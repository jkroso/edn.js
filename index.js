import type from '@jkroso/type'
import List, {EOL} from './list'
import write from './write'
import read from './read'
import UUID from './uuid'

/////
// Tagged template handler
//
export const edn = (strs, ...data) => {
  const ids = data.map(() => Symbol.for(':' + new UUID().toString()))
  const edn = strs.reduce((a,b,i) => a + write(ids[i - 1]) + b)
  const env = {}
  ids.forEach((id,i) => env[id] = data[i])
  return replaceSymbols(read(edn), env)
}

export const replaceSymbols = (data, env) => {
  if (Array.isArray(data)) return data.map(x => replaceSymbols(x, env))
  if (data instanceof Map) {
    var map = new Map
    for (var [key,value] of data) {
      map.set(replaceSymbols(key, env), replaceSymbols(value, env))
    }
    return map
  }
  if (data instanceof Set) {
    var set = new Set
    data.forEach(val => set.add(replaceSymbols(val, env)))
    return set
  }
  if (data instanceof List) return replaceInList(data, env)
  if (type(data) == 'symbol' && data in env) return env[data]
  return data
}

const replaceInList = (list, env) => {
  if (list === EOL) return list
  list.value = replaceSymbols(list.value, env)
  replaceInList(list.tail, env)
  return list
}

export {write, read, UUID, List, EOL}
