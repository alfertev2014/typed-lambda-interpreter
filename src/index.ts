import repl from 'repl'
import clc from 'cli-color'
import { evaluate } from './lambda/eval'
import { parse } from './lambda/parser'
import { prettyPrint } from './lambda/printer'

type ReplOutput = {
  echo?: string
  result?: string
  error?: unknown
}

const replEval = (cmd: string): ReplOutput => {
  if (!cmd.trim()) {
    return {}
  }
  try {
    const term = parse(cmd)

    const echo = prettyPrint(term)

    const res = evaluate(term, null)

    return {
      echo,
      result: prettyPrint(res),
    }
  } catch (e) {
    if (e instanceof Error) {
      return {
        echo: cmd,
        error: `ERROR: ${e.message}`,
      }
    } else {
      return {
        echo: cmd,
        error: e,
      }
    }
  }
}

repl.start({
  prompt: clc.cyanBright('\\.> '),
  eval: (cmd, context, file, cb) => {
    cb(null, replEval(cmd))
  },
  writer: ({ echo, result, error }: ReplOutput) => {
    return `${echo ? clc.yellow(`--->\n${echo}\n`) : ''}${
      result ? clc.greenBright(`<---\n${result}\n`) : ''
    }${error ? clc.redBright(String(error ?? '')) : ''}`
  },
})
