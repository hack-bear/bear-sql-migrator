'use strict'

function _fieldToSql(f) {
  let s = '`' + f.key + '` ' + f.type
  if (f.notNull) s+= ' NOT NULL'
  if (f.settings) {
    f.settings.forEach((setting) => {
      s += ' ' + setting + ''
    })
  }
  if (f.default) {
    // CAUTION: 不设置DEFAULT相当于DEFAULT NULL，但是却不能说NOT NULL DEFAULT NULL
    if (!f.notNull || f.default !== 'NULL') {
      s += ' DEFAULT ' + f.default + ''
    }
  }
  if (f.comment) s += ' COMMENT \'' + f.comment + '\''
  return s
}

module.exports = _fieldToSql
