declare namespace S {
  interface IpcRendererEvent {
    event: Electron.IpcRendererEvent
  }
  interface IpcRendererEventParams<T> {
    event: Electron.IpcRendererEvent
    params: T
  }
  type IpcRendererEventListener = (params: S.IpcRendererEvent) => any
  type IpcRendererEventListenerParams<T> = (params: S.IpcRendererEventParams<T>) => any
}
