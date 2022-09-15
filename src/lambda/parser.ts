import {
  alphaNum,
  or,
  Parser,
  transformParser,
  seq,
  spaces,
  star,
  tok,
} from '../generic/parser'
import { app, Lambda, lmd, Term, Variable, vr } from './ast'

const parseVar: Parser<Variable> = transformParser(alphaNum, (name: string) =>
  vr(name)
)

const parseLambda: Parser<Lambda> = (state) =>
  transformParser(
    seq(tok('\\'), spaces, alphaNum, spaces, tok('.'), spaces, parseApp),
    ([, , variable, , , , body]) => lmd(variable, body)
  )(state)

const parseApp: Parser<Term> = (state) =>
  transformParser(
    seq(parseSimpleTerm, star(seq(spaces, parseSimpleTerm))),
    ([term1, term2]) => {
      let res: Term = term1
      for (const [, t] of term2) {
        res = app(res, t)
      }
      return res
    }
  )(state)

const parseBraces: Parser<Term> = (state) =>
  transformParser(
    seq(tok('('), spaces, parseSimpleTerm, spaces, tok(')')),
    ([, , term, ,]) => term
  )(state)

const parseSimpleTerm: Parser<Term> =
  or(parseLambda, parseBraces, parseVar)

export const parse = (s: string) => {
  const parsed = parseApp({ line: 0, position: 0, rest: s })
  if ('error' in parsed) {
    throw new Error(
      `Parse error at position ${parsed.position}: ${parsed.error}`
    )
  }
  return parsed.res
}
