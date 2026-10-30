# S Music 审查问题修复实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复全项目审查中确认的缺陷（播放重试竞态、设置迁移、同步服务安全、下载暂停时序、歌词窗口同步、发布与打包配置、依赖锁定、许可证归属、深链接），并抽出可测试的纯函数模块来承载这些修复。

**Architecture:** 遵循项目既有模式：每个新模块是 `src/**/<name>.ts`，旁边放 `<name>.test.ts`（vitest，`environment: 'node'`，`include: ['src/**/*.test.ts']`），不引入新依赖。纯逻辑抽成不依赖 `window` 的函数；涉及主进程状态的修复只在模块内做最小接线。Electron 安全隔离改造**不在本计划范围内**，单独出设计。

**Tech Stack:** TypeScript 5.9、Electron 37.6.1、Vue 3.3、Webpack 5、Vitest 4、Node 22+。

**Spec:** 本次全项目审查的结论（会话内），关键事实：
- 播放重试：`src/renderer/core/player/action.ts:66-84` 的 `delayRetry` 调用 `getMusicPlayUrl(musicInfo, isRefresh, true)` 时漏传的是 `isRetryed` 之外的第三个语义，且 `cancelDelayRetry` 被内层覆盖，外层 Promise 泄漏。
- 迁移笔误：`src/common/utils/migrateSetting.ts:139` 写入 `sync.erver.port`，真实键 `sync.server.port`（`defaultSetting.ts:144`）。`mergeSetting` 只遍历 `originSetting` 的键，多余键会被丢弃 —— 所以笔误导致老用户端口确实丢失。
- 同步服务：`server.ts:125` 默认 `ip = '0.0.0.0'`；`auth.ts:91` 的 `// if (num > 20) return` 被注释，失败计数只累加不拦截（`getAvailableIP` 有 `< 10` 上限，但两个鉴权函数在计数后仍继续执行）。
- 下载暂停：`store/download/action.ts:390` `void pauseTask` 后未等待，`setStatus(PAUSE)` 与 `checkStartTask()` 立即执行。
- 桌面歌词：`desktopLyric.width/height` 被主进程写入但渲染侧从不读取；`set_win_resizeable` 发送端已注释成死通道，主进程仍在监听；`set_playbackRate` 只更新主窗口。
- 发布/打包：`publish/utils/githubRelease.js` owner 取 `pkg.author`（对象）、repo 取 `pkg.name`（`savior-music`）、`target_commitish: 'master'`；`overrides` 中 8 个包为 `latest`；`browserslist` 为 `Electron 22.3.0`（实际 Chromium 138，声明的是 108）；运行期注册 `smusic` 而打包注册 `saviormusic`；`licenses/` 无 NOTICE，README 无上游归属。

## Global Constraints

- 所有代码文件 UTF-8 无 BOM；注释写意图与约束，不写变更说明。
- 一切输出使用简体中文（代码标识符沿用项目既有英文命名）。
- 不新增运行时依赖；不修改 `package-lock.json` 之外的锁文件策略。
- 不执行 `git add`/`commit`/`push`，除非用户明确要求 —— 本计划中的提交步骤需用户单独授权；执行者应把每个任务收尾为“等待用户确认后再提交”。
- 测试命令统一为 `npx vitest run src/<path>.test.ts -t "<用例名>"`，全量 `npx vitest run`。
- 类型检查：`npx tsc --noEmit -p src/main/tsconfig.json`（主进程）与 `npx tsc --noEmit -p src/renderer/tsconfig.json`（渲染侧）；ESLint：`npx eslint <file>`。
- 多语言文案必须同时补齐 `src/lang/zh-cn.json`、`zh-tw.json`、`en-us.json` 三个文件。
- 用户可见的变更说明只写可感知行为，禁止写实现细节（见全局 CLAUDE.md）。

## Review Focus

- **认证码暴力尝试**：同步服务端开启后，局域网设备反复用错误认证码请求 `/ah` 与 `/ws`，超过阈值后应被明确拒绝（403 `Blocked IP`），而不是继续进入解密校验。
- **限流切歌**：音乐接口返回 429 时快速点“下一首”，最终播放的必须是当前歌曲，旧请求的地址不能写入播放器。
- **老用户升级**：从 2.0.x 升级到当前版本，自定义的同步端口应当保留。
- **暂停多任务下载**：同时下载多个任务时点“全部暂停”，所有任务都应停止写盘并在稍后不会被自动拉起。
- **无歌词歌曲**：从有歌词的歌曲切到纯音乐，歌词面板与桌面歌词不应残留上一首内容。

---

### Task 1: 播放地址获取的取消与重试标识

**Files:**
- Create: `src/renderer/core/player/getUrlTrack.ts`
- Test: `src/renderer/core/player/getUrlTrack.test.ts`
- Modify: `src/renderer/core/player/action.ts:66-84`（`delayRetry`）、`:119`（重试分支）

