'use strict'

const _fieldToSql = require('./_fieldToSql')

function modelToSql (model, defs, forward) {
  // TODO: 检查索引建立在存在的列上
  if (forward) {
    let str = 'CREATE TABLE `' + defs.tablePrefix + model.name + '` (\n'
    let arr = []
    if (model.fields) {
      let length = model.fields.length

      for (let i = 0; i < length; i++) {
        arr.push(_fieldToSql(model.fields[i]))
      }
    }
    if (model.settings) {
      let length = model.settings.length
      for (let i = 0; i < length; i++) {
        let setting = model.settings[i]
        arr.push(setting[0] + ' ' + setting[1])
      }
    }
    str += '  ' + arr.join(',\n  ') + '\n'
    str += ') ENGINE=' + model.ENGINE + ' DEFAULT CHARSET=' + model.CHARSET + ' ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;\n'
    return str
  } else {
    let str = 'DROP TABLE `' + defs.tablePrefix + model.name + '` ;\n'
    return str
  }
}

module.exports = modelToSql
