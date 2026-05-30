import { reactive, markRaw, shallowReactive } from '@common/utils/vueTools'
import music from '@renderer/utils/musicSdk'

export type Source = S.OnlineSource

export const sources: S.OnlineSource[] = markRaw([])

for (const source of music.sources) {
  if (!music[source.id as S.OnlineSource]?.leaderboard?.getBoards) continue
  sources.push(source.id as S.OnlineSource)
}

export interface BoardItem {
  id: string
  name: string
  bangid: string
}
export interface Board {
  list: BoardItem[]
  source: S.OnlineSource
}
type Boards = Partial<Record<S.OnlineSource, Board>>

export const boards = shallowReactive<Boards>({})

export interface ListDetailInfo {
  list: S.Music.MusicInfoOnline[]
  total: number
  page: number
  source: S.OnlineSource | null
  limit: number
  key: string | null
  id: string
  noItemLabel: string
}

export const listDetailInfo = reactive<ListDetailInfo>({
  list: [],
  total: 0,
  page: 1,
  limit: 30,
  key: null,
  source: null,
  id: '',
  noItemLabel: '',
})

