import { describe, expect, it } from 'vitest'
import { normalizeUpdateUrl } from './preloadUtils'

describe('normalizeUpdateUrl', () => {
  it('应保留合法的 HTTP 更新地址', () => {
    expect(normalizeUpdateUrl('https://example.com/update')).toBe('https://example.com/update')
  })

  it('应丢弃格式非法但长度未超限的更新地址', () => {
    expect(normalizeUpdateUrl('javascript:alert(1)')).toBeUndefined()
  })

  it('应丢弃长度超限的更新地址', () => {
    expect(normalizeUpdateUrl(`https://example.com/${'a'.repeat(1024)}`)).toBeUndefined()
  })
})
