'use strict'

const fs = require('fs')

module.exports = function (defs, conn, ver, fake, outPath) {
  let tablename = `${ defs.tablePrefix }hb_migration`

  function createLogTable () {
    let sql = 
`
CREATE TABLE ${ tablename } (
  id int(10),
  ver int(10) DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ;
`

    let promise = new Promise(function (resolve) {
      conn.query(sql, function (err, res) {
        if (err) {
          let sql = `select ver from ${ tablename } limit 1`
          conn.query(sql, function (err, res) {
            resolve(res[0].ver)
          })
        } else {
          let sql = `insert into ${ tablename } (ver) values (0)`
          conn.query(sql, function (err, res) {
            resolve(0)
          })
        }
      })
    })

    return promise
  }

  function migrateForwardTo(current, to, cb) {
    if (current > to) {
      cb()
    } else {
      let sql = fs.readFileSync(outPath + '/' + current + '_forward.sql', { encoding: 'utf8' })
      queryNext(sql.split(';'), function () {
        migrateForwardTo(current + 1, to, cb)
      })
    }
  }

  function migrateForward(preVer, ver) {
    let promise = new Promise(function (resolve) {
      migrateForwardTo(preVer + 1, ver, resolve)
    })

    return promise
  }

  function migrateBackwardTo(current, to, cb) {
    if (current <= to) {
      cb()
    } else {
      let sql = fs.readFileSync(outPath + '/' + current + '_backward.sql', { encoding: 'utf8' })
      queryNext(sql.split(';'), function () {
        migrateBackwardTo(current - 1, to, cb)
      })
    }
  }

  function migrateBackward(preVer, ver) {
    let promise = new Promise(function (resolve) {
      migrateBackwardTo(preVer, ver, resolve)
    })

    return promise
  }

  function queryNext(arr, cb) {
    if (arr.length) {
      let sql = arr.shift()
      if (!sql.replace(/[\r\n\t\s]/g, '')) {
        queryNext(arr, cb)
      } else {
        conn.query(sql + ';', function (err, res) {
          if (!err) {
            queryNext(arr, cb)
          } else {
            console.log(err)
          }
        })
      }
    } else {
      cb()
    }
  }

  function afterMigration(ver) {
    let promise = new Promise(function (resolve) {
      let sql = `update ${tablename} set ver = ${ver}`
      conn.query(sql, function (err, res) {
        resolve()
      })
    })

    console.log('migrated to version ' + ver)

    return promise
  }

  return createLogTable()
    .then(function (preVer) {
      if (fake) {
        return null
      } else if (ver > preVer) {
        return migrateForward(preVer, ver)
      } else if (ver < preVer) {
        return migrateBackward(preVer, ver)
      }
    })
    .then(function () {
      return afterMigration(ver)
    })
}
