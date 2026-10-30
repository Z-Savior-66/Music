export interface DelayRetryHandle {
  promise: Promise<string | null>
  cancel: () => void
}

/**
 * 创建一个延迟执行并返回音频地址的重试句柄。
 *
 * 约束：`run` 至多执行一次；`cancel()` 之后结果不再对外生效——未启动则永不启动，
 * 已启动则结果被丢弃、`promise` 以 `null` resolve。`shouldRun` 在等待期结束时
 * 再判断一次，用于在切歌后连请求本身都不再发出。调用方据此保证旧歌曲的重试
 * 不会在切歌后把地址写回播放器，也不会残留状态文案或触发自动切歌。
 */
export const createDelayRetry = (
  run: () => Promise<string | null>,
  waitSeconds: number,
  shouldRun: () => boolean = () => true,
): DelayRetryHandle => {
  let timer: NodeJS.Timeout | null = null
  let settled = false
  let resolveFn: (value: string | null) => void
  let rejectFn: (reason?: any) => void

  const promise = new Promise<string | null>((resolve, reject) => {
    resolveFn = resolve
    rejectFn = reject
  })

  const settle = (fn: (value: string | null) => void, value: string | null) => {
    if (settled) return
    settled = true
    timer = null
    fn(value)
  }

  timer = setTimeout(() => {
    if (!shouldRun()) {
      settle(resolveFn, null)
      return
    }
    void run().then(
      result => { settle(resolveFn, result) },
      (err: any) => {
        if (settled) return
        settled = true
        timer = null
        rejectFn(err)
      },
    )
  }, waitSeconds * 1000)

  return {
    promise,
    cancel() {
      if (timer) clearTimeout(timer)
      settle(resolveFn, null)
    },
  }
}
