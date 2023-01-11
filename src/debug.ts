Object.defineProperties(Object.prototype, {
  ll: {
    get() {
      console.log(this)
      return this
    },
  },
  llt: {
    get() {
      console.time()
      return this
    },
  },
  lltt: {
    get() {
      console.timeEnd()
      return this
    },
  },
  llc: {
    get() {
      window.cc = 0
      setTimeout(() => {
        console.log(window.cc)
      })
      return this
    },
  },
  llcc: {
    get() {
      window.cc++
      return this
    },
  },
})

export function runWithTime(fn: Function = () => {}, str?: string) {
  console.time(str)
  const rs = fn()
  console.timeEnd(str)
  return rs
}

const p = performance.now.bind(performance)
export function sleepSync(t: number = 100) {
  const old = p()
  while (old - p() > -t) {
    window.x += 1
  }
}
