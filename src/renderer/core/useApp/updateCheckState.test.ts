import { describe, expect, it } from 'vitest'
import {
  shouldCheckUpdateOnStartup,
  shouldHandleUpdateCheckTimeout,
  shouldLoadVersionInfoOnStartup,
} from './updateCheckState'

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

describe('启动时更新检查策略', () => {
  it('生产环境且已同意协议时应触发自动更新检查', () => {
    expect(shouldCheckUpdateOnStartup({
      isProd: true,
      isAgreePact: true,
    })).toBe(true)
  })

  it('开发环境且已同意协议时只应拉取版本信息用于显示', () => {
    expect(shouldCheckUpdateOnStartup({
      isProd: false,
      isAgreePact: true,
    })).toBe(false)
    expect(shouldLoadVersionInfoOnStartup({
      isProd: false,
      isAgreePact: true,
    })).toBe(true)
  })

  it('未同意协议时不应触发任何更新网络请求', () => {
    expect(shouldCheckUpdateOnStartup({
      isProd: true,
      isAgreePact: false,
    })).toBe(false)
    expect(shouldLoadVersionInfoOnStartup({
      isProd: false,
      isAgreePact: false,
    })).toBe(false)
  })
})
