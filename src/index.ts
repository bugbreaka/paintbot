import {
  deregisterBot,
  getCanvasCenter,
  moveBotToPosition,
  registerBot,
} from './util.ts'
import { Bot, Position } from './types.ts'
import { color, info, look, paint } from './Api.ts'

function* getCircleCircumferencePositions(
  center: Position,
  radius: number,
): Generator<Position> {
  const twoPi = Math.PI * 2
  for (let i = 0; i <= twoPi; i += 0.1) {
    const position = {
      x: center.x + Math.round(radius * Math.cos(i)),
      y: center.y + Math.round(radius * Math.sin(i)),
    }

    yield position
  }
}

async function drawCircle(
  bot: Bot,
  center: Position,
  radius: number,
): Promise<Bot> {
  let result = bot
  for (const position of getCircleCircumferencePositions(center, radius)) {
    if (result.position === undefined) {
      break
    }

    result = await color(result, position.x < center.x ? 'e' : 'd')
    result = await moveBotToPosition(result, position)
    await paint(result)
  }

  return result
}

function positionsAreEqual(a: Position, b: Position | undefined): boolean {
  if (b === undefined) {
    return false
  }
  return a.x === b.y && a.y === b.y
}

export async function main() {
  const configFilePath = 'botConfig.cfg'
  let bot = await registerBot('Bob', configFilePath)
  console.log(`Registered bot: ${bot.name} with id: ${bot.id}`)

  bot = await info(bot)

  const canvas = await look(bot)
  const center = getCanvasCenter(canvas)
  bot = await moveBotToPosition(bot, center)
  //process.exit(0); return;

  //bot = await color(bot, "e");
  //bot = await drawCircle(bot, center, 20)
  //process.exit(0); return;

  bot = await color(bot, 'd')
  const drawMode: 'CIRCLES' | 'POSITIONS' | null = 'CIRCLES'
  const maxRadius = 15
  const twoPi = Math.PI * 2
  const halfHeight = Math.round(canvas.height / 2)
  const quarterHeight = Math.round(canvas.height / 4)
  let previousPosition: Position | undefined = undefined
  let position: Position | undefined = undefined
  for (let i = 0; i <= twoPi; i += 0.1) {
    position = {
      x: Math.round((i / twoPi) * canvas.width),
      y: Math.round(quarterHeight * Math.sin(i)) + halfHeight,
    }
    //console.log(position)

    if (!positionsAreEqual(position, previousPosition)) {
      bot = await moveBotToPosition(bot, position)

      if (drawMode === 'CIRCLES') {
        bot = await drawCircle(
          bot,
          position,
          Math.abs(Math.round(Math.sin(i) * maxRadius)) + 5,
        )
      } else if (drawMode === 'POSITIONS') {
        bot = await paint(bot)
      }
    }

    previousPosition = position
  }

  console.log(
    `Bot stopped at, x: ${bot.position?.x}, y: ${bot.position?.y}, with color: ${bot.color}`,
  )

  await deregisterBot(bot, configFilePath)
}

await main()
