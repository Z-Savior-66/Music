declare namespace S {

  namespace Sync {
    namespace List {
      interface ListInfo {
        lastSyncDate?: number
        snapshotKey: string
      }

      type ActionList = S.Sync.SyncAction<'list_data_overwrite', S.List.ListActionDataOverwrite>
      | SyncAction<'list_create', S.List.ListActionAdd>
      | SyncAction<'list_remove', S.List.ListActionRemove>
      | SyncAction<'list_update', S.List.ListActionUpdate>
      | SyncAction<'list_update_position', S.List.ListActionUpdatePosition>
      | SyncAction<'list_music_add', S.List.ListActionMusicAdd>
      | SyncAction<'list_music_move', S.List.ListActionMusicMove>
      | SyncAction<'list_music_remove', S.List.ListActionMusicRemove>
      | SyncAction<'list_music_update', S.List.ListActionMusicUpdate>
      | SyncAction<'list_music_update_position', S.List.ListActionMusicUpdatePosition>
      | SyncAction<'list_music_overwrite', S.List.ListActionMusicOverwrite>
      | SyncAction<'list_music_clear', S.List.ListActionMusicClear>

      type ListData = Omit<S.List.ListDataFull, 'tempList'>
      type SyncMode = 'merge_local_remote'
      | 'merge_remote_local'
      | 'overwrite_local_remote'
      | 'overwrite_remote_local'
      | 'overwrite_local_remote_full'
      | 'overwrite_remote_local_full'
      // | 'none'
      | 'cancel'
    }
  }
}
