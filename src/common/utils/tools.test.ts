import { describe, expect, it } from 'vitest'
import {
  clipFileNameLength,
  clipNameLength,
  filterMusicList,
  fixNewMusicInfoQuality,
  toNewMusicInfo,
  toOldMusicInfo,
} from './tools'

// ---------------------------------------------------------------------------
// filterMusicList
// ---------------------------------------------------------------------------
describe('filterMusicList', () => {
  it('应去重相同 id 的条目', () => {
    const list = [
      { id: 'a', name: 'A', singer: 'S1', source: 'local', interval: null, meta: {} },
      { id: 'a', name: 'B', singer: 'S2', source: 'local', interval: null, meta: {} },
      { id: 'b', name: 'C', singer: 'S3', source: 'local', interval: null, meta: {} },
    ] as any[]
    expect(filterMusicList(list)).toEqual([
      { id: 'a', name: 'A', singer: 'S1', source: 'local', interval: null, meta: {} },
      { id: 'b', name: 'C', singer: 'S3', source: 'local', interval: null, meta: {} },
    ])
  })

  it('应过滤掉缺少 id 或 name 的条目', () => {
    const list = [
      { id: '', name: 'A', singer: 'S1', source: 'local', interval: null, meta: {} },
      { id: 'b', name: '', singer: 'S2', source: 'local', interval: null, meta: {} },
      { id: 'c', name: 'C', singer: 'S3', source: 'local', interval: null, meta: {} },
    ] as any[]
    expect(filterMusicList(list)).toEqual([
      { id: 'c', name: 'C', singer: 'S3', source: 'local', interval: null, meta: {} },
    ])
  })

  it('应将 null singer 设为空字符串', () => {
    const list = [
      { id: 'a', name: 'A', singer: null, source: 'local', interval: null, meta: {} },
    ] as any[]
    const result = filterMusicList(list)
    expect(result[0].singer).toBe('')
  })
})

