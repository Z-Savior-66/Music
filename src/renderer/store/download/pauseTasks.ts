import { DOWNLOAD_STATUS } from '@common/constants'

export interface PauseTaskItem {
  id: string
  status: string
}

/**
 * 批量暂停下载任务。
 *
 * 约束：运行中的任务必须等工作线程确认停止后才回调 `onPaused`，调用方据此在
 * 全部停止后才会调度下一个任务——否则新旧任务会并发写同一个文件。等待中与
 * 出错的任务没有写盘行为，直接置为暂停即可。
 */
export const pauseTasks = async(
  list: PauseTaskItem[],
  pauseRunning: (id: string) => Promise<void>,
  onPaused: (id: string) => void,
): Promise<void> => {
  const tasks: Array<Promise<void>> = []
  for (const item of list) {
    if (item.status == DOWNLOAD_STATUS.WAITING || item.status == DOWNLOAD_STATUS.ERROR) {
      onPaused(item.id)
      continue
    }
    if (item.status == DOWNLOAD_STATUS.RUN) {
      tasks.push(pauseRunning(item.id).finally(() => { onPaused(item.id) }))
    }
  }
  await Promise.all(tasks)
}
