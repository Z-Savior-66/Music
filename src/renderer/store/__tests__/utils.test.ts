import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock electron（utils.ts 间接引用 rendererIpc -> electron）
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

const mockGetThemes = vi.fn()
vi.mock('@renderer/utils/ipc', () => ({
  getThemes: mockGetThemes,
}))

// ---------------------------------------------------------------------------
// store/utils.ts
// ---------------------------------------------------------------------------
describe('store/utils', () => {
  let utils: typeof import('../utils')

  beforeEach(async () => {
    vi.resetModules()
    ;(globalThis as any).window = {
      lxData: {} as any,
      lx: { rootOffset: 0 } as any,
      setTheme: vi.fn(),
      dt: false,
      requestIdleCallback: vi.fn(),
      addEventListener: vi.fn(),
    }
    ;(globalThis as any).document = {
      getElementsByTagName: () => [{ innerText: '' }],
      createElement: () => ({}),
    }
    mockGetThemes.mockReset()

    await import('../index')
    utils = await import('../utils')
  })

  describe('assertApiSupport', () => {
    it('local 源应始终受支持', () => {
      expect(utils.assertApiSupport('local')).toBe(true)
    })
    it('在线源应检查 qualityList 是否存在', () => {
      expect(utils.assertApiSupport('kw')).toBe(false)
    })
  })

  describe('buildBgUrl', () => {
    it('应处理 URL 地址', () => {
      expect(utils.buildBgUrl('https://example.com/bg.jpg', '/data')).toBe('url(https://example.com/bg.jpg)')
    })
    it('应处理本地文件路径', () => {
      const result = utils.buildBgUrl('bg.jpg', '/data/themes')
      expect(result).toMatch(/^url\(/)
      expect(result).toContain('bg.jpg')
    })
  })

  describe('copyTheme', () => {
    it('应深度复制主题对象', () => {
      const theme: LX.Theme = {
        id: 'custom', name: '自定义', isDark: false, isCustom: true,
        config: { themeColors: { '--color-primary': '#ff0000' }, extInfo: { '--background-image': 'bg.jpg' } },
      }
      const copied = utils.copyTheme(theme)
      copied.config.themeColors['--color-primary'] = '#00ff00'
      expect(theme.config.themeColors['--color-primary']).toBe('#ff0000')
    })
  })

  describe('findTheme', () => {
    it('应在内置主题中查找', () => {
      const info: LX.ThemeInfo = {
        themes: [{ id: 'green', name: '绿色', isDark: false, isCustom: false, config: { themeColors: {}, extInfo: {} } }],
        userThemes: [], dataPath: '',
      }
      expect(utils.findTheme(info, 'green')!.id).toBe('green')
    })
    it('应在用户主题中查找', () => {
      const info: LX.ThemeInfo = {
        themes: [],
        userThemes: [{ id: 'my_theme', name: '我的主题', isDark: false, isCustom: true, config: { themeColors: {}, extInfo: {} } }],
        dataPath: '',
      }
      expect(utils.findTheme(info, 'my_theme')!.id).toBe('my_theme')
    })
    it('主题不存在时应返回 undefined', () => {
      expect(utils.findTheme({ themes: [], userThemes: [], dataPath: '' }, 'x')).toBeUndefined()
    })
  })

  describe('buildThemeColors', () => {
    it('应合并 themeColors 和 extInfo', () => {
      const theme: LX.Theme = {
        id: 'test', name: '测试', isDark: false, isCustom: false,
        config: { themeColors: { '--color-primary': '#ff0000' }, extInfo: { '--background-image': 'none' } },
      }
      const colors = utils.buildThemeColors(theme, '/data')
      expect(colors['--color-primary']).toBe('#ff0000')
      expect(colors['--background-image']).toBe('none')
    })
    it('自定义主题应处理背景图片路径', () => {
      const theme: LX.Theme = {
        id: 'custom', name: '自定义', isDark: false, isCustom: true,
        config: { themeColors: {}, extInfo: { '--background-image': 'custom_bg.jpg' } },
      }
      expect(utils.buildThemeColors(theme, '/data/themes')['--background-image']).toMatch(/^url\(/)
    })
  })
})
