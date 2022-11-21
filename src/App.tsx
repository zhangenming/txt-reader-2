import _txt from '../txt/欧维'
import { getDom, getDoms, getWordPositionAll } from './utils'
import './App.css'
import { useEffect, useState } from 'react'

const _selects: string[] =
  JSON.parse(String(localStorage.getItem('selects'))) || []

type block = {
  char: string
  spking: boolean
  points: string
  pointType?: 'first' | 'last' | 'justOne'
  key?: number
}[]

const txt = _txt.replaceAll(/( *\n+ *)+/gi, '\n').slice(0, 1e6) // 7

const blocks_str = txt
  .split('\n')
  .map(block => '    ' + block.replaceAll(/。(?!($| |）|”))/gi, '。\n\n    '))

console.time()
const blocks_obj = blocks_str.map(txt2obj)
const blocks_render = blocks_obj.map(obj2render)
const blocks_jsx = blocks_render.map(render2jsx)

// const blocks_jsx = blocks_str.map(str => render2jsx(obj2render(txt2obj(str))))
console.timeEnd()

function txt2obj(block_txt: string) {
  let _spk = false
  const blockObj: block = [...block_txt].map(char => {
    // 依据 spk 标记分割; 能不能通过css/reg搞定？
    let spking = _spk
    if (char === '“') spking = _spk = true
    if (char === '”') _spk = false

    return { char, spking, points: '-' }
  })

  _selects.forEach(select => {
    getWordPositionAll(block_txt, select)?.forEach(idx => {
      blockObj[idx].points += select + '-'
    })
  })

  return blockObj
}
function obj2render(obj: block) {
  return obj.reduce((all: block, { char, spking, points }, key) => {
    if (key === 0) return [{ char, spking, points }]

    const pre = all.at(-1)!
    if (pre.spking === spking && pre.points === points) {
      pre.char += char
    } else {
      all.push({ char, spking, points })
    }
    return all
  }, [])
}
function render2jsx(block: block) {
  return (
    <div style={block.style}>
      {block.map(({ key, spking, points, pointType, char }) =>
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
            {char}
          </span>
        ) : (
          char
        )
      )}
    </div>
  )
}

// 增量修改arr_block_jsx
function changeData(select: string, type: 'add' | 'del') {
  // if (select === '的') return

  blocks_str.forEach((block, i) => {
    const r = getWordPositionAll(block, select)
    if (!r?.length) return

    r.forEach(idx => {
      const target = blocks_obj[i][idx]
      if (type === 'add') {
        target.points += select + '-'
      } else {
        target.points = target.points.replace(`-${select}-`, '-')
      }
    })
    // console.log(33, r)

    // console.time()
    blocks_render[i] = obj2render(blocks_obj[i])
    blocks_jsx[i] = render2jsx(blocks_render[i])
    // console.timeEnd()
  })
}
// 部分渲染
export default function App() {
  window.onbeforeunload = () => {
    localStorage.setItem('scrollTop', String(html.scrollTop))
    localStorage.setItem('selects', JSON.stringify(selects))
  }
  useEffect(() => {
    html.scrollTop = Number(localStorage.getItem('scrollTop'))
  }, [])

  const [selects, SETselects] = useState(_selects)

  // 1 && return 1
  return (
    <>
      <div id="reader" onClick={selectionHandle}>
        {blocks_jsx}
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
      changeData(select, 'del')
      SETselects(selects.filter(e => e !== select))
    }
    function add() {
      changeData(select, 'add')
      SETselects([...selects, select])
    }
  }
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
