import { describe, it, expect, vi } from 'vitest'
import { createDelayRetry } from './getUrlTrack'

describe('createDelayRetry', () => {
  it('等待期结束后执行 run 并返回其结果', async() => {
    const run = vi.fn().mockResolvedValue('url')
    const handle = createDelayRetry(run, 0.01)
    await expect(handle.promise).resolves.toBe('url')
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('run 抛错时 promise 以错误 reject', async() => {
    const handle = createDelayRetry(async() => Promise.reject(new Error('429')), 0.01)
    await expect(handle.promise).rejects.toThrow('429')
  })

  it('cancel 后 promise 以 null resolve，且 run 不再执行', async() => {
    const run = vi.fn().mockResolvedValue('url')
    const handle = createDelayRetry(run, 1)
    handle.cancel()
    await expect(handle.promise).resolves.toBeNull()
    await new Promise(resolve => setTimeout(resolve, 1100))
    expect(run).not.toHaveBeenCalled()
  })

  it('等待期结束时若 shouldRun 为假则跳过 run 并返回 null', async() => {
    // 等待期内切歌后，旧歌曲的请求连同状态文案与加载超时都必须不再发生
    const run = vi.fn().mockResolvedValue('url')
    const handle = createDelayRetry(run, 0.01, () => false)
    await expect(handle.promise).resolves.toBeNull()
    expect(run).not.toHaveBeenCalled()
  })
})
