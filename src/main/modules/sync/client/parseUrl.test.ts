import { describe, it, expect } from 'vitest'
import { parseSyncUrl } from './parseUrl'

describe('parseSyncUrl', () => {
  it('解析 http 地址', () => {
    expect(parseSyncUrl('http://192.168.1.5:23332/')).toEqual({
      wsProtocol: 'ws:', httpProtocol: 'http:', hostPath: '192.168.1.5:23332', href: 'http://192.168.1.5:23332',
    })
  })

  it('https 地址使用 wss', () => {
    expect(parseSyncUrl('https://a.com:1').wsProtocol).toBe('wss:')
  })

  it('拒绝 file 与 ftp 协议', () => {
    expect(() => parseSyncUrl('file:///C:/Windows')).toThrow()
    expect(() => parseSyncUrl('ftp://a.com')).toThrow()
  })

  it('拒绝无法解析的输入', () => {
    expect(() => parseSyncUrl('not a url')).toThrow()
  })
})
