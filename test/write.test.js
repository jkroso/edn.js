import UUID from 'edn-js/uuid'
import assert from 'assert'
import edn from '../write'

describe('write', () => {
  it('numbers', () => {
    assert(edn(1) == '1')
    assert(edn(1.2) == '1.2')
    assert(edn(-1.2) == '-1.2')
  })

  it('booleans', () => {
    assert(edn(true) == 'true')
    assert(edn(false) == 'false')
  })

  it('null', () => {
    assert(edn(null) == 'nil')
  })

  it('dates', () => {
    assert(edn(new Date(0)) == `#inst "1970-01-01T00:00:00.000Z"`)
  })

  it('UUIDs', () => {
    const id = new UUID("f81d4fae-7dec-11d0-a765-00a0c91e6bf6")
    assert(edn(id) == `#uuid "f81d4fae-7dec-11d0-a765-00a0c91e6bf6"`)
  })

  it('symbols', () => {
    assert(edn(Symbol('a')) == 'a')
    assert(edn(Symbol('?a')) == '?a')
  })

  it('objects', () => {
    assert(edn({}) == '#js/Object {}')
    assert(edn({a:1}) == '#js/Object {"a" #ref 1}\t1')
    assert(edn({a:1,b:2}) == '#js/Object {"a" #ref 1 "b" #ref 2}\t1\t2')
  })

  it('arrays', () => {
    assert(edn([]) == '#js/Array []')
    assert(edn([1]) == '#js/Array [#ref 1]\t1')
    assert(edn([1,2]) == '#js/Array [#ref 1 #ref 2]\t1\t2')
  })

  it('sets', () => {
    assert(edn(new Set([])) == '#{}')
    assert(edn(new Set([1,2])) == '#{#ref 1 #ref 2}\t1\t2')
  })

  it('maps', () => {
    assert(edn(new Map([])) == '{}')
    assert(edn(new Map([['a',1]])) == '{#ref 1 #ref 2}\t"a"\t1')
    assert(edn(new Map([['a',1],[Symbol('b'),2]])) == '{#ref 1 #ref 2 #ref 3 #ref 4}\t"a"\t1\tb\t2')
  })
})
