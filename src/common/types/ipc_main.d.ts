declare namespace S {
  interface IpcMainEvent {
    event: Electron.IpcMainEvent
  }
  interface IpcMainEventParams<T> {
    event: Electron.IpcMainEvent
    params: T
  }
  type IpcMainEventListener = (params: S.IpcMainEvent) => void
  type IpcMainEventListenerParams<T> = (params: S.IpcMainEventParams<T>) => void

  interface IpcMainInvokeEvent {
    event: Electron.IpcMainInvokeEvent
  }
  interface IpcMainInvokeEventParams<T> {
    event: Electron.IpcMainInvokeEvent
    params: T
  }

  type IpcMainInvokeEventListener = (params: S.IpcMainInvokeEvent) => Promise<void>
  type IpcMainInvokeEventListenerParams<T> = (params: S.IpcMainInvokeEventParams<T>) => Promise<void>
  type IpcMainInvokeEventListenerValue<V> = (params: S.IpcMainInvokeEvent) => Promise<V>
  type IpcMainInvokeEventListenerParamsValue<T, V> = (params: S.IpcMainInvokeEventParams<T>) => Promise<V>
}
