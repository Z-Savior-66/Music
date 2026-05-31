import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getRandom,
  sizeFormate,
  toDateObj,
  dateFormat,
  formatPlayTime,
  formatPlayTime2,
  isUrl,
  parseUrlParams,
  throttle,
  debounce,
  filterFileName,
  similar,
  sortInsert,
  encodePath,
  arrPush,
  arrUnshift,
  arrPushByPosition,
  arrShuffle,
} from './common'

// ---------------------------------------------------------------------------
// getRandom
// ---------------------------------------------------------------------------
describe('getRandom', () => {
  it('应在 [min, max) 范围内返回整数', () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandom(5, 10)
      expect(result).toBeGreaterThanOrEqual(5)
      expect(result).toBeLessThan(10)
      expect(Number.isInteger(result)).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// sizeFormate
// ---------------------------------------------------------------------------
describe('sizeFormate', () => {
  it('应返回 "0 B" 当输入为 0', () => {
    expect(sizeFormate(0)).toBe('0 B')
  })

  it('应格式化字节 (B)', () => {
    expect(sizeFormate(500)).toBe('500.00 B')
    expect(sizeFormate(1)).toBe('1.00 B')
    expect(sizeFormate(1023)).toBe('1023.00 B')
  })

  it('应格式化千字节 (KB)', () => {
    expect(sizeFormate(1024)).toBe('1.00 KB')
    expect(sizeFormate(2048)).toBe('2.00 KB')
    expect(sizeFormate(1536)).toBe('1.50 KB')
  })

  it('应格式化兆字节 (MB)', () => {
    expect(sizeFormate(1048576)).toBe('1.00 MB')
    expect(sizeFormate(2097152)).toBe('2.00 MB')
    expect(sizeFormate(1572864)).toBe('1.50 MB')
  })

  it('应格式化吉字节 (GB)', () => {
    expect(sizeFormate(1073741824)).toBe('1.00 GB')
  })

  it('应格式化太字节 (TB)', () => {
    expect(sizeFormate(1099511627776)).toBe('1.00 TB')
  })
})

// ---------------------------------------------------------------------------
// toDateObj
// ---------------------------------------------------------------------------
describe('toDateObj', () => {
  it('应返回空字符串当输入为 falsy', () => {
    expect(toDateObj('')).toBe('')
    expect(toDateObj(0)).toBe('')
    expect(toDateObj(null)).toBe('')
    expect(toDateObj(undefined)).toBe('')
  })

  it('应将时间戳数字转为 Date 对象', () => {
    const ts = 1700000000000
    const result = toDateObj(ts)
    expect(result).toBeInstanceOf(Date)
    expect((result as Date).getTime()).toBe(ts)
  })

  it('应将日期字符串转为 Date 对象（不含 T）', () => {
    const str = '2024-01-15 10:30:00'
    const result = toDateObj(str)
    expect(result).toBeInstanceOf(Date)
    const d = result as Date
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(0) // 一月
    expect(d.getDate()).toBe(15)
  })

  it('应将 ISO 日期字符串转为 Date 对象（含 T）', () => {
    const str = '2024-01-15T10:30:00.000Z'
    const result = toDateObj(str)
    expect(result).toBeInstanceOf(Date)
    expect((result as Date).toISOString()).toBe(str)
  })

  it('应原样返回已经是 Date 对象的输入', () => {
    const d = new Date('2024-01-15')
    const result = toDateObj(d)
    expect(result).toBe(d)
  })

  it('应对无效类型返回空字符串', () => {
    expect(toDateObj(true)).toBe('')
    expect(toDateObj(Symbol('test'))).toBe('')
  })
})

// ---------------------------------------------------------------------------
// dateFormat
// ---------------------------------------------------------------------------
describe('dateFormat', () => {
  it('应使用默认格式 Y-M-D h:m:s', () => {
    const d = new Date(2024, 0, 15, 10, 30, 45)
    expect(dateFormat(d)).toBe('2024-01-15 10:30:45')
  })

  it('应支持自定义格式', () => {
    const d = new Date(2024, 0, 15, 10, 30, 45)
    expect(dateFormat(d, 'Y年M月D日 h时m分s秒')).toBe('2024年01月15日 10时30分45秒')
    expect(dateFormat(d, 'M/D')).toBe('01/15')
    expect(dateFormat(d, 'h:m')).toBe('10:30')
  })

  it('应对无效日期返回空字符串', () => {
    expect(dateFormat(null)).toBe('')
    expect(dateFormat('')).toBe('')
  })

  it('应为个位数补零', () => {
    const d = new Date(2024, 2, 5, 8, 7, 3)
    expect(dateFormat(d)).toBe('2024-03-05 08:07:03')
  })
})

// ---------------------------------------------------------------------------
// formatPlayTime / formatPlayTime2
// ---------------------------------------------------------------------------
describe('formatPlayTime', () => {
  it('输入 0 应返回 "--/--"', () => {
    expect(formatPlayTime(0)).toBe('--/--')
  })

  it('应格式化秒数', () => {
    expect(formatPlayTime(30)).toBe('00:30')
    expect(formatPlayTime(5)).toBe('00:05')
    expect(formatPlayTime(59)).toBe('00:59')
  })

  it('应格式化为 分钟:秒数', () => {
    expect(formatPlayTime(150)).toBe('02:30')
    expect(formatPlayTime(3661)).toBe('61:01')
  })
})

describe('formatPlayTime2', () => {
  it('输入 0 应返回 "00:00"', () => {
    expect(formatPlayTime2(0)).toBe('00:00')
  })

  it('应格式化秒数', () => {
    expect(formatPlayTime2(30)).toBe('00:30')
    expect(formatPlayTime2(5)).toBe('00:05')
  })

  it('应格式化为 分钟:秒数', () => {
    expect(formatPlayTime2(150)).toBe('02:30')
    expect(formatPlayTime2(3661)).toBe('61:01')
  })
})

// ---------------------------------------------------------------------------
// isUrl
// ---------------------------------------------------------------------------
describe('isUrl', () => {
  it('应识别 http 链接', () => {
    expect(isUrl('http://example.com')).toBe(true)
  })

  it('应识别 https 链接', () => {
    expect(isUrl('https://example.com')).toBe(true)
    expect(isUrl('https://example.com/path?q=1')).toBe(true)
  })

  it('应拒绝非 http 链接', () => {
    expect(isUrl('ftp://example.com')).toBe(false)
    expect(isUrl('file:///C:/path')).toBe(false)
  })

  it('应拒绝普通字符串', () => {
    expect(isUrl('example.com')).toBe(false)
    expect(isUrl('')).toBe(false)
    expect(isUrl('/path/to/file')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// parseUrlParams
// ---------------------------------------------------------------------------
describe('parseUrlParams', () => {
  it('应解析查询参数', () => {
    expect(parseUrlParams('a=1&b=2')).toEqual({ a: '1', b: '2' })
  })

  it('应处理单个参数', () => {
    expect(parseUrlParams('key=value')).toEqual({ key: 'value' })
  })

  it('应处理空值参数', () => {
    expect(parseUrlParams('a=&b=2')).toEqual({ a: '', b: '2' })
  })

  it('应返回空对象当输入为空字符串', () => {
    expect(parseUrlParams('')).toEqual({})
  })

  it('应返回空对象当输入不是字符串', () => {
    expect(parseUrlParams(123 as any)).toEqual({})
    expect(parseUrlParams(null as any)).toEqual({})
    expect(parseUrlParams(undefined as any)).toEqual({})
  })
})

// ---------------------------------------------------------------------------
// filterFileName
// ---------------------------------------------------------------------------
describe('filterFileName', () => {
  it('应移除非法字符 \\ / : * ? # " < > |', () => {
    expect(filterFileName('a/b:c')).toBe('abc')
    expect(filterFileName('file<name>')).toBe('filename')
    expect(filterFileName('a|b"c<d>e?f*g#h')).toBe('abcdefgh')
    expect(filterFileName('test\\file')).toBe('testfile')
  })

  it('应保留合法文件名', () => {
    expect(filterFileName('valid.txt')).toBe('valid.txt')
    expect(filterFileName('my-file_v2.0')).toBe('my-file_v2.0')
    expect(filterFileName('')).toBe('')
  })
})

// ---------------------------------------------------------------------------
// similar
// ---------------------------------------------------------------------------
describe('similar', () => {
  it('一方为空时应返回 0', () => {
    expect(similar('', 'abc')).toBe(0)
    expect(similar('abc', '')).toBe(0)
    expect(similar('', '')).toBe(0)
  })

  it('完全相同的字符串应返回 1', () => {
    expect(similar('abc', 'abc')).toBe(1)
    expect(similar('hello', 'hello')).toBe(1)
  })

  it('应计算相似字符串的相似度', () => {
    // 'abc' -> 'abd', 编辑距离 1, 较长串长度 3 => 1 - 1/3
    expect(similar('abc', 'abd')).toBeCloseTo(1 - 1 / 3)
    // 'kitten' -> 'sitting', 编辑距离 3, 较长串长度 7 => 1 - 3/7
    expect(similar('kitten', 'sitting')).toBeCloseTo(1 - 3 / 7)
  })
})

// ---------------------------------------------------------------------------
// sortInsert
// ---------------------------------------------------------------------------
describe('sortInsert', () => {
  it('应向空数组插入元素', () => {
    const arr: Array<{ num: number, data: string }> = []
    sortInsert(arr, { num: 2, data: 'b' })
    expect(arr).toEqual([{ num: 2, data: 'b' }])
  })

  it('应保持数组有序', () => {
    const arr: Array<{ num: number, data: string }> = []
    sortInsert(arr, { num: 2, data: 'b' })
    sortInsert(arr, { num: 1, data: 'a' })
    sortInsert(arr, { num: 3, data: 'c' })
    expect(arr.map((x) => x.num)).toEqual([1, 2, 3])
  })

  it('相同值应插入到同值分组最前面', () => {
    const arr: Array<{ num: number, data: string }> = [
      { num: 1, data: 'a' },
      { num: 1, data: 'b' },
    ]
    sortInsert(arr, { num: 1, data: 'c' })
    expect(arr[0].data).toBe('c')
    expect(arr[1].data).toBe('a')
    expect(arr[2].data).toBe('b')
  })
})

// ---------------------------------------------------------------------------
// encodePath
// ---------------------------------------------------------------------------
describe('encodePath', () => {
  it('应将反斜杠替换为正斜杠并编码', () => {
    expect(encodePath('C:\\Users\\test')).toBe('C:/Users/test')
  })

  it('应对空格等特殊字符进行 URL 编码', () => {
    expect(encodePath('C:\\Users\\test file')).toBe('C:/Users/test%20file')
  })

  it('应对中文进行 URL 编码', () => {
    const result = encodePath('C:\\Users\\测试')
    expect(result).toContain('C:/Users/')
    expect(result).not.toContain('测试')
    expect(decodeURI(result)).toBe('C:/Users/测试')
  })
})

// ---------------------------------------------------------------------------
// arrPush / arrUnshift / arrPushByPosition
// ---------------------------------------------------------------------------
describe('arrPush', () => {
  it('应将元素追加到数组末尾', () => {
    const list = [1, 2, 3]
    const result = arrPush(list, [4, 5, 6])
    expect(result).toBe(list)
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('应处理超过 1000 个元素的大数组', () => {
    const list: number[] = []
    const newItems = Array.from({ length: 2500 }, (_, i) => i)
    arrPush(list, newItems)
    expect(list).toHaveLength(2500)
    expect(list[0]).toBe(0)
    expect(list[2499]).toBe(2499)
  })
})

describe('arrUnshift', () => {
  it('应将元素插入到数组开头', () => {
    const list = [4, 5, 6]
    const result = arrUnshift(list, [1, 2, 3])
    expect(result).toBe(list)
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('应处理超过 1000 个元素的大数组', () => {
    const list = [9999]
    const newItems = Array.from({ length: 2500 }, (_, i) => i)
    arrUnshift(list, newItems)
    expect(list).toHaveLength(2501)
    expect(list[0]).toBe(0)
    expect(list[2499]).toBe(2499)
    expect(list[2500]).toBe(9999)
  })
})

describe('arrPushByPosition', () => {
  it('应在指定位置插入元素', () => {
    const list = [1, 2, 5, 6]
    const result = arrPushByPosition(list, [3, 4], 2)
    expect(result).toBe(list)
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('位置为 0 时应等同于前置插入', () => {
    const list = [3, 4, 5]
    arrPushByPosition(list, [1, 2], 0)
    expect(list).toEqual([1, 2, 3, 4, 5])
  })

  it('位置为数组长度时应等同于追加', () => {
    const list = [1, 2]
    arrPushByPosition(list, [3, 4], 2)
    expect(list).toEqual([1, 2, 3, 4])
  })

  it('应处理超过 1000 个元素的大数组', () => {
    const list = [0, 1, 1002, 1003]
    const newItems = Array.from({ length: 1000 }, (_, i) => i + 2)
    arrPushByPosition(list, newItems, 2)
    expect(list).toHaveLength(1004)
    expect(list[2]).toBe(2)
    expect(list[1001]).toBe(1001)
  })
})

// ---------------------------------------------------------------------------
// arrShuffle
// ---------------------------------------------------------------------------
describe('arrShuffle', () => {
  it('应保留所有元素', () => {
    const original = [1, 2, 3, 4, 5]
    const shuffled = arrShuffle([...original])
    expect(shuffled).toHaveLength(original.length)
    expect([...shuffled].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  it('应返回原数组引用', () => {
    const arr = [1, 2, 3]
    const result = arrShuffle(arr)
    expect(result).toBe(arr)
  })

  it('空数组应保持不变', () => {
    const arr: number[] = []
    expect(arrShuffle(arr)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// throttle / debounce
// ---------------------------------------------------------------------------
describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应在延迟后执行一次', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled('a')
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('a')
  })

  it('在延迟期间内的多次调用应只执行一次', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled('a')
    throttled('b')
    throttled('c')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
  })

  it('延迟结束后应可再次触发', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled('a')
    vi.advanceTimersByTime(100)
    throttled('b')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenNthCalledWith(1, 'a')
    expect(fn).toHaveBeenNthCalledWith(2, 'b')
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应在延迟后执行', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('a')
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('a')
  })

  it('连续调用应重置延迟，只执行最后一次', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('a')
    vi.advanceTimersByTime(50)
    debounced('b')
    vi.advanceTimersByTime(50)
    debounced('c')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
  })

  it('每次触发周期独立', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('a')
    vi.advanceTimersByTime(100)
    debounced('b')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
