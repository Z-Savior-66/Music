import { describe, it, expect, vi, beforeEach } from 'vitest'
import type * as SoundEffectModule from '../soundEffect'

// ---------------------------------------------------------------------------
// Mock IPC 层
// ---------------------------------------------------------------------------
const mockGetEQPresetList = vi.fn()
const mockSaveEQPresetList = vi.fn()
const mockGetConvolutionPresetList = vi.fn()
const mockSaveConvolutionPresetList = vi.fn()

vi.mock('@renderer/utils/ipc', () => ({
  getUserSoundEffectEQPresetList: mockGetEQPresetList,
  saveUserSoundEffectEQPresetList: mockSaveEQPresetList,
  getUserSoundEffectConvolutionPresetList: mockGetConvolutionPresetList,
  saveUserSoundEffectConvolutionPresetList: mockSaveConvolutionPresetList,
}))

// ---------------------------------------------------------------------------
// 预设数据工厂
// ---------------------------------------------------------------------------
const createEQPreset = (id: string): S.SoundEffect.EQPreset => ({
  id,
  name: `EQ ${id}`,
  hz31: 0,
  hz62: 0,
  hz125: 0,
  hz250: 0,
  hz500: 0,
  hz1000: 0,
  hz2000: 0,
  hz4000: 0,
  hz8000: 0,
  hz16000: 0,
})

const createConvolutionPreset = (id: string): S.SoundEffect.ConvolutionPreset => ({
  id,
  name: `Conv ${id}`,
  source: 'impulse.wav',
  mainGain: 10,
  sendGain: 0,
})

