export interface TimeAxisData {
  value: string
  label: string
  disabled: boolean
  width?: string
  height?: string
  longTickWidth?: string
  longTickHeight?: string
  shortTickWidth?: string
  shortTickHeight?: string
  left?: string
  leftValue?: number
  showLabel?: boolean
  labelWidth?: number
}

export interface TimeAxisDate {
  date: string
  disabled: boolean
}

export interface TimeAxisItem<T> {
  value: string
  last: string
  next: string
  data: T
  index: number
}

export interface TimeAxisSliderStyle {
  // 两个长刻度之间的身位系数
  labelCoefficient?: number
  // 两个刻度直接的间隔像素
  minGap?: number
  // 两端距离
  bothEnds?: number
  // 刻度标签
  fontSize?: number
  // 刻度标签字体
  fontFamily?: string
  // 标签颜色
  color?: string
  // 刻度字体加粗
  bold?: boolean
  // 长刻度宽度
  longTickWidth?: number
  // 长刻度高度
  longTickHeight?: number
  // 长刻度颜色
  longTickColor?: string
  // 短刻度宽度
  shortTickWidth?: number
  // 短刻度高度
  shortTickHeight?: number
  // 短刻度颜色
  shortTickColor?: string
  // 刻度禁用颜色
  tickDisabledColor?: string
  // 轴颜色
  progressColor?: string
  // 轴高度
  progressHeight?: number
  progressBorderRadius?: number
  progressTlBorderRadius?: number
  progressTrBorderRadius?: number
  progressBrBorderRadius?: number
  progressBlBorderRadius?: number
  // 滑动按钮大小
  sliderButtonSize?: number
  // 滑动按钮颜色
  sliderButtonColor?: number
  // 滑动按钮边框
  sliderButtonBorderWidth?: number
  // 滑动按钮边框颜色
  sliderButtonBorderColor?: number
}

export interface TimeAxisBlockStyle {
  // 背景颜色
  backgroundColor?: string
  // 选中背景颜色
  activeBackgroundColor?: string
  // 禁用背景颜色
  disabledBackgroundColor?: string
  // 字体颜色
  color?: string
  // 选中字体颜色
  activeColor?: string
  // 禁用字体颜色
  disabledColor?: string
  // 边框颜色
  borderColor?: string
  // 指示箭头颜色
  arrowColor?: string
  // 指示箭头禁用颜色
  arrowDisabledColor?: string
  // 暂无数据字样颜色
  noDataTextColor?: string
}

export interface TimeAxisControlStyle {
  // 播放控件的字体颜色
  playColor?: string
  // 播放控件线框颜色
  playPolylineColors?: string[]
  // 播放控件圆圈颜色
  playPolygonColors?: string[]
  // 播放控件内部形状颜色
  playInnerColor?: string
  // 播放控件鼠标移入线框颜色
  hoverPolylineColors?: string[]
  // 播放控件鼠标移入圆圈颜色
  hoverPolygonColors?: string[]
  // 播放控件鼠标移入内部形状颜色
  hoverInnerColor?: string
}

export type UnitType = 'year' | 'season' | 'month' | 'xun' | 'hou' | 'day' | 'hour' | 'minutes'

export interface TimeAxisConfig {
  uuid?: string
  // 时间组件是否共用样式
  share?: boolean
  // 是否冻结数据
  freeze?: boolean
  // 时间轴类型
  type?: 'block' | 'slider'
  // 分辨率
  ratio?: number
  // 单位
  unit?: string
  // 格式化数组 决定了方块列表可以分几层
  formatList?: string[]
  // 默认日期
  current?: string
  // 开始时间
  startDate?: string
  // 结束时间
  endDate?: string
  // 时间范围 当存在开始时间和范围就往后退 当存在结束时间和范围就往前推
  extent?: number
  // 闭合类型 1 左开右闭 2 左闭右开 3 全开 4 全闭
  closeType?: 1 | 2 | 3 | 4
  // 数据列表
  data?: TimeAxisDate[]
  // 是否补全
  complement?: boolean
  // 默认选中第一个还是最后一个
  position?: 'start' | 'end'
  // 是否重复播放
  loop?: boolean
  // 播放间隔
  playInterval?: number
  // 是否暗色主题
  dark?: boolean
  // 是否显示控制按钮
  control?: boolean
  // 是否一直显示tooltip
  alwaysTooltip?: boolean
  // 自定义请求方法
  request?: (timeAxisItem: TimeAxisItem<any>) => Promise<any>
  // 缓存数据请求开始
  requestBefore?: () => void
  // 缓存数据请求结束
  requestFinished?: () => void
  // 缓存长度 用户当缓存多少条数据后启动播放
  requestLength?: number
  // 方块样式
  blockStyle?: TimeAxisBlockStyle
  // 刻度样式
  sliderStyle?: TimeAxisSliderStyle
  // 播放控件样式
  controlStyle?: TimeAxisControlStyle
  startPlay?: () =>void
}
