import type from '@jkroso/type'

const write = (data, cache) => {
  switch (type(data)) {
    case 'null': return 'nil'
    case 'boolean': return data ? 'true' : 'false'
    case 'number': return data.toString()
    case 'string': return JSON.stringify(data)
    case 'date': return `#inst "${data.toJSON()}"`
    case 'symbol': return data.toString().slice(7,-1)
    case 'array': return check(data, cache, arrayEDN)
    case 'map': return check(data, cache, mapEDN)
    case 'set': return check(data, cache, setEDN)
    case 'object':
      return data.toEDN ? data.toEDN(cache) : check(data, cache, objectEDN)
    default:
      throw new Error(`can't convert a ${data.constructor.name} to EDN`)
  }
}

const check = (x, cache, fn) => {
  if (cache.has(x)) return `# ${cache.get(x)}`
  cache.set(x, cache.size + 1)
  return fn(x, cache)
}

const arrayEDN = (array, cache) =>
  `#js/Array [${array.map(x => write(x, cache)).join(' ')}]`

const objectEDN = (object, cache) =>
  '#js/Object {' + Object.keys(object).reduce((arr, key) => {
    arr.push(JSON.stringify(key), write(object[key], cache))
    return arr
  }, []).join(' ') + '}'

const mapEDN = (map, cache) => {
  const arr = []
  for (var [key,value] of map.entries()) {
    arr.push(write(key, cache), write(value, cache))
  }
  return '{' + arr.join(' ') + '}'
}

const setEDN = (set, cache) => {
  var arr = []
  for (var value of set.values()) arr.push(write(value, cache))
  return `#{${arr.join(' ')}}`
}

export default (value) => write(value, new Map)
