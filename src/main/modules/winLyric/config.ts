import { isLinux } from '@common/utils'
import { closeWindow, createWindow, getBounds, isExistWindow, alwaysOnTopTools, setBounds, setIgnoreMouseEvents, setSkipTaskbar } from './main'
import { sendConfigChange } from './rendererEvent'
import { buildLyricConfig, getLyricWindowBounds, initWindowSize, watchConfigKeys } from './utils'

let isLock: boolean
let isEnable: boolean
let isAlwaysOnTop: boolean
let isAlwaysOnTopLoop: boolean
let isShowTaskbar: boolean
let isLockScreen: boolean
let isHoverHide: boolean


export const setLrcConfig = (keys: Array<keyof S.AppSetting>, setting: Partial<S.AppSetting>) => {
  if (!watchConfigKeys.some(key => keys.includes(key))) return

  if (isExistWindow()) {
    sendConfigChange(buildLyricConfig(setting))
    if (keys.includes('desktopLyric.isLock') && isLock != global.s.appSetting['desktopLyric.isLock']) {
      isLock = global.s.appSetting['desktopLyric.isLock']
      if (global.s.appSetting['desktopLyric.isLock']) {
        setIgnoreMouseEvents(true, { forward: !isLinux && global.s.appSetting['desktopLyric.isHoverHide'] })
      } else {
        setIgnoreMouseEvents(false, { forward: !isLinux && global.s.appSetting['desktopLyric.isHoverHide'] })
      }
    }
    if (keys.includes('desktopLyric.isHoverHide') && isHoverHide != global.s.appSetting['desktopLyric.isHoverHide']) {
      isHoverHide = global.s.appSetting['desktopLyric.isHoverHide']
      if (!isLinux) {
        setIgnoreMouseEvents(global.s.appSetting['desktopLyric.isLock'], { forward: global.s.appSetting['desktopLyric.isHoverHide'] })
      }
    }
    if (keys.includes('desktopLyric.isAlwaysOnTop') && isAlwaysOnTop != global.s.appSetting['desktopLyric.isAlwaysOnTop']) {
      isAlwaysOnTop = global.s.appSetting['desktopLyric.isAlwaysOnTop']
      alwaysOnTopTools.setAlwaysOnTop(global.s.appSetting['desktopLyric.isAlwaysOnTopLoop'])
      if (isAlwaysOnTop && global.s.appSetting['desktopLyric.isAlwaysOnTopLoop']) {
        alwaysOnTopTools.startLoop()
      } else alwaysOnTopTools.clearLoop()
    }
    if (keys.includes('desktopLyric.isShowTaskbar') && isShowTaskbar != global.s.appSetting['desktopLyric.isShowTaskbar']) {
      isShowTaskbar = global.s.appSetting['desktopLyric.isShowTaskbar']
      setSkipTaskbar(!global.s.appSetting['desktopLyric.isShowTaskbar'])
    }
    if (keys.includes('desktopLyric.isAlwaysOnTopLoop') && isAlwaysOnTopLoop != global.s.appSetting['desktopLyric.isAlwaysOnTopLoop']) {
      isAlwaysOnTopLoop = global.s.appSetting['desktopLyric.isAlwaysOnTopLoop']
      if (!global.s.appSetting['desktopLyric.isAlwaysOnTop']) return
      if (isAlwaysOnTopLoop) {
        alwaysOnTopTools.startLoop()
      } else {
        alwaysOnTopTools.clearLoop()
      }
    }
    if (keys.includes('desktopLyric.isLockScreen') && isLockScreen != global.s.appSetting['desktopLyric.isLockScreen']) {
      isLockScreen = global.s.appSetting['desktopLyric.isLockScreen']
      if (global.s.appSetting['desktopLyric.isLockScreen']) {
        setBounds(getLyricWindowBounds(getBounds(), {
          x: 0,
          y: 0,
          w: global.s.appSetting['desktopLyric.width'],
          h: global.s.appSetting['desktopLyric.height'],
        }))
      }
    }
    if (keys.includes('desktopLyric.x') && setting['desktopLyric.x'] == null) {
      setBounds(initWindowSize(
        global.s.appSetting['desktopLyric.x'],
        global.s.appSetting['desktopLyric.y'],
        global.s.appSetting['desktopLyric.width'],
        global.s.appSetting['desktopLyric.height'],
      ))
    }
  }
  if (keys.includes('desktopLyric.enable') && isEnable != global.s.appSetting['desktopLyric.enable']) {
    isEnable = global.s.appSetting['desktopLyric.enable']
    if (global.s.appSetting['desktopLyric.enable']) {
      createWindow()
    } else {
      alwaysOnTopTools.clearLoop()
      closeWindow()
    }
  }
}
