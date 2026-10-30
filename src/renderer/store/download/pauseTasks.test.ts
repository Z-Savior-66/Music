import { describe, it, expect, vi } from 'vitest'
import { pauseTasks } from './pauseTasks'
import { DOWNLOAD_STATUS } from '@common/constants'

describe('pauseTasks', () => {
  it('运行中的任务要等工作线程确认停止后才回调', async() => {
    const order: string[] = []
    let finishStop: () => void = () => {}
    const pauseRunning = vi.fn(async() => new Promise<void>((resolve) => { finishStop = resolve }))
    const done = pauseTasks(
      [{ id: 'a', status: DOWNLOAD_STATUS.RUN }],
      pauseRunning,
      id => { order.push(`paused:${id}`) },
    )

    await Promise.resolve()
    expect(order).toEqual([])

    finishStop()
    await done
    expect(order).toEqual(['paused:a'])
  })

  it('等待中与出错的任务直接置为暂停，不调用工作线程', async() => {
    const pauseRunning = vi.fn().mockResolvedValue(undefined)
    const paused: string[] = []
    await pauseTasks(
      [
        { id: 'b', status: DOWNLOAD_STATUS.WAITING },
        { id: 'c', status: DOWNLOAD_STATUS.ERROR },
        { id: 'd', status: DOWNLOAD_STATUS.PAUSE },
      ],
      pauseRunning,
      id => { paused.push(id) },
    )
    expect(pauseRunning).not.toHaveBeenCalled()
    expect(paused).toEqual(['b', 'c'])
  })

  it('全部运行中的任务都停止后才 resolve', async() => {
    const resolvers: Array<() => void> = []
    const pauseRunning = vi.fn(async() => new Promise<void>((resolve) => { resolvers.push(resolve) }))
    let finished = false
    const done = pauseTasks(
      [
        { id: 'e', status: DOWNLOAD_STATUS.RUN },
        { id: 'f', status: DOWNLOAD_STATUS.RUN },
      ],
      pauseRunning,
      () => {},
    ).then(() => { finished = true })

    resolvers[0]()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(finished).toBe(false)

    resolvers[1]()
    await done
    expect(finished).toBe(true)
  })
})
