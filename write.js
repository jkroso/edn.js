import type from '@jkroso/type'

export default (data) => {
  const buffer = []
  write(data, [], buffer)
  return buffer.join('\t')
}

const write = (data, seen, buffer) => {
  var i = seen.indexOf(data)
  if (i < 0) {
    i = seen.push(data) - 1
    buffer[i] = toEDN(data, seen, buffer)
  }
  return `#ref ${i}`
}

const toEDN = (data, seen, buffer) => {
  switch (type(data)) {
    case 'null': return 'nil'
    case 'boolean': return data ? 'true' : 'false'
    case 'number': return data.toString()
    case 'string': return JSON.stringify(data)
    case 'date': return `#inst "${data.toJSON()}"`
    case 'array': return `#js/Array [${data.map(d => write(d, seen, buffer)).join(' ')}]`
    case 'symbol': return data.toString().slice(7,-1)
    case 'map': return mapEDN(data, seen, buffer)
    case 'set': return setEDN(data, seen, buffer)
    case 'object':
      if (data.toEDN) return data.toEDN()
      return objectEDN(data.toJSON ? data.toJSON() : data, seen, buffer)
    default:
      throw new Error(`can't convert a ${data.constructor.name} to EDN`)
  }
}

const objectEDN = (object, seen, buffer) =>
  '#js/Object {' + Object.keys(object).reduce((arr, key) => {
    arr.push(JSON.stringify(key), write(object[key], seen, buffer))
    return arr
  }, []).join(' ') + '}'

const mapEDN = (map, seen, buffer) => {
  const arr = []
  for (var [key,value] of map.entries()) {
    arr.push(write(key, seen, buffer), write(value, seen, buffer))
  }
  return '{' + arr.join(' ') + '}'
}

const setEDN = (set, seen, buffer) => {
  var arr = []
  for (var value of set.values()) {
    arr.push(write(value, seen, buffer))
  }
  return `#{${arr.join(' ')}}`
}
