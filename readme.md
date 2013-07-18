###Hogan.js Layout and Partials support in Express 3.x

Just a quick template engine I whipped one day as I didn't want anything too complicated. Also includes a timed hash table as a simple cache. This part will be separated out to it's own repo one day along with a bunch of other datastructures I've got lying around.

Note that I haven't written any tests for this yet, so it may very well break and contain bugs.

####Example

######Server.js

    var express = require('express'),
        HoganPartials = require('hogan-partials');

    var app = express();

    app.engine('html', new HoganPartials());
    app.set('view engine', 'html');
    app.set('views', __dirname+'/app/templates/');

    app.enable('view cache'); //enabled by default
    app.set('view cache lifetime', 1000 * 3600 * 6); //6 hours, default: 1 week

    app.get('/', function(req, res){
        res.render('layout', {
            words: ['Hello', 'World'],
            partials: {page: 'dynamic'}
        });
    });

    app.listen(3000);


######/app/templates/layout.html

    <!doctype html>
    <html lang="en">
    <body>
        {{#words}}
            {{> word }}
        {{/words}}
        {{> page }} {{!Notice, this is a partial we specify}}
    </body>
    </html>

######/app/templates/word.html
    <h1>{{.}}</h1>

######/app/templates/dynamic.html
    <h1>Dynamic Page</h1>
