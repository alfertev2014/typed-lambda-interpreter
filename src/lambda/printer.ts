import { indent, withBraces } from '../generic/print'
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

export const prettyPrint = (term: Term | ResultTerm, depth = 1): string => {
  switch (term.t) {
    case 'Variable':
      return term.name
    case 'Lambda':
      return `\\${term.variable}.${
        term.body.t === 'Application' ? `\n${indent(depth)}` : ''
      }${prettyPrint(term.body, depth + 1)}`
    case 'Application':
      return `${withBraces(
        term.term1.t === 'Lambda',
        prettyPrint(term.term1, depth)
      )} ${withBraces(
        term.term2.t !== 'Variable',
        prettyPrint(term.term2, depth + 1)
      )}`
    case 'Closure': {
      let res = `[`
      for (let env = term.env; env; env = env.next) {
        res += `\n${indent(depth)}${env.variable}->${prettyPrint(
          env.value,
          depth + 1
        )},`
      }
      return res + ']' + prettyPrint(term.lambda, depth)
    }
  }
}
