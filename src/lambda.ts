export type Variable = { t: 'Variable'; name: string }
export type Lambda = { t: 'Lambda'; variable: string; body: Term }
export type Application = { t: 'Application'; term1: Term; term2: Term }

export type Term = Variable | Lambda | Application

export const vr = (name: string): Variable => ({ t: 'Variable', name })
export const lmd = (variable: string, body: Term): Lambda => ({
  t: 'Lambda',
  variable,
  body,
})
export const app = (term1: Term, term2: Term): Application => ({
  t: 'Application',
  term1,
  term2,
})

export type Environment = {
  variable: string
  value: ResultTerm
  next: Environment
} | null

export const mkenv = (
  variable: string,
  value: ResultTerm,
  next: Environment
) => ({
  value,
  variable,
  next,
})

export const assoc = (
  variable: string,
  env: Environment
): ResultTerm | null => {
  if (!env) {
    return null
  }
  return env.variable === variable ? env.value : assoc(variable, env.next)
}

export type Closure = { t: 'Closure'; lambda: Lambda; env: Environment }
export const closure = (lambda: Lambda, env: Environment): Closure => ({
  t: 'Closure',
  lambda,
  env,
})

export type ResultTerm = Variable | Closure

export const evaluate = (term: Term, env: Environment): ResultTerm => {
  switch (term.t) {
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

export const apply = (
  m: ResultTerm,
  n: ResultTerm,
  env: Environment
): ResultTerm => {
  if (m.t === 'Closure') {
    throw new Error('Apply of nonapplyable!')
  }
  const newEnv: Environment = mkenv(m.name, n, env)
  return evaluate(m, newEnv)
}
