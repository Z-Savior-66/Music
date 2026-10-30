import { describe, it, expect } from 'vitest'
import { buildS2tLyric } from './s2tLyric'

const convert = async(text: string) => `T(${text})`

describe('buildS2tLyric', () => {
  it('转换可见歌词，保留原文到 rawlrcInfo', async() => {
    const result = await buildS2tLyric({ lyric: '[00:00]美丽', tlyric: null, rlyric: null, slyric: null, rawlrcInfo: { lyric: '美丽', tlyric: null, rlyric: null, slyric: null } } as any, convert)
    expect(result.lyric).toBe('T([00:00]美丽)')
    expect(result.rawlrcInfo.lyric).toBe('美丽')
  })

  it('没有 rawlrcInfo 时用原文自身作为 rawlrcInfo', async() => {
    const result = await buildS2tLyric({ lyric: '[00:00]美丽', tlyric: null, rlyric: null, slyric: null } as any, convert)
    expect(result.lyric).toBe('T([00:00]美丽)')
    expect(result.rawlrcInfo.lyric).toBe('[00:00]美丽')
  })
})
