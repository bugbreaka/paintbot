import { exists as fileExists } from 'fs/mod.ts'
import {
  Bot,
  BotIdentity,
  CanvasDimensions,
  Direction,
  Position,
} from './types.ts'
import { bye, info, move, register } from './Api.ts'

async function storeBotConfig(
  botName: string,
  id: string,
  configFilePath: string,
): Promise<BotIdentity> {
  await Deno.writeTextFile(configFilePath, `${botName}:${id}`)

  return {
    name: botName,
    id,
  }
}

async function removeBotConfig(configFilePath: string): Promise<void> {
  await Deno.remove(configFilePath)
}

async function loadBotConfig(
  configFilePath: string,
): Promise<BotIdentity | undefined> {
  const exists = await fileExists(configFilePath)

  if (exists) {
    try {
      const decoder = new TextDecoder('utf-8')
      const data = await Deno.readFile(configFilePath)
      const splat = decoder.decode(data).split(':')

      return {
        name: splat[0],
        id: splat[1],
      }
    } catch (e) {
      console.error(e)
    }
  }

  return
}

export async function registerBot(
  botName: string,
  configFilePath: string,
): Promise<Bot> {
  const config = await loadBotConfig(configFilePath)

  let botIdentity: BotIdentity
  if (config && config.name === botName) {
    botIdentity = {
      name: botName,
      id: config.id,
    }

    console.log(`Loaded bot "${botIdentity.name}" with id: ${botIdentity.id}`)
  } else {
    const id = await register(botName)
    botIdentity = await storeBotConfig(botName, id, configFilePath)

    console.log(
      `Registered bot "${botIdentity.name}" with id: ${botIdentity.id}`,
    )
  }

  return info(botIdentity)
}

export async function deregisterBot(
  bot: Bot,
  configFilePath: string,
): Promise<void> {
  await bye(bot).finally(() => removeBotConfig(configFilePath))
}

export async function moveBot(
  bot: Bot,
  dir: Direction,
  dist: number,
): Promise<Bot> {
  let result = bot

  for (let i = 0; i < dist; i++) {
    result = await move(result, dir)
  }

  return result
}

export function getCanvasCenter(canvas: CanvasDimensions): Position {
  return {
    x: Math.floor(canvas.width / 2),
    y: Math.floor(canvas.height / 2),
  }
}

export async function moveBotToPosition(
  bot: Bot,
  position: Position,
): Promise<Bot> {
  let result = bot

  const distX = position.x - result.position.x
  const distY = position.y - result.position.y
  const dirX: Direction = distX < 0 ? 'LEFT' : 'RIGHT'
  const dirY: Direction = distY < 0 ? 'UP' : 'DOWN'

  if (distX !== 0) {
    result = await moveBot(result, dirX, Math.abs(distX))
  }
  if (distY !== 0) {
    result = await moveBot(result, dirY, Math.abs(distY))
  }

  return result
}
