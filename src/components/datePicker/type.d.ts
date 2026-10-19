import type { Dayjs } from 'dayjs'

// ==========================================
// 公共基础类型 (Common Types)
// ==========================================

/**
 * 组件的选择模式
 * - single: 单选
 * - multiple: 多选
 * - range: 范围选择
 */
export type SelectionMode = 'single' | 'multiple' | 'range'

/**
 * 当前操作的面板类型
 * - single: 单选面板
 * - start: 范围选择的开始面板
 * - end: 范围选择的结束面板
 */
export type PanelType = 'single' | 'start' | 'end'

/**
 * 禁用的日期值格式（支持字符串、时间戳、Date对象和 Dayjs 实例）
 */
export type DisabledDateValue = string | number | Date | Dayjs

/**
 * 时间列表项
 */
export type TimeListItem = {
  label: string
  value: string | number
}

/**
 * 选择器暴露的时间列表方法
 */
export type TimeListExpose = {
  getSelectedTimeList: (step?: number) => TimeListItem[]
}

// ==========================================
// 年份选择器专用类型 (Year Picker Types)
// ==========================================

/**
 * 年份选择器的范围值
 */
export type YearValue = number | string

/**
 * 年份选择器的范围值
 */
export type YearRangeValue = [YearValue | null, YearValue | null]

/**
 * 年份选择器的绑定模型值
 */
export type YearModelValue = YearValue | YearValue[] | YearRangeValue | null

// ==========================================
// 季节选择器专用类型 (Season Picker Types)
// ==========================================

/**
 * 季节草稿状态（用于处理用户手动输入不完整的状态）
 */
export type SeasonDraft = {
  year: number
  season: number | null
}

/**
 * 季节选择器的范围草稿状态
 */
export type SeasonRangeDraft = [SeasonDraft | null, SeasonDraft | null]

/**
 * 带有季节扩展方法的 Dayjs 实例类型
 */
export type SeasonCapableDayjs = Dayjs & {
  season(): number
  season(season: number): SeasonCapableDayjs
  startOf(unit: 'season'): SeasonCapableDayjs
}

/**
 * 季节选择器的绑定模型值
 */
export type SeasonModelValue = string | string[] | [string | null, string | null] | null

// ==========================================
// 月份选择器专用类型 (Month Picker Types)
// ==========================================

/**
 * 月份草稿状态（用于处理用户手动输入不完整的状态）
 */
export type MonthDraft = {
  year: number
  month: number | null
}

/**
 * 月份选择器的范围草稿状态
 */
export type MonthRangeDraft = [MonthDraft | null, MonthDraft | null]

/**
 * 月份选择器的绑定模型值
 */
export type MonthModelValue = string | string[] | [string | null, string | null] | null

// ==========================================
// 旬选择器专用类型 (Xun Picker Types)
// ==========================================

/**
 * 旬草稿状态（用于处理用户手动输入不完整的状态）
 */
export type XunDraft = {
  year: number
  month: number | null
  xun: number | null
}

/**
 * 旬选择器的范围草稿状态
 */
export type XunRangeDraft = [XunDraft | null, XunDraft | null]

/**
 * 旬选择器的绑定模型值
 */
export type XunModelValue = string | string[] | [string | null, string | null] | null

// ==========================================
// 侯选择器专用类型 (Hou Picker Types)
// ==========================================

/**
 * 侯草稿状态（用于处理用户手动输入不完整的状态）
 */
export type HouDraft = {
  year: number
  month: number | null
  hou: number | null
}

/**
 * 侯选择器的范围草稿状态
 */
export type HouRangeDraft = [HouDraft | null, HouDraft | null]

/**
 * 侯选择器的绑定模型值
 */
export type HouModelValue = string | string[] | [string | null, string | null] | null

// ==========================================
// 日期选择器专用类型 (Date Picker Types)
// ==========================================

/**
 * 日期草稿状态（用于处理用户手动输入不完整的状态）
 */
export type DateDraft = {
  year: number
  month: number | null
  day: number | null
  hour: number | null
  minute: number | null
}

/**
 * 日期选择器的范围草稿状态
 */
export type DateRangeDraft = [DateDraft | null, DateDraft | null]

/**
 * 日期选择器的绑定模型值
 */
export type DateModelValue = string | string[] | [string | null, string | null] | null
