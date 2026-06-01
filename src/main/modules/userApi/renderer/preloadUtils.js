const updateUrlRxp = /^https?:\/\/[^\s$.?#].[^\s]*$/

export const normalizeUpdateUrl = updateUrl => {
  if (!updateUrl) return undefined
  if (typeof updateUrl != 'string') return undefined
  if (updateUrl.length > 1024) return undefined
  return updateUrlRxp.test(updateUrl) ? updateUrl : undefined
}