// ---------------------------------------------------------------------------
// toNewMusicInfo
// ---------------------------------------------------------------------------
describe('toNewMusicInfo', () => {
  it('应转换 local 源音乐信息，含 filePath 和 ext', () => {
    const oldInfo = {
      source: 'local',
      songmid: '/music/song.mp3',
      name: 'Test Song',
      singer: 'Test Artist',
      interval: '04:00',
      albumName: 'Test Album',
      img: 'http://example.com/pic.jpg',
      filePath: '/music/song.mp3',
      ext: 'mp3',
    }
    const result = toNewMusicInfo(oldInfo)
    expect(result.id).toBe('local_/music/song.mp3')
    expect(result.name).toBe('Test Song')
    expect(result.singer).toBe('Test Artist')
    expect(result.source).toBe('local')
    expect(result.interval).toBe('04:00')
    expect(result.meta.songId).toBe('/music/song.mp3')
    expect(result.meta.albumName).toBe('Test Album')
    expect(result.meta.picUrl).toBe('http://example.com/pic.jpg')
    expect(result.meta.filePath).toBe('/music/song.mp3')
    expect(result.meta.ext).toBe('mp3')
  })

  it('local 源未提供 filePath 时应回退到 songmid', () => {
    const oldInfo = {
      source: 'local',
      songmid: '/music/song.flac',
      name: 'Song',
      singer: 'Artist',
      interval: null,
      albumName: 'Album',
      img: null,
    }
    const result = toNewMusicInfo(oldInfo)
    expect(result.meta.filePath).toBe('/music/song.flac')
    expect(result.meta.ext).toBe('flac')
  })

  it('local 源无 ext 时应从 filePath 扩展名推断', () => {
    const oldInfo = {
      source: 'local',
      songmid: '/music/song.ogg',
      name: 'Song',
      singer: 'Artist',
      interval: null,
      albumName: 'Album',
      img: null,
      filePath: '/music/song.ogg',
    }
    const result = toNewMusicInfo(oldInfo)
    expect(result.meta.ext).toBe('ogg')
  })

  it('local 源 ext 为空时应从 filePath 提取', () => {
    const oldInfo = {
      source: 'local',
      songmid: '/music/song.wav',
      name: 'Song',
      singer: 'Artist',
      interval: null,
      albumName: 'Album',
      img: null,
      filePath: '/music/song.wav',
      ext: undefined,
    }
    const result = toNewMusicInfo(oldInfo)
    expect(result.meta.ext).toBe('wav')
  })

  it('local 源无 ext 且 filePath 无扩展名时应返回空字符串', () => {
    const oldInfo = {
      source: 'local',
      songmid: 'some_id',
      name: 'Song',
      singer: 'Artist',
      interval: null,
      albumName: 'Album',
      img: null,
      filePath: undefined,
      ext: undefined,
    }
    const result = toNewMusicInfo(oldInfo)
    expect(result.meta.ext).toBe('')
  })

  it('应转换 kg 源音乐信息，id 包含 hash', () => {
    const oldInfo = {
      source: 'kg',
      songmid: 'kg_song_123',
      hash: 'abc123hash',
      name: 'KG Song',
      singer: 'KG Artist',
      interval: '03:30',
      albumName: 'KG Album',
      img: 'http://example.com/kg.jpg',
      types: [{ type: '128k', size: '3.5M' }],
      _types: { '128k': { size: '3.5M' } },
      albumId: 'album_01',
    }
    const result = toNewMusicInfo(oldInfo)
    expect(result.id).toBe('kg_song_123_abc123hash')
    expect(result.name).toBe('KG Song')
    expect(result.singer).toBe('KG Artist')
    expect(result.source).toBe('kg')
    expect(result.meta.hash).toBe('abc123hash')
    expect(result.meta.qualitys).toEqual([{ type: '128k', size: '3.5M' }])
    expect(result.meta._qualitys).toEqual({ '128k': { size: '3.5M' } })
    expect(result.meta.albumId).toBe('album_01')
  })

  it('应转换 tx 源音乐信息', () => {
    const oldInfo = {
      source: 'tx',
      songmid: 'song_456',
      name: 'TX Song',
      singer: 'TX Artist',
      interval: '02:45',
      albumName: 'TX Album',
      img: 'http://example.com/tx.jpg',
      types: [{ type: '128k', size: '2.1M' }],
      _types: { '128k': { size: '2.1M' } },
      albumId: 'tx_album_01',
      strMediaMid: 'str_media_mid_val',
      songId: 999,
      albumMid: 'album_mid_val',
    }
    const result = toNewMusicInfo(oldInfo)
    expect(result.id).toBe('tx_song_456')
    expect(result.meta.strMediaMid).toBe('str_media_mid_val')
    expect(result.meta.id).toBe(999)
    expect(result.meta.albumMid).toBe('album_mid_val')
  })

  it('应转换 mg 源音乐信息', () => {
    const oldInfo = {
      source: 'mg',
      songmid: 'song_789',
      name: 'MG Song',
      singer: 'MG Artist',
      interval: '05:00',
      albumName: 'MG Album',
      img: 'http://example.com/mg.jpg',
      types: [{ type: '128k', size: '4.0M' }],
      _types: { '128k': { size: '4.0M' } },
      albumId: 'mg_album_01',
      copyrightId: 'copyright_123',
      lrcUrl: 'http://example.com/lyrics.lrc',
      mrcUrl: 'http://example.com/lyrics.mrc',
      trcUrl: 'http://example.com/lyrics.trc',
    }
    const result = toNewMusicInfo(oldInfo)
    expect(result.id).toBe('mg_song_789')
    expect(result.meta.copyrightId).toBe('copyright_123')
    expect(result.meta.lrcUrl).toBe('http://example.com/lyrics.lrc')
    expect(result.meta.mrcUrl).toBe('http://example.com/lyrics.mrc')
    expect(result.meta.trcUrl).toBe('http://example.com/lyrics.trc')
  })

  it('应处理 flac32bit 到 flac24bit 迁移', () => {
    const oldInfo = {
      source: 'kw',
      songmid: 'kw_song_111',
      name: 'KW Song',
      singer: 'KW Artist',
      interval: '03:00',
      albumName: 'KW Album',
      img: null,
      types: [{ type: 'flac32bit', size: '30M' }, { type: '128k', size: '3M' }],
      _types: { flac32bit: { size: '30M' }, '128k': { size: '3M' } },
      albumId: 'kw_album',
    }
    const result = toNewMusicInfo(oldInfo)
    // flac32bit 应被迁移到 flac24bit
    expect(result.meta._qualitys.flac24bit).toEqual({ size: '30M' })
    expect(result.meta._qualitys.flac32bit).toBeUndefined()
    // qualitys 数组中的 type 也应被转换
    expect(result.meta.qualitys).toEqual([
      { type: 'flac24bit', size: '30M' },
      { type: '128k', size: '3M' },
    ])
  })

  it('如果已有 flac24bit 则不进行 flac32bit 迁移', () => {
    const oldInfo = {
      source: 'kw',
      songmid: 'kw_song_222',
      name: 'KW Song 2',
      singer: 'KW Artist 2',
      interval: '03:30',
      albumName: 'KW Album 2',
      img: null,
      types: [
        { type: 'flac32bit', size: '50M' },
        { type: 'flac24bit', size: '40M' },
        { type: '128k', size: '3M' },
      ],
      _types: {
        flac32bit: { size: '50M' },
        flac24bit: { size: '40M' },
        '128k': { size: '3M' },
      },
      albumId: 'kw_album_2',
    }
    const result = toNewMusicInfo(oldInfo)
    // 已有 flac24bit，flac32bit 应保留
    expect(result.meta._qualitys.flac32bit).toEqual({ size: '50M' })
    expect(result.meta._qualitys.flac24bit).toEqual({ size: '40M' })
  })
})

