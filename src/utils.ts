export function getDom(selector: string) {
  return document.querySelector<HTMLElement>(selector)!
}
export function getDoms(selector: string, n?: number) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector))!.slice(
    0,
    n
  )
}

export function getWordPositionAll(str: string = '', word: string) {
  if (word === '') return undefined

  const t = Array(word.length)
    .fill(0)
    .map((_, i) => i)

  const positions = []
  let pos = str.indexOf(word)
  while (pos !== -1) {
    positions.push(...t.map(e => e + pos))
    pos = str.indexOf(word, pos + word.length)
  }

  return positions
}

const features = [...new URLSearchParams(location.search).keys()]

export const hasFeature = (f: string) => features.includes(f)
// console.time()
// ;[...txt]
//   .reduce((all, now, i, arr) => {
//     const nowWrap = arr[i + 0] + arr[i + 1]

//     if (['，', '。', '\n', '“', '”', '？', ' '].some(e => nowWrap.includes(e)))
//       return all

//     const o = all.find(e => e.word === nowWrap)
//     if (o) o.count++
//     else all.push({ word: nowWrap, count: 1 })

//     return all
//   }, [] as { word: string; count: number }[])
//   .sort((q, w) => w.count - q.count).ll

// console.timeEnd()

// console.time()
// const o = [...txt].reduce((all, now, i, arr) => {
//   const nowWrap = arr[i + 0] + arr[i + 1]

//   if (['，', '。', '\n', '“', '”', '？', ' '].some(e => nowWrap.includes(e)))
//     return all

//   if (!all[nowWrap]) all[nowWrap] = 1
//   else all[nowWrap]++

//   return all
// }, {} as { [k: string]: number })

// Object.entries(o).sort((q, w) => w[1] - q[1]).ll

// console.timeEnd()

export type Fragment = {
  char: string
  spking: boolean
  className: string
  pointType?: 'first' | 'last' | 'justOne'
  key?: number | string
}[]
