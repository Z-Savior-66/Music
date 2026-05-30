import { APP_EVENT_NAMES } from '@common/constants'
import initRendererEvent, { sendMainWindowInitedEvent } from './rendererEvent'
import { setLrcConfig } from './config'
import { HOTKEY_DESKTOP_LYRIC } from '@common/hotKey'
import { closeWindow, createWindow, isExistWindow } from './main'
// import main from './main'
// import { Event, EVENT_NAMES } from './event'

let isMainWidnowFullscreen = false

export default () => {
  initRendererEvent()
  // global.s.event_app.winLyric = new Event()
  // global.app_event.winMain.

  global.s.event_app.on('main_window_inited', () => {
    isMainWidnowFullscreen = global.s.appSetting['common.startInFullscreen']

    if (global.s.appSetting['desktopLyric.enable']) {
      if (global.s.appSetting['desktopLyric.fullscreenHide'] && isMainWidnowFullscreen) {
        closeWindow()
      } else {
        if (isExistWindow()) sendMainWindowInitedEvent()
        else createWindow()
      }
    }
  })
  global.s.event_app.on('updated_config', (keys, setting) => {
    setLrcConfig(keys, setting)
    if (keys.includes('desktopLyric.fullscreenHide') && global.s.appSetting['desktopLyric.enable'] && isMainWidnowFullscreen) {
      if (global.s.appSetting['desktopLyric.fullscreenHide']) closeWindow()
      else if (!isExistWindow()) createWindow()
    }
  })
  global.s.event_app.on('main_window_close', () => {
    closeWindow()
  })
  global.s.event_app.on('main_window_fullscreen', (isFullscreen) => {
    isMainWidnowFullscreen = isFullscreen
    if (global.s.appSetting['desktopLyric.enable'] && global.s.appSetting['desktopLyric.fullscreenHide']) {
      if (isFullscreen) closeWindow()
      else if (!isExistWindow()) createWindow()
    }
  })


  // global.s_event.mainWindow.on(MAIN_WINDOW_EVENT_NAME.setLyricInfo, info => {
  //   if (!global.modules.lyricWindow) return
  //   mainSend(global.modules.lyricWindow, ipcWinLyricNames.set_lyric_info, info)
  // })

  global.s.event_app.on('hot_key_down', ({ type, key }) => {
    let info = global.s.hotKey.config.global.keys[key]
    if (!info || info.type != APP_EVENT_NAMES.winLyricName) return
    let newSetting: Partial<S.AppSetting> = {}
    let settingKey: keyof S.AppSetting
    switch (info.action) {
      case HOTKEY_DESKTOP_LYRIC.toggle_visible.action:
        settingKey = 'desktopLyric.enable'
        break
      case HOTKEY_DESKTOP_LYRIC.toggle_lock.action:
        settingKey = 'desktopLyric.isLock'
        break
      case HOTKEY_DESKTOP_LYRIC.toggle_always_top.action:
        settingKey = 'desktopLyric.isAlwaysOnTop'
        break
      default: return
    }
    newSetting[settingKey] = !global.s.appSetting[settingKey]

    global.s.event_app.update_config(newSetting)
  })
}
export * from './main'
export * from './rendererEvent'

// export {
//   EVENT_NAMES,
// }
