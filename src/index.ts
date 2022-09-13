import { app, Application, Lambda, lmd, Term, Variable, vr } from './lambda'
import { or, Parser, seq, tok } from './parser'

const spaces: Parser<string> = tok(/\s*/)

const alphaNum: Parser<string> = tok(/[a-zA-Z][a-zA-Z0-9]*/)

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
    parseTerm
  )(state)
  if ('error' in parsed) {
    return parsed
  }
  const [, , variable, , , , body] = parsed.res
  return { ...parsed, res: lmd(variable, body) }
}

const parseApp: Parser<Application> = (state) => {
  const parsed = seq(parseTerm, spaces, parseTerm)(state)
  if ('error' in parsed) {
    return parsed
  }
  const [term1, , term2] = parsed.res
  return { ...parsed, res: app(term1, term2) }
}

const parseTerm: Parser<Term> = (state) => {
  const parsed = or(parseVar, parseLambda, parseApp)(state)
  if ('error' in parsed) {
    return parsed
  }
  return parsed
}

const term = app(lmd('x', vr('x')), vr('y'))
