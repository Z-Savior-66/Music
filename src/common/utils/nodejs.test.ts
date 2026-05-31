import { describe, it, expect, vi, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import type * as NodejsModule from '@common/utils/nodejs'
import type * as UtilsModule from '@common/utils/index'

// ---------------------------------------------------------------------------
// nodejs.ts 纯函数测试
// ---------------------------------------------------------------------------
describe('common/utils/nodejs - path helpers', () => {
  let nodejs: typeof NodejsModule

  beforeEach(async() => {
    vi.resetModules()
    nodejs = await import('@common/utils/nodejs')
  })

  it('joinPath 应合并路径', () => {
    expect(nodejs.joinPath('/data', 'themes')).toBe(path.join('/data', 'themes'))
    expect(nodejs.joinPath('/data', 'themes', 'bg.jpg')).toBe(path.join('/data', 'themes', 'bg.jpg'))
  })

  it('extname 应提取文件扩展名', () => {
    expect(nodejs.extname('song.mp3')).toBe('.mp3')
    expect(nodejs.extname('song.flac')).toBe('.flac')
    expect(nodejs.extname('song')).toBe('')
  })

  it('basename 应提取文件名', () => {
    expect(nodejs.basename('/data/song.mp3')).toBe('song.mp3')
    expect(nodejs.basename('/data/song.mp3', '.mp3')).toBe('song')
  })

  it('dirname 应提取目录名', () => {
    expect(nodejs.dirname('/data/song.mp3')).toBe('/data')
  })

  it('toMD5 应生成正确的 MD5 哈希', () => {
    expect(nodejs.toMD5('hello')).toBe('5d41402abc4b2a76b9719d911017c592')
    expect(nodejs.toMD5('S Music')).toHaveLength(32)
  })

  it('toMD5 空字符串应生成正确哈希', () => {
    expect(nodejs.toMD5('')).toBe('d41d8cd98f00b204e9800998ecf8427e')
  })

  it('b64DecodeUnicode 应解码 base64 字符串', () => {
    expect(nodejs.b64DecodeUnicode('SGVsbG8=')).toBe('Hello')
    expect(nodejs.b64DecodeUnicode('5L2g5aW9')).toBe('你好')
  })
})

// ---------------------------------------------------------------------------
// nodejs.ts 异步函数测试（使用真实文件系统）
// ---------------------------------------------------------------------------
describe('common/utils/nodejs - async fs functions', () => {
  let nodejs: typeof NodejsModule
  const testDir = path.join(os.tmpdir(), 'savior-test-' + Date.now())

  beforeEach(async() => {
    vi.resetModules()
    nodejs = await import('@common/utils/nodejs')
    try { fs.rmSync(testDir, { recursive: true }) } catch {}
    fs.mkdirSync(testDir, { recursive: true })
  })

  it('checkPath 应检测存在的路径', async() => {
    expect(await nodejs.checkPath(testDir)).toBe(true)
  })

  it('checkPath 应检测不存在的路径', async() => {
    expect(await nodejs.checkPath(path.join(testDir, 'nonexistent'))).toBe(false)
  })

  it('checkPath 空字符串应返回 false', async() => {
    expect(await nodejs.checkPath('')).toBe(false)
  })

  it('getFileStats 应获取文件状态', async() => {
    const filePath = path.join(testDir, 'test.txt')
    fs.writeFileSync(filePath, 'test')
    const stats = await nodejs.getFileStats(filePath)
    expect(stats).not.toBeNull()
    expect(stats!.isFile()).toBe(true)
  })

  it('getFileStats 不存在的路径应返回 null', async() => {
    const stats = await nodejs.getFileStats(path.join(testDir, 'nonexistent.txt'))
    expect(stats).toBeNull()
  })

  it('getFileStats 空字符串应返回 null', async() => {
    expect(await nodejs.getFileStats('')).toBeNull()
  })

  it('createDir 应创建目录', async() => {
    const newDir = path.join(testDir, 'subdir')
    await nodejs.createDir(newDir)
    expect(fs.existsSync(newDir)).toBe(true)
  })

  it('readFile 应读取文件内容', async() => {
    const filePath = path.join(testDir, 'readme.txt')
    fs.writeFileSync(filePath, 'hello world')
    const buf = await nodejs.readFile(filePath)
    expect(buf.toString()).toBe('hello world')
  })
})

// ---------------------------------------------------------------------------
// common/utils/index.ts - 平台工具函数
// ---------------------------------------------------------------------------
describe('common/utils/index - platform helpers', () => {
  let utils: typeof UtilsModule

  beforeEach(async() => {
    vi.resetModules()
    utils = await import('@common/utils/index')
  })

  it('getPlatform 应识别 windows', () => {
    expect(utils.getPlatform('win32')).toBe('windows')
  })

  it('getPlatform 应识别 mac', () => {
    expect(utils.getPlatform('darwin')).toBe('mac')
  })

  it('getPlatform 应识别 linux', () => {
    expect(utils.getPlatform('linux')).toBe('linux')
    expect(utils.getPlatform('aix')).toBe('linux')
  })

  describe('compareVer', () => {
    it('相同版本应返回 0', () => {
      expect(utils.compareVer('2.12.3', '2.12.3')).toBe(0)
    })

    it('当前版本大于目标应返回 1', () => {
      expect(utils.compareVer('2.13.0', '2.12.3')).toBe(1)
      expect(utils.compareVer('3.0.0', '2.12.3')).toBe(1)
    })

    it('当前版本小于目标应返回 -1', () => {
      expect(utils.compareVer('2.12.0', '2.12.3')).toBe(-1)
      expect(utils.compareVer('1.0.0', '2.12.3')).toBe(-1)
    })

    it('应处理不同长度的版本号', () => {
      expect(utils.compareVer('1.2', '1.2.0')).toBe(0)
      expect(utils.compareVer('1.0.0', '1.0')).toBe(0)
    })

    it('应处理包含字母的版本号', () => {
      expect(utils.compareVer('2.0.0-beta', '2.0.0')).toBe(-1)
      expect(utils.compareVer('2.0.0', '2.0.0-rc1')).toBe(1)
    })
  })
})
