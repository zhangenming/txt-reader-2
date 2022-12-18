const _txt = '撒哈拉的故事 (三毛) (z-lib.org)'

const txt: string = (await import(`../txt/${_txt}.txt?raw`)).default
  .replaceAll('\r', '')
  .replaceAll(/ * *\n{1,2} * *(?!\n)/gi, '\n')

import { useEffect, useState } from 'react'
import { useFlags, useHover } from './hooksReader'
import { getDom, getDoms, getWordPositionAll, hasFeature, block } from './utils'

const mergeFlag = '-'
const s1 = ' '.repeat(1)
const s3 = ' '.repeat(3)
const s4 = ' '.repeat(4)

const blocks_string = txt.split('\n').map(e => e && s4 + e) //.reduce(merge, [])
const blocks_object = blocks_string.map(txt2obj)
const blocks_render = blocks_object.map(obj2render)
const blocks_jsxdom = blocks_render.map(render2jsx)
// cache jsx to disk? 压缩
// const blocks_jsxdom = blocks_string.map(str => render2jsx(obj2render(txt2obj(str))))

function merge(all: string[], now: string) {
  // 合并多个block
  if (
    now.includes('“') &&
    now.endsWith('”') &&
    all[all.length - 1].endsWith('。')
    // now.length != 0 &&
    // all[all.length - 1]?.length != 0 &&
    // (getWordPositionAll(now, '。')?.length! <= 2 ||
    //   (now.includes('“') && now.endsWith('”')))
  ) {
    all[all.length - 1] = all[all.length - 1] + mergeFlag + now
  } else {
    all.push(s4 + now)
  }
  return all
}
function txt2obj(block_txt: string) {
  const sentenceFlag = ['。', '？', '！', '…']
  const allFlag = [...sentenceFlag, '）', '\r']
  let _spk = false
  let spk_0 = 0
  // 分割单个block
  const block: block = [...block_txt].map((curChar, i, arr) => {
    const pre2Char = arr[i - 2]
    const preChar = arr[i - 1]
    const nextChar = arr[i + 1]
    const next2Char = arr[i + 2]

    if (curChar === '：' && nextChar != '“')
      return { char: curChar, spking: true, className: '-' }

    // 依据 spk 标记分割; 能不能通过css/reg搞定？
    let spking = _spk
    if (curChar === '“') _spk = true
    if (curChar === '”') spking = _spk = false

    // let spking = _spk
    // if (char === '"') spk_0++
    // if (spk_0 % 2 === 1) spking = _spk = true
    // if (spk_0 % 2 === 1) _spk = false

    if (!spking && nextChar) {
      // 句号分割
      if (
        sentenceFlag.includes(curChar) &&
        // 排除……或者?!这种两个标点连在一起的
        !allFlag.includes(nextChar)
      ) {
        if (nextChar === mergeFlag) {
          if (next2Char == '“') {
            curChar = curChar + '\n' + s1
          } else {
            curChar = curChar + '\n\n' + s3
          }
        } else {
          curChar = curChar + '\n\n' + s4
        }
      }

      if ([...sentenceFlag, '—'].includes(preChar) && curChar == '”') {
        curChar = curChar + '\n' + s4
      }

      // if (sentenceFlag.includes(preChar) && curChar === '”')
      //   curChar = curChar + '\n\n    '

      // if (
      //   preChar != '”' &&
      //   preChar != ' ' &&
      //   preChar != '。' &&
      //   curChar === '—' &&
      //   nextChar === '—'
      // )
      //   curChar = '\n    ' + curChar
    }

    // if (sentenceFlag.includes(pre2Char) && preChar == '”')
    //   curChar = '\n\n    ' + curChar

    // if (nextChar == '“' && ['。', '？', '！'].includes(preChar))
    //   curChar += ' \n'

    // if (curChar == '：' && nextChar == '“') curChar += ' \n'

    // if (
    //   curChar == '”' &&
    //   sentenceFlag.includes(preChar) &&
    //   nextChar != '，'
    // )
    //   curChar += ' \n'

    // if (curChar === '。' && nextChar != '）') {
    //   curChar += spking ? ' \n' : ' \n\n'
    // }
    // if (['？', '！'].includes(curChar) && nextChar != '）') {
    //   curChar += spking ? ' ' : ' \n'
    // }

    // if (['，', '；', '）'].includes(curChar) && nextChar != '“')
    //   curChar += spking ? ' ' : ' \n'

    // if (curChar == '…' && preChar == '…' && nextChar != '”') curChar += ' \n'

    return { char: curChar, spking, className: '-' }
  })
  return block
}

