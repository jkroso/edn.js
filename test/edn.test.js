const {read,write,edn} = require('..')
const {deepEqual} = require('assert')
const UUID = require('../uuid')

it('Tagged template strings', () => {
  deepEqual(edn`[a 2]`, read('[a 2]'))
  deepEqual(edn`[${1} 2]`, [1,2])
  deepEqual(edn`[{${1} 2 ${2} 3}]`, [new Map([[1,2],[2,3]])])
})
