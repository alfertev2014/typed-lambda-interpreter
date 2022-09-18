import {
  alphaNum,
  or,
  Parser,
  transformParser,
  seq,
  spaces,
  star,
  tok,
  eof,
} from '../generic/parser'
import { repeat } from '../generic/print'
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
    seq(tok('('), spaces, parseApp, spaces, tok(')')),
    ([, , term, ,]) => term
  )(state)

const parseSimpleTerm: Parser<Term> =
  or(parseLambda, parseBraces, parseVar)

const parseRoot: Parser<Term> = transformParser(
  seq(spaces, parseApp, spaces, eof),
  ([ , term, , ]) => term
)

const printLinePosition = (s:string, position: number): string => {
  let line = 0
  let lineStart = 0
  let lineEnd = 0
  for (;;) {
    const nextLine = s.indexOf('\n', lineStart)
    if (nextLine < 0) {
      lineEnd = s.length
      break
    }
    if (nextLine > position) {
      lineEnd = nextLine
      break
    }
    lineStart = nextLine + 1
    line++
  }
  const column = position - lineStart
  return `    at line ${line} (column ${column}):\n${s.substring(lineStart, lineEnd)}\n${
    repeat(column, ' ')
  }^`
}

export const parse = (s: string) => {
  const parsed = parseRoot({ position: 0, rest: s })
  if ('error' in parsed) {
    const message = parsed.error === 'or' ? 'Unexpected syntax' : 'Unexpected token'
    throw new Error(
      `Parse error: ${message}\n${printLinePosition(s, parsed.position)}`
    )
  }
  return parsed.res
}
