import write from './write'

export default class List {
  constructor(head, tail) {
    this.value = head
    this.tail = tail || EOL
  }
  static from(array) {
    var i = array.length
    var list = EOL
    while (i--) {
      list = new List(array[i], list)
    }
    return list
  }
  [Symbol.iterator]() {
    return new ListIterator(this)
  }
  toEDN() {
    var arr = []
    for (var value of this) arr.push(write(value))
    return `(${arr.join(' ')})`
  }
}

class ListIterator {
  constructor(list) {
    this.list = list
  }
  next() {
    const list = this.list
    if (list !== EOL) this.list = list.tail
    return list
  }
}

// the end of list marker
export const EOL = Object.create(List.prototype)

Object.defineProperty(EOL, 'value', {
  get() {throw new Error("Can't get the head of the empty List")},
  enumerable: false
})
Object.defineProperty(EOL, 'tail', {
  get() {throw new Error("Can't get the tail of the empty List")},
  enumerable: false
})
EOL.done = true
