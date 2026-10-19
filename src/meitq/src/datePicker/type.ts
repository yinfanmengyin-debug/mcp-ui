import type { Prop, btnItem } from './hooks/use-shortcut/index'

// 时间尺度
export type TimeScale = 'year' | 'season' | 'month' | 'xun' | 'hou' | 'day' | 'hour';

// 获取日期对应的季节
export function getSeason(date: Date) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return 1;
  else if (month >= 6 && month <= 8) return 2;
  else if (month >= 9 && month <= 11) return 3;
  else return 4;
}

// 获取季节的开始月份
export function getSeasonStartMonth(season: number): number {
  return { 1: 3, 2: 6, 3: 9, 4: 12 }[season]!;
}

// 获取季节的结束月份
export function getSeasonEndMonth(season: number): number {
  return { 1: 5, 2: 8, 3: 11, 4: 2 }[season]!;
}

//  时间label， margin 配置
export interface TimeSetting {
  // 连续时段
  continue?: {
    label1?: string
    label2?: string
    marginLeft?: string
  }
  // 历年同期
  same?: {
    label1?: string
    label2?: string
    marginLeft?: string
  }
}

export interface Props {
  // 开始时间与结束时间的时段
  modelValue: Array<Date | string>
  // 需要展示的时间尺度
  types?: TimeScale[]
  // 当前默认选中的时间尺度
  type: TimeScale
  // 是否显示时间尺度选项列表
  showTypes?: boolean
  // 是否显示时间尺度标签
  showTypesLabel?: boolean
  // 是否为同期时段选择 否则为连续时段
  samePeriod?: boolean
  // 是否显示年份选择（仅历年同期时有效）
  showYear?: boolean
  // 是否显示快捷操作
  showShortcuts?: boolean
  // 折叠按钮所在行数
  colNum?: number
  // 每行按钮个数
  rowNum?: number
  // 折叠展开配置
  fold?:  Prop['fold']
  // 头部添加快捷
  preAppend?:  btnItem[]
  // 尾部添加快捷
  sufAppend?:  btnItem[]
  // 替换列表
  reList?:  btnItem[]
  // 删除快捷时间
  exclude?:  string[]
  //  时间label， margin 配置
  setting?: TimeSetting
  // 是否显示插槽
  showSlots?:boolean
}
