import { modules } from '../../modules'

export const registerLocalSyncEvent = async(wss: S.Sync.Server.SocketServer) => {
  unregisterLocalSyncEvent()
  for (const module of Object.values(modules)) {
    module.registerEvent(wss)
  }
}

export const unregisterLocalSyncEvent = () => {
  for (const module of Object.values(modules)) {
    module.unregisterEvent()
  }
}
