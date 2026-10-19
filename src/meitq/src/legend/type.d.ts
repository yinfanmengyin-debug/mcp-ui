// 图层类型
import type { NestingOptionProps, OptionProps } from '@/types/common'

export type LayerType =
  | 'contourFace'
  | 'contourLine'
  | 'stationValue'
  | 'stationName'
  | 'gridValue'
  | 'windField'
  | 'pointMarker'
  | 'pointValue'
  | 'pointName'
  | 'pointId'
// 图层类别
export type LayerCategory = 'contour' | 'county' | 'point'

export interface LegendProps {
  // 需要展示的图例配置信息
  info?: LegendInfo | LegendInfo[]
  // 显示名称 默认"图层管理"
  title?: string
  // css定位 默认absolute
  position?: 'absolute' | 'relative'
  // 定位元素右侧距离 可以是具体数值或百分比 默认10px
  right?: number | string
  // 定位元素底部距离 可以是具体数值或百分比 默认10px
  bottom?: number | string
  // 定位层级 默认1
  zIndex?: number
  // 默认是否折叠图例窗口 默认false
  collapse?: boolean
  // 是否显示收起按钮 默认true
  showCollapse?: boolean
  // 是否默认展示简单模式 只有图例 没有图层控制 默认false
  simple?: boolean
  // 是否显示简单模式切换按钮 默认true
  showSimpleSwitch?: boolean
  // 是否显示图层模式(色斑图/县级色斑图/散点图)切换 默认true
  showLayerCategorySwitch?: boolean
  // 默认展示的图层类别 默认 'contour'
  layerCategory?: LayerCategory
  // 图层类别列表 默认['contour', 'point']
  layerCategories?: LayerCategory[]
  /**
   * 色卡区域的最大宽度 (仅初始化时有效)
   * - number 数值类型时色卡区域的宽度为固定数值 单位为px
   * - 'auto' 每个色卡区域的宽度相同,为所有色卡自适应后的最大宽度
   * - 'fit-content' 每个色卡区域的宽度不同,为根据内容自适应的实际宽度
   */
  colorBarMaxWidth?: number | 'auto' | 'fit-content'
  // 色卡文字的字体大小 默认12px (仅初始化时有效)
  labelFontSize?: number
  // 色卡文字的字体类型 默认"Microsoft YaHei" (仅初始化时有效)
  labelFontFamily?: string
  // 色卡文字之间的最小间距 (避免挨得太近)
  labelMinGap?: number
  /**
   * 多个图例之间的图层切换是否互斥 默认true
   * - true 不同图例之间的相同图层切换互斥 (A图例的contourFace图层被选中时，B图例的contourFace图层会被取消选中 )
   * - false 不同图例之间的相同图层切换不互斥 (A图例的contourFace图层被选中时，B图例的contourFace图层不会被取消选中)
   * - 'overall' 不同图例之间的所有图层切换互斥 (A图例的某个图层被选中时，B图例的所有图层都会被取消选中)
   */
  mutualExclusion?: boolean | 'overall'
  // 是否显示色斑图图层的透明度控制 默认false
  showContourFaceOpacityControl?: boolean
  // 是否同步所有色斑图图层的透明度控制值 默认true
  syncContourFaceOpacity?: boolean
  // 简单模式下隐藏 slot
  hiddenSlot?: boolean
}

