import List from './list'
import UUID from './uuid'

class Parser {
  constructor(str, filename) {
    this.filename = filename
    this.source = str
    this.index = 0
  }

  get current() { return this.source[this.index] }
  get next() { return this.source[this.index + 1] }

  nextForm() {
    switch (this.current) {
      case '"': return this.string()
      case '[': return this.toClosing(']')
      case '(': return List.from(this.toClosing(')'))
      case '{': return new Map(pairs(this.toClosing('}')))
      case ':': return Symbol.for(this.bufferChars())
      case '#': return this.tagged()
      case '\\': return this.char()
      case '}':
      case ']':
      case ')': throw this.error(`unexpected closing "${this.source[this.index++]}"`)
      case undefined: throw new SyntaxError('unexpected end of input')
      default: return this.primitive(this.bufferChars())
    }
  }

  error(msg) {
    const lines = this.source.split(/\n/g)
    var count = this.index
    var lineno = 0
    while (lines[lineno].length < count) {
      count -= lines[lineno++].length + 1
    }
    return new SyntaxError(`${msg} (${lineno + 1}:${count})`)
  }

  char() { return this.source[++this.index] }

  toClosing(brace) {
    this.index++
    var out = []
    while (true) {
      // skip whitespace
      switch (this.current) {
        case '\n':
        case '\r':
        case '\t':
        case ',':
        case ' ': this.index++; continue
      }
      if (this.current == brace) break
      out.push(this.nextForm())
    }
    this.index++
    return out
  }

  string() {
    var c
    var str = []
    while ((c = this.char()) != '"') {
      if (c == '\\') switch (c = this.char()) {
        case 'b': c = '\b'; break
        case 'f': c = '\f'; break
        case 'n': c = '\n'; break
        case 'r': c = '\r'; break
        case 't': c = '\t'; break
        case 'v': c = '\v'; break
        case 'x': throw new Error('TODO: support hex literals')
      }
      str.push(c)
    }
    this.index++
    return str.join('')
  }

  bufferChars() {
    var buf = this.current
    while (isChar(this.char())) buf += this.current
    return buf
  }

  primitive(str) {
    if (str == 'true') return true
    if (str == 'false') return false
    if (str == 'nil') return null
    var n = parseFloat(str, 10)
    if (isNaN(n)) return Symbol.for(str)
    if (n == str) return n
    throw this.error('invalid symbol "' + str + '"')
  }

  tagged() {
    if (this.char() == '{') return new Set(this.toClosing('}'))
    const tag = this.bufferChars()
    const fn = parse[tag]
    if (!fn) throw this.error('unknown tag type "' + tag + '"')
    this.index++ // skip space
    return fn(this.nextForm())
  }
}

const pairs = arr => {
  const half = arr.length / 2
  const out = Array(half)
  var i = 0
  var j = 0
  while (i < half) {
    out[i++] = [arr[j++], arr[j++]]
  }
  return out
}

const charRegex = /[^\s,}\])]/
const isChar = c => c != null && charRegex.test(c)

const parse = (str, filename) => new Parser(str, filename).nextForm()
parse['inst'] = str => new Date(str)
parse['uuid'] = str => new UUID(str)
parse['js/Array'] = array => array
parse['js/Object'] = map => {
  const object = {}
  for (var [key,value] of map.entries()) {
    object[key] = value
  }
  return object
}

export default parse
