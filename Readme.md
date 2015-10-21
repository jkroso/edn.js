# edn-js

An EDN reader and an EDN writer for JS. It tries to use native JS types when possible but currently JS has no equivalent of EDN's List or UUID; so edn-js provides them.

## Installation

`npm install edn-js`

then in your app:

```js
const {read,write,edn,List,UUID} = require('edn-js')
```

## API

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

### ``edn`str` ``

This function is designed to be used with ES6's tagged template strings

```js
edn`(1 2)` // => List.from([1,2])
```

And if you want to interpolate values it does it without serializing them so identity is preserved

```js
const object = {}
edn`(${object})` // => List.from([object])
```
