import txt from '../txt/欧维'
import { getDom, getDoms, getWordPositionAll } from './utils'
import './App.css'
import { useEffect, useState } from 'react'

const selection = getSelection()!

function gene(selects: string[]) {
  type T = {
    word: string
    isSpk: boolean
    selects: string
  }[]

  let _spk = false
  const txtObj: T = [...txt].map(word => {
    // 能不能通过css搞定？
    let isSpk = _spk
    if (word === '“') isSpk = _spk = true
    if (word === '”') _spk = false

    return { word, isSpk, selects: '-' }
  })

  // select
  selects.forEach(select => {
    const idxs = getWordPositionAll(txt, select)
    idxs?.forEach(idx => {
      txtObj[idx].selects += select + '-' //Modify
    })
  })

  // reduce合并
  let key = 0
  const txtRes = txtObj.reduce(
    (all, { word, isSpk, selects }) => {
      key += word.length
      const pre = all.at(-1)!
      if (
        // 需不需要sort一下?
        String(pre.selects) === String(selects) &&
        pre.isSpk === isSpk
      ) {
        pre.word += word
      } else {
        all.push({ word, isSpk, selects, key })
      }

      return all
    },
    [{ word: '', isSpk: false, selects: '', key }]
  )

  return txtRes
}

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

  const txtRes = gene(selects)

  // add/remove select
  function selectionHandle() {
    const select = String(selection)
    if (!select) return
    selection.removeAllRanges()

    if (selects.includes(select)) {
      SETselects(selects.filter(e => e !== select))
    } else {
      SETselects([...selects, select])

      const count = getWordPositionAll(txt, select)!.length / select.length
      console.log(count)

      // // justOne
      // if (count === 1) {
      //   setTimeout(() => {
      //     selects.splice(selects.indexOf(select), 1)
      //   }, 1000)
      // }

      // justOneScreen
      // 判断所有元素是否在屏幕内
    }
  }

  function jumpHandle({ target }) {
    if (String(selection)) return

    const { innerHTML, offsetTop } = target

    document.documentElement.scrollTop +=
      getDoms(`[class*='${innerHTML}']`).find(e => e.offsetTop > offsetTop)!
        .offsetTop - offsetTop
  }

  return (
    <>
      <div id="reader" onClick={selectionHandle}>
        {txtRes.map(({ isSpk, selects, word, key }) => (
          <span
            key={key}
            {...(isSpk && { 'data-spking': '' })}
            {...(selects != '-' && { className: selects, onClick: jumpHandle })}
          >
            {word}
          </span>
        ))}
      </div>
      <style>
        {selects
          .map(
            word =>
              `#reader:has([class*="-${word}-"]:hover) [class*="-${word}-"]`
          )
          .join(',\n') + '{ background: #516041 }'}
      </style>
    </>
  )
}
