import { SYNC_CODE } from '@common/constants_sync'

const ALLOWED_PROTOCOLS = ['http:', 'https:']

/**
 * 解析用户填写的同步服务地址。
 *
 * 仅接受 http/https：地址会被客户端用于发起网络请求，其他协议（file、ftp 等）
 * 可能被用来读取本机文件或访问非预期资源。无法解析或协议不允许时抛错，
 * 错误信息沿用 `SYNC_CODE.unknownServiceAddress` 以便界面直接展示。
 */
export const parseSyncUrl = (host: string): S.Sync.Client.UrlInfo => {
  let url: URL
  try {
    url = new URL(host)
  } catch {
    throw new Error(SYNC_CODE.unknownServiceAddress)
  }
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) throw new Error(SYNC_CODE.unknownServiceAddress)

  let hostPath = url.host + url.pathname
  let href = url.href
  if (hostPath.endsWith('/')) hostPath = hostPath.replace(/\/$/, '')
  if (href.endsWith('/')) href = href.replace(/\/$/, '')

  return {
    wsProtocol: url.protocol == 'https:' ? 'wss:' : 'ws:',
    httpProtocol: url.protocol,
    hostPath,
    href,
  }
}
