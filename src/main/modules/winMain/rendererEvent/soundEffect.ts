import { STORE_NAMES } from '@common/constants'
import { WIN_MAIN_RENDERER_EVENT_NAME } from '@common/ipcNames'
import { mainOn, mainHandle } from '@common/mainIpc'
import getStore from '@main/utils/store'

export default () => {
  mainHandle<S.SoundEffect.EQPreset[]>(WIN_MAIN_RENDERER_EVENT_NAME.get_sound_effect_eq_preset, async() => {
    return getStore(STORE_NAMES.SOUND_EFFECT).get('eqPreset') as S.SoundEffect.EQPreset[] | null ?? []
  })
  mainOn<S.SoundEffect.EQPreset[]>(WIN_MAIN_RENDERER_EVENT_NAME.save_sound_effect_eq_preset, ({ params }) => {
    getStore(STORE_NAMES.SOUND_EFFECT).set('eqPreset', params)
  })

  mainHandle<S.SoundEffect.ConvolutionPreset[]>(WIN_MAIN_RENDERER_EVENT_NAME.get_sound_effect_convolution_preset, async() => {
    return getStore(STORE_NAMES.SOUND_EFFECT).get('convolutionPreset') as S.SoundEffect.ConvolutionPreset[] | null ?? []
  })
  mainOn<S.SoundEffect.ConvolutionPreset[]>(WIN_MAIN_RENDERER_EVENT_NAME.save_sound_effect_convolution_preset, ({ params }) => {
    getStore(STORE_NAMES.SOUND_EFFECT).set('convolutionPreset', params)
  })

  // mainHandle<S.SoundEffect.PitchShifterPreset[]>(WIN_MAIN_RENDERER_EVENT_NAME.get_sound_effect_pitch_shifter_preset, async() => {
  //   return getStore(STORE_NAMES.SOUND_EFFECT).get('pitchShifterPreset') as S.SoundEffect.PitchShifterPreset[] | null ?? []
  // })
  // mainOn<S.SoundEffect.PitchShifterPreset[]>(WIN_MAIN_RENDERER_EVENT_NAME.save_sound_effect_pitch_shifter_preset, ({ params }) => {
  //   getStore(STORE_NAMES.SOUND_EFFECT).set('pitchShifterPreset', params)
  // })
}
