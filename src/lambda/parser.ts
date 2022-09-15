import { alphaNum, or, Parser, seq, spaces, star, tok } from '../generic/parser'
import { app, Application, Lambda, lmd, Term, Variable, vr } from './ast'

const parseVar: Parser<Variable> = (state) => {
  const parsed = alphaNum(state)
  if ('error' in parsed) {
    return parsed
  }
  return {
    ...parsed,
    res: vr(parsed.res),
  }
}

const parseLambda: Parser<Lambda> = (state) => {
  const parsed = seq(
    tok('\\'),
    spaces,
    alphaNum,
    spaces,
    tok('.'),
    spaces,
    parseApp
  )(state)
  if ('error' in parsed) {
    return parsed
  }
  const [, , variable, , , , body] = parsed.res
  return { ...parsed, res: lmd(variable, body) }
}

const parseApp: Parser<Term> = (state) => {
  const parsed = seq(parseSimpleTerm, star(seq(spaces, parseSimpleTerm)))(state)
  if ('error' in parsed) {
    return parsed
  }
  const [term1, term2] = parsed.res
  let res: Term = term1
  for (const [ , t] of term2) {
    res = app(res, t)
  }
  return { ...parsed, res }
}

const parseBraces: Parser<Term> = (state) => {
  const parsed = seq(tok('('), spaces, parseSimpleTerm, spaces, tok(')'))(state)
  if ('error' in parsed) {
    return parsed
  }
  const [ , , term, , ] = parsed.res
  return { ...parsed, res: term }
}

const parseSimpleTerm: Parser<Term> = (state) =>
  or(parseLambda, parseBraces, parseVar)(state)

export const parse = (s: string) => {
  const parsed = parseApp({ line: 0, position: 0, rest: s})
  if ('error' in parsed) {
    throw new Error(`Parse error at position ${parsed.position}: ${parsed.error}`)
  }
  return parsed.res
}
