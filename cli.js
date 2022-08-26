#!/usr/bin/env node
var args = process.argv.splice(2)
var convert = require('./')
var fs = require('fs')

var file = args[0]
var name = args[1]
var protobuf = convert(fs.readFileSync(file).toString(), name)
process.stdout.write(protobuf)