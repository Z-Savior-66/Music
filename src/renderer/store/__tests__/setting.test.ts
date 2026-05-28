import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// 使用 globalThis 设置窗口 mock（避免 vi.stubGlobal 的全局污染）
// ---------------------------------------------------------------------------
const mockSaveSetting = vi.fn()
vi.mock('@renderer/utils/ipc', () => ({
  updateSetting: mockSaveSetting,
}))

// ---------------------------------------------------------------------------
// 测试套件
// ---------------------------------------------------------------------------
describe('store/setting', () => {
  let setting: typeof import('../setting')

  beforeEach(async () => {
    vi.resetModules()
    ;(globalThis as any).window = {
      lxData: {},
    }
    mockSaveSetting.mockReset()
    setting = await import('../setting')
  })

  describe('appSetting', () => {
    it('应使用默认设置初始化', () => {
      expect(setting.appSetting['common.windowSizeId']).toBe(3)
      expect(setting.appSetting['common.fontSize']).toBe(16)
      expect(setting.appSetting['common.langId']).toBeNull()
    })

    it('应自动同意协议 isAgreePact 为 true', () => {
      expect(setting.appSetting['common.isAgreePact']).toBe(true)
    })

    it('应挂载到 window.lxData.appSetting', () => {
      expect((globalThis as any).window.lxData.appSetting).toBe(setting.appSetting)
    })
  })

  describe('isShowAnimation', () => {
    it('默认值应为 true', () => {
      expect(setting.isShowAnimation.value).toBe(true)
    })

    it('当 common.isShowAnimation 变化时应同步更新', () => {
      setting.appSetting['common.isShowAnimation'] = false
      expect(setting.isShowAnimation.value).toBe(false)

      setting.appSetting['common.isShowAnimation'] = true
      expect(setting.isShowAnimation.value).toBe(true)
    })
  })

  describe('initSetting', () => {
    it('应合并新设置到 appSetting', () => {
      const newSetting = { ...setting.appSetting, 'common.fontSize': 20, 'common.windowSizeId': 5 }
      setting.initSetting(newSetting)
      expect(setting.appSetting['common.fontSize']).toBe(20)
      expect(setting.appSetting['common.windowSizeId']).toBe(5)
    })

    it('应确保 isAgreePact 为 true', () => {
      const newSetting = { ...setting.appSetting, 'common.isAgreePact': false }
      setting.initSetting(newSetting)
      expect(setting.appSetting['common.isAgreePact']).toBe(true)
    })
  })

  describe('mergeSetting', () => {
    it('应部分合并设置', () => {
      setting.mergeSetting({ 'common.fontSize': 24 })
      expect(setting.appSetting['common.fontSize']).toBe(24)
      expect(setting.appSetting['common.windowSizeId']).toBe(3)
    })

    it('应确保 isAgreePact 为 true', () => {
      setting.mergeSetting({ 'common.isAgreePact': false })
      expect(setting.appSetting['common.isAgreePact']).toBe(true)
    })

    it('应合并多个设置项', () => {
      setting.mergeSetting({ 'common.fontSize': 18, 'common.windowSizeId': 4, 'common.langId': 'zh-CN' })
      expect(setting.appSetting['common.fontSize']).toBe(18)
      expect(setting.appSetting['common.windowSizeId']).toBe(4)
      expect(setting.appSetting['common.langId']).toBe('zh-CN')
    })

    it('空对象应不做任何变更', () => {
      const before = { ...setting.appSetting }
      setting.mergeSetting({})
      expect(setting.appSetting['common.fontSize']).toBe(before['common.fontSize'])
    })
  })

  describe('updateSetting', () => {
    it('应调用 IPC 保存设置', () => {
      setting.updateSetting({ 'common.fontSize': 22 })
      expect(mockSaveSetting).toHaveBeenCalledTimes(1)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'common.fontSize': 22 })
    })

    it('应挂载到 window.lxData.updateSetting', () => {
      expect((globalThis as any).window.lxData.updateSetting).toBe(setting.updateSetting)
    })

    it('应支持保存多个设置项', () => {
      setting.updateSetting({ 'common.fontSize': 18, 'common.langId': 'en' })
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'common.fontSize': 18, 'common.langId': 'en' })
    })
  })

  describe('saveAgreePact', () => {
    it('应保存协议同意状态', () => {
      setting.saveAgreePact(true)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'common.isAgreePact': true })
      setting.saveAgreePact(false)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'common.isAgreePact': false })
    })
  })

  describe('saveMediaDeviceId', () => {
    it('应保存媒体设备 ID', () => {
      setting.saveMediaDeviceId('test-device-id')
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.mediaDeviceId': 'test-device-id' })
    })
  })

  describe('saveVolume', () => {
    it('应保存音量值', () => {
      setting.saveVolume(0.5)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.volume': 0.5 })
    })
    it('应保存音量为 0', () => {
      setting.saveVolume(0)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.volume': 0 })
    })
    it('应保存音量为 1', () => {
      setting.saveVolume(1)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.volume': 1 })
    })
  })

  describe('saveVolumeIsMute', () => {
    it('应保存静音状态', () => {
      setting.saveVolumeIsMute(true)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.isMute': true })
      setting.saveVolumeIsMute(false)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.isMute': false })
    })
  })

  describe('savePlaybackRate', () => {
    it('应保存播放速率', () => {
      setting.savePlaybackRate(1.5)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.playbackRate': 1.5 })
      setting.savePlaybackRate(0.5)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.playbackRate': 0.5 })
      setting.savePlaybackRate(2)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.playbackRate': 2 })
    })
  })

  describe('setVisibleDesktopLyric', () => {
    it('应设置桌面歌词可见', () => {
      setting.setVisibleDesktopLyric(true)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'desktopLyric.enable': true })
      setting.setVisibleDesktopLyric(false)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'desktopLyric.enable': false })
    })
  })

  describe('setLockDesktopLyric', () => {
    it('应设置桌面歌词锁定状态', () => {
      setting.setLockDesktopLyric(true)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'desktopLyric.isLock': true })
    })
  })

  describe('setTogglePlayMode', () => {
    it('应设置切歌模式', () => {
      setting.setTogglePlayMode('listLoop')
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.togglePlayMethod': 'listLoop' })
      setting.setTogglePlayMode('singleLoop')
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.togglePlayMethod': 'singleLoop' })
    })
  })

  describe('setApiSource', () => {
    it('应设置 API 源', () => {
      setting.setApiSource('kw')
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'common.apiSource': 'kw' })
    })
  })

  describe('setPlayDetailLyricFont', () => {
    it('应设置歌词字体大小', () => {
      setting.setPlayDetailLyricFont(20)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'playDetail.style.fontSize': 20 })
    })
  })

  describe('setPlayDetailLyricAlign', () => {
    it('应设置歌词对齐方式', () => {
      setting.setPlayDetailLyricAlign('center')
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'playDetail.style.align': 'center' })
      setting.setPlayDetailLyricAlign('left')
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'playDetail.style.align': 'left' })
    })
  })

  describe('setEnableAudioVisualization', () => {
    it('应启用/禁用音频可视化', () => {
      setting.setEnableAudioVisualization(true)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.audioVisualization': true })
      setting.setEnableAudioVisualization(false)
      expect(mockSaveSetting).toHaveBeenCalledWith({ 'player.audioVisualization': false })
    })
  })
})
