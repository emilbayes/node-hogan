nodeHogan = require '../index'
fs = require 'fs'

readFile = fs.readFile
readFileSync = fs.readFileSync

describe 'node-hogan', ->
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

    it 'should cache for 1 sec'

        #render, cache
        #render right after, hit cache
        #wait 1 sec, render, cache again

    describe 'should support rendering', ->
        it 'should support locals (and implicitly app wide locals)'

        it 'should support layouts'

        it 'should support partials'

        it 'should support dynamic partials'
