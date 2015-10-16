const {deepEqual:equal} = require('assert')
const {List,EOL} = require('../list')

describe('List', () => {
  it('from(array)', () => {
    const list = List.from([1,2,3])
    equal(list.value, 1)
    equal(list.tail.value, 2)
    equal(list.tail.tail.value, 3)
    equal(list.tail.tail.tail, EOL)
  })

  it('iterator protocol', () => {
    const list = List.from([1,2,3])
    var loops = 0
    for (var value of list) {
      equal(value, ++loops)
    }
    equal(loops, 3)
  })

  it('toEDN()', () => {
    equal(EOL.toEDN(), '()')
    equal(List.from([{toEDN(){return 1}}]).toEDN(), '(1)')
    equal(List.from([{toEDN(){return 1}}, {toEDN() {return 2}}]).toEDN(), '(1 2)')
  })
})
