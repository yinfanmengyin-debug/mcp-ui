import type { ECharts, EChartsOption, SeriesOption } from 'echarts/types/dist/echarts'
import type { ZRFontWeight } from 'echarts/types/src/util/types'

export type LineOrBarSeries = 'line' | 'bar'

export interface ChartInjectOptions {
  theme?: 'light' | 'dark'
  fontOptions?(isDownload: boolean): MtChartFontOptions | undefined
}

export type MtChartFontFamily = 'sans-serif' | 'SimSun' | 'FangSong' | 'SimHei' | string

// 图表字体配置
export interface MtChartFontConfig {
  // 字体大小
  fontSize?: number
  // 字体粗细
  fontWeight?: ZRFontWeight
  // 字体系列
  fontFamily?: MtChartFontFamily
}

// 图表坐标轴字体配置
export interface MtChartAxisFontConfig {
  // 坐标轴名称字体配置
  name: MtChartFontConfig
  // 坐标轴标签字体配置
  label: MtChartFontConfig
}

// 图表字体配置项
export interface MtChartFontOptions {
  // 标题字体配置
  title?: MtChartFontConfig
  // 副标题字体配置
  subtitle?: MtChartFontConfig
  // x轴字体配置
  xAxis?: MtChartAxisFontConfig
  // y轴字体配置
  yAxis?: MtChartAxisFontConfig
  // 图例字体配置
  legend?: MtChartFontConfig
  // 图形(series label)的字体配置
  graph?: MtChartFontConfig
}

export interface MtChartElement {
  // 要素名称
  name: string
  // 数据项key
  prop: string
  // y轴名称
  yAxisName?: string
  // y轴索引
  yAxisIndex?: number
  // 数据序列的类型（不指定则使用props中的seriesType）
  seriesType?: 'line' | 'bar' | 'heatmap'
  // 是否固定数据序列的类型（设置该序列显示类型不随图形类型切换改变）
  fixedSeriesType?: boolean
  // 系列的配置项（会覆盖默认配置）
  seriesProps?: SeriesOption | ((data: number[]) => SeriesOption)
  // 序列的颜色
  color?: string
  // 数据排序方法
  dataSort?: (list: any, sortType: 'asc' | 'desc') => any[]
  // 是否显示该系列的图例
  showLegend?: boolean
}

// 工具栏类型
export type MtChartToolbarType =
  | 'fullscreen'
  | 'sort'
  | 'lineChart'
  | 'barChart'
  | 'downloadImage'
  | 'downloadData'
  | 'reset'
  | 'heatChart'

export interface MtChartExtraToolbarItem {
  // 图标名称 (也用于触发点击事件)
  name: string
  // 图标提示
  title?: string
  // 图标名称（可以是HTML、iconfont图标类名、svg）
  icon: any
  // 插入索引图标的位置，不传默认添加到最后
  index?: number
}

export interface MtChartAxisConfig {
  name?: string
  interval?: number
  rotate?: number
  offset?: number
}

export interface MtChartYAxisConfig extends MtChartAxisConfig {
  position?: 'left' | 'right'
}

