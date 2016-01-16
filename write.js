import type from '@jkroso/type'

const write = data => {
  switch (type(data)) {
    case 'null': return 'nil'
    case 'boolean': return data ? 'true' : 'false'
    case 'number': return data.toString()
    case 'string': return JSON.stringify(data)
    case 'date': return `#inst "${data.toJSON()}"`
    case 'array': return `#js/Array [${data.map(write).join(' ')}]`
    case 'symbol': return data.toString().slice(7,-1)
    case 'map': return mapEDN(data)
    case 'set': return setEDN(data)
    case 'object':
      if (data.toEDN) return data.toEDN()
      return objectEDN(data.toJSON ? data.toJSON() : data)
    default:
      throw new Error(`can't convert a ${data.constructor.name} to EDN`)
  }
}

const objectEDN = object =>
  '#js/Object {' + Object.keys(object).reduce((arr, key) => {
    arr.push(JSON.stringify(key), write(object[key]))
    return arr
  }, []).join(' ') + '}'

const mapEDN = map => {
  const arr = []
  for (var [key,value] of map.entries()) {
    arr.push(write(key), write(value))
  }
  return '{' + arr.join(' ') + '}'
}

const setEDN = set => {
  var arr = []
  for (var value of set.values()) arr.push(write(value))
  return `#{${arr.join(' ')}}`
}

export default write
