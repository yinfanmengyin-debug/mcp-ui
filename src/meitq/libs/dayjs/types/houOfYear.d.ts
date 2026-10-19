import { PluginFunc, ConfigType } from 'dayjs'

declare const plugin: PluginFunc
export = plugin

declare type HouType = 'hou' | 'hous'

declare module 'dayjs' {
  interface Dayjs {
    hou(): number

    hou(season: number): Dayjs

    add(value: number, unit: HouType): Dayjs

    subtract(value: number, unit: HouType): Dayjs

    startOf(unit: HouType): Dayjs

    endOf(unit: HouType): Dayjs

    isSame(date?: ConfigType, unit?: HouType): boolean

    isBefore(date?: ConfigType, unit?: HouType): boolean

    isAfter(date?: ConfigType, unit?: HouType): boolean
  }
}
