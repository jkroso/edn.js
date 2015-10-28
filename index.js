const type = require('jkroso-type')

export const write = require('./write')
export const read = require('./read')
export const UUID = require('./uuid')
export const List = require('./list')

/////
// Tagged template handler
//
export const edn = (strs, ...data) => {
  const ids = data.map(() => Symbol.for(':' + new UUID().toString()))
  const edn = strs.reduce((a,b,i) => a + write(ids[i - 1]) + b)
  const env = new Map(ids.map((id,i) => [id, data[i]]))
  return replace(read(edn), env)
}

const replace = (data, env) => {
  if (Array.isArray(data)) return data.map(x => replace(x, env))
  if (data instanceof Map) {
    var map = data
    data = new Map
    for (var [key,value] of map) {
      data.set(replace(key, env), replace(value, env))
    }
  }
  if (data instanceof List) return replaceInList(data, env)
  if (type(data) == 'symbol' && env.has(data)) return env.get(data)
  return data
}

const replaceInList = (list, env) => {
  if (list === List.EOL) return list
  list.value = replace(list.value, env)
  replaceInList(list.tail, env)
  return list
}