// 图例信息
export interface LegendInfo {
  // 名称
  name?: string
  // 单位
  unit?: string
  // 颜色列表
  colors: string | string[]
  // 数值列表
  levels: Array<string | number> | string
  // 标签列表
  labels?: string | string[]
  // 颜色列表/数值列表为字符串时的分隔符 默认为","
  delimiter?: string
  // 图例展示时的排序方式 默认保持原始排序
  sort?: 'asc' | 'desc'
  // 用于色标编辑信息
  colorCode?: ColorCode
  // 色斑图图层选项列表 默认显示全部可用选项
  contourLayers?: (LayerType | LayerTypeOther)[]
  // 默认选中的色斑图图层列表 默认选中 'contourFace'
  checkedContourLayers?: LayerType[]
  // 县级色标图层选项列表
  countyLayers?: (LayerType | LayerTypeOther)[]
  // 默认选中的县级色标图层列表 默认选中 'contourFace'
  checkedCountyLayers?: LayerType[]
  // 散点图图层选项列表 默认显示全部可用选项
  pointLayers?: (LayerType | LayerTypeOther)[]
  // 默认选中的散点图图层列表 默认选中 'pointMarker'
  checkedPointLayers?: LayerType[]
  // 默认的显示/隐藏状态 小眼睛的默认状态 默认true
  visible?: boolean
  // 显示/隐藏的小眼睛是否可见 默认true
  showSwitcher?: boolean
  // 色标色块的宽度 auto时根据数值的最大字符串长度自动计算色块的宽度(若与props.colorBarMaxWidth为数值时则平分宽度) 默认auto
  width?: number | 'auto'
  // 色标色块最小宽度 默认20px
  minWidth?: number
  // 色标色块的高度 默认12px
  height?: number
  // 色斑图图层的透明度默认值 范围为0~1 默认1
  contourFaceOpacity?: number
}

// 根据图例信息得到的图例配置
export interface LegendConf {
  // 名称
  name: string
  // 单位
  unit: string
  // 颜色列表
  colors: string[]
  // 数值列表
  levels: number[]
  // 标签列表 没有标签时默认为数值列表
  labels: string[]
  // 当props.colorBarMaxWidth为数值时计算出的label间隔个数
  labelInterval: number
  // 图例展示时的排序方式
  sort: 'asc' | 'desc'
  // 用于色标编辑信息
  colorCode?: ColorCode
  // 色斑图图层选项列表
  contourLayers: LayerTypeOther[]
  // 默认选中的色斑图图层列表
  checkedContourLayers: LayerType[]
  // 县级色标图层选项列表
  countyLayers: LayerTypeOther[]
  // 默认选中的县级色标图层列表
  checkedCountyLayers: LayerType[]
  // 散点图图层选项列表
  pointLayers: LayerTypeOther[]
  // 默认选中的散点图图层列表
  checkedPointLayers: LayerType[]
  // 默认的显示/隐藏状态 小眼睛的默认状态
  visible: boolean
  // 显示/隐藏的小眼睛是否可见
  showSwitcher: boolean
  // 图例项宽度
  width: number
  // 图例项高度
  height: number
  // label的数量比颜色少
  lessThanColor: boolean
  // label的数量比颜色多
  moreThanColor: boolean
  // 色斑图图层的透明度默认值
  contourFaceOpacity: number
}

export interface LayerState {
  // 图例名称
  name: string
  // 图例的索引
  index: number
  // 展示的图层
  layers: LayerType[]
  // 图例颜色列表
  colors: string[]
  // 图例数值列表
  levels: number[]
  // 图例标签列表
  labels: string[]
  // 图例色标信息
  colorCode?: ColorCode
}

export interface ContourFaceOpacityState {
  // 图例名称
  name: string
  // 图例的索引
  index: number
  // 图层透明度
  opacity: number
}

// 要素选项的配置
export interface ElementOptionProps extends NestingOptionProps {
  // 选项中要素单位对应的键名 默认"unit"
  unitField?: string
  // 选项中要素高度选项对应的键名 默认"height"
  heightField?: string
}

// 特殊颜色
export interface ColorItem {
  color: string
  label: string
  level: number
}

