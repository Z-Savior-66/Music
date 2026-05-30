const xm = {
  comment: {
    getComment() {
      return Promise.reject(new Error('fail'))
    },
    getHotComment() {
      return Promise.reject(new Error('fail'))
    },
  },
  getMusicUrl(songInfo, type) {
    return {
      promise: Promise.reject(new Error('fail')),
    }
  },
  getLyric(songInfo) {
    return {
      promise: Promise.reject(new Error('fail')),
    }
  },
  getPic(songInfo) {
    return Promise.reject(new Error('fail'))
  },
}

export default xm