**Interfaces:**
- Produces:
  - `export interface DelayRetryHandle { promise: Promise<string | null>, cancel: () => void }`
  - `export const createDelayRetry = <T>(run: () => Promise<T>, waitSeconds: number): DelayRetryHandle`
  - 行为约定：`run` 至多执行一次；`cancel()` 后 `promise` 以 `null` resolve，且若 `run` 尚未启动则永不启动、若已启动则其结果被丢弃。

- [ ] **Step 1: 写失败测试**

```ts
import { describe, it, expect, vi } from 'vitest'
import { createDelayRetry } from './getUrlTrack'

describe('createDelayRetry', () => {
  it('等待期结束后执行 run 并返回其结果', async() => {
    const run = vi.fn().mockResolvedValue('url')
    const handle = createDelayRetry(run, 0.01)
    await expect(handle.promise).resolves.toBe('url')
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('run 抛错时 promise 以错误 reject', async() => {
    const handle = createDelayRetry(() => Promise.reject(new Error('429')), 0.01)
    await expect(handle.promise).rejects.toThrow('429')
  })

  it('cancel 后 promise 以 null resolve，且 run 不再执行', async() => {
    const run = vi.fn().mockResolvedValue('url')
    const handle = createDelayRetry(run, 1)
    handle.cancel()
    await expect(handle.promise).resolves.toBeNull()
    await new Promise(resolve => setTimeout(resolve, 1100))
    expect(run).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/renderer/core/player/getUrlTrack.test.ts`
Expected: FAIL（`Cannot find module './getUrlTrack'`）

- [ ] **Step 3: 实现 `createDelayRetry`**

定时器用 `setTimeout(run, waitSeconds * 1000)`；cancel 时 `clearTimeout` 并 `resolve(null)`；用一个 `settled` 标志保证 resolve/reject 只发生一次，`run` 的结果在 cancel 之后不再写入。

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/renderer/core/player/getUrlTrack.test.ts`
Expected: PASS（3 passed）

- [ ] **Step 5: 接线到 `delayRetry`**

把 `action.ts:66-84` 的 `delayRetry` 改为基于 `createDelayRetry`：

```ts
let currentDelayRetry: DelayRetryHandle | null = null
const delayRetry = (musicInfo: S.Music.MusicInfo | S.Download.ListItem, isRefresh = false): Promise<string | null> => {
  currentDelayRetry?.cancel()
  const handle = createDelayRetry(() => getMusicPlayUrl(musicInfo, isRefresh, true), getRandom(2, 6))
  currentDelayRetry = handle
  setAllStatus(window.i18n.t('player__getting_url_delay_retry', { time: getRandom(2, 6) }))
  return handle.promise
}
```

并把 `setMusicUrl`（`:130`）与其它读取 `cancelDelayRetry` 的位置改为 `currentDelayRetry?.cancel()`。保留原有的 `setAllStatus` 提示文案键。

- [ ] **Step 6: 运行相关测试与检查**

Run: `npx vitest run src/renderer/core/player/` 然后 `npx eslint src/renderer/core/player/action.ts src/renderer/core/player/getUrlTrack.ts`
Expected: 全部通过，无 lint 错误

- [ ] **Step 7: 等待用户确认后提交**

```bash
git add src/renderer/core/player/getUrlTrack.ts src/renderer/core/player/getUrlTrack.test.ts src/renderer/core/player/action.ts
git commit -m "修复限流切歌时旧地址覆盖新歌曲的问题"
```

---

### Task 2: 设置迁移笔误修正

**Files:**
- Create: `src/common/utils/migrateSetting.test.ts`
- Modify: `src/common/utils/migrateSetting.ts:137-141`

**Interfaces:**
- Consumes: 默认导出 `(setting: any) => Partial<S.AppSetting>`
- Produces: 无新导出；修正后 `migrateSetting({ version: '2.0.0', sync: { port: 30000 } })` 的结果包含 `'sync.server.port': 30000`，不含 `'sync.erver.port'`。

- [ ] **Step 1: 写失败测试**

```ts
import { describe, it, expect } from 'vitest'
import migrateSetting from './migrateSetting'

