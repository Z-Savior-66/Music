import { app } from 'electron'
import electronDebug from 'electron-debug'
import { openDevTools } from './utils'

electronDebug({
  showDevTools: false,
  devToolsMode: 'undocked',
})

app.on('ready', () => {
  global.lx.event_app.on('main_window_created', (win) => {
    openDevTools(win.webContents)
  })
  global.lx.event_app.on('desktop_lyric_window_created', (win) => {
    openDevTools(win.webContents)
  })
})

require('./index')
