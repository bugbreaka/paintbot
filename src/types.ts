export interface Position {
  readonly x: number
  readonly y: number
}

export interface Bot {
  readonly id: string
  readonly name: string
  readonly color?: string
  readonly position?: Position
}

export interface CanvasDimensions {
  readonly width: number
  readonly height: number
}

export interface RegisterCommand {
  readonly register: string
}

export type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT'

export interface BotCommand {
  readonly id: string
  readonly color?: Color
  readonly move?: Direction
  readonly info?: string
  readonly paint?: string
  readonly clear?: string
  readonly look?: string
  readonly msg?: string
  readonly bye?: string
  readonly bots?: string
}

/**
 * pico-8 16 color palette from https://www.pixilart.com/palettes/pico-8-51001
 */
export type Color =
  | '0' // "#000000"
  | '1' // "#1D2B53"
  | '2' // "#7E2553"
  | '3' // "#008751"
  | '4' // "#AB5236"
  | '5' // "#5F574F"
  | '6' // "#C2C3C7"
  | '7' // "#FFF1E8"
  | '8' // "#FF004D"
  | '9' // "#FFA300"
  | 'a' // "#FFEC27"
  | 'b' // "#00E436"
  | 'c' // "#29ADFF"
  | 'd' // "#83769C"
  | 'e' // "#FF77A8"
  | 'f' // "#FFCCAA"

export interface Pixel {
  readonly color: string
  readonly position: Position
}
