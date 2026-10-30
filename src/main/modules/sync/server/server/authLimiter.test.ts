import { describe, it, expect } from 'vitest'
import { createAuthLimiter, MAX_AUTH_FAILURES } from './authLimiter'

describe('authLimiter', () => {
  it('超过失败次数后封禁该 IP', () => {
    const limiter = createAuthLimiter(3)
    for (let i = 0; i < 3; i++) limiter.recordFailure('1.1.1.1')
    expect(limiter.isBlocked('1.1.1.1')).toBe(false)
    limiter.recordFailure('1.1.1.1')
    expect(limiter.isBlocked('1.1.1.1')).toBe(true)
  })

  it('成功后解除封禁并清零', () => {
    const limiter = createAuthLimiter(1)
    limiter.recordFailure('2.2.2.2')
    limiter.recordFailure('2.2.2.2')
    expect(limiter.isBlocked('2.2.2.2')).toBe(true)
    limiter.recordSuccess('2.2.2.2')
    expect(limiter.isBlocked('2.2.2.2')).toBe(false)
  })

  it('不同 IP 互不影响，默认上限为 20', () => {
    const limiter = createAuthLimiter()
    expect(MAX_AUTH_FAILURES).toBe(20)
    limiter.recordFailure('3.3.3.3')
    expect(limiter.isBlocked('4.4.4.4')).toBe(false)
  })

  it('封锁在冷却窗口内保持，窗口过后自动解除', () => {
    // 永久封锁会让用户只能重启应用才能恢复连接，冷却窗口给出自助恢复的路径
    let now = 0
    const limiter = createAuthLimiter(1, 60000, () => now)
    limiter.recordFailure('5.5.5.5')
    limiter.recordFailure('5.5.5.5')
    expect(limiter.isBlocked('5.5.5.5')).toBe(true)

    now = 59999
    expect(limiter.isBlocked('5.5.5.5')).toBe(true)

    now = 60000
    expect(limiter.isBlocked('5.5.5.5')).toBe(false)
  })

  it('冷却窗口过后重新计数，不会立刻再次封锁', () => {
    let now = 0
    const limiter = createAuthLimiter(1, 60000, () => now)
    limiter.recordFailure('6.6.6.6')
    limiter.recordFailure('6.6.6.6')
    now = 60000
    expect(limiter.recordFailure('6.6.6.6')).toBe(1)
    expect(limiter.isBlocked('6.6.6.6')).toBe(false)
  })
})