function obj2render(obj: block) {
  const x = obj.reduce((all: block, cur, key) => {
    if (key === 0) return [{ ...cur, key }]

    const { char, spking, className } = cur
    const pre = all.at(-1)!

    if (
      pre.spking === spking &&
      pre.className === className &&
      className.length !== 3
    ) {
      pre.char += char
    } else {
      all.push({ ...cur, key })
    }
    return all
  }, [])
  return x
}
function render2jsx(block: block, key: number) {
  const res = block.map(({ spking, className, pointType, char, key }) =>
    spking || className != '-' ? (
      <span
        key={key}
        {...(spking && { 'data-spking': '' })}
        {...(className != '-' && {
          className,
          onClick: e => jumpHandle(e.currentTarget),
          'point-type': pointType,
        })}
      >
        {char.replaceAll('  “', '“')}
      </span>
    ) : (
      char.replaceAll('  “', '“')
    )
  )

  return <div key={key}>{res}</div>
}

// 部分渲染
export default function App() {
  window.onbeforeunload = () => {
    localStorage.setItem('scrollTop', String(html.scrollTop))
    localStorage.setItem('selects', JSON.stringify(selects))
  }
  useEffect(() => {
    html.scrollTop = Number(localStorage.getItem('scrollTop'))

    if (!hasFeature('select')) {
      const selects: string[] = JSON.parse(
        localStorage.getItem('selects') || '[]'
      )
      selects.forEach(select => changeData(select, 'add'))
    }
  }, [])

  const [selects, SETselects] = useState<string[]>([])

  const flags = useFlags(selects, hasFeature('close'))

  const [onMouseMove, hoverStyle] = useHover(hasFeature('close'))

  return (
    <>
      <div id="reader" onClick={selectionHandle} onMouseMove={onMouseMove}>
        {blocks_jsxdom}
      </div>

      <div className="flags">{flags}</div>

      {/* 延迟? 优先render reader */}
      <style>{hoverStyle}</style>
    </>
  )

  // 增量修改arr_block_jsx
  function changeData(select: string, type: 'add' | 'del') {
    // if (select === '的') return

    const isAdd = type === 'add' || undefined //add-true del-undefined
    const first = blocks_string.findIndex(e => e.includes(select))
    const last = (blocks_string as any).findLastIndex((e: string) =>
      e.includes(select)
    )
    const justOne =
      getWordPositionAll(txt, select)!.length / select.length === 1

    blocks_string.forEach((block, i) => {
      const r = getWordPositionAll(block, select)
      if (!r?.length) return

      r.forEach((idx, j) => {
        const target = blocks_object[i][idx] // 修改blocks_obj

        target.className = isAdd
          ? target.className + select + '-'
          : target.className.replace(`-${select}-`, '-')

        if (first === i && j === 0) target.pointType = isAdd && 'first'

        if (last === i && j === r.length - select.length)
          target.pointType = isAdd && 'last'

        if (justOne) target.pointType = isAdd && 'justOne'
      })

      // 应用blocks_obj
      blocks_render[i] = obj2render(blocks_object[i])
      blocks_jsxdom[i] = render2jsx(blocks_render[i], i)
    })

    SETselects(selects =>
      isAdd ? [...selects, select] : selects.filter(e => e !== select)
    )
  }

  // add/remove select
  function selectionHandle() {
    const select = String(selection).replaceAll(' ', '')
    selection.removeAllRanges()
    if (!select || select.includes('\n')) return

    if (selects.includes(select)) {
      changeData(select, 'del')
    } else {
      changeData(select, 'add')

      const count = getWordPositionAll(txt, select)!.length / select.length
      console.log(count)

      // justOne
      if (count === 1) {
        setTimeout(() => changeData(select, 'del'), 1000)
      }

      // justOneScreen
      // 判断所有元素是否在屏幕内
    }
  }
}

let autoSelect: any = {}
function jumpHandle({
  innerText: select,
  offsetTop,
}: {
  innerText: string
  offsetTop: number
}) {
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
    const doms = getDoms(`#reader [class*='${select}']`)

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
const html = getDom('#root')

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
