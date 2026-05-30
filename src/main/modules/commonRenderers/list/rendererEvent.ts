import { mainHandle } from '@common/mainIpc'
import { PLAYER_EVENT_NAME } from '@common/ipcNames'

// 列表操作事件（公共，只注册一次）
export default () => {
  mainHandle<S.List.UserListInfo[]>(PLAYER_EVENT_NAME.list_get, async() => {
    return global.s.worker.dbService.getAllUserList()
  })
  mainHandle<S.List.ListActionDataOverwrite>(PLAYER_EVENT_NAME.list_data_overwire, async({ params: listData }) => {
    await global.s.event_list.list_data_overwrite(listData, false)
  })
  mainHandle<S.List.ListActionAdd>(PLAYER_EVENT_NAME.list_add, async({ params: { position, listInfos } }) => {
    await global.s.event_list.list_create(position, listInfos, false)
  })
  mainHandle<S.List.ListActionRemove>(PLAYER_EVENT_NAME.list_remove, async({ params: ids }) => {
    await global.s.event_list.list_remove(ids, false)
  })
  mainHandle<S.List.ListActionUpdate>(PLAYER_EVENT_NAME.list_update, async({ params: listInfos }) => {
    await global.s.event_list.list_update(listInfos, false)
  })
  mainHandle<S.List.ListActionUpdatePosition>(PLAYER_EVENT_NAME.list_update_position, async({ params: { position, ids } }) => {
    await global.s.event_list.list_update_position(position, ids, false)
  })
  mainHandle<string, S.Music.MusicInfo[]>(PLAYER_EVENT_NAME.list_music_get, async({ params: listId }) => {
    return global.s.worker.dbService.getListMusics(listId)
  })
  mainHandle<S.List.ListActionMusicAdd>(PLAYER_EVENT_NAME.list_music_add, async({ params: { id, musicInfos, addMusicLocationType } }) => {
    await global.s.event_list.list_music_add(id, musicInfos, addMusicLocationType, false)
  })
  mainHandle<S.List.ListActionMusicMove>(PLAYER_EVENT_NAME.list_music_move, async({ params: { fromId, toId, musicInfos, addMusicLocationType } }) => {
    await global.s.event_list.list_music_move(fromId, toId, musicInfos, addMusicLocationType, false)
  })
  mainHandle<S.List.ListActionMusicRemove>(PLAYER_EVENT_NAME.list_music_remove, async({ params: { listId, ids } }) => {
    await global.s.event_list.list_music_remove(listId, ids, false)
  })
  mainHandle<S.List.ListActionMusicUpdate>(PLAYER_EVENT_NAME.list_music_update, async({ params: musicInfos }) => {
    await global.s.event_list.list_music_update(musicInfos, false)
  })
  mainHandle<S.List.ListActionMusicUpdatePosition>(PLAYER_EVENT_NAME.list_music_update_position, async({ params: { listId, position, ids } }) => {
    await global.s.event_list.list_music_update_position(listId, position, ids, false)
  })
  mainHandle<S.List.ListActionMusicOverwrite>(PLAYER_EVENT_NAME.list_music_overwrite, async({ params: { listId, musicInfos } }) => {
    await global.s.event_list.list_music_overwrite(listId, musicInfos, false)
  })
  mainHandle<S.List.ListActionMusicClear>(PLAYER_EVENT_NAME.list_music_clear, async({ params: listId }) => {
    await global.s.event_list.list_music_clear(listId, false)
  })
  mainHandle<S.List.ListActionCheckMusicExistList, boolean>(PLAYER_EVENT_NAME.list_music_check_exist, async({ params: { listId, musicInfoId } }) => {
    return global.s.worker.dbService.checkListExistMusic(listId, musicInfoId)
  })
  mainHandle<string, string[]>(PLAYER_EVENT_NAME.list_music_get_list_ids, async({ params: musicInfoId }) => {
    return global.s.worker.dbService.getMusicExistListIds(musicInfoId)
  })
}
