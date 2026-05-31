import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock electron（list/state 间接引用 rendererIpc -> electron）
// ---------------------------------------------------------------------------
vi.mock('electron', () => ({
  ipcRenderer: {
    send: vi.fn(),
    invoke: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
  },
}))

// 设置 document 和 window 全局环境
vi.stubGlobal('document', {
  getElementsByTagName: () => [{ innerText: '' }],
  createElement: () => ({}),
})

vi.stubGlobal('window', {
  sData: {} as any,
  requestIdleCallback: vi.fn(),
  addEventListener: vi.fn(),
})

// ---------------------------------------------------------------------------
// store/list/listManage/state.ts
// ---------------------------------------------------------------------------
describe('store/list/listManage/state', () => {
  beforeEach(async() => {
    vi.resetModules()
    window.sData = {} as any
  })

  it('defaultList 应使用默认初始值', async() => {
    const { defaultList } = await import('../list/listManage/state')
    expect(defaultList.id).toBe('default')
    expect(defaultList.name).toBe('list__name_default')
  })

  it('loveList 应使用默认初始值', async() => {
    const { loveList } = await import('../list/listManage/state')
    expect(loveList.id).toBe('love')
    expect(loveList.name).toBe('list__name_love')
  })

  it('tempList 应使用默认初始值', async() => {
    const { tempList } = await import('../list/listManage/state')
    expect(tempList.id).toBe('temp')
    expect(tempList.name).toBe('临时列表')
    expect(tempList.meta).toEqual({})
  })

  it('userLists 默认应为空数组', async() => {
    const { userLists } = await import('../list/listManage/state')
    expect(userLists).toHaveLength(0)
  })

  it('userLists 应支持添加用户列表', async() => {
    const { userLists } = await import('../list/listManage/state')
    const newList: S.List.UserListInfo = {
      id: 'user_list_1',
      name: '我的歌单',
      source: 'local',
    }
    userLists.push(newList)
    expect(userLists).toHaveLength(1)
    expect(userLists[0].id).toBe('user_list_1')
  })

  it('allMusicList 默认应为空 Map', async() => {
    const { allMusicList } = await import('../list/listManage/state')
    expect(allMusicList.size).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// store/list/state.ts
// ---------------------------------------------------------------------------
describe('store/list/state', () => {
  beforeEach(async() => {
    vi.resetModules()
    window.sData = {} as any
  })

  it('默认应从 listManage 导出 defaultList', async() => {
    const listState = await import('../list/state')
    expect(listState.defaultList.id).toBe('default')
  })

  it('默认应从 listManage 导出 loveList', async() => {
    const listState = await import('../list/state')
    expect(listState.loveList.id).toBe('love')
  })

  it('默认应从 listManage 导出 userLists', async() => {
    const listState = await import('../list/state')
    expect(listState.userLists).toHaveLength(0)
  })

  it('fetchingListStatus 默认应为空对象', async() => {
    const { fetchingListStatus } = await import('../list/state')
    expect(fetchingListStatus).toEqual({})
  })

  it('fetchingListStatus 应支持添加状态', async() => {
    const { fetchingListStatus } = await import('../list/state')
    fetchingListStatus.user_list_1 = true
    expect(fetchingListStatus.user_list_1).toBe(true)
  })

  it('listUpdateTimes 默认应为空对象', async() => {
    const { listUpdateTimes } = await import('../list/state')
    expect(listUpdateTimes).toEqual({})
  })

  it('listUpdateTimes 应支持更新时间', async() => {
    const { listUpdateTimes } = await import('../list/state')
    listUpdateTimes.user_list_1 = '2026-01-01 00:00:00'
    expect(listUpdateTimes.user_list_1).toBe('2026-01-01 00:00:00')
  })

  it('tempListMeta 应使用默认值', async() => {
    const { tempListMeta } = await import('../list/state')
    expect(tempListMeta.id).toBe('')
  })
})
