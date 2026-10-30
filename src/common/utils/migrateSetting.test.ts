import { describe, it, expect } from 'vitest'
import migrateSetting from './migrateSetting'

describe('migrateSetting sync 端口迁移', () => {
  it('1.x 配置应迁移到 sync.server.port', () => {
    // 用真实的旧版本号触发两段迁移，避免跨版本直接跳到 2.0.0 时该键从未被写入
    const result: any = migrateSetting({ version: '1.0.0', sync: { enable: true, port: 30000 } })
    expect(result['sync.server.port']).toBe(30000)
    expect(result['sync.erver.port']).toBeUndefined()
  })

  it('2.0.x 配置的 sync.port 应迁移到 sync.server.port', () => {
    const result: any = migrateSetting({ version: '2.0.5', 'sync.port': 30000, 'sync.enable': true })
    expect(result['sync.server.port']).toBe(30000)
  })

  it('2.0.x 配置缺少 sync.port 时不应写入 undefined 覆盖默认端口', () => {
    // 覆盖默认端口会让同步服务因端口为空而无法启动
    const result: any = migrateSetting({ version: '2.0.5', 'sync.enable': true })
    expect('sync.server.port' in result).toBe(false)
  })

  it('2.1.0 配置不再迁移同步端口', () => {
    const result: any = migrateSetting({ version: '2.1.0', 'sync.server.port': '25000' })
    expect(result['sync.server.port']).toBe('25000')
  })
})
