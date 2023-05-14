import {
  Bot,
  BotCommand,
  BotIdentity,
  CanvasDimensions,
  Color,
  Direction,
  Pixel,
  RegisterCommand,
} from './types.ts'

const API_URL = Deno.env.get('PAINTBOTS_URL') || 'http://localhost:31173/'

function toURLSearchParams(
  command: BotCommand | RegisterCommand,
): URLSearchParams {
  const data = new URLSearchParams()

  for (const [key, value] of Object.entries(command)) {
    data.append(key, value)
  }

  return data
}

async function httpPost(
  data: BotCommand | RegisterCommand,
  errorMsg: string,
): Promise<string> {
  let response: Response | null = null
  let responseData: string | null = null
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      body: toURLSearchParams(data),
    })

    responseData = await response.text()
  } catch (err) {
    throw Error(`${errorMsg}: ${err}`)
  }

  if (response?.status === 200 && responseData !== null) {
    return responseData
  } else if (response?.status === 204) {
    return ''
  } else {
    throw Error(
      `${errorMsg}: (${response?.status}) ${
        responseData !== null ? responseData : 'Unknown error.'
      }`,
    )
  }
}

function isInteger(v: any): v is number {
  return Number.isInteger(v)
}

function parsePixelResponse(response: string): Pixel {
  const params = new URLSearchParams(response)
  let color, x, y

  if (params.get('color')) {
    color = params.get('color')
  }

  if (params.get('x')) {
    x = parseInt(<string> params.get('x'))
  }

  if (params.get('y')) {
    y = parseInt(<string> params.get('y'))
  }

  if (!color || !isInteger(x) || !isInteger(y)) {
    throw Error(`Unable to parse pixel response (${color}, ${x}, ${y})!`)
  }

  return { color, position: { x, y } }
}

async function apiCommand(
  bot: BotIdentity,
  command: BotCommand,
  errorMsg: string,
): Promise<Bot> {
  try {
    const response = await httpPost(command, errorMsg)

    return { ...bot, ...parsePixelResponse(response) }
  } catch (err) {
    throw err
  }
}

/*
| register | register=name   | register a bot with the given name (if not already registered), returns id              |
| info     | id=ID&info      | no-op command that just returns bots current                                            |
| move     | id=ID&move=DIR  | move from current to position to direction DIR, which is one of LEFT, RIGHT, UP or DOWN |
| paint    | id=ID           | paint the current position with the current color                                       |
| color    | id=ID&color=COL | set the current color to COL, which is one of 0-f (16 color palette)                    |
| msg      | id=ID&msg=MSG   | say MSG, displays the message along with your name in the UI                            |
| clear    | id=ID&clear     | clear the pixel at current position                                                     |
| look     | id=ID           | look around, returns ascii containing the current image (with colors as above)          |
| bye      | id=ID&bye       | deregister this bot (id no longer is usable and name can be reused)                     |
| bots     | id=ID&bots      | return (JSON) information about all registered bots                                     |
*/

export function register(name: string): Promise<string> {
  return httpPost({ register: name }, 'Failed to register')
}

export function info(bot: BotIdentity): Promise<Bot> {
  return apiCommand(bot, { id: bot.id, info: '' }, 'Failed to get info')
}

export function move(bot: BotIdentity, dir: Direction): Promise<Bot> {
  return apiCommand(bot, { id: bot.id, move: dir }, 'Failed to move bot')
}

export function paint(bot: BotIdentity): Promise<Bot> {
  return apiCommand(bot, { id: bot.id, paint: '' }, 'Failed to paint')
}

export function color(bot: BotIdentity, color: Color): Promise<Bot> {
  return apiCommand(bot, { id: bot.id, color }, 'Failed to set color')
}

export function msg(bot: BotIdentity, msg: string): Promise<Bot> {
  return apiCommand(bot, { id: bot.id, msg }, 'Failed to send message')
}

export function clear(bot: BotIdentity): Promise<Bot> {
  return apiCommand(bot, { id: bot.id, clear: '' }, 'Failed to clear pixel')
}

export async function look(bot: BotIdentity): Promise<CanvasDimensions> {
  const rawData: string = await httpPost(
    { id: bot.id, look: '' },
    'Failed to look',
  )
  const rows = rawData.split('\n')

  return {
    width: rows[0].length,
    height: rows.length - 1,
  }
}

export function bye(bot: BotIdentity): Promise<string> {
  return httpPost({ id: bot.id, bye: '' }, 'Failed to bye')
}
export function bots(bot: BotIdentity): Promise<string> {
  return httpPost({ id: bot.id, bots: '' }, 'Failed to get bots')
}
