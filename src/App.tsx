// import snapshot from '../txt/三毛AOT'
// cache to disk, 快照

const _txt = hasFeature('short')
  ? '你当像鸟飞往你的山 (塔拉．韦斯特弗 (Tara Westover)) (z-lib.org)'
  : '显微镜下的大明 (马伯庸) (z-lib.org)'

const txt: string = (await import(`../txt/${_txt}.txt?raw`)).default
  .replaceAll('\r', '')
  .replaceAll('	', '')
  .replaceAll(/　* * *\n{1,2}　* * *(?!\n)/gi, '\n    ')

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { runWithTime } from './debug'
import { useFlags, useHover } from './hooksReader'
import {
  getDom,
  getDoms,
  getWordPositionAll,
  hasFeature,
  Fragment,
} from './utils'

const mergeFlag = '-'
const s1 = ' '.repeat(1)
const s3 = ' '.repeat(3)
const s4 = ' '.repeat(4)
const sentenceFlag = ['。', '？', '！', '…']
const allFlag = [...sentenceFlag, '）', '\r']

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
    all.push(now)
  }
  return all
}

const strings = txt.split('\n') //.reduce(merge, [])
const fragments: Fragment[] = strings.map(str2frag)
const reader_renders = fragments.map(str2render)

// call on init, 但过后select更改时 此对象会被副作用修改,mutable
function str2frag(str: string) {
  let _spk = false
  // 分割单个block

  str
  // '自你决定去撒哈拉大漠后，我们的心就没有一天安静过，'

  const strs = [...str]
  // ['自', '你', '决', '定', '去', '撒', '哈', '拉', '大', '漠', '后', '，', '我','们', '的', '心', '就', '没', '有', '一', '天', '安', '静', '过', '，']

  // 生成打了标记的对象, 之后select时, 增量修改此对象
  const frag = strs.map((curChar, i, arr) => {
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

  return frag
}

// call on init & select
function str2render(frag: Fragment, key: number, updata: any) {
  // 根据标记合并同类项, 之后select时重新执行
  const fragment = frag.reduce((all, cur, key) => {
    if (key === 0) return [{ ...cur, key }]

    const { char, spking, className } = cur
    const pre = all.at(-1)!

    if (
      pre.spking === spking &&
      pre.className === className &&
      className.length !== 3
    ) {
      pre.char += char // meger
    } else {
      all.push({ ...cur, key }) // new
    }
    return all
  }, [] as Fragment)

  // 生成结果
  const render = fragment.map(({ spking, className, pointType, char, key }) =>
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
  const dom = <div key={key}>{render}</div>
  if (updata === 'updata') reader_renders[key] = dom
  return dom
}

// select更改, 增量修改
function changeSelect(
  SETselects: Dispatch<SetStateAction<string[]>>,
  select: string,
  type: 'add' | 'del'
) {
  SETselects(selects =>
    isAdd ? [...selects, select] : selects.filter(e => e !== select)
  )
  // if (select === '的') return

  const isAdd = type === 'add' || undefined //add-true del-undefined
  const first = strings.findIndex(e => e.includes(select))
  const last = (strings as any).findLastIndex((e: string) => e.includes(select))
  const justOne = getWordPositionAll(txt, select)!.length / select.length === 1

  strings.forEach((Fragment, i) => {
    const r = getWordPositionAll(Fragment, select)
    if (!r?.length) return

    // setFlag
    r.forEach((idx, j) => {
      const target = fragments[i][idx] // 修改paragraphs_obj

      target.className = isAdd
        ? target.className + select + '-'
        : target.className.replace(`-${select}-`, '-')

      if (first === i && j === 0) target.pointType = isAdd && 'first'

      if (last === i && j === r.length - select.length)
        target.pointType = isAdd && 'last'

      if (justOne) target.pointType = isAdd && 'justOne'
    })

    // applyFlag
    str2render(fragments[i], i, 'updata') // need batch when init with multi selects
  })
}

// 分片渲染
export default function App() {
  window.onbeforeunload = () => {
    localStorage.setItem('scrollTop', String(html.scrollTop))

    hasFeature('clear')
      ? localStorage.setItem('selects', JSON.stringify([]))
      : localStorage.setItem('selects', JSON.stringify(selects))
  }
  useEffect(() => {
    html.scrollTop = Number(localStorage.getItem('scrollTop'))

    if (!hasFeature('select')) {
      const selects: string[] = JSON.parse(
        localStorage.getItem('selects') || '[]'
      )
      ;[...new Set([...selects])].forEach(select =>
        changeSelect(SETselects, select, 'add')
      )
    }
  }, [])

  const [selects, SETselects] = useState<string[]>([])

  const [flags, percent] = useFlags(selects, hasFeature('close'))

  const [onMouseMove, hoverStyle] = useHover(hasFeature('close'))

  return (
    <>
      <div
        id="reader"
        onClick={() => runWithTime(selectionHandle)}
        onMouseMove={onMouseMove}
      >
        {reader_renders}
      </div>

      <div className="flags">{flags}</div>

      {/* 延迟? 优先render reader */}
      <style>
        {hoverStyle}
        {/* {`::-webkit-scrollbar-thumb {
            height: ${percent};
            border-top: ${percent} solid red;

        }`} */}
      </style>
    </>
  )

  // add/remove select
  function selectionHandle() {
    const select = String(selection).replaceAll(' ', '')
    selection.removeAllRanges()
    if (!select || select.includes('\n')) return

    if (selects.includes(select)) {
      changeSelect(SETselects, select, 'del')
    } else {
      changeSelect(SETselects, select, 'add')

      const count = getWordPositionAll(txt, select)!.length / select.length
      console.log(count)

      // justOne
      if (count === 1) {
        setTimeout(() => changeSelect(SETselects, select, 'del'), 1000)
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
