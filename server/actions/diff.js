'use strict'

const fs = require('fs')

const tablesToModels = require('../utils/tablesToModels')
const diffModel = require('../utils/diffModel')
const diffsToSql = require('../utils/diffsToSql')
const modelToSql = require('../utils/modelToSql')

function getCurrentMigrate (tablename, conn) {
  return new Promise(function (resolve) {
    let sql = `select ver from ${ tablename } limit 1`
    conn.query(sql, function (err, res) {
      resolve((res && res[0]) ? res[0].ver : 0)
    })
  })
}

module.exports = function (defs, conn, inPath, outPath) {
  let lastMigration = 0
  fs.readdirSync(outPath).forEach(function (filename) {
    let num = parseInt(filename.split('_')[0], 10)
    if (num > lastMigration) {
      lastMigration = num
    }
  })
  let nextMigration = lastMigration + 1

  let models = fs.readdirSync(inPath).filter((f) => {
    return f != '_defs.json'
  }).map((f) => {
    return JSON.parse(fs.readFileSync(inPath + '/' + f, { encoding: 'utf8' }))
  })

  let forwardScript = ''
  let backwardScript = ''

  return getCurrentMigrate(defs.tablePrefix + 'hb_migration', conn).then(function (mig) {
    if (lastMigration != mig) {
      // TODO：这里有个坑，只能比对当前的数据库版本与classes的区别
      console.log('please migrate to lastest version then diff')
      return null
    }
    return tablesToModels(defs, conn)
      // diff models
      .then(function (prevModels) {
        let diff = {
          newTables: [],
          deleteTables: [],
          modifiedTables: []
        }

        models.forEach(function (m) {
          let found = prevModels.some(function (pM) {
            if (pM.name === m.name) {
              var modelDiffs = diffModel(pM, m)
              if (modelDiffs) diff.modifiedTables.push(modelDiffs)
              return true
            }
          })
          if (!found) diff.newTables.push(m)
        })

        prevModels.forEach(function (pM) {
          let found = models.some(function (m) {
            if (pM.name === m.name) {
              return true
            }
          })
          if (!found) diff.deleteTables.push(pM)
        })

        return diff
      })
      // new models sql
      .then(function (diff) {
        forwardScript += diff.newTables.map((model) => {
          return modelToSql(model, defs, true)
        }).join('\n')

        backwardScript = diff.newTables.map((model) => {
          return modelToSql(model, defs, false)
        }).join('\n')

        return diff
      })
      // drop models sql
      .then(function (diff) {
        forwardScript += diff.deleteTables.map((model) => {
          return modelToSql(model, defs, false)
        }).join('\n')

        backwardScript += diff.deleteTables.map((model) => {
          return modelToSql(model, defs, true)
        }).join('\n')

        return diff
      })
      // modified models sql
      .then(function (diff) {
        forwardScript += diff.modifiedTables.map(function (diff) {
          return diffsToSql(diff, defs, true)
        }).join('\n')

        backwardScript += diff.modifiedTables.map(function (diff) {
          return diffsToSql(diff, defs, false)
        }).join('\n')

        return diff
      })
      // write migration files
      .then(function () {
        if (forwardScript || backwardScript) {
          fs.writeFileSync(outPath + '/' + nextMigration + '_forward.sql', forwardScript, { encoding: 'utf8' })
          fs.writeFileSync(outPath + '/' + nextMigration + '_backward.sql', backwardScript, { encoding: 'utf8' })
          console.log('migration files generated')
        } else {
          console.log('nothing changed so far')
        }
      })
  })
}
