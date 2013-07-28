express = require 'express'

app = express()

app.engine 'html', require '../index.js'
app.set 'views', __dirname+'/fixtures'
app.set 'view engine', 'html'
app.set 'view layout', 'complex/layout.html'
app.set 'view partials', head: 'complex/heads/green.html'

app.locals.title = 'Testing'

app.enable 'view cache' #enabled by default
app.set 'view cache lifetime', 1000 * 3600 * 6 #6 hours, default 1 week

app.get '/', (req, res) ->
    res.locals.pageTitle = 'test'
    res.render 'complex/body.html',
        renderVar: 'Rendering here'


app.listen 3000
