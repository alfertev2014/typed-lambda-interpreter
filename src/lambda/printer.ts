import { Term } from './ast'
import { ResultTerm } from './eval'

export const print = (term: Term | ResultTerm): string => {
  switch (term.t) {
    case 'Variable':
      return term.name
    case 'Lambda':
      return `(\\${term.variable}.${print(term.body)})`
    case 'Application':
      return `${print(term.term1)} ${print(term.term2)}`
    case 'Closure': {
      let res = '['
      for (let env = term.env; env; env = env.next) {
        res += `${env.variable}->${print(env.value)},`
      }
      return res + ']' + print(term.lambda)
    }
  }
}

const repeat = (depth: number, char: string) => {
  let res = ''
  for (let i = 0; i < depth; ++i) {
    res += char
  }
  return res
}

const indent = (depth: number) => repeat(depth, ' ')

const prettyPrint = (term: Term | ResultTerm, depth: number): string => {
  switch (term.t) {
    case 'Variable':
      return term.name
    case 'Lambda':
      return `(\\${term.variable}.\n${indent(
        depth + 1
      )}${prettyPrint(term.body, depth + 2)})`
    case 'Application':
      return `${prettyPrint(term.term1, depth)} ${prettyPrint(
        term.term2,
        depth + 1
      )}`
    case 'Closure': {
      let res = `\n${indent(depth)}[`
      for (let env = term.env; env; env = env.next) {
        res += `\n${indent(depth + 1)}${env.variable}->${prettyPrint(
          env.value,
          depth + 2
        )},`
      }
      return res + ']' + prettyPrint(term.lambda, depth)
    }
  }
}

export const pretty = (term: Term | ResultTerm) => prettyPrint(term, 0)