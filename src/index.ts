import { sleep } from 'sleep/mod.ts'
import {
  deregisterBot,
  getCanvasCenter,
  moveBotToPosition,
  registerBot,
} from './util.ts'
import { Bot, CanvasDimensions, Color, Position } from './types.ts'
import { color, look, paint } from './Api.ts'

type CirclePosition = Position & {
  index: number
}

function positionsAreEqual(a: Position, b: Position | undefined): boolean {
  if (b === undefined) {
    return false
  }
  return a.x === b.y && a.y === b.y
}

function* getCircleCircumferencePositions(
  center: Position,
  radius: number,
  getDisplacement: (
    r: number,
    c: Position,
    p: CirclePosition,
  ) => CirclePosition,
  getNextIndex: (i: number) => number = (i) => i + 0.1,
): Generator<CirclePosition> {
  const twoPi = Math.PI * 2
  for (let i = 0; i <= twoPi; i = getNextIndex(i)) {
    const position: CirclePosition = getDisplacement(radius, center, {
      x: center.x + Math.round(radius * Math.cos(i)),
      y: center.y + Math.round(radius * Math.sin(i)),
      index: i,
    })

    yield position
  }
}

async function drawCircle(
  bot: Bot,
  center: Position,
  radius: number,
  getColor: (c: Position, p: CirclePosition) => Color,
  getDisplacement: (
    r: number,
    c: Position,
    p: CirclePosition,
  ) => CirclePosition = (r, c, p) => p,
): Promise<Bot> {
  let result = bot

  for (
    const position of getCircleCircumferencePositions(
      center,
      radius,
      getDisplacement,
    )
  ) {
    //await sleep(0.2)

    result = await color(result, getColor(center, position))
    result = await moveBotToPosition(result, position)
    await paint(result)
  }

  return result
}

type DrawMode = 'CIRCLES' | 'POSITIONS' | 'NONE'

async function drawWorm(
  bot: Bot,
  canvas: CanvasDimensions,
  drawMode: DrawMode = 'CIRCLES',
  slow = false
): Promise<Bot> {
  let result = bot

  const maxRadius = 15
  const twoPi = Math.PI * 2
  const halfHeight = Math.round(canvas.height / 2)
  const quarterHeight = Math.round(canvas.height / 4)

  let previousPosition: Position | undefined = undefined
  let position: Position | undefined = undefined

  result = await color(result, 'd')

  for (let i = 0; i <= twoPi; i += 0.1) {
    position = {
      x: Math.round((i / twoPi) * canvas.width),
      y: Math.round(quarterHeight * Math.sin(i)) + halfHeight,
    }
    //console.log(position)

    if (!positionsAreEqual(position, previousPosition)) {
      if (slow) {
        await sleep(0.1)
      }
      result = await moveBotToPosition(result, position)

      if (drawMode === 'CIRCLES') {
        result = await drawCircle(
          result,
          position,
          Math.abs(Math.round(Math.sin(i) * maxRadius)) + 5,
          (c, p) => p.x < c.x ? 'e' : 'd',
        )
      } else if (drawMode === 'POSITIONS') {
        result = await paint(result)
      }
    }

    previousPosition = position
  }

  return result
}

async function drawDroplet(
  bot: Bot,
  canvas: CanvasDimensions,
  drawMode: DrawMode = 'CIRCLES',
  slow = false
): Promise<Bot> {
  let result = bot

  const center = getCanvasCenter(canvas)
  result = await color(result, 'd')

  const pathRadius = 35
  const maxCircleRadius = 15

  let previousPosition: Position | undefined = undefined
  for (
    const position of getCircleCircumferencePositions(
      center,
      pathRadius,
      (r, c, p): CirclePosition => {
        const halfRadius = Math.round(r / 2)

        const x =
          Math.round((halfRadius * Math.cos(p.index)) * Math.sin(p.index)) + p.x
        const y = Math.round(r * Math.sin(p.index)) + p.y

        return { x, y, index: p.index }
      },
      (i) => i + 0.1 + Math.abs(Math.sin(i) * 0.05),
    )
  ) {
    if (!positionsAreEqual(position, previousPosition)) {
      if (slow) {
        await sleep(0.1)
      }
      result = await moveBotToPosition(result, position)

      if (drawMode === 'CIRCLES') {
        result = await drawCircle(
          result,
          position,
          Math.abs(Math.round(Math.sin(position.index) * maxCircleRadius)) + 5,
          (c, p) => {
            if (position.y < center.y) {
              return p.x < c.x ? 'e' : 'd'
            } else {
              return p.x < c.x ? 'd' : 'e'
            }
          },
        )
      } else if (drawMode === 'POSITIONS') {
        result = await paint(result)
      }
    }

    previousPosition = position
  }

  return result
}

export async function main() {
  const configFilePath = 'botConfig.cfg'
  let bot = await registerBot('Bob', configFilePath)
  const canvas = await look(bot)

  //bot = await moveBotToPosition(bot, getCanvasCenter(canvas))
  //bot = await color(bot, 'd')
  //bot = await paint(bot)
  //Deno.exit(0); return;

  //bot = await drawCircle(bot, getCanvasCenter(canvas), 20, () => 'd')
  //Deno.exit(0); return;

  //bot = await drawWorm(bot, canvas)
  //Deno.exit(0); return;

  bot = await drawDroplet(bot, canvas)
  //Deno.exit(0); return;

  console.log(
    `Bot stopped at, x: ${bot.position?.x}, y: ${bot.position?.y}, with color: ${bot.color}`,
  )

  await deregisterBot(bot, configFilePath)

  console.log('Bot said bye (^_^)')
}

await main()
