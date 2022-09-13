import { evaluate } from './lambda/eval'
import { parse } from './lambda/parser'
import { pretty } from './lambda/printer'

const ps1 = '\\> '

process.stdout.write('\n' + ps1)

process.stdin.on('data', (data) => {
  try {
    const term = parse(data.toString())

    process.stdout.write(pretty(term) + '\n')

    const res = evaluate(term, null)

    process.stdout.write(`${pretty(res)}\n${ps1}`)
  } catch (e) {
    if (e instanceof Error) {
      process.stdout.write(`${e.message}\n${ps1}`)
    } else {
      console.log(e)
    }
  }
})

process.stdin.on('end', () => {
  process.stdout.write('\n')
})