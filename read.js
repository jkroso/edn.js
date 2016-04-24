import List, {EOL} from './list'
import UUID from './uuid'

class Parser {
  constructor(str, filename) {
    this.filename = filename
    this.source = str
    this.index = 0
    this.cache = []
  }

  get current() { return this.source[this.index] }
  get next() { return this.source[this.index + 1] }

  nextForm() {
    switch (this.current) {
      case '"': return this.string()
      case '[': return this.vector()
      case '(': return this.list()
      case '{': return this.map()
      case ':': return Symbol.for(this.bufferChars())
      case '#': return this.tagged()
      case '\\': return this.char()
      case '}':
      case ']':
      case ')': throw this.error(`unexpected closing "${this.source[this.index++]}"`)
      case undefined: throw new SyntaxError('unexpected end of input')
      default: return this.primitive()
    }
  }

  vector() {
    const vec = []
    this.cache.push(vec)
    this.index++ // skip opening brace
    while (true) {
      this.skipWhitespace()
      if (this.current == ']') break
      vec.push(this.nextForm())
    }
    this.index++ // skip closing brace
    return vec
  }

  list() {
    this.index++
    this.skipWhitespace()
    if (this.current == ')') return EOL
    const list = new List
    this.cache.push(list)
    var tail = list
    while (true) {
      tail.value = this.nextForm()
      this.skipWhitespace()
      if (this.current == ')') break
      tail = tail.tail = new List
    }
    this.index++
    return list
  }

  map() {
    const map = new Map
    this.cache.push(map)
    this.index++
    while (true) {
      this.skipWhitespace()
      if (this.current == '}') break
      const key = this.nextForm()
      this.skipWhitespace()
      const val = this.nextForm()
      map.set(key, val)
    }
    this.index++
    return map
  }

  set() {
    const set = new Set
    this.cache.push(set)
    this.index++
    while (true) {
      this.skipWhitespace()
      if (this.current == '}') break
      set.add(this.nextForm())
    }
    this.index++
    return set
  }

  char() { return this.source[++this.index] }

  skipWhitespace() {
    while ('\n\r\t, '.includes(this.current)) this.index++
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

  primitive() {
    const str = this.bufferChars()
    if (str == 'true') return true
    if (str == 'false') return false
    if (str == 'nil') return null
    var n = parseFloat(str, 10)
    if (isNaN(n)) return Symbol.for(str)
    if (n == str) return n
    throw this.error('invalid symbol "' + str + '"')
  }

  tagged() {
    const c = this.char()
    if (c == '{') return this.set()
    if (c == ' ') return this.reference()
    const tag = this.bufferChars()
    const fn = parse[tag]
    if (!fn) throw this.error('unknown tag type "' + tag + '"')
    this.index++ // skip space
    return fn(this.nextForm())
  }

  reference() {
    return this.cache[this.primitive() - 1]
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
