//No guarantees yet, as I have yet to write tests. However it "seems" to work well enough

var fs      = require('fs'),
    _       = require('underscore'),
    Hogan   = require('hogan.js'),
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var TemplateEngine = function TemplateEngine(){
    return __bind(this.__express, this);

}

TemplateEngine.prototype.__express = function(path, context, fn) {
    try {
        if(this.cache == null && (context.settings['view cache'] != null ? context.settings['view cache'] : true))
        {
            this.cache = new TimedHashTable(
                context.settings['view cache lifetime'] || 1000*3600*24*7
            )
        }

        return fn(null, this.render(path, context));
    }
    catch(e) {
        return fn(e);
    }
};

TemplateEngine.prototype.render = function(path, context) {
    var templateName    = this.getTemplateName(path, context.settings),
        template        = this.getTemplate(templateName, context.settings),
        options         = this.getPartials(template, context.settings, context.partials || {});

    return template.render(context, options);
};

TemplateEngine.prototype.getTemplateName = function(path, settings) {
    return path
        .substr(settings['views'].replace(/\/$/, '').length)
        .replace(/(\.[^.]+)$/, '');
}

TemplateEngine.prototype.getTemplate = function(name, settings) {
    if(settings['view cache'])
        return this.cache.get(name) || this.loadFromFile(name, settings);

    return this.loadFromFile(name, settings);
};

TemplateEngine.prototype.loadFromFile = function(name, settings) {
    var template = Hogan.compile(
        fs.readFileSync(this.resolvePath(name, settings), 'utf8')
    );
    this.cache.set(name, template);

    return template;
}

TemplateEngine.prototype.resolvePath = function(name, settings) {
    var basePath    = settings['views'].replace(/\/$/, '') + '/',
        ext         = '.' + settings['view engine'].replace(/^\./, '');

    return basePath + name + ext;
};

TemplateEngine.prototype.getPartials = function(template, settings, partialSubstitutions) {
    var tree = Hogan.parse(
        Hogan.scan(template.text)
    ),
    reducer = function(memo, elm){
        if(elm.nodes != null)
            memo.push.apply(memo, _.reduce(elm.nodes, reducer, []));

        if(elm.tag != null && elm.tag === '>')
            return memo.concat(elm.n);

        return memo;
    }
    partialsNames = _.chain(tree)
        .reduce(reducer, [])
        .unique()
        .value(),
    partials = {};

    for (var i = 0; i < partialsNames.length; i++)
        partials[partialsNames[i]] =
            this.getTemplate(partialSubstitutions[partialsNames[i]] || partialsNames[i], settings).text;

    return partials;
};



module.exports = TemplateEngine



var TimedHashTable = function(defaultTimeout){
    this.defaultTimeout = defaultTimeout;

    this.table  = {};
    this.timers = {};
    this.size   = 0;
}

TimedHashTable.prototype.get = function(hash) {
    return this.table[hash];
};

TimedHashTable.prototype.set = function(hash, value, timeout) {
    timeout = timeout != null ? timeout : this.defaultTimeout;

    if(!this.contains(hash))
        ++this.size;
    else
        clearTimeout(this.timers[hash]);

    this.table[hash]    = value;
    this.timers[hash]   = setTimeout(this.remove, timeout, hash);

    return this;
};

TimedHashTable.prototype.contains = function(hash) {
    return this.table[hash] != null;
};

TimedHashTable.prototype.size = function() {
    return this.size;
};

TimedHashTable.prototype.remove = function(hash) {
    if(this.contains(hash))
    {
        clearTiemout(this.timers[hash]);
        delete this.table[hash];
        delete this.timers[hash];

        --this.size;
    }

    return this;
};

TimedHashTable.prototype.purge = function() {
    for (timer in this.timers)
        if(this.timers.hasOwnProperty(timer))
            clearTimeout(timer);

    delete this.table;
    delete this.timers;
    delete this.size;

    this.table = {};
    this.timers = {};
    this.size = 0;

    return this;
};
