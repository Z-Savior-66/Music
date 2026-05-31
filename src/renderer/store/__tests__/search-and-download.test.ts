import { describe, it, expect, vi, beforeEach } from 'vitest'

// 完整环境 mock
;(globalThis as any).window = (globalThis as any).window || {} as any
;(globalThis as any).window.sData = {} as any
;(globalThis as any).window.s = { rootOffset: 0 } as any
;(globalThis as any).window.dt = false
;(globalThis as any).window.requestIdleCallback = vi.fn()
;(globalThis as any).window.addEventListener = vi.fn()

// ---------------------------------------------------------------------------
// store/search/state.ts
// ---------------------------------------------------------------------------
describe('store/search/state', () => {
  beforeEach(async() => {
    vi.resetModules()
    ;(globalThis as any).window.sData = {} as any
  })

  it('searchText 默认应为空字符串', async() => {
    const { searchText } = await import('../search/state')
    expect(searchText.value).toBe('')
  })

  it('searchText 应可写入', async() => {
    const { searchText } = await import('../search/state')
    searchText.value = '周杰伦'
    expect(searchText.value).toBe('周杰伦')
  })

  it('historyList 默认应为空数组', async() => {
    const { historyList } = await import('../search/state')
    expect(historyList).toHaveLength(0)
  })

  it('historyList 应支持添加记录', async() => {
    const { historyList } = await import('../search/state')
    historyList.push('周杰伦')
    historyList.push('林俊杰')
    expect(historyList).toHaveLength(2)
    expect(historyList[0]).toBe('周杰伦')
    expect(historyList[1]).toBe('林俊杰')
  })
})

// ---------------------------------------------------------------------------
// store/download/state.ts
// ---------------------------------------------------------------------------
describe('store/download/state', () => {
  beforeEach(async() => {
    vi.resetModules()
    ;(globalThis as any).window.sData = {} as any
  })

  it('isInitedList 默认应为 false', async() => {
    const { isInitedList } = await import('../download/state')
    expect(isInitedList.value).toBe(false)
  })

  it('setInited 应将 isInitedList 设为 true', async() => {
    const { isInitedList, setInited } = await import('../download/state')
    setInited()
    expect(isInitedList.value).toBe(true)
  })

  it('downloadList 默认应为空数组', async() => {
    const { downloadList } = await import('../download/state')
    expect(downloadList).toHaveLength(0)
  })

  it('downloadStatus 应包含枚举值', async() => {
    const { downloadStatus } = await import('../download/state')
    expect(downloadStatus.RUN).toBe('run')
    expect(downloadStatus.WAITING).toBe('waiting')
    expect(downloadStatus.PAUSE).toBe('pause')
    expect(downloadStatus.ERROR).toBe('error')
    expect(downloadStatus.COMPLETED).toBe('completed')
  })
})
