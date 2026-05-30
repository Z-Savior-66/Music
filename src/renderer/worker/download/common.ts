import { setMeta } from '@common/utils/musicMeta'
import { buildLyrics } from './lrcTool'

export const writeMeta = ({ filePath, isEmbedLyricS, isEmbedLyricT, isEmbedLyricR, ...meta }: {
  filePath: string
  isEmbedLyricS: boolean
  isEmbedLyricT: boolean
  isEmbedLyricR: boolean
  title: string
  artist: string
  album: string
  APIC: string | null
}, lyric: S.Music.LyricInfo, proxy?: { host: string, port: number }) => {
  setMeta(filePath, { ...meta, lyrics: buildLyrics(lyric, isEmbedLyricS, isEmbedLyricT, isEmbedLyricR) }, proxy)
}

export { saveLrc } from './utils'
