type Convert = (text: string) => Promise<string>

/**
 * 生成简繁转换后的歌词信息。
 *
 * `rawlrcInfo` 必须保留转换前的原文，用户才能在界面里切回原始歌词；
 * 没有原文时用传入的歌词自身充当原文，且不重复转换一次。
 * 转换函数由调用方注入，模块本身不依赖 window，便于单独测试。
 */
export const buildS2tLyric = async(
  source: MakeOptional<S.Player.LyricInfo, 'rawlrcInfo'>,
  convert: Convert,
): Promise<S.Player.LyricInfo> => {
  const convertOrEmpty = async(text: string | null | undefined) => text ? convert(text) : ''

  const [lyric, tlyric, rlyric, slyric] = await Promise.all([
    convertOrEmpty(source.lyric),
    convertOrEmpty(source.tlyric),
    convertOrEmpty(source.rlyric),
    convertOrEmpty(source.slyric),
  ])

  const rawSource = source.rawlrcInfo ?? source

  return {
    lyric,
    tlyric,
    rlyric,
    slyric,
    rawlrcInfo: {
      lyric: rawSource.lyric,
      tlyric: rawSource.tlyric,
      rlyric: rawSource.rlyric,
      slyric: rawSource.slyric,
    },
  }
}
