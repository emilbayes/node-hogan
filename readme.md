#node-hogan
###Implementation for loading hogan.js with layouts and partials for Express 3.x

Hogan.js templating engine, for [express.js](http://expressjs.com/).

* Layouts
* Resolves and loads static and dynamic partials (see example)
* Timed caching layer

Currently supporting the latest version of Hogan.js on npm (2.0).
When Hogan.js 3.0 is published I'll revisit layouts, as template inheritance makes the current implementation redundant.

####Example

######Server.js

    var express = require('express'),
        HoganPartials = require('hogan-partials');

    var app = express();

    app.engine('html', new HoganPartials());
    app.set('views', __dirname+'/app/templates/');
    app.set('view engine', 'html');
    app.set('view layout', 'layout')
    
    app.locals.partials = {head: 'includes.html'} //App wide partial
    app.locals.name = 'Emil' //App wide locals

    app.enable('view cache'); //enabled by default
    app.set('view cache lifetime', 1000 * 3600 * 6); //6 hours, default: 1 hour

    app.get('/', function(req, res){
        res.render('index.html', {
            tags: ['Javascript', 'Node.js'],
            partials: {
                profile: 'profile.html'
            }
        });
    });

    app.listen(3000);


######/app/templates/layout.html

    <!doctype html>
    <html lang="en">
    <head>
        {{> head }}
    </head>
    <body>
        {{> profile }} {{! dynamic partial specified in partials: {} }}
        {{#tags}}
            {{> tag.html }}
        {{/tags}}
        {{> yield }} {{! This is where the body will be injected, index.html}}
    </body>
    </html>

######/app/templates/includes.html
    <script>alert('Welcome!')</script>

######/app/templates/profile.html
    <h1>{{ name }}</h1>

######/app/templates/tag.html
    <h3>{{.}}</h3>

######/app/templates/index.html
    <h1>Page Body</h1>


###License
Copyright (C) 2013 Emil Bay

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
