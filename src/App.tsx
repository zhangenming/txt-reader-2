import txt from '../txt/欧维'
import { getWordPositionAll } from './utils'
import './App.css'

type T = {
  word: string
  isSpk: boolean
  selects: string
}[]
const txtObj: T = [...txt].map(word => ({ word, isSpk: false, selects: '' }))

// spk
let spk1 = false
txtObj.forEach(t => {
  let spk2 = spk1
  if (t.word === '“') spk2 = spk1 = true
  if (t.word === '”') spk1 = false
  if (spk2) {
    t.isSpk = true //Modify
  }
})

// select
const selects = ['编辑', '我们', '是']
selects.forEach(select => {
  const idxs = getWordPositionAll(txt, select)
  idxs?.forEach(idx => {
    txtObj[idx].selects += select + ' ' //Modify
  })
})

// reduce合并
const txtRes = txtObj.reduce(
  (all, now) => {
    const pre = all.at(-1)!
    if (
      // 需不需要sort一下?
      String(pre.selects) === String(now.selects) &&
      pre.isSpk === now.isSpk
    ) {
      pre.word += now.word
    } else {
      all.push(now)
    }

    return all
  },
  [{ word: '', isSpk: false, selects: '' }]
)

export default function App() {
  return (
    <div id="reader">
      {txtRes.map(t =>
        t.isSpk || t.selects ? (
          <span
            // {...{
            //   ...(t.isSpk && { 'data-isSpk': '' }),
            //   ...(t.selects && { className: t.selects }),
            // }}
            {...(t.isSpk && { 'data-isSpk': '' })}
            {...(t.selects && { className: t.selects })}
          >
            {t.word}
          </span>
        ) : (
          t.word
        )
      )}
    </div>
  )
}
