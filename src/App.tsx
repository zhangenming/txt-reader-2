import _txt from '../txt/欧维'
const txt = _txt.replaceAll(/ *\n+ */gi, '\n')

import { getDom, getDoms, getWordPositionAll } from './utils'
import './App.css'
import { useEffect, useState } from 'react'

function gene(selects: string[]) {
  type character = {
    content: string
    spking: boolean
    points: string
    pointType?: 'first' | 'last' | 'justOne'
    key?: number
  }
  type characterArr = character[] & { style?: {} }

  let _spk = false
  // 字符对象
  const txtObj: characterArr = [...txt].map(content => {
    // 依据 spk 标记分割; 能不能通过css/reg搞定？
    let spking = _spk
    if (content === '“') spking = _spk = true
    if (content === '”') _spk = false
    if (content === '\n') _spk = false // 容错

    return { content, spking, points: '-' }
  })

  // 依据 select 标记分割
  selects.forEach(select => {
    getWordPositionAll(txt, select)?.forEach((idx, i, arr) => {
      if (i === 0) {
        txtObj[idx].pointType = 'first'
      }
      if (i === arr.length - select.length) {
        txtObj[idx].pointType = 'last'
      }
      // first === last, hint justOne
      if (0 === arr.length - select.length) {
        txtObj[idx].pointType = 'justOne'
      }

      txtObj[idx].points += select + '-'
    })
  })

  // reduce 依据标记合并
  let key = 0
  const txtRender = txtObj.reduce(
    (all: characterArr[], { content, spking, points, pointType }) => {
      const preT = all.at(-1)!
      const pre = preT.at(-1)

      if (content === '\n') {
        all.push([]) // new block

        // 分割 尝试识别段落
        const blockText = preT.map(e => e.content).join('')
        preT.style = {
          marginTop:
            blockText.includes('第') && blockText.includes('章') ? '5em' : '',
        }

        // 分割 语句
        preT[0].content = preT[0].content.replace(/^/, '    ')
        preT.forEach(block => {
          block.content = block.content.replaceAll(
            /。(?!($| |）|”))/gi,
            '。\n\n    '
          )
        })

        return all
      }

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
          <div style={block.style}>
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
          .join(',\n') + '{ outline:solid!important }'}
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
      del()
    } else {
      add()

      const count = getWordPositionAll(txt, select)!.length / select.length
      console.log(count)

      // justOne
      if (count === 1) {
        setTimeout(del, 1000)
      }

      // justOneScreen
      // 判断所有元素是否在屏幕内
    }
    function del() {
      SETselects(selects.filter(e => e !== select))
    }
    function add() {
      SETselects([...selects, select])
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
    // if (!autoSelect) {
    //   autoSelect = getDom('span[class]:hover')
    // }

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

  autoSelect.style.outline = 'brown solid 5px'
  autoSelect.style.background = '#eae'

  html.scrollTop += autoSelect.offsetTop - offsetTop
}
