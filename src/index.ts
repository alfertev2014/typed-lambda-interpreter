import { tagged, Tagged, __tag } from './tagged'

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

const assoc = (variable: string, env: Environment): ResultTerm | null => {
  if (!env) {
    return null
  }
  return env.variable === variable ? env.value : assoc(variable, env.next)
}

type Closure = Tagged<'Closure', { lambda: Lambda; env: Environment }>
const closure = (lambda: Lambda, env: Environment) => tagged('Closure', { lambda, env })

type ResultTerm = Variable | Closure

const evaluate = (term: Term, env: Environment): ResultTerm => {
  switch (term[__tag]) {
    case 'Application':
      return apply(evaluate(term.term1, env), evaluate(term.term2, env), env)
    case 'Lambda':
      return closure(term, env)
    default: {
      const res = assoc(term.name, env)
      if (!res) {
        throw new Error(`Undefined variable '${term.name}'`)
      }
      return res
    }
  }
}

const apply = (m: ResultTerm, n: ResultTerm, env: Environment): ResultTerm => {
  if (m[__tag] === 'Closure') {
    throw new Error('Apply of nonapplyable!')
  }
  const newEnv: Environment = mkenv(m.name, n, env)
  return evaluate(m, newEnv)
}


const term = application(lambda('x', variable('x')), variable('y'))

