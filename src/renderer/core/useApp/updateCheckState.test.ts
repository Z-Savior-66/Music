import { describe, expect, it } from 'vitest'
import { shouldHandleUpdateCheckTimeout } from './updateCheckState'

describe('shouldHandleUpdateCheckTimeout', () => {
  it('应只在生产环境的检查中状态触发超时兜底', () => {
    expect(shouldHandleUpdateCheckTimeout({
      status: 'checking',
      isProd: true,
      isWinArm: false,
    })).toBe(true)
  })

  it('非检查中、开发环境、Windows ARM 环境不应触发超时兜底', () => {
    expect(shouldHandleUpdateCheckTimeout({
      status: 'idle',
      isProd: true,
      isWinArm: false,
    })).toBe(false)
    expect(shouldHandleUpdateCheckTimeout({
      status: 'checking',
      isProd: false,
      isWinArm: false,
    })).toBe(false)
    expect(shouldHandleUpdateCheckTimeout({
      status: 'checking',
      isProd: true,
      isWinArm: true,
    })).toBe(false)
  })
})
