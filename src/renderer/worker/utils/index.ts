import * as Comlink from 'comlink'

export type MainTypes = Comlink.Remote<S.WorkerMainTypes>

export const createMainWorker = () => {
  const worker: Worker = new Worker(new URL(
    /* webpackChunkName: 'renderer.main.worker' */
    '../main',
    import.meta.url,
  ))
  return Comlink.wrap<S.WorkerMainTypes>(worker)
}

export type DownloadTypes = Comlink.Remote<S.WorkerDownloadTypes>
export const createDownloadWorker = () => {
  const worker: Worker = new Worker(new URL(
    /* webpackChunkName: 'renderer.download.worker' */
    '../download',
    import.meta.url,
  ))
  return Comlink.wrap<S.WorkerDownloadTypes>(worker)
}

export const proxyCallback = <Args extends any[]>(callback: (...T: Args) => void) => {
  return Comlink.proxy(callback)
}
