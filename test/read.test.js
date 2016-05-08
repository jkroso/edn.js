import {EOL} from '../list'
import assert from 'assert'
import UUID from '../uuid'
import read, {tags,types} from '../read'

describe('read', () => {
  it('number', () => {
    assert(read('1') == 1)
    assert(read('-1') == -1)
    assert(read('-1.0') == -1.0)
    assert(read('1000') == 1000)
  })

  it('string', () => {
    assert(read('""') == '')
    assert(read('"a"') == 'a')
    assert(read('"a1"') == 'a1')
  })

  it('boolean', () => {
    assert(read('true') === true)
    assert(read('false') === false)
  })

  it('nil', () => {
    assert(read('nil') == null)
  })

  it('char', () => {
    assert(read('\\c') == 'c')
  })

  it('dates', () => {
    const date = '2014-11-28T20:21:43.712-00:00'
    assert(read(`#inst "${date}"`) <= new Date(date))
  })

  it('UUIDs', () => {
    const str = 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6'
    assert(read(`#uuid "${str}"`) instanceof UUID)
    assert(read(`#uuid "${str}"`).toJSON() == str)
  })

  it('symbols', () => {
    assert(read('?a') == Symbol.for('?a'))
    assert(read('a') == Symbol.for('a'))
  })

  it('keywords', () => {
    assert(read(':keyword') == Symbol.for(':keyword'))
  })

  it('map', () => {
    assert.deepEqual(read('{}'), new Map)
    assert.deepEqual(read('{"a" 1}'), new Map([['a',1]]))
    assert.deepEqual(read('{[] 1}'), new Map([[[], 1]]))
    assert.deepEqual(read('{[1] 1}'), new Map([[[1], 1]]))
  })

  it('vector', () => {
    assert.deepEqual(read('[]'), [])
    assert.deepEqual(read('[1]'), [1])
    assert.deepEqual(read('["a" 1]'), ["a",1])
    assert.deepEqual(read('[1 2 3]'), [1,2,3])
  })

  it('list', () => {
    assert.deepEqual(read('()'), EOL)
    assert.deepEqual(Array.from(read('(1)')), [1])
    assert.deepEqual(Array.from(read('("a" 1)')), ["a",1])
    assert.deepEqual(Array.from(read('(1 2 3)')), [1,2,3])
  })

  it('set', () => {
    assert.deepEqual(read('#{}'), new Set)
    assert.deepEqual(read('#{true "a"}'), new Set([true, 'a']))
    assert.deepEqual(read('#{{-1 1} "a"}'), new Set([new Map([[-1,1]]), 'a']))
  })

  it('errors', () => {
    assert.throws(()=> read(']'), 'unexpected closing "]" (1:1)')
    assert.throws(()=> read('{\n]}'), 'unexpected closing "]" (2:1)')
    assert.throws(()=> read('{\n ]}'), 'unexpected closing "]" (2:2)')
    assert.throws(()=> read('{\n [\n] ]}'), 'unexpected closing "]" (3:3)')
    assert.throws(()=> read('1a'), 'invalid symbol "1a" (1:2)')
  })

  it('#js/Object', () => {
    assert.deepEqual(read('#js/Object {}'), {})
    assert.deepEqual(read('#js/Object {"a" 1}'), {a:1})
    assert.deepEqual(read('#js/Object {"a" 1 "b" 2}'), {a:1,b:2})
  })

  it('#js/Array', () => {
    assert.deepEqual(read('#js/Array []'), [])
    assert.deepEqual(read('#js/Array ["a"]'), ["a"])
    assert.deepEqual(read('#js/Array ["a" 1]'), ["a", 1])
  })

  it('references', () => {
    const a = read('{self # 1}')
    assert(a.get(Symbol.for('self')) == a)
    const b = read('[{vec # 1} {map # 2} (# 3 # 2)]')
    assert(b[0] == b[1].get(Symbol.for('map')))
    assert(b[0].get(Symbol.for('vec')) == b)
    assert(b[2].value == b[1])
    assert(b[2].tail.value == b[0])
  })

  it('custom tags', () => {
    tags['whatever'] = x => x
    const x = read('#whatever [{self # 1}]')
    assert(x[0].get(Symbol.for('self')) == x[0])
  })

  // NB: can't support types which have been defined with class
  // because they don't support staged construction and in turn this
  // makes cycles impossible to parse
  it('custom types', () => {
    types['A'] = function A(a){ this.a = a }
    const x = read('#A (# 1)')
    assert(x.a == x)
  })
})
