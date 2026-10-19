import type { ColorCode, ColorInfo, Condition } from '@/src/legend/type'
import type { Vector } from '@texel/color'
import { ElMessage } from 'element-plus'

import 'element-plus/es/components/message/style/css'
import type { InjectionKey, Ref } from 'vue'

/**
 * 色标编辑组件的props
 */
export interface ColorBarEditorProps {
  /**
   * 色标信息 (不传则表示生成初始所有值为初始状态的色标信息)
   */
  colorCode?: ColorCode
  /**
   * 是否显示"色属性设置"表单
   */
  showAttrForm?: boolean
}

/**
 * 色标编辑组件的"色标属性设置"表单的属性
 */
export interface ColorBarEditorAttrFormInfo {
  /**
   * 气象要素
   */
  elementType: string
  /**
   * 要素的高度, 没有用空串表示
   */
  elementLevel: string
  /**
   * 统计方式 (数据类型, 原值/距平), 没有用空串表示
   */
  dataValueType: string
  /**
   * 适用系统模块id (旧版为单个系统模块id, v2新版为多个系统模块id)
   */
  systemId: string[]
  /**
   * 适用系统模块名称 (旧版为单个系统模块名称, v2新版为多个系统模块名称)
   */
  systemName: string[]
  /**
   * 第一部分为时段类型：日月季<br>
   * 第二部分用逗号分隔，支持多个时间时段，<br>
   * 例如春、夏、5-6月等，统一用开始月日-结束月日来表示：MMdd-MMdd，暂不支持小时，无用空串表示<br>
   * 示例：日,0101-0202,1031-1105；月,0101-0131；季,0301-0531。二月不考虑29号，结束日传28号<br>
   */
  timePeriod: string
  /**
   * 时间分辨率 (分钟/小时/日/候/旬/月/季/年), 没有用空串表示
   */
  timeResolution: string
  /**
   * 适用范围的区域id (旧版为单个区域id, v2新版为多个区域id)
   */
  areaId: string[]
  /**
   * 适用范围的区域名称 (旧版为单个区域名称, v2新版为多个区域名称)
   */
  areaName: string[]
}

/**
 * 色标编辑组件的"色标属性设置"表单条件类型
 */
export type ColorBarEditorAttrFormCondition = Omit<Condition, 'name' | 'unit'>

/**
 * 色标编辑组件的"图例编辑预览"表单条件类型
 */
export interface ColorBarEditorLegendFormCondition extends ColorInfo {
  unit?: string
}

export interface ColorBarEditorLegendFormInfo {
  /**
   * 色标名称
   */
  name: string
  /**
   * 色标单位
   */
  unit: string
  /**
   * 色标的等级列表
   */
  levelList: number[]
  /**
   * 色标的等级名称列表
   */
  labelList: string[]
  /**
   * 色标类型：1.数值色标 2.等级色标
   */
  colorBarType: number
  /**
   * 数值类型：1.固定数值 2.自适应
   */
  dataType: number
  /**
   * 是否做缺测值处理
   */
  missingFlag: boolean
  /**
   * 是否在色标头尾各增加一个等级，设置后参与出图，但在色标中不展示。
   */
  blankFlag: boolean
  /**
   * 设置后参与出图，但在色标中不展示的最小值（小于该值为透明色）
   */
  minBlank?: number
  /**
   * 设置后参与出图，但在色标中不展示的最大值（大于该值为透明色）
   */
  maxBlank?: number
  /**
   * 局部色标标识：出图时色标只展示数据范围内对应的部分色标
   */
  partViewFlag: boolean
  /**
   * 自适应数值的小数位数
   */
  levelFormat?: number
}

export interface ColorBlock {
  x: number
  color: string
}

export interface ColorStop {
  pos: number
  color: Vector
}

export interface QuickSettings {
  type: 'min' | 'max' | 'range' | 'center'
  /**
   * 最小值
   */
  min: number
  /**
   * 最大值
   */
  max: number
  /**
   * 中心值
   */
  central: number
  /**
   * 间隔
   */
  interval: number
}

/**
 * 空色标信息
 */
export const emptyColorCode: ColorCode = {
  enable: true,
  elementType: '',
  elementLevel: '',
  dataValueType: '',
  timePeriod: '',
  timeResolution: '',
  areaId: '',
  areaName: '',
  unit: '',
  systemId: '',
  systemName: '',
  name: '',
  colors: '',
  levels: '',
  levelLabels: '',
  style: '0',
  colorBarType: 1,
  dataType: 1,
  missingFlag: false,
  blankFlag: false,
  partViewFlag: false,
  levelFormat: 0
}

export function error(message: string, e?: Error) {
  ElMessage.error({ message, duration: 2000, showClose: true, grouping: true })
  throw e ?? new Error(message)
}

export const colorSchemeList = [
  { value: '1', colorList: ['#3534CB', '#00F6FF', '#08B81E', '#EAF901', '#FFB200', '#F4010A', '#570C7D'] },
  { value: '2', colorList: ['#0001FD', '#07A71F', '#D7F302', '#FFB300', '#FE2B00', '#590088'] },
  { value: '3', colorList: ['#FFFFFF', '#FFFF3B', '#FE02F6', '#FF0026', '#00FFF0', '#00FF48', '#0106F6', '#000000'] },
  { value: '4', colorList: ['#AC0001', '#FF5900', '#FFFF00', '#44FB31', '#0003CF'] },
  { value: '5', colorList: ['#400051', '#0F2FEF', '#40EDFF', '#FEEB3F', '#FF7ADB', '#FFFFFF'] },
  { value: '6', colorList: ['#EF1111', '#FDF301', '#05FF04', '#01FFFF', '#030EFF', '#FF00EF', '#FF002D'] },
  { value: '7', colorList: ['#010199', '#0050FE', '#06FFF9', '#82FF7C', '#EEFF0F', '#FF2E01', '#800000'] },

  { value: '9', colorList: ['#3534CB', '#00F6FF', '#08B81E', '#EAF901', '#FFB200', '#F4010A', '#570C7D'] },
  { value: '10', colorList: ['#0001FD', '#07A71F', '#D7F302', '#FFB300', '#FE2B00', '#590088'] },
  { value: '11', colorList: ['#FFFFFF', '#FFFF3B', '#FE02F6', '#FF0026', '#00FFF0', '#00FF48', '#0106F6', '#000000'] },
  { value: '12', colorList: ['#AC0001', '#FF5900', '#FFFF00', '#44FB31', '#0003CF'] },
  { value: '13', colorList: ['#400051', '#0F2FEF', '#40EDFF', '#FEEB3F', '#FF7ADB', '#FFFFFF'] },
  { value: '14', colorList: ['#EF1111', '#FDF301', '#05FF04', '#01FFFF', '#030EFF', '#FF00EF', '#FF002D'] },
  { value: '15', colorList: ['#010199', '#0050FE', '#06FFF9', '#82FF7C', '#EEFF0F', '#FF2E01', '#800000'] }
]

export function splitStr<T = string>(str: string, call: (item: string) => T = item => item as T): T[] {
  const trimStr = str.trim()
  if (!trimStr) return []
  return trimStr
    .split(',')
    .filter(Boolean)
    .map(item => call(item.trim()))
}

export const applyColorBarMinMaxInjectKey = Symbol('applyColorBarMinMaxInjectKey') as InjectionKey<Ref<[number, number] | undefined>>
