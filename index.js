/**
 * Inspired by Consolidate.js and hogan-express
 */

/*

    TO DO:

        Yield
        Global Partials
        Hash options when caching

*/


var fs              = require('fs'),
    Hogan           = require('hogan.js'),
    TimedHashTable  = require('node-datastructures').TimedHashTable;

var cacheStore;

function render(path, options, cb) {
    try {
        if(options.partials === undefined) options.partials = {};

        if(options.settings['view layout']) {
            options.partials.yield = path;
            path = options.settings['view layout'];
        }

        read(path, options, function(err, template) {
            if(err) return cb(err);

            readPartials(template, options, function(err, partials) {
                if(err) return cb(err);

                cb(null, template.render(options, partials));
            });
        });
    }
    catch(err) {
        cb(err);
    }
}

/**
 * Reads a template and resolves partials.
 * @return <Function> Hogan compiled template
 */
function read(path, options, cb) {
    var template;

    _read(path, options, function(err, template) {
        if(err) return cb(err);

        cb(null, template);
    });
}

/**
 * Returns a compiled template. If it does not exist in the cache it will read
 * the file and, if caching is enabled, cache the compiled template.
 */

function _read(path, options, cb) {
    if(cacheStore && cacheStore.has(path)) {
        return cb(null, cacheStore.get(path));
    }

    _readFile(path, options, function(err, str) {
        var template;

        if(err) return cb(err);

        template = Hogan.compile(str);
        if(cacheStore) cacheStore.set(path, template);

        cb(null, template);
    });
}

/**
 *
 * @callback <String> Template contents
 */
function _readFile(filename, options, cb) {
    var path = '';

    if(options.settings['views']) path += options.settings['views'];
    path += filename;

    fs.readFile(path, {encoding: 'utf8'}, cb);
}

/**
 * 
 *
 */

function _analyseTemplate(template) {
    var tree, 
        templateText = template;

    if('string' !== typeof template) templateText = template.text;

    tree = Hogan.parse(Hogan.scan(templateText));

    function reducer(memo, elm) {
        if(elm.nodes !== undefined) {
            for(key in elm.nodes.reduce(reducer, {})) {
                memo[key] = 1;
            }
        }

        if(elm.tag !== undefined && elm.tag === '>' && elm.n.match(/\..+$/)) {
            memo[elm.n] = 1;
            return memo;
        }

        return memo;
    }

    return Object.keys(tree.reduce(reducer, {}));
}

/**
 *
 * @callback <Void> Updates options.partials recursively 
 */
function readPartials(rootTemplate, options, cb) {
    var partialsQueue = [],
        compiledTemplates = {},
        currentKey;

    for(var p in options.partials) {
        if('string' === typeof options.partials[p]) {
            partialsQueue.push(options.partials[p]);
        }
    }

    partialsQueue = partialsQueue.concat(_analyseTemplate(rootTemplate));

    function processNext(index) {
        if(index === partialsQueue.length) {
            for(var p in options.partials) {

                //Add dynamic partials with the compiled template
                compiledTemplates[p] = compiledTemplates[options.partials[p]]
            }

            return cb(null, compiledTemplates);
        }


        currentKey = partialsQueue[index];

        _read(currentKey, options, function(err, template) {
            if(err) return cb(err);

            compiledTemplates[currentKey] = template;

            _analyseTemplate(template).forEach(function(t) {
                if(partialsQueue.indexOf(t) < 0) partialsQueue.push(t); 
            });

            processNext(++index);
        })
    }

    processNext(0);
}


var initialized;
function NodeHogan(path, options, fn) {
    if(!initialized) {
        initialized = true;

        var stgs = options.settings;

        if(stgs['view cache'] === undefined && stgs.env == 'production') {
            stgs['view cache'] = true;
        }

        stgs['view cache lifetime'] = stgs['view cache lifetime'] || 1000 * 60 * 60; 

        if(stgs['view cache']) {
            cacheStore = new TimedHashTable(stgs['view cache lifetime']);
        }
    }

    return render(path, options, fn);
}

module.exports = exports = NodeHogan;
