import { describe, it, expect } from 'vitest'
import { withTimeout } from './checkAudioUrl'

describe('withTimeout', () => {
  it('按时完成时返回原结果', async() => {
    await expect(withTimeout(Promise.resolve(true), false, 100)).resolves.toBe(true)
  })

  it('超时时返回兜底值', async() => {
    await expect(withTimeout(new Promise<boolean>(() => {}), false, 20)).resolves.toBe(false)
  })

  it('原 promise 拒绝时原样抛出', async() => {
    await expect(withTimeout(Promise.reject(new Error('x')), false, 100)).rejects.toThrow('x')
  })
})