// ---------------------------------------------------------------------------
// toOldMusicInfo
// ---------------------------------------------------------------------------
describe('toOldMusicInfo', () => {
  it('应反向转换 local 源音乐信息', () => {
    const newInfo = {
      id: 'local_/music/song.mp3',
      name: 'Test Song',
      singer: 'Test Artist',
      source: 'local',
      interval: '04:00',
      meta: {
        songId: '/music/song.mp3',
        albumName: 'Test Album',
        picUrl: 'http://example.com/pic.jpg',
        filePath: '/music/song.mp3',
        ext: 'mp3',
      },
    } as any
    const result = toOldMusicInfo(newInfo)
    expect(result.name).toBe('Test Song')
    expect(result.singer).toBe('Test Artist')
    expect(result.source).toBe('local')
    expect(result.songmid).toBe('/music/song.mp3')
    expect(result.albumName).toBe('Test Album')
    expect(result.img).toBe('http://example.com/pic.jpg')
    expect(result.filePath).toBe('/music/song.mp3')
    expect(result.ext).toBe('mp3')
    expect(result.albumId).toBe('')
    expect(result.types).toEqual([])
    expect(result._types).toEqual({})
  })

  it('local 源 picUrl 为 null/undefined 时应回退为空字符串', () => {
    const newInfo = {
      id: 'local_x',
      name: 'N',
      singer: 'S',
      source: 'local',
      interval: null,
      meta: {
        songId: 'x',
        albumName: 'A',
        picUrl: null,
        filePath: '/p/file.mp3',
        ext: 'mp3',
      },
    } as any
    const result = toOldMusicInfo(newInfo)
    expect(result.img).toBe('')
  })

  it('应反向转换 kg 源音乐信息', () => {
    const newInfo = {
      id: 'kg_song_123_hash_val',
      name: 'KG Song',
      singer: 'KG Artist',
      source: 'kg',
      interval: '03:30',
      meta: {
        songId: 'kg_song_123',
        albumName: 'KG Album',
        picUrl: 'http://example.com/kg.jpg',
        qualitys: [{ type: '128k', size: '3.5M' }],
        _qualitys: { '128k': { size: '3.5M' } },
        albumId: 'album_01',
        hash: 'hash_val',
      },
    } as any
    const result = toOldMusicInfo(newInfo)
    expect(result.name).toBe('KG Song')
    expect(result.singer).toBe('KG Artist')
    expect(result.source).toBe('kg')
    expect(result.songmid).toBe('kg_song_123')
    expect(result.albumName).toBe('KG Album')
    expect(result.img).toBe('http://example.com/kg.jpg')
    expect(result.hash).toBe('hash_val')
    expect(result.types).toEqual([{ type: '128k', size: '3.5M' }])
    expect(result._types).toEqual({ '128k': { size: '3.5M' } })
    expect(result.albumId).toBe('album_01')
  })

  it('应反向转换 tx 源音乐信息', () => {
    const newInfo = {
      id: 'tx_song_456',
      name: 'TX Song',
      singer: 'TX Artist',
      source: 'tx',
      interval: '02:45',
      meta: {
        songId: 'tx_song_456',
        albumName: 'TX Album',
        picUrl: 'http://example.com/tx.jpg',
        qualitys: [{ type: '128k', size: '2.1M' }],
        _qualitys: { '128k': { size: '2.1M' } },
        albumId: 'tx_album_01',
        strMediaMid: 'str_media_mid_val',
        id: 999,
        albumMid: 'album_mid_val',
      },
    } as any
    const result = toOldMusicInfo(newInfo)
    expect(result.strMediaMid).toBe('str_media_mid_val')
    expect(result.songId).toBe(999)
    expect(result.albumMid).toBe('album_mid_val')
  })

  it('应反向转换 mg 源音乐信息', () => {
    const newInfo = {
      id: 'mg_song_789',
      name: 'MG Song',
      singer: 'MG Artist',
      source: 'mg',
      interval: '05:00',
      meta: {
        songId: 'mg_song_789',
        albumName: 'MG Album',
        picUrl: 'http://example.com/mg.jpg',
        qualitys: [{ type: '128k', size: '4.0M' }],
        _qualitys: { '128k': { size: '4.0M' } },
        albumId: 'mg_album_01',
        copyrightId: 'copyright_123',
        lrcUrl: 'http://example.com/lyrics.lrc',
        mrcUrl: 'http://example.com/lyrics.mrc',
        trcUrl: 'http://example.com/lyrics.trc',
      },
    } as any
    const result = toOldMusicInfo(newInfo)
    expect(result.copyrightId).toBe('copyright_123')
    expect(result.lrcUrl).toBe('http://example.com/lyrics.lrc')
    expect(result.mrcUrl).toBe('http://example.com/lyrics.mrc')
    expect(result.trcUrl).toBe('http://example.com/lyrics.trc')
  })
})

