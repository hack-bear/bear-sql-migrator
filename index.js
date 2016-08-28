#!/usr/bin/env node

'use strict'

const fs = require('fs')
const program = require('commander')
const mysql = require('mysql')

program
  .version('1.0.0')
  .option('-m, --migrate [version]', 'Migrate to version [version]')
  .option('-g, --generate', 'Generate the table definitions from db')
  .option('-d, --diff', 'Diff the table definitions with db and generate migration files')
  .option('-i, --input [path]', 'Path of table definitions, defaults to ./classes')
  .option('-o, --output [path]', 'Path of migration files, defaults to ./migrations')
  .option('-f, --fake', 'Fake migration which only changes the record of migration version but not tables')
  .parse(process.argv)

const inPath = program.input || './classes'
const outPath = program.output || './migrations'
const _defs = JSON.parse(fs.readFileSync(inPath + '/_defs.json', { encoding: 'utf8' }))
const conn = mysql.createConnection(_defs.config)

if (program.diff) {
  require('./server/actions/diff')(_defs, conn, inPath, outPath)
    .then(function () {
      conn.end()
    })
} else if (program.generate) {
  require('./server/actions/generate')(_defs, conn, inPath)
    .then(function () {
      conn.end()
    })
}else if (program.migrate || program.migrate === 0) {
  require('./server/actions/migrate')(_defs, conn, program.migrate, !!program.fake, outPath)
    .then(function () {
      conn.end()
    })
} else {
  console.log('bsqlm -h for help :)')
}