// ---------------------------------------------------------------------------
// 测试套件
// ---------------------------------------------------------------------------
describe('store/soundEffect', () => {
  let soundEffect: typeof SoundEffectModule

  beforeEach(async() => {
    vi.resetModules()
    mockGetEQPresetList.mockReset()
    mockSaveEQPresetList.mockReset()
    mockGetConvolutionPresetList.mockReset()
    mockSaveConvolutionPresetList.mockReset()
    soundEffect = await import('../soundEffect')
  })

  // ---------- EQ Preset ----------

  describe('getUserEQPresetList', () => {
    it('首次调用应通过 IPC 获取并缓存列表', async() => {
      const presets = [createEQPreset('eq1'), createEQPreset('eq2')]
      mockGetEQPresetList.mockResolvedValue(presets)

      const result = await soundEffect.getUserEQPresetList()
      expect(mockGetEQPresetList).toHaveBeenCalledTimes(1)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('eq1')
      expect(result[1].id).toBe('eq2')
    })

    it('后续调用应使用缓存列表，不再请求 IPC', async() => {
      const presets = [createEQPreset('eq1')]
      mockGetEQPresetList.mockResolvedValue(presets)

      await soundEffect.getUserEQPresetList()
      await soundEffect.getUserEQPresetList()
      expect(mockGetEQPresetList).toHaveBeenCalledTimes(1)
    })

    it('返回的列表应是响应式的', async() => {
      mockGetEQPresetList.mockResolvedValue([createEQPreset('eq1')])
      const result = await soundEffect.getUserEQPresetList()
      result.push(createEQPreset('eq2'))
      expect(result).toHaveLength(2)
    })
  })

  describe('saveUserEQPreset', () => {
    it('应新增预设并保存', async() => {
      mockGetEQPresetList.mockResolvedValue([])

      await soundEffect.saveUserEQPreset(createEQPreset('new_eq'))
      expect(mockSaveEQPresetList).toHaveBeenCalledTimes(1)
      const savedList = mockSaveEQPresetList.mock.calls[0][0]
      expect(savedList).toHaveLength(1)
      expect(savedList[0].id).toBe('new_eq')
    })

    it('应更新已有预设', async() => {
      const existing = createEQPreset('eq1')
      mockGetEQPresetList.mockResolvedValue([existing])

      await soundEffect.saveUserEQPreset({ ...existing, name: 'Updated Name' })
      expect(mockSaveEQPresetList).toHaveBeenCalledTimes(1)
      const savedList = mockSaveEQPresetList.mock.calls[0][0]
      expect(savedList).toHaveLength(1)
      expect(savedList[0].name).toBe('Updated Name')
    })

    it('未初始化时应自动初始化', async() => {
      mockGetEQPresetList.mockResolvedValue([])

      await soundEffect.saveUserEQPreset(createEQPreset('auto_init'))
      expect(mockGetEQPresetList).toHaveBeenCalledTimes(1)
      expect(mockSaveEQPresetList).toHaveBeenCalledTimes(1)
    })
  })

  describe('removeUserEQPreset', () => {
    it('应删除存在的预设', async() => {
      mockGetEQPresetList.mockResolvedValue([
        createEQPreset('eq1'),
        createEQPreset('eq2'),
      ])

      await soundEffect.removeUserEQPreset('eq1')
      expect(mockSaveEQPresetList).toHaveBeenCalledTimes(1)
      const savedList = mockSaveEQPresetList.mock.calls[0][0]
      expect(savedList).toHaveLength(1)
      expect(savedList[0].id).toBe('eq2')
    })

    it('删除不存在的预设不应保存', async() => {
      mockGetEQPresetList.mockResolvedValue([createEQPreset('eq1')])

      await soundEffect.removeUserEQPreset('nonexistent')
      expect(mockSaveEQPresetList).not.toHaveBeenCalled()
    })
  })

  // ---------- Convolution Preset ----------

  describe('getUserConvolutionPresetList', () => {
    it('首次调用应通过 IPC 获取并缓存列表', async() => {
      const presets = [createConvolutionPreset('conv1')]
      mockGetConvolutionPresetList.mockResolvedValue(presets)

      const result = await soundEffect.getUserConvolutionPresetList()
      expect(mockGetConvolutionPresetList).toHaveBeenCalledTimes(1)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('conv1')
    })

    it('后续调用应使用缓存', async() => {
      mockGetConvolutionPresetList.mockResolvedValue([createConvolutionPreset('conv1')])

      await soundEffect.getUserConvolutionPresetList()
      await soundEffect.getUserConvolutionPresetList()
      expect(mockGetConvolutionPresetList).toHaveBeenCalledTimes(1)
    })
  })

  describe('saveUserConvolutionPreset', () => {
    it('应新增卷积预设并保存', async() => {
      mockGetConvolutionPresetList.mockResolvedValue([])

      await soundEffect.saveUserConvolutionPreset(createConvolutionPreset('new_conv'))
      expect(mockSaveConvolutionPresetList).toHaveBeenCalledTimes(1)
      const savedList = mockSaveConvolutionPresetList.mock.calls[0][0]
      expect(savedList).toHaveLength(1)
      expect(savedList[0].id).toBe('new_conv')
    })

    it('应更新已有卷积预设', async() => {
      const existing = createConvolutionPreset('conv1')
      mockGetConvolutionPresetList.mockResolvedValue([existing])

      await soundEffect.saveUserConvolutionPreset({ ...existing, name: 'Updated Conv' })
      expect(mockSaveConvolutionPresetList).toHaveBeenCalledTimes(1)
      const savedList = mockSaveConvolutionPresetList.mock.calls[0][0]
      expect(savedList).toHaveLength(1)
      expect(savedList[0].name).toBe('Updated Conv')
    })
  })

  describe('removeUserConvolutionPreset', () => {
    it('应删除存在的卷积预设', async() => {
      mockGetConvolutionPresetList.mockResolvedValue([
        createConvolutionPreset('conv1'),
        createConvolutionPreset('conv2'),
      ])

      await soundEffect.removeUserConvolutionPreset('conv1')
      expect(mockSaveConvolutionPresetList).toHaveBeenCalledTimes(1)
      const savedList = mockSaveConvolutionPresetList.mock.calls[0][0]
      expect(savedList).toHaveLength(1)
      expect(savedList[0].id).toBe('conv2')
    })

    it('删除不存在的卷积预设不应保存', async() => {
      mockGetConvolutionPresetList.mockResolvedValue([createConvolutionPreset('conv1')])

      await soundEffect.removeUserConvolutionPreset('nonexistent')
      expect(mockSaveConvolutionPresetList).not.toHaveBeenCalled()
    })
  })
})
