export type ParseState = {
  readonly rest: string
  readonly position: number
  readonly line: number
}

export type ParseSuccessResult<T = unknown> = {
  readonly res: T
  readonly position: number
  readonly state: ParseState
}

export type ParseError = {
  readonly error: string
  readonly position: number
}

export type ParseResult<T = unknown> = ParseSuccessResult<T> | ParseError

export type Parser<T = unknown> = (state: ParseState) => ParseResult<T>

export const tok =
  (s: string | RegExp): Parser<string> =>
  (state) => {
    let token = ''
    if (s instanceof RegExp) {
      const matched = state.rest.match(s)
      if (matched && matched.length > 0) {
        token = matched[0]
      } else {
        throw new Error(`Token /${s.source}/ expected`)
      }
    } else if (s === '') {
      token = ''
    } else {
      if (state.rest.startsWith(s)) {
        token = s
      } else {
        throw new Error(`Token '${s}' expected`)
      }
    }
    return {
      res: token,
      position: state.position,
      state: {
        ...state,
        position: state.position + token.length,
        rest: state.rest.substring(token.length),
      },
    }
  }

export const seq =
  <T>(...args: Parser<T>[]): Parser<T[]> =>
  (state) => {
    const start = state.position
    const res: T[] = []
    for (const arg of args) {
      const parsed = arg(state)
      if ('error' in parsed) {
        return parsed
      }
      state = parsed.state
      res.push(parsed.res)
    }
    return {
      res,
      state,
      position: start,
    }
  }

export const or =
  <T>(...args: Parser<T>[]): Parser<T> =>
  (state) => {
    for (const arg of args) {
      const parsed = arg(state)
      if (!('error' in parsed)) {
        return parsed
      }
    }
    return {
      position: state.position,
      error: 'No one of alternatives can be applied',
    }
  }

export const star =
  <T>(parser: Parser<T>): Parser<T[]> =>
  (state) => {
    const start = state.position
    const res: T[] = []
    for (;;) {
      const parsed = parser(state)
      if ('error' in parsed) {
        break
      }
      state = parsed.state
      res.push(parsed.res)
    }
    return {
      res,
      position: start,
      state,
    }
  }

export const opt =
  <T>(arg: Parser<T>): Parser<T | string> =>
  (state) => {
    return or<T | string>(arg, tok(''))(state)
  }
