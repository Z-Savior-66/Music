/* eslint-disable no-var */
// import { Event as WinMainEvent } from '@main/modules/winMain/event'
// import { Event as WinLyricEvent } from '@main/modules/winLyric/event'
import { type DislikeType, type AppType, type ListType } from '@main/event'
import { type DBSeriveTypes } from '@main/worker/utils'

interface S {
  inited: boolean
  appSetting: S.AppSetting
  hotKey: {
    enable: boolean
    config: S.HotKeyConfigAll
    state: S.HotKeyState
  }
  /**
   * 是否跳过托盘退出
   */
  isSkipTrayQuit: boolean
  /**
   * main window 是否关闭
   */
  // mainWindowClosed: boolean
  event_app: AppType
  event_list: ListType
  event_dislike: DislikeType
  worker: {
    dbService: DBSeriveTypes
  }
  theme: S.ThemeSetting
  player_status: S.Player.Status
}

declare global {
  // declare module NodeJS {
  //   export interface Global {
  //     s: {
  //       app_event: {
  //         winMain: WinMainEvent
  //         winLyric: WinLyricEvent
  //       }
  //     }
  //   }
  // }

  // var isDev: boolean
  var envParams: S.EnvParams
  var staticPath: string
  var sDataPath: string
  var sOldDataPath: string
  var s: S
  var appWorder: AppWorder
}


