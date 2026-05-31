interface CheckUpdateTimeoutOptions {
  status: S.UpdateStatus
  isProd: boolean
  isWinArm: boolean
}

interface StartupUpdateOptions {
  isProd: boolean
  isAgreePact: boolean
}

export const UPDATE_CHECK_TIMEOUT = 30 * 1000

export const shouldHandleUpdateCheckTimeout = ({
  status,
  isProd,
  isWinArm,
}: CheckUpdateTimeoutOptions) => {
  return status == 'checking' && isProd && !isWinArm
}

export const shouldCheckUpdateOnStartup = ({
  isProd,
  isAgreePact,
}: StartupUpdateOptions) => {
  return isProd && isAgreePact
}

export const shouldLoadVersionInfoOnStartup = ({
  isProd,
  isAgreePact,
}: StartupUpdateOptions) => {
  return !isProd && isAgreePact
}
