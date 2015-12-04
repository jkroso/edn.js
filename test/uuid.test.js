import {deepEqual,notDeepEqual} from 'assert'
import UUID from '../uuid'

describe('UUID', () => {
  it('new UUID()', () => {
    deepEqual(new UUID().data.length, 16)
    notDeepEqual(new UUID().data, new UUID().data)
    deepEqual(new UUID('00000000-0000-0000-0000-000000000000').data,
              new Uint8Array(16))
    deepEqual(new UUID('f81d4fae-7dec-11d0-a765-00a0c91e6bf6').data,
              new Uint8Array([0xf8,0x1d,0x4f,0xae,0x7d,0xec,0x11,0xd0,0xa7,0x65,0x00,0xa0,0xc9,0x1e,0x6b,0xf6]))
    deepEqual(new UUID('f81d4fae7dec11d0a76500a0c91e6bf6').data,
              new Uint8Array([0xf8,0x1d,0x4f,0xae,0x7d,0xec,0x11,0xd0,0xa7,0x65,0x00,0xa0,0xc9,0x1e,0x6b,0xf6]))
  })

  it('toJSON', () => {
    deepEqual(new UUID('00000000-0000-0000-0000-000000000000').toJSON(),
              '00000000-0000-0000-0000-000000000000')
    deepEqual(new UUID('f81d4fae-7dec-11d0-a765-00a0c91e6bf6').toJSON(),
              'f81d4fae-7dec-11d0-a765-00a0c91e6bf6')
  })

  it('toString', () => {
    deepEqual(new UUID('00000000-0000-0000-0000-000000000000').toString(),
              '00000000000000000000000000000000')
    deepEqual(new UUID('f81d4fae-7dec-11d0-a765-00a0c91e6bf6').toString(),
              'f81d4fae7dec11d0a76500a0c91e6bf6')
  })
})
