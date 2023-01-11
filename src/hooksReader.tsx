import { useEffect, useState } from 'react'
import { getDom, getDoms } from './utils'

export function useFlags(selects: string[], close?: boolean) {
  if (close) return []

  const [flags, SETflags] = useState<JSX.Element[]>([])
  const [percent, SETpercent] = useState('0%')

  useEffect(() => {
    const H = getDom('#reader').clientHeight
    const percent =
      ((window.innerHeight * window.innerHeight) / H).toFixed(2) + 'px'

    const x = selects.reduce((all, now) => {
      const nowWrap = `-${now}-`
      getDoms(`#reader .${nowWrap}`)
        .map(e => ((e.offsetTop * 100) / H).toFixed(2) + '%')
        .forEach(top => {
          if (!all[top]) {
            all[top] = nowWrap
          } else if (!all[top].includes(nowWrap)) {
            all[top] += now + '-'
          }
        })
      return all
    }, {} as { [key: string]: string })

    SETflags(
      Object.entries(x).map(([top, select]) => (
        <div className={select} key={top} style={{ top }} />
      ))
    )

    SETpercent(percent)
  }, [selects])

  return [flags, percent] as const
}

export function useHover(close?: boolean) {
  if (close) return [() => {}, ''] as const

  const [hover, SEThover] = useState('')

  return [
    function onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
      if (e.target instanceof HTMLSpanElement) {
        const s = e.target.classList + ''
        s && SEThover(s)
      } else {
        // SEThover('')
      }
    },

    `
    span.${hover}{ background:var(--hover)}
    .flags div[class*='${hover}']{ display:block }
    `,
  ] as const
}