// ---------------------------------------------------------------------------
// fixNewMusicInfoQuality
// ---------------------------------------------------------------------------
describe('fixNewMusicInfoQuality', () => {
  it('local 源应直接返回不修改', () => {
    const info = {
      id: 'local_x',
      name: 'Song',
      singer: 'Artist',
      source: 'local',
      interval: null,
      meta: {
        songId: 'x',
        albumName: 'A',
        picUrl: null,
        filePath: '/p/file.mp3',
        ext: 'mp3',
      },
    } as any
    const result = fixNewMusicInfoQuality(info)
    expect(result).toBe(info)
  })

  it('应将 flac32bit 修复为 flac24bit', () => {
    const info = {
      id: 'kw_song_111',
      name: 'Song',
      singer: 'Artist',
      source: 'kw',
      interval: '03:00',
      meta: {
        songId: 'kw_song_111',
        albumName: 'Album',
        picUrl: null,
        qualitys: [{ type: 'flac32bit', size: '30M' }, { type: '128k', size: '3M' }],
        _qualitys: { flac32bit: { size: '30M' }, '128k': { size: '3M' } },
        albumId: 'album_01',
      },
    } as any
    const result = fixNewMusicInfoQuality(info)
    expect(result.meta._qualitys.flac24bit).toEqual({ size: '30M' })
    expect(result.meta._qualitys.flac32bit).toBeUndefined()
    expect(result.meta.qualitys).toEqual([
      { type: 'flac24bit', size: '30M' },
      { type: '128k', size: '3M' },
    ])
  })

  it('如果已有 flac24bit 则不修改', () => {
    const info = {
      id: 'kw_song_222',
      name: 'Song 2',
      singer: 'Artist 2',
      source: 'kw',
      interval: '03:30',
      meta: {
        songId: 'kw_song_222',
        albumName: 'Album 2',
        picUrl: null,
        qualitys: [
          { type: 'flac32bit', size: '50M' },
          { type: 'flac24bit', size: '40M' },
        ],
        _qualitys: {
          flac32bit: { size: '50M' },
          flac24bit: { size: '40M' },
        },
        albumId: 'album_02',
      },
    } as any
    const result = fixNewMusicInfoQuality(info)
    // flac32bit 应该保留
    expect(result.meta._qualitys.flac32bit).toEqual({ size: '50M' })
    expect(result.meta._qualitys.flac24bit).toEqual({ size: '40M' })
  })

  it('如果没有 flac32bit 则不做任何修改', () => {
    const info = {
      id: 'kw_song_333',
      name: 'Song 3',
      singer: 'Artist 3',
      source: 'kw',
      interval: '04:00',
      meta: {
        songId: 'kw_song_333',
        albumName: 'Album 3',
        picUrl: null,
        qualitys: [{ type: '128k', size: '3M' }],
        _qualitys: { '128k': { size: '3M' } },
        albumId: 'album_03',
      },
    } as any
    const result = fixNewMusicInfoQuality(info)
    expect(result.meta._qualitys).toEqual({ '128k': { size: '3M' } })
    expect(result.meta.qualitys).toEqual([{ type: '128k', size: '3M' }])
  })
})

