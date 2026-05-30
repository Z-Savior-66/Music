import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// player/state.ts
// ---------------------------------------------------------------------------
describe('store/player/state', () => {
  beforeEach(async () => {
    vi.resetModules()
    ;(globalThis as any).window = { sData: {} }
  })

  it('musicInfo 应使用默认初始值', async () => {
    const { musicInfo } = await import('../player/state')
    expect(musicInfo.id).toBeNull()
    expect(musicInfo.pic).toBeNull()
    expect(musicInfo.name).toBe('')
    expect(musicInfo.singer).toBe('')
    expect(musicInfo.album).toBe('')
  })

  it('musicInfo 应挂载到 window.sData.musicInfo', async () => {
    const { musicInfo } = await import('../player/state')
    expect((globalThis as any).window.sData.musicInfo).toBe(musicInfo)
  })

  it('isPlay 默认应为 false 且可切换', async () => {
    const { isPlay } = await import('../player/state')
    expect(isPlay.value).toBe(false)
    isPlay.value = true
    expect(isPlay.value).toBe(true)
  })

  it('status 默认应为空字符串并挂载到 window.sData', async () => {
    const { status } = await import('../player/state')
    expect(status.value).toBe('')
    expect((globalThis as any).window.sData.status).toBe(status)
  })

  it('playInfo 应使用默认初始值', async () => {
    const { playInfo } = await import('../player/state')
    expect(playInfo.playIndex).toBe(-1)
    expect(playInfo.playerListId).toBeNull()
  })

  it('playMusicInfo 应使用默认初始值', async () => {
    const { playMusicInfo } = await import('../player/state')
    expect(playMusicInfo.listId).toBeNull()
    expect(playMusicInfo.musicInfo).toBeNull()
    expect(playMusicInfo.isTempPlay).toBe(false)
  })

  it('playedList 和 tempPlayList 默认应为空数组', async () => {
    const { playedList, tempPlayList } = await import('../player/state')
    expect(playedList).toHaveLength(0)
    expect(tempPlayList).toHaveLength(0)
    expect((globalThis as any).window.sData.playedList).toBe(playedList)
  })

  it('isShowPlayerDetail/isShowPlayComment/isShowLrcSelectContent 默认均为 false', async () => {
    const { isShowPlayerDetail, isShowPlayComment, isShowLrcSelectContent } = await import('../player/state')
    expect(isShowPlayerDetail.value).toBe(false)
    expect(isShowPlayComment.value).toBe(false)
    expect(isShowLrcSelectContent.value).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// player/volume.ts
// ---------------------------------------------------------------------------
describe('store/player/volume', () => {
  beforeEach(async () => {
    vi.resetModules()
  })

  it('volume 默认应为 0', async () => {
    const { volume } = await import('../player/volume')
    expect(volume.value).toBe(0)
  })

  it('setVolume 应更新音量值', async () => {
    const { volume, setVolume } = await import('../player/volume')
    setVolume(0.5)
    expect(volume.value).toBe(0.5)
    setVolume(0)
    expect(volume.value).toBe(0)
    setVolume(1)
    expect(volume.value).toBe(1)
  })

  it('setMute 应更新静音状态', async () => {
    const { isMute, setMute } = await import('../player/volume')
    expect(isMute.value).toBe(false)
    setMute(true)
    expect(isMute.value).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// player/playbackRate.ts
// ---------------------------------------------------------------------------
describe('store/player/playbackRate', () => {
  beforeEach(async () => {
    vi.resetModules()
  })

  it('playbackRate 默认应为 1', async () => {
    const { playbackRate } = await import('../player/playbackRate')
    expect(playbackRate.value).toBe(1)
  })

  it('setPlaybackRate 应更新播放速率', async () => {
    const { playbackRate, setPlaybackRate } = await import('../player/playbackRate')
    setPlaybackRate(2)
    expect(playbackRate.value).toBe(2)
    setPlaybackRate(0.5)
    expect(playbackRate.value).toBe(0.5)
  })
})

// ---------------------------------------------------------------------------
// player/lyric.ts
// ---------------------------------------------------------------------------
describe('store/player/lyric', () => {
  beforeEach(async () => {
    vi.resetModules()
  })

  it('lyric 应使用默认初始值', async () => {
    const { lyric } = await import('../player/lyric')
    expect(lyric.lines).toHaveLength(0)
    expect(lyric.text).toBe('')
    expect(lyric.line).toBe(0)
    expect(lyric.offset).toBe(0)
    expect(lyric.tempOffset).toBe(0)
  })

  it('setLines 应设置歌词行', async () => {
    const { lyric, setLines } = await import('../player/lyric')
    const lines = [{ text: 'line1', time: 1000, extendedLyrics: [], dom_line: {} as HTMLDivElement }]
    setLines(lines)
    expect(lyric.lines).toHaveLength(1)
    expect(lyric.lines[0].text).toBe('line1')
  })

  it('setLines 空数组且当前无行时应不做变更', async () => {
    const { lyric, setLines } = await import('../player/lyric')
    setLines([])
    expect(lyric.lines).toHaveLength(0)
  })

  it('setText/setOffset/setTempOffset 应更新对应属性', async () => {
    const { lyric, setText, setOffset, setTempOffset } = await import('../player/lyric')
    setText('Hello', 5)
    expect(lyric.text).toBe('Hello')
    expect(lyric.line).toBe(5)
    setOffset(500)
    expect(lyric.offset).toBe(500)
    setOffset(-300)
    expect(lyric.offset).toBe(-300)
    setTempOffset(200)
    expect(lyric.tempOffset).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// player/playProgress.ts
// ---------------------------------------------------------------------------
describe('store/player/playProgress', () => {
  beforeEach(async () => {
    vi.resetModules()
  })

  it('playProgress 应使用默认初始值', async () => {
    const { playProgress } = await import('../player/playProgress')
    expect(playProgress.nowPlayTime).toBe(0)
    expect(playProgress.maxPlayTime).toBe(0)
    expect(playProgress.progress).toBe(0)
  })

  it('setNowPlayTime 应更新当前播放时间', async () => {
    const { playProgress, setNowPlayTime } = await import('../player/playProgress')
    setNowPlayTime(90)
    expect(playProgress.nowPlayTime).toBe(90)
    expect(playProgress.nowPlayTimeStr).toBe('01:30')
  })

  it('setNowPlayTime 当 maxPlayTime 为 0 时应保持 progress 为 0', async () => {
    const { playProgress, setNowPlayTime, setMaxplayTime } = await import('../player/playProgress')
    setNowPlayTime(60)
    expect(playProgress.progress).toBe(0)
    setMaxplayTime(120)
    setNowPlayTime(60)
    expect(playProgress.progress).toBe(0.5)
  })

  it('setMaxplayTime 应更新最大播放时间', async () => {
    const { playProgress, setMaxplayTime } = await import('../player/playProgress')
    setMaxplayTime(200)
    expect(playProgress.maxPlayTime).toBe(200)
    expect(playProgress.maxPlayTimeStr).toBe('03:20')
  })

  it('setProgress 应同时设置当前时间和总时间', async () => {
    const { playProgress, setProgress } = await import('../player/playProgress')
    setProgress(75, 150)
    expect(playProgress.nowPlayTime).toBe(75)
    expect(playProgress.maxPlayTime).toBe(150)
    expect(playProgress.progress).toBe(0.5)
  })

  it('setProgress 总时间为 0 时应保持 progress 为 0', async () => {
    const { playProgress, setProgress } = await import('../player/playProgress')
    setProgress(30, 0)
    expect(playProgress.progress).toBe(0)
  })
})
