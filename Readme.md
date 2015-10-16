# edn

An EDN reader and an EDN writer for JS

## Installation

`npm install edn-js`

then in your app:

```js
const edn = require('edn-js')
```

## API

### `edn()`


### `read(str)`

Just takes a string of EDN data and returns the best approximation of it in native JS data

```js
read('[1 2]') // => [1, 2]
read('#{1 2}') // => new Set([1, 2])
read('{1 2}') // => new Map([[1, 2]])
```

### `write(value)`

Converts any value to its EDN representation. If its not a builtin type then it should implement either `toEDN()` returning a string or `toJSON()` returning a plain `Object`.

```js
write(new Date(0)) // => '#inst "1970-01-01T00:00:00.000Z"'
write(new Set([1,2,3])) // => '#{1 2 3}'
write(new Map([[Symbol('a'), 1]])) // => '{a 1}'
write({a: 1, b: 2}) // => '#js/Object {"a" 1 "b" 2}'
write([1,2]) // => '#js/Array [1 2]'
```