// ---------------------------------------------------------------------------
// clipNameLength
// ---------------------------------------------------------------------------
describe('clipNameLength', () => {
  it('短名称应保持不变', () => {
    const name = '短歌名'
    expect(clipNameLength(name)).toBe(name)
  })

  it('不含顿号的长名称应保持不变', () => {
    const name = 'A'.repeat(100)
    expect(clipNameLength(name)).toBe(name)
  })

  it('含顿号的长名称应在 80 字符内截断', () => {
    // 生成一串通过顿号连接的名字，总长度 > 80，确保截断
    const parts = Array.from({ length: 10 }, (_, i) => 'A'.repeat(15))
    const longName = parts.join('、')
    const result = clipNameLength(longName)
    expect(result.length).toBeLessThanOrEqual(80)
    // 不应以顿号结尾
    expect(result.endsWith('、')).toBe(false)
  })

  it('应保留第一个名称，并尽可能追加后续名称', () => {
    const name = 'A'.repeat(10) + '、' + 'B'.repeat(10) + '、' + 'C'.repeat(10) + '、' + 'D'.repeat(60)
    // 总长度: 10 + 1 + 10 + 1 + 10 + 1 + 60 = 93
    // A(10) = 10, A+B(10+1+10=21) <= 80, A+B+C(21+1+10=32) <= 80, A+B+C+D(32+1+60=93) > 80, 所以 D 被截断
    const result = clipNameLength(name)
    expect(result).toBe('AAAAAAAAAA、BBBBBBBBBB、CCCCCCCCCC')
    expect(result.length).toBe(32)
  })

  it('如果第一个名称就已超过 80 字符，应直接返回', () => {
    const name = 'A'.repeat(90)
    expect(clipNameLength(name)).toBe(name)
  })
})

// ---------------------------------------------------------------------------
// clipFileNameLength
// ---------------------------------------------------------------------------
describe('clipFileNameLength', () => {
  it('短文件名应保持不变', () => {
    const name = 'short-file-name.mp3'
    expect(clipFileNameLength(name)).toBe(name)
  })

  it('长度等于 150 的文件名应保持不变', () => {
    const name = 'A'.repeat(150)
    expect(clipFileNameLength(name)).toBe(name)
  })

  it('长度超过 150 的文件名应截断', () => {
    const name = 'A'.repeat(200)
    const result = clipFileNameLength(name)
    expect(result).toBe('A'.repeat(150))
    expect(result.length).toBe(150)
  })
})