export interface MtChartProps<T = Record<string, any>> {
  // 图表主题 (默认light)
  theme?: 'light' | 'dark'
  // 图表名称 (不仅用于展示标题, 也用作下载图片或数据的文件名)
  title?: string
  // 图表副标题 (不仅用于展示副标题, 也会包含在下载图片或数据的文件名中)
  subtitle?: string
  // 是否显示标题 默认 true
  showTitle?: boolean
  // 统计要素列表
  elements?: MtChartElement[]
  // 数据列表
  list?: T[]
  // 是否对要素选项进行多选
  multiple?: boolean
  // 默认选中的要素项列表
  defaultChecked?: string[]
  // 需要固定显示的要素项列表
  fixedElements?: MtChartElement[] | ((elements: string[]) => MtChartElement[])
  // 类目轴数据key
  categoryProp?: keyof T
  /**
   * 类目轴为日期时, 匹配其中年份的正则<br>
   * 设置为`true`默认使用 `/\d{4}年/` 来匹配日期中的年份<br>
   * 仅在需要对类目轴显示日期进行年份优化时设置, 设置此项则类目轴中相同年份日期仅显示第一个日期的年份 <br>
   *
   * *注意: 仅当类目轴为日期时才设置*
   *
   * 例如: 2020年1月1日, 2020年1月2日, 2020年1月3日 <br>
   * 显示: 2020年1月1日, 1月2日, 1月3日
   */
  categoryYearReg?: RegExp | boolean
  // 选中要素项的图表序列的默认展示形式
  seriesType?: 'line' | 'bar'
  /**
   * x轴名称
   * @deprecated 请使用`xAXisConfig`进行配置
   */
  xAxisName?: string
  /**
   * x轴名称
   * @deprecated 请使用`yAXisConfig`进行配置
   */
  yAxisName?: string | string[]
  /**
   * x轴配置
   * @since 1.0.43
   */
  xAxisConfig?: string | MtChartAxisConfig
  /**
   * y轴配置 (1.0.43仅支持双Y轴, 1.0.52开始支持多Y轴)
   * @since 1.0.43
   */
  yAxisConfig?: string | string[] | MtChartYAxisConfig | MtChartYAxisConfig[]
  // 是否显示统计要素下拉选 默认 false
  showElementSelect?: boolean
  // 下拉框名称 默认 '统计要素'
  elementSelectLabel?: string
  // 下拉框位置 默认 'afterTitle'
  elementSelectLocation?: 'beforeTitle' | 'afterTitle'
  // 是否显示工具栏
  showToolbar?: boolean
  // 需要排除的工具栏按钮
  excludeToolbar?: MtChartToolbarType[]
  // 用于覆盖默认图表配置
  options?: EChartsOption | ((elements: string[], theme: 'light' | 'dark') => EChartsOption)
  // 自定义序列 (自定义序列不会显示图例)
  customSeries?: SeriesOption[] | ((list: T[]) => SeriesOption[])
  /**
   * 在设置图表配置项后执行的回调函数
   * @param chart {ECharts} 图表实例
   * @param isDownload {boolean} 是否是在图片下载组件内被调用
   */
  afterSetOption?: (chart: ECharts, isDownload: boolean) => void
  // 全屏时的目标元素的选择器 默认 'body'
  fullscreenTarget?: string
  // 全屏时的padding 必须带单位 如 '10px' '10px 20px' 默认 '20px'
  fullscreenPadding?: string
  // 下载图片的回调函数 传递该函数后则不会触发默认下载图片
  downloadImage?: () => void | Promise<void>
  // 下载数据的回调函数 传递该函数后则不会触发默认下载数据
  downloadData?: () => void | Promise<void>
  // 下载图片弹窗的自定义下载实现 (点击下载图片弹窗中的"下载"按钮后调用该函数)
  chartDownloadCustomFn?: (chart: ECharts) => void | Promise<void>
  // 下载图片弹窗的图形列表中展示已在页面上隐藏的序列 默认 true
  showHiddenSeries?: boolean
  // 额外工具栏图标
  extraToolbars?: MtChartExtraToolbarItem[]
}

// 居中 | 靠上 | 靠下 | 靠左 | 靠右
export type MtChartGraphLineLabelPosition = 'inside' | 'top' | 'bottom' | 'left' | 'right'

// 居中 / 靠上 | 靠下 | 顶部
export type MtChartGraphBarLabelPosition = 'inside' | 'insideTop' | 'insideBottom' | 'top'

// 下载图片中的配置项
export interface MtChartGraphConfig {
  name: string
  type: LineOrBarSeries
  lineSymbol: 'dotted' | 'dashed' | 'circle' | 'none'
  lineWidth: number
  lineColor?: string
  barWidth: number
  barColor?: string
  visible: boolean
  disabled: boolean
  labelVisible: boolean
  labelFontSize: number
  labelFontFamily: string
  lineLabelPosition: MtChartGraphLineLabelPosition
  barLabelPosition: MtChartGraphBarLabelPosition
}
