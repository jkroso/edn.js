# cyclic-edn

A fork of edn-js which supports reading and writing of cyclic data. It turns out to be suprisingly difficult to support this feature. As a result the code is more complex and adding taggedLiterals takes more effort. So this fork will always remain a fork. Also it uses a slightly different seriliazation format which isn't compatable with EDN proper. Though this could be fixed and probably should be.

## Installation

`npm install cyclic-edn`

then in your app:

```js
const {read,write} = require('cyclic-edn')
```

## API

### `read(str)`

Takes a string of CEDN data and returns the best approximation of it in native JS data

```js
read('#{#ref 1 #ref 2 #ref 3}\t1\t2\t3') // => new Set([1,2,3])
```

### `write(value)`

Converts any value to its CEDN representation

```js
write(new Set([1,2,3])) // => '#{#ref 1 #ref 2 #ref 3}\t1\t2\t3'
```
