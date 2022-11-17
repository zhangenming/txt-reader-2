import _txt from '../txt/欧维'
const txt = _txt
  .replaceAll('　　', '')
  .replaceAll('。', '。   ')
  .replaceAll('。   ”', '。”')
// .replaceAll('。', '。\n')
import { getDoms, getWordPositionAll } from './utils'
import './App.css'
import { useEffect, useState } from 'react'

function gene(selects: string[]) {
  type T = {
    content: string
    spking: boolean
    points: string
    pointType?: 'first' | 'last' | 'justOne'
    key?: number
  }[]

  let _spk = false
  // init with spk
  const txtObj: T = [...txt].map(content => {
    // 能不能通过css搞定？
    let spking = _spk
    if (content === '“') spking = _spk = true
    if (content === '”') _spk = false

    return { content, spking, points: '-' }
  })

  // 应用 select 分割独立标记
  selects.forEach(select => {
    getWordPositionAll(txt, select)?.forEach((idx, i, arr) => {
      if (i === 0) {
        txtObj[idx].pointType = 'first'
      }
      if (i === arr.length - select.length) {
        txtObj[idx].pointType = 'last'
      }
      if (0 === arr.length - select.length) {
        txtObj[idx].pointType = 'justOne'
      }

      txtObj[idx].points += select + '-'
    })
  })

  // reduce 依据标记合并
  let key = 0
  const txtRender = txtObj.reduce(
    (all: T[], { content, spking, points, pointType }) => {
      if (content === '\n') {
        all.push([]) // new block
        return all
      }

      const preT = all.at(-1)!
      const pre = preT.at(-1)
      if (
        pre && // ?
        pre.spking === spking &&
        String(pre.points) === String(points) // 需不需要sort一下?
      ) {
        pre.content += content
      } else {
        preT.push({
          content,
          spking,
          points,
          pointType,
          key,
        })
      }

      key += content.length

      return all
    },
    [[]]
  )

  // txtRender.ll

  return txtRender
}

// 部分渲染
export default function App() {
  const [selects, SETselects] = useState<string[]>(
    JSON.parse(String(localStorage.getItem('selects'))) || []
  )
  console.time()
  const txtRender = gene(selects)
  console.timeEnd()

  console.time()
  const render = (
    <>
      <div id="reader" onClick={selectionHandle}>
        {txtRender.map(block => (
          <div>
            {block.map(({ key, spking, points, pointType, content }) =>
              spking || points != '-' ? (
                <span
                  key={key}
                  {...(spking && { 'data-spking': '' })}
                  {...(points != '-' && {
                    className: points,
                    onClick: e => jumpHandle(e.currentTarget),
                    'point-type': pointType,
                  })}
                >
                  {content}
                </span>
              ) : (
                content
              )
            )}
          </div>
        ))}
      </div>

      {/* 延迟? 优先render reader */}
      {/* 集合/独立 是否有区别 */}
      <style>
        {selects
          .map(
            select =>
              `#reader:has([class*="-${select}-"]:hover) [class*="-${select}-"]`
          )
          .join(',\n') + '{ outline:solid }'}
      </style>
    </>
  )
  console.timeEnd()

  window.onbeforeunload = () => {
    localStorage.setItem('scrollTop', String(html.scrollTop))
    localStorage.setItem('selects', JSON.stringify(selects))
  }

  useEffect(() => {
    html.scrollTop = Number(localStorage.getItem('scrollTop'))
  }, [])

  // add/remove select
  function selectionHandle() {
    const select = String(selection)
    selection.removeAllRanges()
    if (!select || select.includes('\n')) return

    if (selects.includes(select)) {
      SETselects(selects.filter(e => e !== select))
    } else {
      SETselects([...selects, select])

      const count = getWordPositionAll(txt, select)!.length / select.length
      console.log(count)

      // justOne
      if (count === 1) {
        setTimeout(() => {
          SETselects(selects.filter(e => e !== select))
        }, 1000)
      }

      // justOneScreen
      // 判断所有元素是否在屏幕内
    }
  }

  return render
}

const selection = getSelection()!
const html = document.documentElement

const keysHold: { [key: string]: boolean } = {}
document.addEventListener('keyup', ({ key }) => {
  keysHold[key] = false
})
document.addEventListener('keydown', e => {
  keysHold[e.key] = true

  if (e.key === 'Alt') {
    e.preventDefault()
    jumpHandle()
  }
})

let autoSelect: any = { style: {} }
function jumpHandle({ innerText: select, offsetTop } = autoSelect) {
  if (String(selection)) return

  // active select
  const preSelect = autoSelect.innerText
  if (preSelect != select) {
    getDoms(`[class*='${select}'],[class*='${preSelect}']`).forEach(e =>
      e.classList.toggle('activeSelect')
    )
  }

  // active word
  autoSelect.style.background = ''
  autoSelect.style.outline = ''

  autoSelect = (() => {
    const { Control /* 到底 */, Shift /* 反向 */ } = keysHold
    const doms = getDoms(`[class*='${select}']`)

    if (Control && Shift) return doms[0]

    if (Control) return doms.at(-1)

    if (Shift)
      return (
        (doms as any).findLast((e: any) => e.offsetTop < offsetTop) ||
        doms.at(-1) // pre
      )

    return doms.find(e => e.offsetTop > offsetTop) || doms[0] // next
  })()

  autoSelect.style.outline = 'solid brown'
  autoSelect.style.background = '#eae'

  html.scrollTop += autoSelect.offsetTop - offsetTop
}
