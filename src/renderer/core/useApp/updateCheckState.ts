interface CheckUpdateTimeoutOptions {
  status: S.UpdateStatus
  isProd: boolean
  isWinArm: boolean
}

export const UPDATE_CHECK_TIMEOUT = 30 * 1000

export const shouldHandleUpdateCheckTimeout = ({
  status,
  isProd,
  isWinArm,
}: CheckUpdateTimeoutOptions) => {
  return status == 'checking' && isProd && !isWinArm
}
