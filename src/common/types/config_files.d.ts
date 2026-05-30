declare namespace S {
  namespace ConfigFile {
    interface MyListInfoPart {
      type: 'playListPart_v2'
      data: S.List.MyDefaultListInfoFull | S.List.MyLoveListInfoFull | S.List.UserListInfoFull
    }

  }
}
