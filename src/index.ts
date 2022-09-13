import { app, lmd, vr } from './lambda/ast'
import { evaluate } from './lambda/eval'

const term = app(lmd('x', vr('x')), vr('y'))

const res = evaluate(term, null)
