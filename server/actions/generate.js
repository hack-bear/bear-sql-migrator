'use strict'

const fs = require('fs')

const tablesToModels = require('../utils/tablesToModels')

function processTable(t) {
  t.fields.forEach(function (f) {
    if (!f.settings) delete f.settings
  })
  Object.keys(t.index).forEach(function (index) {
    t.settings.push(["INDEX", index, t.index[index]])
  })
  delete t.index
}

function getName(name) {
  let arr = name.split('_')
  arr = arr.map(function (s) {
    return s.substr(0,1).toUpperCase() + s.substr(1).toLowerCase()
  })
  return arr.join('') + '.json'
}

function generateDef(inPath, tables, index, cb) {
  if (tables.length > index) {
    let table = tables[index]
    processTable(table)
    fs.writeFileSync(inPath + '/' + getName(table.name), JSON.stringify(table, null, '  '), { encoding: 'utf8' })
    generateDef(inPath, tables, index + 1, cb)
  } else {
    cb()
  }
}

function generateDefs(tables, inPath) {
  return new Promise(function (resolve) {
    generateDef(inPath, tables, 0, resolve)
  })
}

module.exports = function (defs, conn, inPath) {
  return tablesToModels(defs, conn)
    .then(function (tables) {
      return generateDefs(tables, inPath)
    })
}
