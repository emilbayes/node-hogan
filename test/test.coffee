nodeHogan = require '../index'
fs = require 'fs'

readFile = fs.readFile
readFileSync = fs.readFileSync
delay = (ms, fn, args...) -> setTimeout fn, ms, args...
describe 'node-hogan', ->
    beforeEach ->
        delete require.cache[require.resolve('../index.js')]
        nodeHogan = require '../index'

    describe 'should support rendering', ->
        locals = {}
        beforeEach ->
            locals = null
            locals =
                settings:
                    'views': "#{__dirname}/fixtures/"
                    'view engine': 'html'
                    'view layout': 'complex/layout.html'

        it 'should support locals (and implicitly app wide locals)', (done) ->
            path = 'simple/name.html'

            locals.settings['view layout'] = undefined
            locals.name = 'node-hogan'

            nodeHogan path, locals, (err, html) ->
                return done err if err

                html.should.equal "<p>#{locals.name}</p>\n"

                do done

        it 'should support layouts and partials', (done) ->
            path = 'complex/body.html'
            locals.title = 'Document'

            resultPath = locals.settings.views +  
                         path + 
                         '.test-result'

            nodeHogan path, locals, (err, html) ->
                return done err if err

                html.should.eql fs.readFileSync resultPath, encoding: 'utf8'

                do done

        it 'should support dynamic partials', (done) ->
            path = 'complex/body.html'
            locals.partials =
                head: 'complex/heads/green.html'

            resultGreenPath = locals.settings.views + 
                              'complex/partial-green.html.test-result'

            resultOrangePath = locals.settings.views + 
                              'complex/partial-orange.html.test-result'

            nodeHogan path, locals, (err, html) ->
                return done err if err
                html.should.eql fs.readFileSync resultGreenPath, encoding: 'utf8'

                locals.partials.head = 'complex/heads/orange.html'

                nodeHogan path, locals, (err, html) ->
                    return done err if err
                    html.should.eql fs.readFileSync resultOrangePath, encoding: 'utf8'

                    do done

    describe 'caching', ->
        afterEach ->
            fs.readFileSync = readFileSync
            fs.readFile = readFile

        it 'should not cache by default', (done) ->
            path = "#{__dirname}/fixtures/simple/name.html"
            locals = 
                name: 'node-hogan'
                settings: {}

            calls = 0
            
            fs.readFileSync = ->
                ++calls
                readFileSync.apply @, arguments

            fs.readFile = ->
                ++calls
                readFile.apply @, arguments
            
            nodeHogan path, locals, (err, html) ->
                return done err if err
                html.should.equal "<p>#{locals.name}</p>\n"

                locals.name = 'node-hogan2' #ensure simple caching
                nodeHogan path, locals, (err, html) ->
                    return done err if err
                    html.should.equal "<p>#{locals.name}</p>\n"

                    calls.should.be.equal 2

                    done()

        it 'should cache for 60ms', (done) ->
            #render, cache
            #render right after, hit cache
            #wait 1 sec, render, cache again

            path = "#{__dirname}/fixtures/simple/name.html"
            locals = 
                name: 'node-hogan' 
                settings:
                    'view cache': true
                    'view cache lifetime': 60 #60ms

            calls = 0

            fs.readFileSync = ->
                ++calls
                readFileSync.apply @, arguments

            fs.readFile = ->
                ++calls
                readFile.apply @, arguments

            #Read
            nodeHogan path, locals, (err, html) ->
                return done err if err
                html.should.equal "<p>#{locals.name}</p>\n"

                #Hit cache
                nodeHogan path, locals, (err, html) ->
                    return done err if err
                    html.should.equal "<p>#{locals.name}</p>\n"

                    #Read, cache expired
                    delay 60, nodeHogan, path, locals, (err, html) ->
                        return done err if err
                        html.should.equal "<p>#{locals.name}</p>\n"

                        #Hit cache
                        nodeHogan path, locals, (err, html) ->

                            return done err if err
                            html.should.equal "<p>#{locals.name}</p>\n"

                            calls.should.be.equal 2

                            done()
