declare namespace S {
  namespace DesktopLyric {
    interface Config {
      'desktopLyric.enable': S.AppSetting['desktopLyric.enable']
      'desktopLyric.isLock': S.AppSetting['desktopLyric.isLock']
      'desktopLyric.isAlwaysOnTop': S.AppSetting['desktopLyric.isAlwaysOnTop']
      'desktopLyric.isAlwaysOnTopLoop': S.AppSetting['desktopLyric.isAlwaysOnTopLoop']
      'desktopLyric.isShowTaskbar': S.AppSetting['desktopLyric.isShowTaskbar']
      'desktopLyric.pauseHide': S.AppSetting['desktopLyric.pauseHide']
      'desktopLyric.audioVisualization': S.AppSetting['desktopLyric.audioVisualization']
      'desktopLyric.width': S.AppSetting['desktopLyric.width']
      'desktopLyric.height': S.AppSetting['desktopLyric.height']
      'desktopLyric.x': S.AppSetting['desktopLyric.x']
      'desktopLyric.y': S.AppSetting['desktopLyric.y']
      'desktopLyric.isLockScreen': S.AppSetting['desktopLyric.isLockScreen']
      'desktopLyric.isDelayScroll': S.AppSetting['desktopLyric.isDelayScroll']
      'desktopLyric.scrollAlign': S.AppSetting['desktopLyric.scrollAlign']
      'desktopLyric.isHoverHide': S.AppSetting['desktopLyric.isHoverHide']
      'desktopLyric.direction': S.AppSetting['desktopLyric.direction']
      'desktopLyric.style.align': S.AppSetting['desktopLyric.style.align']
      'desktopLyric.style.font': S.AppSetting['desktopLyric.style.font']
      'desktopLyric.style.fontSize': S.AppSetting['desktopLyric.style.fontSize']
      'desktopLyric.style.lineGap': S.AppSetting['desktopLyric.style.lineGap']
      'desktopLyric.style.lyricUnplayColor': S.AppSetting['desktopLyric.style.lyricUnplayColor']
      'desktopLyric.style.lyricPlayedColor': S.AppSetting['desktopLyric.style.lyricPlayedColor']
      'desktopLyric.style.lyricShadowColor': S.AppSetting['desktopLyric.style.lyricShadowColor']
      // 'desktopLyric.style.fontWeight': S.AppSetting['desktopLyric.style.fontWeight']
      'desktopLyric.style.opacity': S.AppSetting['desktopLyric.style.opacity']
      'desktopLyric.style.ellipsis': S.AppSetting['desktopLyric.style.ellipsis']
      'desktopLyric.style.isFontWeightFont': S.AppSetting['desktopLyric.style.isFontWeightFont']
      'desktopLyric.style.isFontWeightLine': S.AppSetting['desktopLyric.style.isFontWeightLine']
      'desktopLyric.style.isFontWeightExtended': S.AppSetting['desktopLyric.style.isFontWeightExtended']
      'desktopLyric.style.isZoomActiveLrc': S.AppSetting['desktopLyric.style.isZoomActiveLrc']
      'common.langId': S.AppSetting['common.langId']
      'player.isShowLyricTranslation': S.AppSetting['player.isShowLyricTranslation']
      'player.isShowLyricRoma': S.AppSetting['player.isShowLyricRoma']
      'player.isSwapLyricTranslationAndRoma': S.AppSetting['player.isSwapLyricTranslationAndRoma']
      'player.isPlaySlrc': S.AppSetting['player.isPlaySlrc']
      'player.playbackRate': S.AppSetting['player.playbackRate']
    }

    type WinMainActions = 'get_info' | 'get_status' | 'get_analyser_data_array'

    interface LyricActionBase <A> {
      action: A
    }
    interface LyricActionData<A, D> extends LyricActionBase<A> {
      data: D
    }
    type LyricAction<A, D = undefined> = D extends undefined ? LyricActionBase<A> : LyricActionData<A, D>

    type LyricActions = LyricAction<'set_info', {
      id: string | null
      singer: string
      name: string
      album: string
      lrc: string | null
      tlrc: string | null
      rlrc: string | null
      slrc: string | null
      // pic: string | null
      isPlay: boolean
      line: number
      played_time: number
    }>
    | LyricAction<'set_status', {
      isPlay: boolean
      line: number
      played_time: number
    }>
    | LyricAction<'set_lyric', {
      lrc: string | null
      tlrc: string | null
      rlrc: string | null
      slrc: string | null
    }>
    | LyricAction<'set_offset', number>
    | LyricAction<'set_playbackRate', number>
    | LyricAction<'set_play', number>
    | LyricAction<'set_pause'>
    | LyricAction<'set_stop'>
    | LyricAction<'send_analyser_data_array', Uint8Array>


    interface NewBounds {
      x: number
      y: number
      w: number
      h: number
    }
  }
}
