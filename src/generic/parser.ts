export type ParserState = {
  readonly rest: string
  readonly position: number
  readonly line: number
}

export type ParseSuccessResult<T = unknown> = {
  readonly res: T
  readonly position: number
  readonly state: ParserState
}

export type ParseError = {
  readonly error: string
  readonly position: number
}

export type ParseResult<T = unknown> = ParseSuccessResult<T> | ParseError

export type Parser<T = unknown> = (state: ParserState) => ParseResult<T>

type ExtractParserType<T> = T extends Parser<infer ResultType>
  ? ResultType
  : never

export type ExtractParsersTuple<Tuple extends [...unknown[]]> = {
  [Index in keyof Tuple]: ExtractParserType<Tuple[Index]>
} & { length: Tuple['length'] }

export type ExtractParsersUnion<Tuple extends [...unknown[]]> =
  ExtractParsersTuple<Tuple>[number]

export const tok =
  (s: string | RegExp): Parser<string> =>
  (state) => {
    let token = ''
    if (s instanceof RegExp) {
      const matched = state.rest.match(s)
      if (matched && matched.length > 0) {
        token = matched[0]
      } else {
        return {
          error: `Token /${s.source}/ expected but '${state.rest.substring(
            0,
            20
          )}' found`,
          position: state.position,
        }
      }
    } else if (s === '') {
      token = ''
    } else {
      if (state.rest.startsWith(s)) {
        token = s
      } else {
        return {
          error: `Token '${s}' expected but '${state.rest.substring(
            0,
            20
          )}' found`,
          position: state.position,
        }
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
  <T, Args extends Parser<T>[]>(
    ...args: Args
  ): Parser<ExtractParsersTuple<Args>> =>
  (state) => {
    const start = state.position
    const res: unknown[] = []
    for (const arg of args) {
      const parsed = arg(state)
      if ('error' in parsed) {
        return parsed
      }
      state = parsed.state
      res.push(parsed.res)
    }
    return {
      res: res as ExtractParsersTuple<Args>,
      state,
      position: start,
    }
  }

export const or =
  <T, Args extends Parser<T>[]>(
    ...args: Args
  ): Parser<ExtractParsersUnion<Args>> =>
  (state) => {
    for (const arg of args) {
      const parsed = arg(state)
      if (!('error' in parsed)) {
        return parsed as ReturnType<Parser<ExtractParsersUnion<Args>>>
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
  (state) =>
    or(arg, tok(''))(state)

export const spaces: Parser<string> = tok(/^\s*/)

export const alphaNum: Parser<string> = tok(/^[a-zA-Z][a-zA-Z0-9]*/)
