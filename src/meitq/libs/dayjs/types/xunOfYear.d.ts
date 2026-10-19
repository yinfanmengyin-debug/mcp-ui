import { PluginFunc, ConfigType } from 'dayjs'

declare const plugin: PluginFunc
export = plugin

declare type XunType = 'xun' | 'xuns'

declare module 'dayjs' {
  interface Dayjs {
    xun(): number

    xun(season: number): Dayjs

    add(value: number, unit: XunType): Dayjs

    subtract(value: number, unit: XunType): Dayjs

    startOf(unit: XunType): Dayjs

    endOf(unit: XunType): Dayjs

    isSame(date?: ConfigType, unit?: XunType): boolean

    isBefore(date?: ConfigType, unit?: XunType): boolean

    isAfter(date?: ConfigType, unit?: XunType): boolean
  }
}
