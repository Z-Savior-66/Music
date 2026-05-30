import { createDownload, type DownloaderType, type Options as DownloadOptions } from '@common/utils/download'
import { createDownloadInfo } from './utils'
import { checkAndCreateDir, checkPath, getFileStats, removeFile } from '@common/utils/nodejs'
import { DOWNLOAD_STATUS } from '@common/constants'

const dls = new Map<string, DownloaderType>()
const tryNum = new Map<string, number>()
const taskActions = new Map<string, (action: LX.Download.DownloadTaskActions) => void>()
const tasks = new Map<string, LX.Download.ListItem>()

export const checkList = (list: LX.Download.ListItem[], musicInfo: LX.Music.MusicInfo, quality: LX.Quality, ext: string): boolean => {
  return list.some(s => s.id === musicInfo.id && (s.metadata.quality === quality || s.metadata.ext === ext))
}

const sendAction = (id: string, action: LX.Download.DownloadTaskActions) => {
  const callback = taskActions.get(id)
  if (!callback) return
  callback(action)
}

export const createDownloadTasks = (
  list: LX.Music.MusicInfoOnline[],
  quality: LX.Quality,
  fileNameFormat: string,
  qualityList: LX.QualityList,
  listId?: string,
): LX.Download.ListItem[] => {
  return list.map(musicInfo => {
    return createDownloadInfo(musicInfo, quality, fileNameFormat, qualityList, listId)
  }).filter(task => task)
}

const createTask = async(downloadInfo: LX.Download.ListItem, savePath: string, skipExistFile: boolean, proxy?: { host: string, port: number }) => {
  if (!await checkAndCreateDir(savePath)) {
    sendAction(downloadInfo.id, {
      action: 'error',
      data: {
        error: 'download_status_error_check_path',
      },
    })
    return
  }
  if (!tasks.has(downloadInfo.id)) return

  if (downloadInfo.downloaded == 0) {
    if (skipExistFile) {
      const stats = await getFileStats(downloadInfo.metadata.filePath)
      if (stats && stats.size > 100) {
        sendAction(downloadInfo.id, {
          action: 'error',
          data: {
            error: 'download_status_error_check_path_exist',
          },
        })
        return
      }
    } else if (await checkPath(downloadInfo.metadata.filePath)) {
      try {
        await removeFile(downloadInfo.metadata.filePath)
      } catch (err) {
        sendAction(downloadInfo.id, {
          action: 'error',
          data: {
            error: 'download_status_error_check_path',
          },
        })
        return
      }
    }
  }

  const downloadOptions: DownloadOptions = {
    url: downloadInfo.metadata.url ?? '',
    path: savePath,
    fileName: downloadInfo.metadata.fileName,
    method: 'get',
    proxy,
    onCompleted() {
      downloadInfo.isComplate = true
      downloadInfo.status = DOWNLOAD_STATUS.COMPLETED
      sendAction(downloadInfo.id, { action: 'complete' })
    },
    onError(err: any) {
      if (err.code == 'EPERM') {
        sendAction(downloadInfo.id, {
          action: 'error',
          data: {
            error: 'download_status_error_write',
            message: err.message,
          },
        })
        return
      }
      let retryNum = tryNum.get(downloadInfo.id) ?? 0
      tryNum.set(downloadInfo.id, ++retryNum)
      if (retryNum > 2) {
        sendAction(downloadInfo.id, {
          action: 'error',
          data: {
            message: err.message,
          },
        })
        return
      }
      if (err.message?.startsWith('Resume failed')) {
        removeFile(downloadInfo.metadata.filePath).catch(err => {
          console.log('删除不匹配的文件失败：', err.message)
        }).finally(() => {
          void dls.get(downloadInfo.id)?.start()
        })
        return
      }
      if (err.code == 'ENOTFOUND') {
        sendAction(downloadInfo.id, { action: 'refreshUrl' })
      } else {
        setTimeout(() => {
          void dls.get(downloadInfo.id)?.start()
        }, 1000)
      }
    },
    onFail(response) {
      let retryNum = tryNum.get(downloadInfo.id) ?? 0
      tryNum.set(downloadInfo.id, ++retryNum)
      if (retryNum > 2) {
        if (response.statusCode) {
          sendAction(downloadInfo.id, {
            action: 'error',
            data: {
              error: 'download_status_error_response',
              message: String(response.statusCode),
            },
          })
        } else {
          sendAction(downloadInfo.id, {
            action: 'error',
            data: {},
          })
        }
        return
      }
      switch (response.statusCode) {
        case 401:
        case 403:
        case 410:
          sendAction(downloadInfo.id, { action: 'refreshUrl' })
          break
        default:
          void dls.get(downloadInfo.id)?.start()
          break
      }
    },
    onStart() {
      sendAction(downloadInfo.id, { action: 'start' })
    },
    onProgress(status) {
      downloadInfo.total = status.total
      downloadInfo.downloaded = status.downloaded
      downloadInfo.progress = status.progress
      downloadInfo.speed = status.speed
      downloadInfo.writeQueue = status.writeQueue
      sendAction(downloadInfo.id, { action: 'progress', data: status })
    },
    onStop() {
    },
  }

  tryNum.set(downloadInfo.id, 0)
  dls.set(downloadInfo.id, createDownload(downloadOptions))
}

export const updateUrl = (id: string, url: string) => {
  const task = tasks.get(id)
  if (!task) return
  task.metadata.url = url
  const dl = dls.get(id)
  if (!dl) return
  dl.refreshUrl(url)
  dl.start().catch(err => {
    sendAction(id, {
      action: 'error',
      data: {
        message: err.message,
      },
    })
  })
}

export const startTask = async(downloadInfo: LX.Download.ListItem, savePath: string, skipExistFile: boolean, callback: (action: LX.Download.DownloadTaskActions) => void, proxy?: { host: string, port: number }) => {
  await pauseTask(downloadInfo.id)

  tasks.set(downloadInfo.id, downloadInfo)
  taskActions.set(downloadInfo.id, callback)

  let dl = dls.get(downloadInfo.id)
  if (dl) {
    dl.updateSaveInfo(savePath, downloadInfo.metadata.fileName)
    if (tryNum.has(downloadInfo.id)) tryNum.set(downloadInfo.id, 0)
    try {
      await dl.start()
    } catch (error) {
    }
  } else {
    await createTask(downloadInfo, savePath, skipExistFile, proxy)
  }
}

export const pauseTask = async(id: string) => {
  const dl = dls.get(id)
  if (dl) {
    dls.delete(id)
    tasks.delete(id)
    taskActions.delete(id)
    tryNum.delete(id)

    try {
      await dl.stop()
    } catch (e) {
      console.log(e)
    }
  }
}

export const removeTask = async(id: string) => {
  const dl = dls.get(id)
  const downloadInfo = tasks.get(id)
  if (dl) {
    dls.delete(id)
    tasks.delete(id)
    taskActions.delete(id)
    tryNum.delete(id)

    try {
      await dl.stop()
    } catch (e) {
      console.log(e)
    }
  }

  if (downloadInfo) {
    if (!downloadInfo.isComplate && downloadInfo.total && downloadInfo.downloaded > 1024) {
      try {
        await removeFile(downloadInfo.metadata.filePath)
      } catch (_) {}
    }
  }
}
