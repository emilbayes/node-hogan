//No guarantees yet, as I have yet to write tests. However it "seems" to work well enough

var fs              = require('fs'),
    _               = require('lodash/dist/lodash.underscore'),
    Hogan           = require('hogan.js'),
    TimedHashTable  = require('node-datastructures/lib/timed-hash-table'),
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var TemplateEngine = module.exports = function TemplateEngine(){
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
    this.settings           = context.settings;
    this.predefinedPartials = context.partials || {};

    var templateName    = this.getTemplateName(path),
        template        = this.getTemplate(templateName),
        options         = this.getPartials(template.text);

    return template.render(context, options);
};

TemplateEngine.prototype.getTemplateName = function(path) {
    return path
        .substr(this.settings['views'].replace(/\/$/, '').length)
        .replace(/(\.[^.]+)$/, '');
}

TemplateEngine.prototype.getTemplate = function(name) {
    if(this.settings['view cache'])
        return this.cache.get(name) || this.loadFromFile(name);

    return this.loadFromFile(name);
};

TemplateEngine.prototype.loadFromFile = function(name) {
    var template = Hogan.compile(
        fs.readFileSync(this.resolvePath(name), 'utf8')
    );
    this.cache.set(name, template);

    return template;
}

TemplateEngine.prototype.resolvePath = function(name) {

    var basePath    = this.settings['views'].replace(/\/$/, ''),
        ext         = this.settings['view engine']
                        ? this.settings['view engine'].replace(/^\./, '')
                        : 'html';

    return basePath + '/' + name + '.' + ext;
};

TemplateEngine.prototype.getPartials = function(template) {
    var partialsNames = this.scanPartials(template),
        partials = {};

    for (var i = 0; i < partialsNames.length; i++)
        partials[partialsNames[i]] =
            this.getTemplate(this.predefinedPartials[partialsNames[i]] || 
                             partialsNames[i]).text;

    var childPartials;
    for(parentPartial in partials)
    {
        for(childPartial in (childPartials = this.getPartials(partials[parentPartial])))
        {
            partials[childPartial] = childPartials[childPartial];
        }
    }

    return partials;
};

TemplateEngine.prototype.scanPartials = function(template){
    function reducer(memo, elm){
        if(elm.nodes != null)
            memo.push.apply(memo, _.reduce(elm.nodes, reducer, []));

        if(elm.tag != null && elm.tag === '>')
            return memo.concat(elm.n);

        return memo;
    }

    var tree = Hogan.parse(
        Hogan.scan(template)
    );

    return _.chain(tree).reduce(reducer, []).unique().value();
}
