import repl from 'repl'
import { evaluate } from './lambda/eval'
import { parse } from './lambda/parser'
import { prettyPrint } from './lambda/printer'

type ReplOutput = {
  echo?: string
  result?: string
  error?: unknown
}

const replEval = (cmd: string): ReplOutput => {
  try {
    const term = parse(cmd)

    const echo = prettyPrint(term)

    const res = evaluate(term, null)

    return {
      echo,
      result: prettyPrint(res)
    }
  } catch (e) {
    if (e instanceof Error) {
      return {
        echo: cmd,
        error: `${cmd}\nERROR: ${e.message}\n`
      }
    } else {
      return {
        echo: cmd,
        error: e
      }
    }
  }
}

repl.start({
  prompt: '\\.> ',
  eval: (cmd, context, file, cb) => {
    cb(null, replEval(cmd))
  },
  writer: ({ echo, result, error}: ReplOutput) => {
    return `${echo ?? ''}\n${result ?? ''}\n${String(error ?? '')}`
  }
})