'use strict'

function tablesToModels (defs, conn) {

  function getTables () {
    let skipTableName = `${ defs.tablePrefix }hb_migration`

    let promise = new Promise(function (resolve) {
      conn.query('SHOW tables', function (err, res) {
        resolve(res.map(function (obj) {
          return obj['Tables_in_' + defs.config.database]
        }).filter(function (tableName) {
          return tableName != skipTableName && tableName.indexOf(defs.tablePrefix) === 0
        }))
      })
    })

    return promise
  }

  function getModel(name, fields, cb) {
    // TODO: ENGINE, CHARSET, comment 拿不到
    // TODO: field extra as field settings
    // TODO: primary key
    let model = {
      name: name,
      fields: [],
      settings: [],
      ENGINE: 'MyISAM',
      CHARSET: 'utf8',
      index: {}
    }
    fields.forEach(function (field) {
      let defaultValue = field.Default
      // TODO: 这边会不会有坑？null，0，数字、字符串和时间等？
      if (defaultValue == null) {
        defaultValue = 'NULL'
      }
      let f = {
        key: field.Field,
        type: field.Type,
        notNull: field.Null === 'NO',
        default: defaultValue,
        settings: field.Extra ? field.Extra.split(',') : ''
      }
      model.fields.push(f)
      if (field.Key === 'PRI') {
        model.settings.push(['PRIMARY KEY', '(`'+field.Field+'`)'])
      }
    })

    // todo: index unique, asc/desc
    conn.query('show index from '+defs.tablePrefix+name, function (err, res) {
      res.forEach(function (index) {
        if (index.Key_name !== 'PRIMARY') {
          if (!model.index[index.Key_name]) model.index[index.Key_name] = []
          model.index[index.Key_name].push(index.Column_name)
        }
      })
      Object.keys(model.index).forEach(function (key) {
        model.index[key] = model.index[key].join(',')
      })
      cb(model)
    })
  }

  function tableToModel(models, tableNames, cb) {
    let index = models.length
    if (index === tableNames.length) {
      cb(models)
    } else {
      conn.query('desc ' + tableNames[index], function (err, res) {
        getModel(tableNames[index].replace(new RegExp('^' + defs.tablePrefix), ''), res, function (model) {
          models.push(model)
          tableToModel(models, tableNames, cb)
        })
      })
    }
  }

  function tablesToModelDefs(tableNames) {
    let promise = new Promise(function (resolve) {
      tableToModel([], tableNames, resolve)
    })

    return promise
  }

  return getTables()
    .then(function (tableNames) {
      return tablesToModelDefs(tableNames)
    })
    .then(function (models) {
      return models
    })
}

module.exports = tablesToModels
