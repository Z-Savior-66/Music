import { globalShortcut } from 'electron'
import { log } from '@common/utils'

export const handleKeyDown = (key: string) => {
  if (!global.s.hotKey.enable) return
  global.s.event_app.hot_key_down({ type: 'global', key })
}

const transformedKeyRxp = /(^|\+)[a-z]/g

export const transformedKey = (key: string): string => {
  if (key.includes('arrow')) key = key.replace(/arrow/g, '')
  return key.replace('mod', 'CommandOrControl').replace(transformedKeyRxp, l => l.toUpperCase())
}

export const registerHotkey = ({ key, info }: S.RegisterKeyInfo): boolean => {
  let targetKey = global.s.hotKey.state.get(key)
  if (targetKey?.status) return true
  const transKey = transformedKey(key)
  // console.log('Register key:', transKey)
  if (targetKey) {
    targetKey.info = info
  } else {
    targetKey = {
      status: false,
      info,
    }
    global.s.hotKey.state.set(key, targetKey)
  }
  const status = targetKey.status = globalShortcut.isRegistered(transKey)
    ? false
    : globalShortcut.register(transKey, () => {
      handleKeyDown(key)
    })
  return status
}

export const unRegisterHotkey = (key: string) => {
  let transKey = transformedKey(key)
  // console.log('Unregister key:', transKey)
  globalShortcut.unregister(transKey)
  global.s.hotKey.state.delete(key)
}

export const unRegisterHotkeyAll = () => {
  global.s.hotKey.state.clear()
  globalShortcut.unregisterAll()
}


const handleRegisterHotkey = (data: S.RegisterKeyInfo) => {
  let ret = registerHotkey(data)
  if (!ret) log.info('Register hot key failed:', data.key)
}


export const init = (isForce = false) => {
  unRegisterHotkeyAll()
  if (!isForce && !global.s.hotKey.config.global.enable) return
  // global.s.hotKey.state = {}
  // console.log(global.s.hotKey.config.global.keys)
  for (const key of Object.keys(global.s.hotKey.config.global.keys)) {
    try {
      handleRegisterHotkey({ key, info: global.s.hotKey.config.global.keys[key] })
    } catch (err) {
      log.info(err)
    }
  }
}
