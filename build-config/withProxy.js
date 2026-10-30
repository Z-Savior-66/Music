/**
 * 通过代理执行 npm 脚本（供 `npm run dp` / `npm run up` 使用）。
 *
 * 代理地址不再硬编码：优先读取 HTTPS_PROXY / https_proxy /
 * HTTP_PROXY / http_proxy 环境变量；本地开发常见的
 * .env / .env.local 文件也会被自动读取。
 *
 * 用法：
 *   node build-config/withProxy.js pack      # 等价于 npm run pack
 *   node build-config/withProxy.js install   # 等价于 npm install
 *
 * 显式关闭：DP_NO_PROXY=1 node build-config/withProxy.js pack
 */
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const rootDir = path.resolve(__dirname, '..')

// 支持的任务：仅限白名单，避免把任意参数拼进 npm 命令
const tasks = {
  pack: ['run', 'pack'],
  install: ['install'],
}

/**
 * 从 .env 风格文件中读取 PROXY 相关变量（不覆盖已有环境变量）。
 * @param {string} file
 */
function loadEnvFile(file) {
  let content
  try {
    content = fs.readFileSync(file, 'utf8')
  } catch {
    return
  }
  for (const line of content.split(/\r?\n/)) {
    const matched = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line)
    if (!matched) continue
    const key = matched[1]
    if (!/^(?:HTTPS?_PROXY|https?_proxy|NO_PROXY|no_proxy)$/.test(key)) continue
    if (process.env[key] != null) continue
    let value = matched[2]
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1)
    process.env[key] = value
  }
}

/**
 * @returns {string}
 */
function resolveProxy() {
  if (process.env.DP_NO_PROXY === '1') return ''
  for (const file of ['.env.local', '.env']) {
    loadEnvFile(path.join(rootDir, file))
  }
  const keys = ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy']
  for (const key of keys) {
    const value = (process.env[key] ?? '').trim()
    if (value) return value
  }
  return ''
}

/**
 * @param {string} message
 */
function fail(message) {
  console.error(`[withProxy] ${message}`)
  process.exit(1)
}

const taskName = process.argv[2]
const npmArgs = tasks[taskName]
if (!npmArgs) {
  fail(`未知任务: ${taskName ?? '(空)'}，可用任务: ${Object.keys(tasks).join(' / ')}`)
}

const proxy = resolveProxy()
if (!proxy) {
  fail([
    '未检测到代理地址，请先设置环境变量后重试，例如：',
    '  PowerShell:  $env:HTTPS_PROXY="http://127.0.0.1:7890"',
    '  CMD:         set HTTPS_PROXY=http://127.0.0.1:7890',
    '  Bash:        export HTTPS_PROXY=http://127.0.0.1:7890',
    '  或写入项目根目录 .env 文件：HTTPS_PROXY=http://127.0.0.1:7890',
    `若本次确实不需要代理，可直接执行 npm ${npmArgs.join(' ')}。`,
  ].join('\n'))
}

const env = {
  ...process.env,
  ELECTRON_GET_USE_PROXY: 'true',
  GLOBAL_AGENT_HTTPS_PROXY: proxy,
  HTTPS_PROXY: proxy,
  https_proxy: proxy,
}

console.log(`[withProxy] 使用代理 ${proxy} 执行 npm ${npmArgs.join(' ')}`)

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
// Windows 下解析 npm.cmd 需要 shell，参数用引号包裹避免被 shell 二次解释
const useShell = process.platform === 'win32'
const child = spawn(npmCmd, useShell ? npmArgs.map((arg) => `"${arg}"`) : npmArgs, {
  cwd: rootDir,
  env,
  stdio: 'inherit',
  shell: useShell,
})

child.on('error', (error) => fail(`启动 npm 失败: ${error.message}`))
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})
