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

var NodeHogan = function(options){}

NodeHogan.prototype.readView = function readView(path, options){}
NodeHogan.prototype.readPartials = function readPartials(partials, options){}
NodeHogan.prototype.renderString = function renderString(str, options){}


module.exports = exports = NodeHogan;
