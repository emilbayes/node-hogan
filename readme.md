###Hogan.js Partials support in Express 3.x

Just a quick template engine I whipped one day as I didn't want anything too complicated. Also includes a timed hash table as a simple cache. This part will be separated out to it's own repo one day along with a bunch of other datastructures I've got lying around.

Note that I haven't written any tests for this yet, so it may very well break and contain bugs.

####Example

    var express = require('express');
    var HoganPartials = require('hogan-partials');
    var app = express();

    app.engine('html', (new HoganPartials()).__express)
    app.set('view engine', 'html');
    app.set('views', __dirname + '/application/templates/');

    app.enable('view cache');
    app.set('view cache lifetime', 1000*60*60); //1 hour, default 1 week


    app.get('/', function(req, res){
        /*
            Will load /application/templates/hello-world.html
            and the partials it contains {{> partial }}

        */
      res.render('hello-world', {words: ['hello', 'world']});
    });

    app.listen(3000);
