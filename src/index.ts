import { evaluate } from './lambda/eval'
import { parse } from './lambda/parser'
import { prettyPrint } from './lambda/printer'

const ps1 = '\\.> '

process.stdout.write('\n' + ps1)

process.stdin.on('data', (data) => {
  try {
    const term = parse(data.toString())

    process.stdout.write(prettyPrint(term) + '\n')

    const res = evaluate(term, null)

    process.stdout.write(`${prettyPrint(res)}\n${ps1}`)
  } catch (e) {
    if (e instanceof Error) {
      process.stdout.write(`ERROR: ${e.message}\n${ps1}`)
    } else {
      console.error(e)
    }
  }
})

process.stdin.on('end', () => {
  process.stdout.write('\n')
})
