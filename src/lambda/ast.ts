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
