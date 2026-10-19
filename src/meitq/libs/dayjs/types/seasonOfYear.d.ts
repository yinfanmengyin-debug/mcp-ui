import { PluginFunc, ConfigType } from 'dayjs'

declare const plugin: PluginFunc
export = plugin

declare type SeasonType = 'ji' | 'season' | 'seasons'

declare module 'dayjs' {
  interface Dayjs {
    season(): number

    season(season: number): Dayjs

    add(value: number, unit: SeasonType): Dayjs

    subtract(value: number, unit: SeasonType): Dayjs

    startOf(unit: SeasonType): Dayjs

    endOf(unit: SeasonType): Dayjs

    isSame(date?: ConfigType, unit?: SeasonType): boolean

    isBefore(date?: ConfigType, unit?: SeasonType): boolean

    isAfter(date?: ConfigType, unit?: SeasonType): boolean
  }
}
