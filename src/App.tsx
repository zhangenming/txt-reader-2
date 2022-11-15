import _txt from '../txt/欧维'
const txt = _txt.replaceAll('\n', '\n\n')
import { getDoms, getWordPositionAll } from './utils'
import './App.css'
import { useEffect, useState } from 'react'

const selection = getSelection()!

function gene(selects: string[]) {
  type T = {
    content: string
    isSpk: boolean
    points: string
    pointType?: 'first' | 'last' | 'justOne'
    key?: number
  }[]

  let _spk = false
  const txtObj: T = [...txt].map(content => {
    // 能不能通过css搞定？
    let isSpk = _spk
    if (content === '“') isSpk = _spk = true
    if (content === '”') _spk = false

    return { content, isSpk, points: '-' }
  })

  // select
  selects.forEach(select => {
    getWordPositionAll(txt, select)?.forEach((idx, i, arr) => {
      const word = txtObj[idx]

      if (i === 0) {
        word.pointType = 'first'
      }
      if (i === arr.length - select.length) {
        word.pointType = 'last'
      }
      if (0 === arr.length - select.length) {
        word.pointType = 'justOne'
      }

      word.points += select + '-'
    })
  })

  // reduce合并
  let key = 0
  const txtRender = txtObj.reduce(
    (all: T, { content, isSpk, points, pointType }) => {
      const pre = all.at(-1)
      if (
        pre &&
        pre.isSpk === isSpk &&
        String(pre.points) === String(points) // 需不需要sort一下?
      ) {
        pre.content += content
      } else {
        all.push({ content, isSpk, points, pointType, key })
      }

      key += content.length

      return all
    },
    []
  )

  // txtRender.ll

  return txtRender
}

const keysHold: { [key: string]: boolean } = {}
document.addEventListener('keydown', ({ key }) => {
  keysHold[key] = true
})
document.addEventListener('keyup', e => {
  keysHold[e.key] = false
})

export default function App() {
  window.onbeforeunload = () => {
    localStorage.setItem(
      'scrollTop',
      String(document.documentElement.scrollTop)
    )
    localStorage.setItem('selects', JSON.stringify(selects))
  }

  useEffect(() => {
    document.documentElement.scrollTop = Number(
      localStorage.getItem('scrollTop')
    )
  }, [])

  const [selects, SETselects] = useState<string[]>(
    JSON.parse(String(localStorage.getItem('selects'))) || []
  )

  const txtRender = gene(selects)

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

  function jumpHandle({
    currentTarget: { innerText, offsetTop },
  }: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    if (String(selection)) return

    const targetDom = (() => {
      const { Control /* 反向 */, Shift, Alt /* 到底 */ } = keysHold
      const doms = getDoms(`[class*='${innerText}']`)

      if (Control && (Shift || Alt)) return doms[0]
      if (Shift || Alt) return doms.at(-1)
      if (Control)
        return (
          (doms as any).findLast((e: any) => e.offsetTop < offsetTop) ||
          doms.at(-1)
        ) // pre
      return doms.find(e => e.offsetTop > offsetTop) || doms[0] // next
    })()

    document.documentElement.scrollTop += targetDom.offsetTop - offsetTop
  }

  return (
    <>
      <div id="reader" onClick={selectionHandle}>
        {txtRender.map(({ isSpk, points, content, key, pointType }) => (
          <span
            key={key}
            {...(isSpk && { 'data-spking': '' })}
            {...(points != '-' && {
              'point-type': pointType,
              className: points,
              onClick: jumpHandle,
            })}
          >
            {content}
          </span>
        ))}
      </div>

      {/* 延迟? 优先render reader */}
      <style>
        {selects
          .map(
            select =>
              `#reader:has([class*="-${select}-"]:hover) [class*="-${select}-"]`
          )
          .join(',\n') + '{ background: #516041 }'}
      </style>
    </>
  )
}
