// 字体大小选项
export const fontSizes = Array.from({ length: 30 - 12 }).map((_, index) => index + 12)

// 字体列表
export const fontList = [
  { value: 'sans-serif', label: '默认' },
  { value: 'SimSun', label: '宋体' },
  { value: 'FangSong', label: '仿宋' },
  { value: 'SimHei', label: '黑体' }
]

// 直线的线形选项
export const lineTypes = [
  { label: '直线', value: 'none' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
  { label: '带点直线', value: 'circle' }
]

// 是否显示选项
export const visibleTypes = [
  { label: '显示', value: true },
  { label: '隐藏', value: false }
]

// 线宽选项
export const lineWeights = [1, 2, 3, 4, 5, 6, 7, 8]

// 图例位置选项
export const legendPosition = [
  { label: '居左', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '居右', value: 'right' }
]

export const seriesTypes = [
  { label: '折线', value: 'line' },
  { label: '柱状', value: 'bar' }
]

// 折线图标签位置选项
export const lineLabelPosition = [
  { label: '居中', value: 'inside' },
  { label: '靠上', value: 'top' },
  { label: '靠下', value: 'bottom' },
  { label: '靠左', value: 'left' },
  { label: '靠右', value: 'right' }
]

// 柱状图标签位置选项
export const barLabelPosition = [
  { label: '居中', value: 'inside' },
  { label: '靠上', value: 'insideTop' },
  { label: '靠下', value: 'insideBottom' },
  { label: '顶部', value: 'top' }
]
