export function getDom(selector: string) {
  return document.querySelector<HTMLElement>(selector)!
}
export function getDoms(selector: string, n?: number) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector))!.slice(
    0,
    n
  )
}

export function getWordPositionAll(str: string, word: string) {
  if (word === '') return undefined

  const positions = []
  let pos = str.indexOf(word)
  while (pos !== -1) {
    positions.push(pos)
    pos = str.indexOf(word, pos + word.length)
  }

  return positions.flatMap(e =>
    Array(word.length)
      .fill(0)
      .map((_, i) => e + i)
  )
}
