import { describe, it, expect } from 'vitest'
import { normalizeBounds } from './bounds'

describe('normalizeBounds', () => {
  it('取整并保持合法尺寸', () => {
    expect(normalizeBounds({ x: 10.6, y: 20.2, width: 400.4, height: 120.8 }))
      .toEqual({ x: 11, y: 20, width: 400, height: 121 })
  })

  it('不改变真实窗口尺寸，避免渲染侧缩放基准与窗口不一致', () => {
    // 窗口最小尺寸由 BrowserWindow 的 minWidth/minHeight 保证，
    // 回推值必须与真实尺寸一致，否则渲染侧按偏大的基准计算会导致缩放跳变
    expect(normalizeBounds({ x: 0, y: 0, width: 100, height: 20 }))
      .toEqual({ x: 0, y: 0, width: 100, height: 20 })
  })
})
