import type { Dayjs } from 'dayjs'
import type {
  PanelType,
  TimeListItem,
  YearRangeValue
} from '../datePicker/type'

export type StatisticalPeriodType = 'date' | 'hour' | 'hou' | 'xun' | 'month' | 'season' | 'year'

export type StatisticalStringRangeValue = [string | null, string | null] | null

export interface StatisticalPeriodTypeOption {
  label: string
  value: StatisticalPeriodType
  disabled?: boolean
}

export interface StatisticalPeriodLimit {
  min?: string | number | Date | Dayjs
  max?: string | number | Date | Dayjs
  maxSpan?: number
}

export interface StatisticalPeriodDisabledContext {
  type: StatisticalPeriodType
  config: StatisticalPeriodConfig
}

export interface StatisticalPeriodItemConfig<TValue> {
  value: TValue
  defaultValue: TValue
  format?: string
  limit?: StatisticalPeriodLimit
  pickerProps?: Record<string, any>
  disabledDate?: (date: Dayjs, panel: PanelType, context: StatisticalPeriodDisabledContext) => boolean
}

export interface StatisticalPeriodItems {
  date: StatisticalPeriodItemConfig<StatisticalStringRangeValue>
  hour: StatisticalPeriodItemConfig<StatisticalStringRangeValue>
  hou: StatisticalPeriodItemConfig<StatisticalStringRangeValue>
  xun: StatisticalPeriodItemConfig<StatisticalStringRangeValue>
  month: StatisticalPeriodItemConfig<StatisticalStringRangeValue>
  season: StatisticalPeriodItemConfig<StatisticalStringRangeValue>
  year: StatisticalPeriodItemConfig<YearRangeValue | null>
}

export interface StatisticalPeriodConfig {
  type: StatisticalPeriodType
  types?: StatisticalPeriodTypeOption[]
  items: Partial<StatisticalPeriodItems>
}

export interface StatisticalPeriodExpose {
  getSelectedTimeList: (step?: number) => TimeListItem[]
}
