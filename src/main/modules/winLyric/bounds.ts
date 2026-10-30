export interface LyricBounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 把窗口实际边界规范化为可持久化、可回推给渲染进程的整数尺寸。
 *
 * Electron 的边界可能带小数（缩放比例非 1 时），直接保存会导致下次创建窗口时
 * 与实际显示尺寸不一致。这里只做取整，不钳制最小尺寸：窗口的最小尺寸由
 * BrowserWindow 的 minWidth/minHeight 保证，渲染进程以回推值作为缩放基准，
 * 若此处抬到比真实窗口更大的值，缩放会以错误的基准计算而跳变。
 */
export const normalizeBounds = (bounds: LyricBounds): LyricBounds => ({
  x: Math.round(bounds.x),
  y: Math.round(bounds.y),
  width: Math.round(bounds.width),
  height: Math.round(bounds.height),
})
