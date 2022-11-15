import _txt from '../txt/欧维'
const txt = _txt.replaceAll('\n', '\n\n')
import { getDom, getDoms, getWordPositionAll } from './utils'
import './App.css'
import { useEffect, useState } from 'react'

const selection = getSelection()!

function gene(selects: string[]) {
  type T = {
    content: string
    isSpk: boolean
    selects: string
    type?: 'first' | 'last' | 'justOne'
    key?: number
  }[]

  let _spk = false
  const txtObj: T = [...txt].map(content => {
    // 能不能通过css搞定？
    let isSpk = _spk
    if (content === '“') isSpk = _spk = true
    if (content === '”') _spk = false

    return { content, isSpk, selects: '-' }
  })

  // select
  selects.forEach(select => {
    const idxs = getWordPositionAll(txt, select)
    idxs?.forEach((idx, i, arr) => {
      const word = txtObj[idx]

      if (i === 0) {
        word.type = 'first'
      }
      if (i === arr.length - select.length) {
        word.type = 'last'
      }
      if (i === 0 && i === arr.length - select.length) {
        word.type = 'justOne'
      }

      word.selects += select + '-'
    })
  })

  // reduce合并
  let key = 0
  const txtRender = txtObj.reduce(
    (all, { content, isSpk, selects, type }) => {
      key += content.length

      const pre = all.at(-1)!
      if (
        String(pre.selects) === String(selects) && // 需不需要sort一下?
        pre.isSpk === isSpk
      ) {
        pre.content += content
      } else {
        all.push({ content, isSpk, selects, type, key })
      }

      return all
    },
    [{ content: '', isSpk: false, selects: '', key }] as T
  )

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
    localStorage.setItem('scroll', String(document.documentElement.scrollTop))
    localStorage.setItem('selects', JSON.stringify(selects))
  }

  useEffect(() => {
    document.documentElement.scrollTop = Number(localStorage.getItem('scroll'))
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
    currentTarget,
  }: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    if (String(selection)) return

    const { innerText, offsetTop } = currentTarget
    const { Control /* 反向 */, Shift, Alt /* 到底 */ } = keysHold

    const doms = getDoms(`[class*='${innerText}']`)
    const targetDom = (() => {
      if (Control && (Shift || Alt)) return doms[0]
      if (Shift || Alt) return doms.at(-1)
      if (Control)
        return doms.findLast(e => e.offsetTop < offsetTop) || doms.at(-1) // pre
      return doms.find(e => e.offsetTop > offsetTop) || doms[0] // next
    })()

    document.documentElement.scrollTop += targetDom!.offsetTop - offsetTop
  }

  return (
    <>
      <div id="reader" onClick={selectionHandle}>
        {txtRender.map(({ isSpk, selects, content, key, type }) => (
          <span
            key={key}
            {...(isSpk && { 'data-spking': '' })}
            {...(type && { type })}
            {...(selects != '-' && {
              className: selects,
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
