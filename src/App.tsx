import _txt from '../txt/诡秘之主'

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
  key?: number | string
}[]

const txt = _txt.replaceAll(/( *\n+ *)+/gi, '\n').slice(0, 1e6) // 7

const blocks_str = txt.split('\n')
const blocks_obj = blocks_str.map(txt2obj)

_selects.forEach(select => changeData(select, 'add', false))
//cache to disk? 压缩

const blocks_render = blocks_obj.map(obj2render)
const blocks_jsx = blocks_render.map(render2jsx)
// const blocks_jsx = blocks_str.map(str => render2jsx(obj2render(txt2obj(str))))

function txt2obj(block_txt: string) {
  let _spk = false
  let spk_0 = 0
  const block: block = [...block_txt].map((curChar, i, arr) => {
    // 依据 spk 标记分割; 能不能通过css/reg搞定？
    let spking = _spk
    if (curChar === '“') spking = _spk = true
    if (curChar === '”') _spk = false

    // let spking = _spk
    // if (char === '"') spk_0++
    // if (spk_0 % 2 === 1) spking = _spk = true
    // if (spk_0 % 2 === 1) _spk = false
    const preChar = arr[i - 1]
    const nextChar = arr[i + 1]

    if (nextChar == '“' && ['。', '？', '！'].includes(preChar))
      curChar += ' \n'

    if (curChar == '：' && nextChar == '“') curChar += ' \n'

    if (
      curChar == '”' &&
      ['。', '？', '！', '…'].includes(preChar) &&
      nextChar != '，'
    )
      curChar += ' \n'

    if (curChar === '。' && nextChar != '）') {
      curChar += spking ? ' \n' : ' \n\n'
    }
    if (['？', '！'].includes(curChar) && nextChar != '）') {
      curChar += spking ? ' ' : ' \n'
    }

    if (['，', '；', '）'].includes(curChar) && nextChar != '“')
      curChar += spking ? ' ' : ' \n'

    if (curChar == '…' && preChar == '…' && nextChar != '”') curChar += ' \n'

    return { char: curChar, spking, points: '-' }
  })
  return block
}

function obj2render(obj: block) {
  const x = obj.reduce((all: block, cur, key) => {
    if (key === 0) return [{ ...cur, key }]

    const { char, spking, points } = cur
    const pre = all.at(-1)!

    if (pre.spking === spking && pre.points === points && points.length !== 3) {
      pre.char += char
    } else {
      all.push({ ...cur, key })
    }
    return all
  }, [])
  // x.forEach((e, i) => {
  //   e.key += e.char
  // })
  return x
}
function render2jsx(block: block, key: number) {
  return (
    <div style={block.style} key={key}>
      {block.map(({ spking, points, pointType, char, key }) =>
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
function changeData(
  select: string,
  type: 'add' | 'del',
  render: boolean = true
) {
  // if (select === '的') return

  const isAdd = type === 'add' || undefined //add-true del-undefined
  const first = blocks_str.findIndex(e => e.includes(select))
  const last = (blocks_str as any).findLastIndex((e: string) =>
    e.includes(select)
  )
  const justOne = getWordPositionAll(txt, select)!.length / select.length === 1

  blocks_str.forEach((block, i) => {
    const r = getWordPositionAll(block, select)
    if (!r?.length) return

    r.forEach((idx, j) => {
      const target = blocks_obj[i][idx]

      target.points = isAdd
        ? target.points + select + '-'
        : target.points.replace(`-${select}-`, '-')

      if (first === i && j === 0) target.pointType = isAdd && 'first'

      if (last === i && j === r.length - select.length)
        target.pointType = isAdd && 'last'

      if (justOne) target.pointType = isAdd && 'justOne'
    })

    if (render) {
      blocks_render[i] = obj2render(blocks_obj[i])
      blocks_jsx[i] = render2jsx(blocks_render[i], i)
    }
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

  return (
    <>
      <div id="reader" onClick={() => selectionHandle(selects, SETselects)}>
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
          .join(',\n') + '{ background:var(--hover) }'}
      </style>
    </>
  )
}

// add/remove select
function selectionHandle(
  selects: string[],
  SETselects: React.Dispatch<React.SetStateAction<string[]>>
) {
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

let autoSelect: any = {}
function jumpHandle({ innerText: select, offsetTop }: any) {
  if (String(selection)) return

  // active select
  const preSelect = autoSelect.innerText
  if (preSelect != select) {
    getDoms(`[class*='${select}'],[class*='${preSelect}']`).forEach(e =>
      e.classList.toggle('activeSelect')
    )
  }

  // active word
  autoSelect.classList?.remove('activeSelectNow')

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

  autoSelect.classList.add('activeSelectNow')

  html.scrollTop += autoSelect.offsetTop - offsetTop
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
    jumpHandle(autoSelect)
  }
})
