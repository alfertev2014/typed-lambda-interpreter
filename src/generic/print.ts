
export const repeat = (depth: number, char: string) => {
  let res = ''
  for (let i = 0; i < depth; ++i) {
    res += char
  }
  return res
}

export const indent = (depth: number) => repeat(depth, ' ')

export const withBraces = (braces: boolean, s: string) => (braces ? `(${s})` : s)
