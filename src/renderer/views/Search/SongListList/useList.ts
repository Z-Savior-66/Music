import { onBeforeRouteLeave } from '@common/utils/vueRouter'
import { ref, nextTick } from '@common/utils/vueTools'
import { addHistoryWord } from '@renderer/store/search/action'
import type { SearchListInfo, ListInfoItem } from '@renderer/store/search/songlist'
import { search as searchSongList, listInfos } from '@renderer/store/search/songlist'

export type SearchSource = S.OnlineSource | 'all'

export default () => {
  const listRef = ref<any>(null)

  const listInfo = ref<SearchListInfo>({
    page: 1,
    limit: 30,
    total: 0,
    list: [],
    key: null,
    noItemLabel: '',
    tagId: '',
    sortId: '',
  })

  const search = (text: string, source: SearchSource, page: number) => {
    // console.log(text, source, page)
    listInfo.value = listInfos[source] as SearchListInfo
    if (text.length) void addHistoryWord(text)
    void searchSongList(text, page, source).then((list: ListInfoItem[]) => {
      // console.log(list)
      if (listInfo.value.key == window.s.songListInfo.searchKey && window.s.songListInfo.searchPosition) {
        void nextTick(() => {
          listRef.value?.scrollTo(window.s.songListInfo.searchPosition)
        })
      } else if (list.length && listRef.value) {
        window.s.songListInfo.searchKey = null
        void nextTick(() => {
          listRef.value.scrollTo(0)
        })
      }
    })
  }

  onBeforeRouteLeave(() => {
    window.s.songListInfo.searchKey = listInfo.value.key
    if (listRef.value) window.s.songListInfo.searchPosition = listRef.value.getScrollTop()
  })


  return {
    listRef,
    listInfo,
    search,
  }
}
