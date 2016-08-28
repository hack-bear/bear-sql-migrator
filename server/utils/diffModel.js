'use strict'

function isNotNull(f) {
  return f.notNull === true
}
function fieldDefault(f) {
  if (f.default === undefined) return 'NULL'
  return f.default
}

function preProcessModel (m) {
  m.index = {}
  m.settings.forEach(function (s) {
    if (s[0] === 'INDEX') {
      m.index[s[1]] = s[2]
    }
  })
}

function diffModel (pM, m) {
  preProcessModel(m)

  let diff = {
    name: m.name,
    added: [],
    removed: [],
    modified: [],
    addedIndex: [],
    removedIndex: []
  }

  m.fields.forEach(function (f) {
    let found = pM.fields.some(function (pF) {
      if (pF.key === f.key) {
        if (
          pF.type !== f.type
          || isNotNull(pF) !== isNotNull(f)
          || fieldDefault(pF) !== fieldDefault(f)
          // TODO: settings changed
          // TODO: 用change来重命名
        ) {
          diff.modified.push([pF, f])
        }
        return true
      }
    })
    if (!found) diff.added.push(f)
  })

  pM.fields.forEach(function (pF) {
    let found = m.fields.some(function (f) {
      if (pF.key === f.key) {
        return true
      }
    })
    if (!found) diff.removed.push(pF)
  })


  Object.keys(pM.index).forEach(function (key) {
    if (!m.index[key]) {
      diff.removedIndex.push([key, pM.index[key]])
    }
  })

  Object.keys(m.index).forEach(function (key) {
    if (!pM.index[key]) {
      diff.addedIndex.push([key, m.index[key]])
    }
  })

  if (diff.added.length || diff.removed.length || diff.modified.length || diff.addedIndex.length || diff.removedIndex.length) return diff
  return null
}

module.exports = diffModel
