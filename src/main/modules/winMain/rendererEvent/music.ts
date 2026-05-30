import { WIN_MAIN_RENDERER_EVENT_NAME } from '@common/ipcNames'
import { mainHandle } from '@common/mainIpc'


export default () => {
  mainHandle<string, LX.Player.LyricInfo>(WIN_MAIN_RENDERER_EVENT_NAME.get_palyer_lyric, async({ params: id }) => {
    return global.lx.worker.dbService.getPlayerLyric(id)
  })

  mainHandle<string, LX.Music.LyricInfo>(WIN_MAIN_RENDERER_EVENT_NAME.get_lyric_raw, async({ params: id }) => {
    return global.lx.worker.dbService.getRawLyric(id)
  })
  mainHandle<LX.Music.LyricInfoSave>(WIN_MAIN_RENDERER_EVENT_NAME.save_lyric_raw, async({ params: { id, lyrics } }) => {
    await global.lx.worker.dbService.rawLyricAdd(id, lyrics)
  })
  mainHandle(WIN_MAIN_RENDERER_EVENT_NAME.clear_lyric_raw, async() => {
    await global.lx.worker.dbService.rawLyricClear()
  })
  mainHandle(WIN_MAIN_RENDERER_EVENT_NAME.get_lyric_raw_count, async() => {
    return global.lx.worker.dbService.rawLyricCount()
  })

  mainHandle<string, LX.Music.LyricInfo>(WIN_MAIN_RENDERER_EVENT_NAME.get_lyric_edited, async({ params: id }) => {
    return global.lx.worker.dbService.getEditedLyric(id)
  })
  mainHandle<LX.Music.LyricInfoSave>(WIN_MAIN_RENDERER_EVENT_NAME.save_lyric_edited, async({ params: { id, lyrics } }) => {
    await global.lx.worker.dbService.editedLyricUpdateAddAndUpdate(id, lyrics)
  })
  mainHandle<string>(WIN_MAIN_RENDERER_EVENT_NAME.remove_lyric_edited, async({ params: id }) => {
    await global.lx.worker.dbService.editedLyricRemove([id])
  })
  mainHandle<string>(WIN_MAIN_RENDERER_EVENT_NAME.clear_lyric_edited, async() => {
    await global.lx.worker.dbService.editedLyricClear()
  })
  mainHandle(WIN_MAIN_RENDERER_EVENT_NAME.get_lyric_edited_count, async() => {
    return global.lx.worker.dbService.editedLyricCount()
  })

  mainHandle<string, string>(WIN_MAIN_RENDERER_EVENT_NAME.get_music_url, async({ params: id }) => {
    return (await global.lx.worker.dbService.getMusicUrl(id)) ?? ''
  })
  mainHandle<LX.Music.MusicUrlInfo>(WIN_MAIN_RENDERER_EVENT_NAME.save_music_url, async({ params: { id, url } }) => {
    await global.lx.worker.dbService.musicUrlSave([{ id, url }])
  })
  mainHandle(WIN_MAIN_RENDERER_EVENT_NAME.clear_music_url, async() => {
    await global.lx.worker.dbService.musicUrlClear()
  })
  mainHandle(WIN_MAIN_RENDERER_EVENT_NAME.get_music_url_count, async() => {
    return global.lx.worker.dbService.musicUrlCount()
  })

  mainHandle<string, LX.Music.MusicInfoOnline[]>(WIN_MAIN_RENDERER_EVENT_NAME.get_other_source, async({ params: id }) => {
    return global.lx.worker.dbService.getMusicInfoOtherSource(id)
  })
  mainHandle<LX.Music.MusicInfoOtherSourceSave>(WIN_MAIN_RENDERER_EVENT_NAME.save_other_source, async({ params: { id, list } }) => {
    await global.lx.worker.dbService.musicInfoOtherSourceAdd(id, list)
  })
  mainHandle(WIN_MAIN_RENDERER_EVENT_NAME.clear_other_source, async() => {
    await global.lx.worker.dbService.musicInfoOtherSourceClear()
  })
  mainHandle(WIN_MAIN_RENDERER_EVENT_NAME.get_other_source_count, async() => {
    return global.lx.worker.dbService.musicInfoOtherSourceCount()
  })
}
