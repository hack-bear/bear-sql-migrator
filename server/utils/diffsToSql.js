'use strict'

const _fieldToSql = require('./_fieldToSql')

function forwardSql (diff, _defs) {
  let str = ''
  let tablename = _defs.tablePrefix + diff.name

  // new columns
  str += diff.added.map(function (f) {
    let s = 'ALTER TABLE ' + tablename + ' ADD COLUMN ' + _fieldToSql(f)
    return s + ';'
  }).join('\n')

  if (diff.added.modified) str += '\n'

  // modified columns
  str += diff.modified.map(function (f) {
    return 'ALTER TABLE ' + tablename + ' MODIFY COLUMN ' + _fieldToSql(f[1]) + ';'
  }).join('\n')

  if (diff.modified.length) str += '\n'

  // old columns
  str += diff.removed.map(function (f) {
    return 'ALTER TABLE ' + tablename + ' DROP COLUMN ' + f.key + ';'
  }).join('\n')

  if (diff.removed.length) str += '\n'

  str += diff.addedIndex.map(function (f) {
    return 'ALTER TABLE ' + tablename + ' ADD INDEX ' + f[0] + '(' + f[1] + ');'
  }).join('\n')

  if (diff.addedIndex.length) str += '\n'

  str += diff.removedIndex.map(function (f) {
    return 'ALTER TABLE ' + tablename + ' DROP INDEX ' + f[0] + ';'
  }).join('\n')

  if (diff.removedIndex.length) str += '\n'

  return str
}

function backwardSql (diff, _defs) {
  let str = ''
  let tablename = _defs.tablePrefix + diff.name

  str += diff.removed.map(function (f) {
    let s = 'ALTER TABLE ' + tablename + ' ADD COLUMN ' + f.key + ' ' + f.type
    if (f.notNull) s+= ' NOT NULL'
    if (f.settings) {
      f.settings.forEach((setting) => {
        s += ' ' + setting + ''
      })
    }
    if (f.default) s += ' DEFAULT ' + f.default + ''
    if (f.comment) s += ' COMMENT \'' + f.comment + '\''
    return s + ';'
  }).join('\n')

  if (diff.removed.length) str += '\n'

  // modified columns
  str += diff.modified.map(function (f) {
    return 'ALTER TABLE ' + tablename + ' MODIFY COLUMN ' + _fieldToSql(f[0]) + ';'
  }).join('\n')

  if (diff.modified.length) str += '\n'

  str += diff.added.map(function (f) {
    return 'ALTER TABLE ' + tablename + ' DROP COLUMN ' + f.key + ';'
  }).join('\n')

  if (diff.added.length) str += '\n'

  str += diff.removedIndex.map(function (f) {
    return 'ALTER TABLE ' + tablename + ' ADD INDEX ' + f[0] + '(' + f[1] + ');'
  }).join('\n')

  if (diff.removedIndex.length) str += '\n'

  str += diff.addedIndex.map(function (f) {
    return 'ALTER TABLE ' + tablename + ' DROP INDEX ' + f[0] + ';'
  }).join('\n')

  if (diff.addedIndex.length) str += '\n'

  return str
}

function diffsToSql (diff, _defs, forward) {
  let str = forward ? forwardSql(diff, _defs) : backwardSql(diff, _defs)

  return str
}

module.exports = diffsToSql