describe('migrateSetting sync 端口迁移', () => {
  it('2.0.0 配置应迁移到 sync.server.port', () => {
    const result: any = migrateSetting({ version: '2.0.0', sync: { enable: true, port: 30000 } })
    expect(result['sync.server.port']).toBe(30000)
    expect(result['sync.erver.port']).toBeUndefined()
  })

  it('2.1.0 配置不再迁移同步端口', () => {
    const result: any = migrateSetting({ version: '2.1.0', 'sync.server.port': '25000' })
    expect(result['sync.server.port']).toBe('25000')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/common/utils/migrateSetting.test.ts`
Expected: FAIL（第一例 `result['sync.server.port']` 为 `undefined`）

- [ ] **Step 3: 修正键名**

把 `:139` 的 `setting['sync.erver.port'] = setting['sync.port']` 改为 `setting['sync.server.port'] = setting['sync.port']`；把上方注释 `// 迁移 v2.2.0 之前的设置数据` 改为 `// 迁移 v2.1.0 之前的设置数据`（与实际 `compareVer(..., '2.1.0')` 一致）。

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/common/utils/migrateSetting.test.ts`
Expected: PASS（2 passed）

- [ ] **Step 5: 等待用户确认后提交**

```bash
git add src/common/utils/migrateSetting.ts src/common/utils/migrateSetting.test.ts
git commit -m "修复旧版本升级后同步端口丢失的问题"
```

---

### Task 3: 同步服务鉴权失败次数限制

**Files:**
- Create: `src/main/modules/sync/server/server/authLimiter.ts`
- Test: `src/main/modules/sync/server/server/authLimiter.test.ts`
- Modify: `src/main/modules/sync/server/server/auth.ts:14-18, 76-96, 118-131`

**Interfaces:**
- Produces:
  - `export const MAX_AUTH_FAILURES = 20`
  - `export interface AuthLimiter { isBlocked: (ip: string) => boolean, recordFailure: (ip: string) => number, recordSuccess: (ip: string) => void }`
  - `export const createAuthLimiter = (maxFailures?: number): AuthLimiter`
  - 约定：`recordSuccess` 清零该 IP；`isBlocked` 在失败次数 `> maxFailures` 时为 true。

- [ ] **Step 1: 写失败测试**

```ts
import { describe, it, expect } from 'vitest'
import { createAuthLimiter, MAX_AUTH_FAILURES } from './authLimiter'

describe('authLimiter', () => {
  it('超过失败次数后封禁该 IP', () => {
    const limiter = createAuthLimiter(3)
    for (let i = 0; i < 3; i++) limiter.recordFailure('1.1.1.1')
    expect(limiter.isBlocked('1.1.1.1')).toBe(false)
    limiter.recordFailure('1.1.1.1')
    expect(limiter.isBlocked('1.1.1.1')).toBe(true)
  })

  it('成功后解除封禁并清零', () => {
    const limiter = createAuthLimiter(1)
    limiter.recordFailure('2.2.2.2')
    limiter.recordFailure('2.2.2.2')
    expect(limiter.isBlocked('2.2.2.2')).toBe(true)
    limiter.recordSuccess('2.2.2.2')
    expect(limiter.isBlocked('2.2.2.2')).toBe(false)
  })

  it('不同 IP 互不影响，默认上限为 20', () => {
    const limiter = createAuthLimiter()
    expect(MAX_AUTH_FAILURES).toBe(20)
    limiter.recordFailure('3.3.3.3')
    expect(limiter.isBlocked('4.4.4.4')).toBe(false)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/main/modules/sync/server/server/authLimiter.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `createAuthLimiter`**

内部用 `Map<string, number>`；不涉及定时清理（进程生命周期内保持即可）。

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/main/modules/sync/server/server/authLimiter.test.ts`
Expected: PASS（3 passed）

- [ ] **Step 5: 接线到 `auth.ts`**

- 删除模块内 `const requestIps = new Map<string, number>()` 与 `getAvailableIP` 中的 `< 10` 判断，改为 `const limiter = createAuthLimiter()`；`getAvailableIP` 返回 `ip && !limiter.isBlocked(ip) ? ip : null`。
- `authCode`（`:76`）中 `code == 200` 时调用 `limiter.recordSuccess(ip)`；否则调用 `limiter.recordFailure(ip)` 并**立即**把 `code = 403`、`msg = SYNC_CODE.msgBlockedIp` 后写出响应。
- `authConnect`（`:118`）中验证成功时 `limiter.recordSuccess(ip)`；失败时 `recordFailure(ip)` 并照旧 `throw new Error('failed')`。

- [ ] **Step 6: 运行测试与类型检查**

Run: `npx vitest run src/main/modules/sync/` 然后 `npx tsc --noEmit -p src/main/tsconfig.json`
Expected: 通过，无类型错误

- [ ] **Step 7: 等待用户确认后提交**

```bash
git add src/main/modules/sync/server/server/authLimiter.ts src/main/modules/sync/server/server/authLimiter.test.ts src/main/modules/sync/server/server/auth.ts
git commit -m "修复同步连接码可被无限尝试的问题"
```

---

### Task 4: 同步服务默认只监听本机

**Files:**
- Modify: `src/main/modules/sync/server/server/server.ts:125, 365`
- Modify: `src/main/modules/winMain/rendererEvent/sync.ts:20-23`
- Modify: `src/common/types/sync.d.ts:4-7`
- Modify: `src/common/defaultSetting.ts`（`'sync.enable'` 附近）、`src/common/types/app_setting.d.ts:645-660`
- Modify: `src/renderer/core/useApp/useSettingSync.ts:43-51`
- Modify: `src/renderer/views/Setting/components/SettingSync/SyncServer.vue:2-16`
- Modify: `src/lang/zh-cn.json`、`src/lang/zh-tw.json`、`src/lang/en-us.json`

**Interfaces:**
- Produces: 设置键 `'sync.server.bindLan': boolean`（默认 `false`）；`S.Sync.EnableServer` 增加 `bindLan: boolean`；`startServer(port: number, bindLan?: boolean)`。

- [ ] **Step 1: 加默认值与类型**

`defaultSetting.ts` 在 `'sync.server.port'` 之后加 `'sync.server.bindLan': false,`；`app_setting.d.ts` 在 `'sync.server.port'` 之后加同键（类型 `boolean`，带中文注释“是否允许局域网访问同步服务”）；`sync.d.ts` 的 `EnableServer` 加 `bindLan: boolean`。

- [ ] **Step 2: 改主进程启动参数**

`startServer` 签名改为 `(port: number, bindLan = false)`，`handleStartServer(port, bindLan ? '0.0.0.0' : '127.0.0.1')`；`rendererEvent/sync.ts` 的 `enable_server` 分支改为 `startServer(parseInt(data.data.port), data.data.bindLan)`，并在 `data.data.bindLan` 为 `undefined` 时按 `false` 处理（旧渲染进程兼容）。

- [ ] **Step 3: 改渲染侧推送**

`useSettingSync.ts` 中两处 `action: 'enable_server'` 的 `data` 增加 `bindLan: appSetting['sync.server.bindLan']`。

- [ ] **Step 4: 加设置项 UI 与文案**

`SyncServer.vue` 在端口输入框所在 `.p.gap-top` 之前加：

```pug
.p.gap-top
  base-checkbox(id="setting_sync_server_bind_lan" :model-value="appSetting['sync.server.bindLan']" :label="$t('setting__sync_server_bind_lan')" @update:model-value="updateSetting({ 'sync.server.bindLan': $event })")
```

三份语言文件各加一个键 `setting__sync_server_bind_lan`：简体“允许局域网内的设备连接”、繁体“允許區域網路內的裝置連接”、英文“Allow connections from LAN”。

- [ ] **Step 5: 校验**

Run: `npx tsc --noEmit -p src/main/tsconfig.json`、`npx tsc --noEmit -p src/renderer/tsconfig.json`、`node -e "['zh-cn','zh-tw','en-us'].forEach(l=>{const k=Object.keys(require('./src/lang/'+l+'.json'));if(!k.includes('setting__sync_server_bind_lan'))throw new Error(l)})"`
Expected: 无类型错误，脚本无输出

- [ ] **Step 6: 等待用户确认后提交**

```bash
git add src/main/modules/sync/server/server/server.ts src/main/modules/winMain/rendererEvent/sync.ts src/common/types/sync.d.ts src/common/types/app_setting.d.ts src/common/defaultSetting.ts src/renderer/core/useApp/useSettingSync.ts src/renderer/views/Setting/components/SettingSync/SyncServer.vue src/lang
git commit -m "优化同步服务的安全默认值"
```

---

### Task 5: 下载任务暂停等待工作线程确认

**Files:**
- Modify: `src/renderer/store/download/action.ts:311-315, 390-404`

**Interfaces:**
- Produces: `startTask` 保持返回 `Promise<void>`，但其内部等待 `'start'` 事件后才 resolve；`pauseDownloadTasks` 变为“先 await 暂停、再统一调度”。

- [ ] **Step 1: 让 `startTask` 等待工作线程确认**

在 `startTask` 内为本次任务创建一个 Promise，在 `proxyCallback` 的 `case 'start'` 分支中 resolve（新增 `resolveStarted` 变量）；`startTask` 改为 `await` 该 Promise 后再 `return`。`handleStartTask` 中获取 URL 失败的分支（`:262-265`）需同样 resolve 以避免悬挂。

- [ ] **Step 2: 改暂停流程**

```ts
export const pauseDownloadTasks = async(list: S.Download.ListItem[]) => {
  const tasks: Promise<void>[] = []
  for (const downloadInfo of list) {
    if (downloadInfo.status == DOWNLOAD_STATUS.WAITING || downloadInfo.status == DOWNLOAD_STATUS.ERROR) {
      setStatus(downloadInfo, DOWNLOAD_STATUS.PAUSE)
      continue
    }
    if (downloadInfo.status == DOWNLOAD_STATUS.RUN) tasks.push(window.s.worker.download.pauseTask(downloadInfo.id).finally(() => {
      runingTask.delete(downloadInfo.id)
      setStatus(downloadInfo, DOWNLOAD_STATUS.PAUSE)
    }))
  }
  await Promise.all(tasks)
  void checkStartTask()
}
```

- [ ] **Step 3: 校验**

Run: `npx tsc --noEmit -p src/renderer/tsconfig.json`、`npx eslint src/renderer/store/download/action.ts`、`npx vitest run src/renderer/store/__tests__/search-and-download.test.ts`
Expected: 通过；现有下载相关用例不回归

- [ ] **Step 4: 等待用户确认后提交**

```bash
git add src/renderer/store/download/action.ts
git commit -m "修复暂停下载后任务可能继续写入文件的问题"
```

---

### Task 6: 统一同步客户端地址解析

**Files:**
- Create: `src/main/modules/sync/client/parseUrl.ts`
- Test: `src/main/modules/sync/client/parseUrl.test.ts`
- Modify: `src/main/modules/sync/client/utils.ts:3-4, 97-110`
- Modify: `src/common/types/sync.d.ts`（`Client` 命名空间）

**Interfaces:**
- Produces: `export const parseSyncUrl = (host: string): S.Sync.Client.UrlInfo`；对非 `http:`/`https:` 协议或无法解析的输入抛出 `Error(SYNC_CODE.unknownServiceAddress)`（常量来自 `@common/constants_sync`）。

- [ ] **Step 1: 写失败测试**

```ts
import { describe, it, expect } from 'vitest'
import { parseSyncUrl } from './parseUrl'

describe('parseSyncUrl', () => {
  it('解析 http 地址', () => {
    expect(parseSyncUrl('http://192.168.1.5:23332/')).toEqual({
      wsProtocol: 'ws:', httpProtocol: 'http:', hostPath: '192.168.1.5:23332', href: 'http://192.168.1.5:23332',
    })
  })

  it('https 地址使用 wss', () => {
    expect(parseSyncUrl('https://a.com:1').wsProtocol).toBe('wss:')
  })

  it('拒绝 file 与 ftp 协议', () => {
    expect(() => parseSyncUrl('file:///C:/Windows')).toThrow()
    expect(() => parseSyncUrl('ftp://a.com')).toThrow()
  })

  it('拒绝无法解析的输入', () => {
    expect(() => parseSyncUrl('not a url')).toThrow()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/main/modules/sync/client/parseUrl.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现并接线**

把 `utils.ts:97-110` 的 `parseUrl` 实现迁移到新文件并改名为 `parseSyncUrl`，在开头加协议白名单校验；`utils.ts` 中改为 `export { parseSyncUrl as parseUrl } from './parseUrl'` 以保持 `index.ts:5` 的导入不变。

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/main/modules/sync/client/parseUrl.test.ts`
Expected: PASS（4 passed）

- [ ] **Step 5: 等待用户确认后提交**

```bash
git add src/main/modules/sync/client/parseUrl.ts src/main/modules/sync/client/parseUrl.test.ts src/main/modules/sync/client/utils.ts
git commit -m "限制同步客户端只接受网页协议地址"
```

---

### Task 7: 桌面歌词窗口尺寸与速度同步

**Files:**
- Create: `src/main/modules/winLyric/bounds.ts`
- Test: `src/main/modules/winLyric/bounds.test.ts`
- Modify: `src/main/modules/winLyric/main.ts:33-66`
- Modify: `src/main/modules/winLyric/rendererEvent.ts:28-40`
- Modify: `src/main/modules/winLyric/index.ts`
- Modify: `src/renderer-lyric/store/action.ts`
- Modify: `src/renderer-lyric/useApp/useWindowSize.ts:80-95`
- Modify: `src/renderer-lyric/utils/ipc.ts:21-27`（删除空的 `set_win_resizeable` 包装）、`src/main/modules/winLyric/rendererEvent.ts:32-34`（删除对应 `mainOn`）
- Modify: `src/renderer/core/lyric.ts:148-157`（`setPlaybackRate` 增发桌面歌词消息）

**Interfaces:**
- Produces:
  - `export interface LyricBounds { x: number, y: number, width: number, height: number }`
  - `export const normalizeBounds = (bounds: LyricBounds): LyricBounds` —— 取整、宽高下限 `320`/`60`。
  - IPC 事件名复用已有 `WIN_LYRIC_RENDERER_EVENT_NAME.set_bounds`；主进程在 `move`/`resize` 后向歌词窗口 `mainSend(win, set_bounds, bounds)`。
  - 主窗口 → 歌词窗口：在 `LyricActions` 中新增 `SyncAction<'set_playback_rate', number>`（`src/common/types/desktop_lyric.d.ts`），由 `mainWindowChannel.ts:50-52` 已有分支消费。

- [ ] **Step 1: 写失败测试**

```ts
import { describe, it, expect } from 'vitest'
import { normalizeBounds } from './bounds'

describe('normalizeBounds', () => {
  it('取整并保持合法尺寸', () => {
    expect(normalizeBounds({ x: 10.6, y: 20.2, width: 400.4, height: 120.8 }))
      .toEqual({ x: 11, y: 20, width: 400, height: 121 })
  })

  it('宽高低于下限时抬到下限', () => {
    expect(normalizeBounds({ x: 0, y: 0, width: 100, height: 20 }))
      .toEqual({ x: 0, y: 0, width: 320, height: 60 })
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/main/modules/winLyric/bounds.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `normalizeBounds` 并接线主进程**

`main.ts` 的 `move`/`resize` 回调改用 `normalizeBounds(win.getBounds())`，写配置后 `mainSend` 回推 `set_bounds`。删除 `rendererEvent.ts` 中 `set_win_resizeable` 的 `mainOn` 以及 `renderer-lyric/utils/ipc.ts` 中的空包装函数（若仍有调用点，一并删除）。

- [ ] **Step 4: 渲染侧消费尺寸**

`src/renderer-lyric/store/action.ts` 的 `on` 处理中增加 `set_bounds` 分支写入 `desktopLyric.x/y/width/height`；`useWindowSize.ts` 的初始值改为读取这四个字段而非 `window.innerWidth/innerHeight`（`innerWidth` 仅作为缺省回退）。

- [ ] **Step 5: 播放速度同步**

`src/renderer/core/lyric.ts` 的 `setPlaybackRate` 在 `lrc.setPlaybackRate(rate)` 之后加 `sendDesktopLyricInfo({ action: 'set_playback_rate', data: rate })`；在 `desktop_lyric.d.ts` 的 `LyricActions` 中登记该 action。

- [ ] **Step 6: 校验**

Run: `npx vitest run src/main/modules/winLyric/`、`npx tsc --noEmit -p src/main/tsconfig.json`、`npx tsc --noEmit -p src/renderer/tsconfig.json`
Expected: 通过

- [ ] **Step 7: 等待用户确认后提交**

```bash
git add src/main/modules/winLyric src/renderer-lyric/store/action.ts src/renderer-lyric/useApp/useWindowSize.ts src/renderer-lyric/utils/ipc.ts src/renderer/core/lyric.ts src/common/types/desktop_lyric.d.ts
git commit -m "修复桌面歌词缩放跳动与速度不同步的问题"
```

---

### Task 8: 无歌词歌曲清理歌词状态

**Files:**
- Modify: `src/renderer/core/lyric.ts:159-185`
- Modify: `src/renderer/store/player/lyric.ts:24-27`

**Interfaces:**
- Consumes: `setLines(lines: Line[])`、`setText(text: string, line: number)`
- Produces: `setLines` 允许空数组清空现有行；`setLyric` 在 `musicInfo.lrc` 为空时调用 `lrc.setLyric('')`、`setLines([])`、`setText('', 0)` 并向桌面歌词发送空歌词。

- [ ] **Step 1: 调整 `setLines` 清空语义**

把 `if (!lines.length && !lyric.lines.length) return` 改为仅在没有需要清空的内容时短路：当传入空数组且 `lyric.lines` 已有内容时照常赋值清空；保留值为空且原本就为空的早退。

- [ ] **Step 2: 补 `setLyric` 的空歌词分支**

在 `if (musicInfo.lrc)` 分支之后加 `else`：清空本窗口歌词（`lrc.setLyric('')`、`setLines([])`、`setText('', 0)`），并以 `{ action: 'set_lyric', data: { lrc: '', tlrc: null, rlrc: null, slrc: null } }` 通知桌面歌词。

- [ ] **Step 3: 校验**

Run: `npx vitest run src/renderer/store/__tests__/player.test.ts`、`npx tsc --noEmit -p src/renderer/tsconfig.json`、`npx eslint src/renderer/core/lyric.ts src/renderer/store/player/lyric.ts`
Expected: 通过

- [ ] **Step 4: 等待用户确认后提交**

```bash
git add src/renderer/core/lyric.ts src/renderer/store/player/lyric.ts
git commit -m "修复切到无歌词歌曲后歌词残留的问题"
```

---

### Task 9: 简繁转换保留原始歌词

**Files:**
- Create: `src/renderer/core/music/s2tLyric.ts`
- Test: `src/renderer/core/music/s2tLyric.test.ts`
- Modify: `src/renderer/core/music/utils.ts:79-122`

**Interfaces:**
- Produces: `export const buildS2tLyric = async(source: S.Music.LyricInfo, convert: (text: string) => Promise<string>): Promise<S.Player.LyricInfo>` —— 返回对象的四个可见字段是转换后的文本，`rawlrcInfo` 恒为 `source` 中的原文；当 `source` 没有 `rawlrcInfo` 时，`rawlrcInfo` 取 `source` 自身（不重复转换）。

- [ ] **Step 1: 写失败测试**

```ts
import { describe, it, expect } from 'vitest'
import { buildS2tLyric } from './s2tLyric'

const convert = async(text: string) => `T(${text})`

describe('buildS2tLyric', () => {
  it('转换可见歌词，保留原文到 rawlrcInfo', async() => {
    const result = await buildS2tLyric({ lyric: '[00:00]美丽', tlyric: null, rlyric: null, slyric: null, rawlrcInfo: { lyric: '美丽', tlyric: null, rlyric: null, slyric: null } } as any, convert)
    expect(result.lyric).toBe('T([00:00]美丽)')
    expect(result.rawlrcInfo.lyric).toBe('美丽')
  })

  it('没有 rawlrcInfo 时用原文自身作为 rawlrcInfo', async() => {
    const result = await buildS2tLyric({ lyric: '[00:00]美丽', tlyric: null, rlyric: null, slyric: null } as any, convert)
    expect(result.lyric).toBe('T([00:00]美丽)')
    expect(result.rawlrcInfo.lyric).toBe('[00:00]美丽')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/renderer/core/music/s2tLyric.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现并替换 `buildLyricInfo` 的转换段**

新模块的 `convert` 参数由调用方注入，使其不依赖 `window`。`utils.ts` 的 `buildLyricInfo` 保留为非 S2T 的早退逻辑，S2T 分支改为 `return buildS2tLyric(lyricInfo, langS2T)`。

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/renderer/core/music/s2tLyric.test.ts`
Expected: PASS（2 passed）

- [ ] **Step 5: 等待用户确认后提交**

```bash
git add src/renderer/core/music/s2tLyric.ts src/renderer/core/music/s2tLyric.test.ts src/renderer/core/music/utils.ts
git commit -m "修复简繁转换后无法查看原始歌词的问题"
```

---

### Task 10: 歌词预加载超时

**Files:**
- Create: `src/renderer/core/useApp/usePlayer/checkAudioUrl.ts`
- Test: `src/renderer/core/useApp/usePlayer/checkAudioUrl.test.ts`
- `src/renderer/core/useApp/usePlayer/usePreloadNextMusic.ts:22-47, 55-77`

**Interfaces:**
- Produces: `export const withTimeout = <T>(promise: Promise<T>, fallback: T, ms: number): Promise<T>` —— 超时后以 `fallback` resolve，原 promise 的结果被丢弃。

- [ ] **Step 1: 写失败测试**

```ts
import { describe, it, expect, vi } from 'vitest'
import { withTimeout } from './checkAudioUrl'

describe('withTimeout', () => {
  it('按时完成时返回原结果', async() => {
    await expect(withTimeout(Promise.resolve(true), false, 100)).resolves.toBe(true)
  })

  it('超时时返回兜底值', async() => {
    await expect(withTimeout(new Promise<boolean>(() => {}), false, 20)).resolves.toBe(false)
  })

  it('原 promise 拒绝时原样抛出', async() => {
    await expect(withTimeout(Promise.reject(new Error('x')), false, 100)).rejects.toThrow('x')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/renderer/core/useApp/usePlayer/checkAudioUrl.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `withTimeout` 并接入预加载**

`checkMusicUrl` 的调用处改为 `await withTimeout(checkMusicUrl(url), false, 10_000)`；`preloadNextMusicUrl` 的整个函数体用 `try/finally` 包住保证 `preloadMusicInfo.isLoading = false` 一定会执行（当前实现中任何异常都会让它永久为 `true`）。

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/renderer/core/useApp/usePlayer/checkAudioUrl.test.ts`
Expected: PASS（3 passed）

- [ ] **Step 5: 等待用户确认后提交**

```bash
git add src/renderer/core/useApp/usePlayer/checkAudioUrl.ts src/renderer/core/useApp/usePlayer/checkAudioUrl.test.ts src/renderer/core/useApp/usePlayer/usePreloadNextMusic.ts
git commit -m "修复网络异常后不再预加载下一首的问题"
```

---

### Task 11: 发布脚本与包元数据对齐

**Files:**
- Rename: `publish/utils/githubRelease.js`（内容改为从 `package.json` 的 `repository.url` 解析 owner/repo）
- Test: 无（发布脚本用一次性 dry-run 命令验证）
- Modify: `publish/utils/githubRelease.js:28-36, 45`
- Modify: `build-config/build-pack.js:16-21, 94`
- Modify: `src/main/app.ts:145-153`
- Modify: `package.json`（`browserslist`、`overrides`）

**Interfaces:**
- Produces: `export const parseRepo = (repoUrl: string): { owner: string, repo: string }`（CJS：`module.exports.parseRepo`）；`build-config/build-pack.js` 的 `protocols.schemes` 与 Linux `MimeType` 使用 `smusic`。

- [ ] **Step 1: 修正 GitHub Release 字段**

在 `githubRelease.js` 中新增 `parseRepo`：从 `pkg.repository.url`（形如 `git+https://github.com/OWNER/REPO.git`）匹配 `github\.com[:/]([^/]+)\/([^/.]+)`，解析失败则 `throw new Error('无法从 package.json 解析仓库地址')`。`options.repo`/`options.owner` 改用解析结果，`target_commitish` 的两处默认值改为 `'main'`。

- [ ] **Step 2: 统一深链接协议**

`build-pack.js:19` 的 `'saviormusic'` 改为 `'smusic'`，`:94` 的 `x-scheme-handler/saviormusic` 改为 `x-scheme-handler/smusic`；`app.ts` 的两处 `setAsDefaultProtocolClient('smusic', ...)` 不变（此时运行时与打包一致）。

- [ ] **Step 3: 修正 browserslist**

`package.json` 的 `"browserslist": ["Electron 22.3.0"]` 改为 `["Electron 37.6.1"]`（`electron-to-chromium` 映射为 Chromium 138）。

- [ ] **Step 4: 锁定浮动依赖**

`overrides` 中把 `"latest"` 全部替换为当前 `package-lock.json` 锁定的版本：`json5: "2.2.3"`、`node-abi: "4.26.0"`、`minimatch: "10.2.0"`、`semver: "7.7.4"`、`braces: "3.0.3"`、`node-gyp-build: "4.8.4"`、`micromatch: "4.0.8"`、`http-cache-semantics: "4.2.0"`；`got` 保持 `"^11"`。

- [ ] **Step 5: 校验**

Run: `node -e "const {parseRepo}=require('./publish/utils/githubRelease.js');console.log(parseRepo('git+https://github.com/Z-Savior-66/Music.git'))"`
Expected: 输出 `{ owner: 'Z-Savior-66', repo: 'Music' }`
Run: `npm install --package-lock-only --no-audit --no-fund` 然后 `git diff --stat package-lock.json`
Expected: 锁定文件无实质版本变化（若出现变化，说明锁文件与 overrides 不一致，需停下排查）

- [ ] **Step 6: 等待用户确认后提交**

```bash
git add package.json package-lock.json publish/utils/githubRelease.js build-config/build-pack.js src/main/app.ts
git commit -m "修复发布信息与深链接不生效的问题"
```

---

### Task 12: 补齐上游归属与许可证说明

**Files:**
- Create: `licenses/NOTICE`
- Modify: `README.md`（末尾“许可证”段）
- Modify: `licenses/license_zh.txt:1`、`licenses/license_en.txt:1`

**Interfaces:**
- Produces: `licenses/NOTICE` 纯文本，随 `extraResources: ['./licenses']` 自动进入安装包，无需改打包配置。

- [ ] **Step 1: 新增 NOTICE**

内容用简体中文写入：本项目为 `lx-music-desktop`（作者 lyswhut，Apache-2.0）的派生项目；保留其原始版权声明；列出运行时来源依赖 `needle`（来自 `github:lyswhut/needle`）的归属。

- [ ] **Step 2: 修正许可证补充协议表述**

`license_zh.txt:1` 与 `license_en.txt:1` 的首句“如有冲突以以下协议为准”改为“以下条款为使用本项目的附加说明，不改变本项目的 Apache License 2.0 授权”；`license_en.txt:52` 的 `By: lyswhut` 保留并在其上补一行“Original copyright (c) lyswhut; adapted for S Music.”

- [ ] **Step 3: README 补归属段**

把“## 许可证”段改为：声明 Apache-2.0、说明本项目基于 `lx-music-desktop` 派生、指向 `licenses/NOTICE`。

- [ ] **Step 4: 校验**

Run: `node -e "const fs=require('fs');['licenses/NOTICE','licenses/license_zh.txt','licenses/license_en.txt'].forEach(f=>{const s=fs.readFileSync(f,'utf8');if(!/Apache License 2.0|Apache-2.0/.test(s)&&f!=='licenses/NOTICE')throw new Error(f)});console.log('ok')"`
Expected: 输出 `ok`

- [ ] **Step 5: 等待用户确认后提交**

```bash
git add licenses/NOTICE licenses/license_zh.txt licenses/license_en.txt README.md
git commit -m "补充项目来源与许可证说明"
```

---

### Task 13: 发布密钥文件不纳入版本控制

**Files:**
- Modify: `.gitignore`
- Create: `publish/utils/cosConfig.example.js`

**Interfaces:**
- Produces: `publish/utils/cosConfig.js` 继续被 `publish/utils/index.js` 以 `require` 方式读取；新增示例文件，键名与空值同当前文件。

- [ ] **Step 1: 忽略真实配置**

`.gitignore` 末尾加：

```text
# 发布凭证，仅保留示例文件
publish/utils/cosConfig.js
```

- [ ] **Step 2: 生成示例文件**

把当前 `cosConfig.js` 的完整内容复制为 `cosConfig.example.js`，在顶部加注释“复制为 cosConfig.js 后填写，勿提交真实密钥”。

- [ ] **Step 3: 校验**

Run: `git check-ignore -v publish/utils/cosConfig.js`、`git ls-files publish/utils/cosConfig.js`
Expected: 前者输出匹配 `.gitignore` 的行；后者仍有输出（文件仍在索引中，忽略规则只防止后续修改被暂存，需交给用户决定是否 `git rm --cached`）

- [ ] **Step 4: 等待用户确认后提交**

向用户说明 `git rm --cached publish/utils/cosConfig.js` 的效果后再执行；提交命令：

```bash
git add .gitignore publish/utils/cosConfig.example.js
git commit -m "避免发布配置误入版本库"
```

---

## Self-Review

- **Spec 覆盖**：重试竞态 → Task 1；迁移笔误 → Task 2；同步鉴权/绑定 → Task 3、4；下载暂停 → Task 5；同步客户端协议 → Task 6；桌面歌词尺寸/速度 → Task 7；无歌词残留 → Task 8；简繁原文 → Task 9；预加载超时 → Task 10；发布/深链接/browserslist/依赖浮动 → Task 11；许可证归属 → Task 12；密钥文件 → Task 13。**未覆盖**并需单独计划的：Electron 安全隔离改造（用户已选择另开）、主进程 IPC 来源校验、`openAPI` 局域网鉴权、`player.audioVisualization` 与 `desktopLyric.audioVisualization` 键合并、`kw` 模块级请求单例。
- **类型一致性**：`DelayRetryHandle`、`AuthLimiter`、`parseSyncUrl`、`normalizeBounds`、`buildS2tLyric`、`withTimeout`、`parseRepo` 均在产生它们的任务中给出签名，后续任务只引用未重命名。
- **占位符检查**：无 TBD；“随协议修改”的步骤都给了具体新旧值。
- **比例**：计划以签名 + 测试断言为主，仅在行为不显然处给出完整片段（Task 5 的暂停流程、Task 1 的接线）。