// 新增/编辑色标时的色标基本条件
export interface Condition {
  // 要素类型
  elementType: string
  // 要素的高度，没有则为空串
  elementLevel: string
  // 数据类型，原值/距平，没有用空串表示
  dataValueType: string
  /**
   * 第一部分为时段类型：日月季<br>
   * 第二部分用逗号分隔，支持多个时间时段，<br>
   * 例如春、夏、5-6月等，统一用开始月日-结束月日来表示：MMdd-MMdd，暂不支持小时，无用空串表示<br>
   * 示例：日,0101-0202,1031-1105；月,0101-0131；季,0301-0531。二月不考虑29号，结束日传28号<br>
   */
  timePeriod: string
  // 时间分辨率
  timeResolution: string
  // 区域id
  areaId: string
  // 区域名称
  areaName: string
  // 色标的单位，没有用空串表示
  unit: string
  // 系统id
  systemId: string
  // 系统名称
  systemName: string
  // 色标名称，不能为空
  name: string
}

export interface ColorInfo {
  // 色标名称
  name: string
  // 色标颜色，用十六进制表示，多个值，用逗号分隔
  colors: string
  // 色标等级，多个值，用逗号分隔，没有则为空字符串
  levels: string
  // 色标等级名称
  levelLabels: string
  // 色卡样式: 0.代表直角 1.代表尖角
  style: string
  // 色标类型: 1.数值色标 2.等级色标
  colorBarType: number
  // 数值类型: 1.固定数值 2.自适应
  dataType: number
  // 是否做缺测值处理
  missingFlag: boolean
  // 最小缺测值边界
  minMissing?: number
  // 最大缺测值边界
  maxMissing?: number
  // 是否在色标头尾各增加一个等级，设置后参与出图，但在色标中不展示。
  blankFlag: boolean
  // 设置后参与出图，但在色标中不展示的最小值（小于该值为透明色）
  minBlank?: number
  // 设置后参与出图，但在色标中不展示的最大值（大于该值为透明色）
  maxBlank?: number
  // 局部色标标识：出图时色标只展示数据范围内对应的部分色标
  partViewFlag: boolean
  // 自适应数值的小数位数
  levelFormat?: number
}

// 色标信息
export interface ColorCode extends Condition, ColorInfo {
  // 主键id
  id?: number
  // 是否启用
  enable: boolean
  // 更新时间 (格式为YYYY-MM-DD HH:mm:ss)
  updateTime?: string
  // 页面出图数据的最小值和最大值 [min, max] (用于设置色标应用组件中"快速设置"的最大最小默认值)
  minMax?: [number, number]
}

export interface ColorCodeResult {
  system: ColorCode[]
  custom: ColorCode[]
}

// 色标编辑需要的选项数据
export interface ColorCodeOptions {
  // 是否使用v2版本的色标编辑器 默认false
  useV2Editor?: boolean
  // 子系统选项列表
  systems?: Record<string, any>[]
  // 要素选项列表
  elements?: Record<string, any>[]
  // 区域类型列表
  areas?: Record<string, any>[]
  // 时间尺度列表
  timeScales?: Record<string, any>[]
  // 子系统选项的配置
  systemProps?: NestingOptionProps
  // 要素类型选项的配置
  elementProps?: ElementOptionProps
  // 区域类型选项的配置
  areaProps?: NestingOptionProps
  // 时间尺度选项的配置
  timeScaleProps?: OptionProps
  // 补充默认配色列表
  colors?: {
    value: string
    colorList: string[]
  }[]
  // 获取色标列表的请求方法
  getColorCodeList: (colorCode: ColorCode) => Promise<ColorCodeResult>
  // 获取所有系统色标的请求方法
  getAllSystemColorCodeList?: () => Promise<ColorCode[]>
  /**
   * 保存色标的请求方法 返回表示保存是否成功
   * @param colorCode 色标信息
   * @param componentName 触发保存的组件名称(用于区分是"新增/编辑色标"组件还是"色标应用"组件触发的保存)
   */
  save: (colorCode: ColorCode, componentName: string) => Promise<boolean>
  // 删除色标的请求方法 返回表示删除是否成功
  remove: (id: number) => Promise<boolean>
}

export interface LayerTypeOther {
  // 图例类型
  type: LayerType
  // 说明
  explain: string
}
