import { WIN_MAIN_RENDERER_EVENT_NAME } from '@common/ipcNames'
import { mainHandle } from '@common/mainIpc'
import { sendEvent } from '../main'
// import getStore from '@common/store'


// const { registerHotkey, unRegisterHotkey } = require('../modules/hotKey/utils')

// mainHandle(ipcMainWindowNames.set_hot_key_config, async(event, { action, data }) => {
//   switch (action) {
//     case 'config':
//       global.s_event.hotKey.saveConfig(data.data, MAIN_WINDOW_EVENT_NAME.source)
//       return
//     case 'register':
//       return registerHotkey(data)
//     case 'unregister':
//       return unRegisterHotkey(data)
//   }
// })

export default () => {
  mainHandle<S.HotKeyConfigAll>(WIN_MAIN_RENDERER_EVENT_NAME.get_hot_key, async() => {
    // const electronStore_hotKey = getStore('hotKey')
    return {
      local: global.s.hotKey?.config.local,
      global: global.s.hotKey?.config.global,
    }
  })

  // global.s.event_app.on(APP_EVENT_NAMES.hotKeyConfig, (config, source) => {
  //   if (!global.modules.mainWindow || source === MAIN_WINDOW_EVENT_NAME.name) return
  //   mainSend(global.modules.mainWindow, WIN_MAIN_RENDERER_EVENT_NAME.set_hot_key_config, { config, source })
  // })
}

export const handleKeyDown = (type: string, key: string) => {
  sendEvent<S.HotKeyEvent>(WIN_MAIN_RENDERER_EVENT_NAME.key_down, { type, key })
}

export const hotKeyConfigUpdate = (config: S.HotKeyConfigAll) => {
  sendEvent<S.HotKeyConfigAll>(WIN_MAIN_RENDERER_EVENT_NAME.set_hot_key_config, config)
}
