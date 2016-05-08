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

  nextForm(nocache) {
    switch (this.current) {
      case '"': return this.string()
      case '[': return this.vector(nocache)
      case '(': return this.list(nocache)
      case '{': return this.map(nocache)
      case ':': return Symbol.for(this.bufferWhile(charRegex))
      case '#': return this.tagged(nocache)
      case '\\': return this.char()
      case '}':
      case ']':
      case ')': throw this.error(`unexpected closing "${this.source[this.index++]}"`)
      case undefined: throw new SyntaxError('unexpected end of input')
      default: return this.primitive()
    }
  }

  vector(nocache) {
    const vec = []
    nocache || this.cache.push(vec)
    this.index++ // skip opening brace
    while (true) {
      this.skipWhitespace()
      if (this.current == ']') break
      vec.push(this.nextForm())
    }
    this.index++ // skip closing brace
    return vec
  }

  list(nocache) {
    this.index++
    this.skipWhitespace()
    if (this.current == ')') return EOL
    const list = new List
    nocache || this.cache.push(list)
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

  map(nocache) {
    const map = new Map
    nocache || this.cache.push(map)
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

  set(nocache) {
    const set = new Set
    nocache || this.cache.push(set)
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

  bufferWhile(regex) {
    var buf = this.current
    while (ismatch(regex, this.char())) buf += this.current
    return buf
  }

  primitive() {
    const str = this.bufferWhile(charRegex)
    if (str == 'true') return true
    if (str == 'false') return false
    if (str == 'nil') return null
    var n = parseFloat(str, 10)
    if (isNaN(n)) return Symbol.for(str)
    if (n == str) return n
    throw this.error('invalid symbol "' + str + '"')
  }

  tagged(nocache) {
    const c = this.char()
    if (c == '{') return this.set(nocache)
    if (c == ' ') return this.reference()
    const tag = this.bufferWhile(tagRegex)
    this.index++ // skip space
    if (tag in tags) return tags[tag](this.nextForm(true))
    if (tag in types) {
      const T = types[tag]
      const t = Object.create(T.prototype)
      this.cache.push(t)
      T.apply(t, Array.from(this.nextForm(true)))
      return t
    }
    throw this.error('unknown tag type "' + tag + '"')
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
const tagRegex = /[^\s]/
const ismatch = (r, c) => c != null && r.test(c)

const parse = (str, filename) => new Parser(str, filename).nextForm()

export const tags = {
  'inst': str => new Date(str),
  'uuid': str => new UUID(str),
  'js/Array': array => array,
  'js/Object': map => {
    const object = {}
    for (var [key,value] of map.entries()) {
      object[key] = value
    }
    return object
  }
}

export const types = {}

export default parse
