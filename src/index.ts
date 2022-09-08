import { checkTag, matchTagged, tagged, Tagged, __tag } from './tagged'

const variable = (name: string) => tagged('Variable', { name })
const lambda = (variable: string, body: Term) =>
  tagged('Lambda', { variable, body })
const application = (term1: Term, term2: Term) =>
  tagged('Application', { term1, term2 })

type Variable = Tagged<'Variable', { name: string }>
type Lambda = Tagged<'Lambda', { variable: string; body: Term }>
type Application = Tagged<'Application', { term1: Term; term2: Term }>

export type Term = Variable | Lambda | Application

type Environment = {
  variable: string
  value: ResultTerm
  next: Environment
} | null


const mkenv = (variable: string, value: ResultTerm, next: Environment) => ({
  value,
  variable,
  next,
})

type Closure = Tagged<'Closure', { lambda: Lambda; env: Environment }>
const closure = (lambda: Lambda, env: Environment) => tagged('Closure', { lambda, env })

type ResultTerm = Variable | Closure

const evaluate = (term: Term, env: Environment): ResultTerm => {
  switch (term[__tag]) {
    case 'Application':
      return apply(term.term1, term.term2, env)
    case 'Lambda':
      return closure(term, env)
    default:
      return term
  }
}

const apply = (m: Term, n: Term, env: Environment): ResultTerm => {
  if (!checkTag(m, 'Lambda')) {
    throw new Error('Apply of nonapplyable!')
  }
  const newEnv: Environment = mkenv(m.variable, evaluate(n, env), env)
  return evaluate(m, newEnv)
}


const term = application(lambda('x', variable('x')), variable('y'))

