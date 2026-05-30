declare namespace S {
  namespace List {
    interface UserListInfo {
      id: string
      name: string
      // list: S.Music.MusicInfo[]
      source?: S.OnlineSource
      sourceListId?: string
      // position?: number
      locationUpdateTime: number | null
    }

    interface MyDefaultListInfo {
      id: 'default'
      name: 'list__name_default'
      // name: '试听列表'
      // list: S.Music.MusicInfo[]
    }

    interface MyLoveListInfo {
      id: 'love'
      name: 'list__name_love'
      // name: '我的收藏'
      // list: S.Music.MusicInfo[]
    }

    interface MyTempListInfo {
      id: 'temp'
      name: '临时列表'
      // list: S.Music.MusicInfo[]
      // TODO: save default lists info
      meta: {
        id?: string
      }
    }

    type MyListInfo = MyDefaultListInfo | MyLoveListInfo | UserListInfo

    interface MyAllList {
      defaultList: MyDefaultListInfo
      loveList: MyLoveListInfo
      userList: UserListInfo[]
      tempList: MyTempListInfo
    }


    type SearchHistoryList = string[]
    type ListPositionInfo = Record<string, number>
    type ListUpdateInfo = Record<string, {
      updateTime: number
      isAutoUpdate: boolean
    }>

    type ListSaveType = 'myList' | 'downloadList'
    type ListSaveInfo = {
      type: 'myList'
      data: Partial<MyAllList>
    } | {
      type: 'downloadList'
      data: S.Download.ListItem[]
    }


    type ListActionDataOverwrite = MakeOptional<S.List.ListDataFull, 'tempList'>
    interface ListActionAdd {
      position: number
      listInfos: UserListInfo[]
    }
    type ListActionRemove = string[]
    type ListActionUpdate = UserListInfo[]
    interface ListActionUpdatePosition {
      /**
       * 列表id
       */
      ids: string[]
      /**
       * 位置
       */
      position: number
    }

    interface ListActionMusicAdd {
      id: string
      musicInfos: S.Music.MusicInfo[]
      addMusicLocationType: S.AddMusicLocationType
    }

    interface ListActionMusicMove {
      fromId: string
      toId: string
      musicInfos: S.Music.MusicInfo[]
      addMusicLocationType: S.AddMusicLocationType
    }

    interface ListActionCheckMusicExistList {
      listId: string
      musicInfoId: string
    }

    interface ListActionMusicRemove {
      listId: string
      ids: string[]
    }

    type ListActionMusicUpdate = Array<{
      id: string
      musicInfo: S.Music.MusicInfo
    }>

    interface ListActionMusicUpdatePosition {
      listId: string
      position: number
      ids: string[]
    }

    interface ListActionMusicOverwrite {
      listId: string
      musicInfos: S.Music.MusicInfo[]
    }

    type ListActionMusicClear = string[]

    interface MyDefaultListInfoFull extends MyDefaultListInfo {
      list: S.Music.MusicInfo[]
    }
    interface MyLoveListInfoFull extends MyLoveListInfo {
      list: S.Music.MusicInfo[]
    }
    interface UserListInfoFull extends UserListInfo {
      list: S.Music.MusicInfo[]
    }
    interface MyTempListInfoFull extends MyTempListInfo {
      list: S.Music.MusicInfo[]
    }

    interface ListDataFull {
      defaultList: S.Music.MusicInfo[]
      loveList: S.Music.MusicInfo[]
      userList: UserListInfoFull[]
      tempList: S.Music.MusicInfo[]
    }
  }
}
