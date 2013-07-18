nodeHogan = require '../index'
fs = require 'fs'

readFile = fs.readFile
readFileSync = fs.readFileSync
delay = (ms, fn) -> setTimeout fn, ms
describe 'node-hogan', ->
    describe 'should support rendering', ->
        locals = {}

        beforeEach ->
            locals =
                settings:
                    'views': "#{__dirname}/fixtures"
                    'view engine': 'html'
                    'view layout': 'complex/layout'

        it 'should support locals (and implicitly app wide locals)', (done) ->
            path = 'simple/name'

            locals.settings['view layout'] = undefined
            locals.name = 'node-hogan'

            nodeHogan path, locals, (err, html) ->
                return done err if err

                html.should.equal "<p>#{locals.name}</p>"

                do done

        it 'should support layouts and partials', (done) ->
            path = 'complex/body'

            resultPath = locals.settings.views + 
                         '/' + 
                         path + 
                         '.test-result.' + 
                         locals.settings['view engine']

            nodeHogan path, locals, (err, html) ->
                return done err if err

                html.should.equal fs.readFileSync resultPath

                do done

        it 'should support dynamic partials', (done) ->
            path = 'complex/body'
            locals.partials =
                head: 'complex/green'

            resultGreenPath = locals.settings.views + 
                              '/partial-green.test-result.' + 
                              locals.settings['view engine']

            resultOrangePath = locals.settings.views + 
                              '/partial-orange.test-result.' + 
                              locals.settings['view engine']

            nodeHogan path, locals, (err, html) ->
                return done err if err
                html.should.equal fs.readFileSync resultGreenPath

                locals.partials.head = 'complex/orange'

                nodeHogan path, locals, (err, html) ->
                    return done err if err
                    html.should.equal fs.readFileSync resultOrangePath

                    do done

    describe 'caching', ->
        afterEach ->
            fs.readFileSync = readFileSync
            fs.readFile = readFile

        it 'should not cache by default', (done) ->
            path = "#{__dirname}/fixtures/simple/name.html"
            locals = { name: 'node-hogan' }

            calls = 0

            fs.readFileSync = ->
                ++calls
                fs.readFileSync.apply @, arguments

            fs.readFile = ->
                ++calls
                fs.readFile.apply @, arguments

            nodeHogan path, locals, (err, html) ->
                return done err if err
                html.should.equal "<p>#{locals.name}</p>"

                locals.name = 'node-hogan2' #ensure simple caching
                nodeHogan path, locals, (err, html) ->
                    return done err if err
                    html.should.equal "<p>#{locals.name}</p>"

                    calls.should.be.equal 2

                    done()

        it 'should cache for 1 sec', (done) ->
            #render, cache
            #render right after, hit cache
            #wait 1 sec, render, cache again

            path = "#{__dirname}/fixtures/simple/name.html"
            locals = 
                name: 'node-hogan' 
                settings:
                    'view cache': true
                    'view cache lifetime': 1000 #1s

            calls = 0

            fs.readFileSync = ->
                ++calls
                fs.readFileSync.apply @, arguments

            fs.readFile = ->
                ++calls
                fs.readFile.apply @, arguments

            nodeHogan path, locals, (err, html) ->
                return done err if err
                html.should.equal "<p>#{locals.name}</p>"

                nodeHogan path, locals, (err, html) ->
                    return done err if err
                    html.should.equal "<p>#{locals.name}</p>"

                    delay 1000, nodeHogan path, locals, (err, html) ->
                        return done err if err
                        html.should.equal "<p>#{locals.name}</p>"

                        calls.should.be.equal 2

                        done()
