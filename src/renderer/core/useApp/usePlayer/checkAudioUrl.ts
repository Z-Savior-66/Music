/**
 * 给 Promise 加一个兜底超时。
 *
 * 预加载依赖浏览器媒体事件，网络异常时事件可能永远不触发；
 * 超时后以 `fallback` 结束，让调用方继续往下走而不是一直卡住。
 * 原 promise 若在超时后才有结果，其结果被丢弃。
 */
export const withTimeout = async <T>(promise: Promise<T>, fallback: T, ms: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(fallback)
    }, ms)

    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}
