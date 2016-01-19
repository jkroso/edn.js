import List,{EOL} from 'edn-js/list'
import UUID from 'edn-js/uuid'

export default (str, filename) => {
  const input = str.split('\t')
  const output = new Array(input.length)
  return parseRef(0, {input, output, filename})
}

const parseRef = (ref, state) => {
  const out = state.output[ref]
  if (out !== undefined) return out
  const str = state.input[ref]
  return state.output[ref] = nextForm(str, 0, state, ref)[1]
}

const nextForm = (str, i, state, ref) => {
  switch (str[i]) {
    case '[':  return parseVector(str, i, state, ref)
    case '(':  return parseList(str, i, state, ref)
    case '{':  return parseMap(str, i, state, ref)
    case '#':  return parseTaggedLiteral(str, i, state, ref)
    case '"':  return parseString(str, i, state)
    case ':':  return parseSymbol(str, i, state)
    case '\\': return [i+2, str[i+1]] // char
    case '}':
    case ']':
    case ')': throw error(`unexpected closing "${str[i++]}"`)
    case undefined: throw new SyntaxError('unexpected end of input')
    default: return parsePrimitive(str, i, state)
  }
}

const parseString = (str, i) => {
  var c, buffer = []
  while ((c = str[++i]) != '"') {
    if (c == '\\') switch (c = str[++i]) {
      case 'b': c = '\b'; break
      case 'f': c = '\f'; break
      case 'n': c = '\n'; break
      case 'r': c = '\r'; break
      case 't': c = '\t'; break
      case 'v': c = '\v'; break
      case 'x': throw new Error('TODO: support hex literals')
    }
    if (c === undefined) throw new SyntaxError('unexpected end of input')
    buffer.push(c)
  }
  return [i + 1, buffer.join('')]
}

const parseUntil = (brace, str, i, state) => {
  i += 1 // skip opening brace
  var form, out = []
  while (true) {
    const c = str[i]
    // skip whitespace
    switch (c) {
      case '\n':
      case '\r':
      case ',':
      case ' ': i += 1; continue
    }
    if (c == brace) break
    [i,form] = nextForm(str, i, state)
    out.push(form)
  }
  return [i + 1, out]
}

const parseVector = (str, i, state, ref) => {
  const vector = state.output[ref] = []
  var [i, list] = parseUntil(']', str, i, state)
  vector.push(...list)
  return [i, vector]
}

const parseList = (str, i, state, ref) => {
  const list = state.output[ref] = new List
  var [i, values] = parseUntil(')', str, i, state)
  if (values.length == 0) return [i, (state.output[ref] = EOL)]
  const donor = List.from(values)
  list.value = donor.value
  list.tail = donor.tail
  return [i, list]
}

const parseMap = (str, i, state, ref) => {
  const map = state.output[ref] = new Map
  var [i, list] = parseUntil('}', str, i, state)
  for (var j = 0, len = list.length; j < len;) {
    map.set(list[j++], list[j++])
  }
  return [i, map]
}

const parseSet = (str, i, state, ref) => {
  const set = state.output[ref] = new Set
  var [i, list] = parseUntil('}', str, i, state)
  for (var j = 0, len = list.length; j < len; j++) {
    set.add(list[j])
  }
  return [i, set]
}

const parseSymbol = (str, i) => {
  const chars = bufferChars(str, i)
  return [i + chars.length, Symbol.for(chars)]
}

const parsePrimitive = (str, i) => {
  const chars = bufferChars(str, i)
  if (chars == 'true') return [i + 4, true]
  if (chars == 'false') return [i + 5, false]
  if (chars == 'nil') return [i + 3, null]
  const n = parseFloat(chars, 10)
  if (isNaN(n)) return [i + chars.length, Symbol.for(chars)]
  if (n == chars) return [i + chars.length, n]
  throw error(`invalid symbol "${chars}"`)
}

const parseTaggedLiteral = (str, i, state, ref) => {
  if (str[++i] == '{') return parseSet(str, i, state, ref)
  const tag = bufferChars(str, i)
  if (tag in taggedLiteralParsers) {
    const fn = taggedLiteralParsers[tag]
    return fn(str, i + tag.length + 1, state, ref)
  }
  const fn = taggedLiteralHandlers[tag]
  if (!fn) throw error(`unknown tag type "${tag}"`)
  var [i, form] = nextForm(str, i + tag.length + 1, state, ref)
  return [i, fn(form, state, ref)]
}

const bufferChars = (str, i) => {
  var buf = ''
  while (true) {
    const c = str[i++]
    if (isChar(c)) buf += c
    else break
  }
  return buf
}

const error = (msg) => {
  return new SyntaxError(msg)
}

const charRegex = /[^\s,}\])]/
const isChar = c => c != null && charRegex.test(c)

const taggedLiteralParsers = {
  'js/Object': (str, i, state, ref) => {
    const object = state.output[ref] = {}
    var [i, list] = parseUntil('}', str, i, state)
    for (var j = 0, len = list.length; j < len;) {
      object[list[j++]] = list[j++]
    }
    return [i, object]
  },
  'ref': (str, i, state) => {
    var [i, int] = parsePrimitive(str, i, state)
    return [i, parseRef(int, state)]
  },
}

const taggedLiteralHandlers = {
  'inst': str => new Date(str),
  'uuid': str => new UUID(str),
  'js/Array': array => array,
}
