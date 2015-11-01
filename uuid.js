export default class UUID {
  constructor(str) {
    this.data = new Uint8Array(16)
    if (str) this.parse(str)
    else this.randomize()
  }
  parse(str) {
    if (str.length == 32) {
      parseChunk(str,  0, 32, this.data,  0)
    } else {
      parseChunk(str,  0,  8, this.data,  0)
      parseChunk(str,  9, 13, this.data,  4)
      parseChunk(str, 14, 18, this.data,  6)
      parseChunk(str, 19, 23, this.data,  8)
      parseChunk(str, 24, 36, this.data, 10)
    }
  }
  randomize() {
    for (var i = 0; i < 16; i++) {
      this.data[i] = Math.floor(Math.random() * 256)
    }
  }
  toString() {
    var buf = Array(32)
    encodeChunk(this.data, 0, 16, buf,  0)
    return buf.join('')
  }
  toJSON() {
    var buf = Array(36)
    encodeChunk(this.data, 0, 4, buf,  0)
    buf[8] = '-'
    encodeChunk(this.data, 4, 6, buf,  9)
    buf[13] = '-'
    encodeChunk(this.data, 6, 8, buf, 14)
    buf[18] = '-'
    encodeChunk(this.data, 8, 10, buf, 19)
    buf[23] = '-'
    encodeChunk(this.data, 10, 16, buf, 24)
    return buf.join('')
  }
  toEDN() {
    return `#uuid "${this.toJSON()}"`
  }
}

const pad = str => str.length < 2 ? '0' + str : str

const encodeChunk = (bytes, begin, end, str, pos) => {
  while (begin < end) {
    var [a,b] = pad(bytes[begin++].toString(16))
    str[pos++] = a
    str[pos++] = b
  }
}

const parseChunk = (str, begin, end, bytes, pos) => {
  for (;begin < end; begin += 2)
    bytes[pos++] = parseInt(str.substr(begin, 2), 16)
}
