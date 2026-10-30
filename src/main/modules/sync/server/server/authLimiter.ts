/**
 * 同步服务的鉴权失败计数上限。
 *
 * 超过该次数后同 IP 的鉴权请求一律拒绝，用来抵御对连接码的暴力尝试。
 * 计数保存在进程内存中，服务重启即清零。
 */
export const MAX_AUTH_FAILURES = 20

/**
 * 封锁的冷却时长（毫秒）。
 *
 * 永久封锁会让输错太多次的局域网设备只能靠重启应用恢复，因此封锁到期后自动解除
 * 并重新计数，让用户能在等待后重新连接。
 */
export const AUTH_BLOCK_DURATION = 10 * 60 * 1000

export interface AuthLimiter {
  isBlocked: (ip: string) => boolean
  recordFailure: (ip: string) => number
  recordSuccess: (ip: string) => void
}

interface FailureRecord {
  count: number
  blockedAt: number | null
}

export const createAuthLimiter = (
  maxFailures = MAX_AUTH_FAILURES,
  blockDuration = AUTH_BLOCK_DURATION,
  now: () => number = Date.now,
): AuthLimiter => {
  const failures = new Map<string, FailureRecord>()

  const readActive = (ip: string): FailureRecord | null => {
    const record = failures.get(ip)
    if (!record) return null
    // 冷却到期即视为未封锁，并从零开始计数
    if (record.blockedAt != null && now() - record.blockedAt >= blockDuration) {
      failures.delete(ip)
      return null
    }
    return record
  }

  return {
    isBlocked(ip: string) {
      const record = readActive(ip)
      return record?.blockedAt != null
    },
    recordFailure(ip: string) {
      const record = readActive(ip) ?? { count: 0, blockedAt: null }
      record.count += 1
      if (record.count > maxFailures) record.blockedAt = now()
      failures.set(ip, record)
      return record.count
    },
    recordSuccess(ip: string) {
      failures.delete(ip)
    },
  }
}
