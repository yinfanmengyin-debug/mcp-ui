import type {
  MtChartAxisConfig,
  MtChartElement,
  MtChartFontConfig,
  MtChartFontOptions,
  MtChartYAxisConfig
} from '@/src/chart/type'
import { normalizeFontConfig } from '@/src/chart/utils'
// @ts-ignore
import IntervalScale from 'echarts/lib/scale/Interval'
import type { EChartsOption, LineSeriesOption, SeriesOption, YAXisComponentOption } from 'echarts/types/dist/echarts'
// @ts-ignore
import type { ScaleTick } from 'echarts/types/src/util/types'
import { groupBy } from 'lodash-es'

const base = {
  fontSize: 14
}

// 坐标轴名称样式
const nameTextStyle: Required<MtChartFontConfig> = {
  ...base,
  fontWeight: 'normal',
  fontFamily: 'sans-serif'
}

const axisLabelStyle = {
  ...base,
  fontWeight: 'normal',
  fontFamily: 'sans-serif'
}

const xAxis = {
  axisLabelMargin: 8,
  nameGap: 6
}
const yAxis = {
  axisLabelMargin: 8,
  // y轴名称与最大label之间的间距
  nameGap: 6
}
const dataZoom = {
  bottom: 10,
  height: 14
}

// 区域缩放组件两侧缩放手柄的 icon 形状
const handleIcon: string =
  'image://data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMyAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik03LjAxMDYyIDAuOTUyNzU5QzcuMjg2NzYgMC45NTI3NTkgNy41MTA2MiAxLjE3NjYyIDcuNTEwNjIgMS40NTI3NlYxMi40MTU2QzcuNTEwNjIgMTIuNjkxOCA3LjI4Njc2IDEyLjkxNTYgNy4wMTA2MiAxMi45MTU2QzYuNzM0NDggMTIuOTE1NiA2LjUxMDYyIDEyLjY5MTggNi41MTA2MiAxMi40MTU2VjEuNDUyNzZDNi41MTA2MiAxLjE3NjYyIDYuNzM0NDggMC45NTI3NTkgNy4wMTA2MiAwLjk1Mjc1OVoiIGZpbGw9IiM0MDdGRjkiLz4KPGNpcmNsZSBjeD0iNi45ODYyMSIgY3k9IjYuOTM0MTkiIHI9IjQiIGZpbGw9IiM0MDdGRjkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00LjYyNDE1IDguNDc5MTNDNC42MjQxNSA4LjIwMjk4IDQuODQ4IDcuOTc5MTMgNS4xMjQxNSA3Ljk3OTEzSDguODk3MDFDOS4xNzMxNSA3Ljk3OTEzIDkuMzk3MDEgOC4yMDI5OCA5LjM5NzAxIDguNDc5MTNDOS4zOTcwMSA4Ljc1NTI3IDkuMTczMTUgOC45NzkxMyA4Ljg5NzAxIDguOTc5MTNINS4xMjQxNUM0Ljg0OCA4Ljk3OTEzIDQuNjI0MTUgOC43NTUyNyA0LjYyNDE1IDguNDc5MTNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTQuNjI0MTUgNi43MTU2NEM0LjYyNDE1IDYuNDM5NDkgNC44NDggNi4yMTU2NCA1LjEyNDE1IDYuMjE1NjRIOC44OTcwMUM5LjE3MzE1IDYuMjE1NjQgOS4zOTcwMSA2LjQzOTQ5IDkuMzk3MDEgNi43MTU2NEM5LjM5NzAxIDYuOTkxNzggOS4xNzMxNSA3LjIxNTY0IDguODk3MDEgNy4yMTU2NEg1LjEyNDE1QzQuODQ4IDcuMjE1NjQgNC42MjQxNSA2Ljk5MTc4IDQuNjI0MTUgNi43MTU2NFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNC42MjQxNSA0Ljk1MjE1QzQuNjI0MTUgNC42NzYwMSA0Ljg0OCA0LjQ1MjE1IDUuMTI0MTUgNC40NTIxNUg4Ljg5NzAxQzkuMTczMTUgNC40NTIxNSA5LjM5NzAxIDQuNjc2MDEgOS4zOTcwMSA0Ljk1MjE1QzkuMzk3MDEgNS4yMjgyOSA5LjE3MzE1IDUuNDUyMTUgOC44OTcwMSA1LjQ1MjE1SDUuMTI0MTVDNC44NDggNS40NTIxNSA0LjYyNDE1IDUuMjI4MjkgNC42MjQxNSA0Ljk1MjE1WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg=='

export function chartOptions(
  categoryProp: string,
  xAxisConfig: MtChartAxisConfig,
  yAxisConfig: MtChartYAxisConfig[],
  seriesElements: MtChartElement[],
  list: Record<string, any>[],
  customSeries?: SeriesOption[] | ((list: Record<string, any>[]) => SeriesOption[]),
  categoryYearReg?: RegExp | boolean,
  fontOptions?: MtChartFontOptions
) {
  // 生成序列
  const series = seriesElements.map(item => {
    const data = item.prop ? list.map(t => t[item.prop]) : []
    const seriesProps = typeof item.seriesProps === 'function' ? item.seriesProps(data) : item.seriesProps ?? {}

    const option = {
      type: item.seriesType,
      name: item.name,
      data,
      yAxisIndex: item.yAxisIndex ?? 0,
      yAxisName: item.yAxisName,
      color: item.color,
      label: fontOptions?.graph,
      ...seriesProps
    } as SeriesOption & { yAxisName?: string; yAxisIndex?: number }

    if (option.type === 'line') {
      // 设置折线不显示标记
      Object.assign(option, {
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        smooth: false
      })
    } else if (option.type === 'bar') {
      // 设置柱状图最大宽度
      Object.assign(option, {
        barMaxWidth: 20
      })
    }

    return option
  })

  // 生成图例
  const legend = series
    .map(({ type, name }, index) => {
      const seriesElement = seriesElements[index]
      const showLegend = seriesElement.showLegend ?? true
      if (!showLegend) return
      let icon: string = 'rect'
      if (type === 'line') {
        const lineType = (series[index] as LineSeriesOption).lineStyle?.type
        if (lineType === 'dashed') {
          icon = 'path://M0,0H10V3H0Z M12,0H22V3H12Z M24,0H34V3H24Z M36,0H46V3H36Z'
        } else if (lineType === 'dotted') {
          icon = 'path://M0,0H2V1H0Z M4,0H6V1H4Z M8,0H10V1H8Z M12,0H14V1H12Z'
        } else {
          icon = 'path://M0,0L40,0L40,3L0,3Z'
        }
      }
      return {
        name,
        icon
      }
    })
    .filter(Boolean)

  // 自定义序列不会显示图例
  if (customSeries) {
    const tempSeries = typeof customSeries === 'function' ? customSeries(list) : customSeries
    series.push(...tempSeries)
  }

  const seriesGroup = groupBy(series, 'yAxisIndex')
  const sortedKeys = Object.keys(seriesGroup).sort()

  // 使用yAxisIndex分组后的数据集
  const dataSet = sortedKeys.reduce(
    (pre, cur) => {
      let index = Number(cur)
      // 设置数据集
      pre[index] = seriesGroup[cur].map(item => (item.data as number[]) ?? []).flat()
      return pre
    },
    {} as { [k: number]: number[] }
  )

  // y轴标签字体配置
  const yAxisLabelFontConfig = normalizeFontConfig(fontOptions?.yAxis?.label, axisLabelStyle)
  // 用于测量y轴名称文字宽高的画布上下文
  const yAxisLabelCtx = document.createElement('canvas')!.getContext('2d')!
  yAxisLabelCtx.font = `${yAxisLabelFontConfig.fontWeight} ${yAxisLabelFontConfig.fontSize}px ${yAxisLabelFontConfig.fontFamily}`
  const yLabelMaxWidth = sortedKeys.map(key => {
    // 计算y轴最大最小值
    let [yMin, yMax] = [Infinity, -Infinity]
    const allData = dataSet[Number(key)]
    allData.forEach(n => {
      if (n < yMin) yMin = n
      if (n > yMax) yMax = n
    })
    // 生成Y轴标签
    const yIntervalScale = new IntervalScale()
    yIntervalScale.setExtent(yMin ?? 0, yMax ?? 0)
    yIntervalScale.calcNiceExtent({} as any)
    const yLabels = yIntervalScale.getTicks().map((tick: ScaleTick) => tick.value)
    // 计算y轴标签最大宽度
    return yLabels.reduce((max: number, label: number) => {
      const width = yAxisLabelCtx.measureText(String(label)).width
      return width > max ? width : max
    }, 0)
  })

  // 重置序列索引(避免yAxisIndex不连续)
  sortedKeys.forEach((key, index) => {
    seriesGroup[key].forEach(item => {
      item.yAxisIndex = index
    })
  })

  // 重置y轴配置项: 将y轴配置项与序列进行关联
  yAxisConfig = sortedKeys.map(key => {
    const index = Number(key)
    const conf = yAxisConfig[index] ?? {}
    // 检查是否有y轴名称
    if (!conf?.name) {
      conf.name = seriesGroup[index].find(item => item.yAxisName)?.yAxisName ?? ''
    }
    return { ...conf }
  })
  // 如果y轴配置中没有任何一个在左侧, 则将第一个y轴设置为左侧
  if (yAxisConfig.length && yAxisConfig.every(item => item.position !== 'left')) {
    yAxisConfig[0].position = 'left'
  }

  // x轴名称字体配置
  const xAxisNameFontConfig = normalizeFontConfig(fontOptions?.xAxis?.name, nameTextStyle)
  // 用于测量y轴名称文字宽高的画布上下文
  const xAxisNameCtx = document.createElement('canvas')!.getContext('2d')!
  xAxisNameCtx.font = `${xAxisNameFontConfig.fontWeight} ${xAxisNameFontConfig.fontSize}px ${xAxisNameFontConfig.fontFamily}`

  // y轴名称字体配置
  const yAxisNameFontConfig = normalizeFontConfig(fontOptions?.yAxis?.name, nameTextStyle)
  // 用于测量y轴名称文字宽高的画布上下文
  const yAxisNameCtx = document.createElement('canvas')!.getContext('2d')!
  yAxisNameCtx.font = `${yAxisNameFontConfig.fontWeight} ${yAxisNameFontConfig.fontSize}px ${yAxisNameFontConfig.fontFamily}`
  const yAxisNameMetrics = yAxisNameCtx.measureText('统计表')
  // y轴名称文字高度
  const yAxisNameHeight = yAxisNameMetrics.actualBoundingBoxAscent + yAxisNameMetrics.actualBoundingBoxDescent

  /*
    1. 设置默认position 若未设置position, 除第一个y轴在左侧外, 其他y轴默认在右侧
    2. 设置offset为该轴位置所占用的宽度, 以便后续计算多个y轴的间距
   */
  yAxisConfig.forEach((item, index) => {
    if (!item.position) {
      item.position = index === 0 ? 'left' : 'right'
    }
    item.offset = yLabelMaxWidth[index] + yAxis.axisLabelMargin + yAxis.nameGap + yAxisNameHeight
  })
  const yAxisConfGroup = groupBy(yAxisConfig, 'position')

  // 多个y轴时, y轴之间的间距
  const yAxisGap = 10

  const gridLeft = (yAxisConfGroup['left']?.reduce((pre, cur) => pre + cur.offset! + yAxisGap, 0) ?? 0) + 10
  let gridRight = yAxis.nameGap + xAxisNameCtx.measureText(xAxisConfig.name!).width + 10
  // 有第二个y轴时，重新计算右侧边距
  if (yAxisConfGroup['right']) {
    const newGridRight = yAxisConfGroup['right'].reduce((pre, cur) => pre + cur.offset! + yAxisGap, 0) + 10
    gridRight = Math.max(gridRight, newGridRight)
  }

  // 生成y轴
  const yAxisList: YAXisComponentOption[] = Object.entries(yAxisConfGroup)
    .map(([_, yAxisConfigList]) => {
      return yAxisConfigList.map((conf: MtChartYAxisConfig, index: number, all: MtChartYAxisConfig[]) => {
        const nameGap = conf.offset! - yAxisNameHeight
        const offset = all.filter((_, idx) => idx < index).reduce((pre, cur) => pre + cur.offset! + yAxisGap, 0)
        return {
          position: conf.position,
          type: 'value',
          name: conf.name,
          nameLocation: 'middle',
          nameTextStyle: yAxisNameFontConfig,
          // FIXME 不知道为什么左边的nameGap会多3px
          nameGap: nameGap - (conf.position === 'left' ? 3 : 0),
          offset,
          axisTick: {
            show: true
          },
          axisLine: {
            show: true
          },
          axisLabel: {
            margin: yAxis.axisLabelMargin,
            interval: conf?.interval,
            rotate: conf?.rotate,
            ...yAxisLabelFontConfig
          },
          splitLine: {
            show: false
          },
          boundaryGap: [0, '10%']
        }
      })
    })
    .flat() as any[]

  let rotatedH = 0
  let rotatedW = 0
  const xAxisLabelRotate = xAxisConfig.rotate
  const xAxisData = list.map(item => item[categoryProp])

  // x轴标签字体配置
  const xAxisLabelFontConfig = normalizeFontConfig(fontOptions?.xAxis?.label, axisLabelStyle)
  // 用于测量x轴标签文字宽高的画布上下文
  const xAxisLabelCtx = document.createElement('canvas')!.getContext('2d')!
  xAxisLabelCtx.font = `${xAxisLabelFontConfig.fontWeight} ${xAxisLabelFontConfig.fontSize}px ${xAxisLabelFontConfig.fontFamily}`

  const xAxisLabelMetrics = xAxisLabelCtx.measureText('统计表')
  const xAxisLabelHeight = xAxisLabelMetrics.actualBoundingBoxAscent + xAxisLabelMetrics.actualBoundingBoxDescent

  // 若x轴的标签发生旋转, 则需要计算旋转后标签的高度和宽度
  if (xAxisLabelRotate) {
    let maxLabelWidth = 0
    const { actualBoundingBoxAscent, actualBoundingBoxDescent } = xAxisLabelCtx.measureText(xAxisData[0])
    const labelHeight = actualBoundingBoxAscent + actualBoundingBoxDescent
    xAxisData.forEach((item: string) => {
      const { width } = xAxisLabelCtx.measureText(item)
      if (width > maxLabelWidth) {
        maxLabelWidth = width
      }
    })
    // 计算旋转后产生的宽度和高度
    const rotate = (Math.abs(xAxisLabelRotate) * Math.PI) / 180
    rotatedH =
      Math.sin(rotate) * maxLabelWidth + Math.sin(((90 - Math.abs(xAxisLabelRotate)) * Math.PI) / 180) * labelHeight
    rotatedW = Math.cos(rotate) * maxLabelWidth
  }

  const options: EChartsOption = {
    legend: {
      left: 0,
      // 由于legend的left与right不能同时设置，所以这里使用padding来实现相同的效果
      padding: [5, 200, 5, gridLeft],
      textStyle: {
        ...{
          fontFamily: fontOptions?.legend?.fontFamily,
          fontSize: fontOptions?.legend?.fontSize,
          fontWeight: fontOptions?.legend?.fontWeight as any
        },
        rich: {
          a: {
            verticalAlign: 'bottom'
          }
        }
      },
      data: legend as any
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: 40,
      right: Math.max(gridRight, (xAxisLabelRotate ?? 0) < 0 ? rotatedW : 0),
      bottom: dataZoom.bottom + dataZoom.height + xAxis.axisLabelMargin + (rotatedH ? rotatedH : xAxisLabelHeight + 10),
      left: Math.max(gridLeft, (xAxisLabelRotate ?? 0) > 0 ? rotatedW : 0)
    },
    xAxis: {
      type: 'category',
      name: xAxisConfig.name,
      nameTextStyle: {
        ...xAxisNameFontConfig,
        verticalAlign: 'top',
        padding: [xAxis.axisLabelMargin, 0, 0, 0]
      },
      nameGap: xAxis.nameGap,
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {},
      axisLabel: {
        margin: xAxis.axisLabelMargin,
        formatter: categoryYearReg
          ? (() => {
              let curIdx = -1
              const years = new Map<string, number>()
              const reg = typeof categoryYearReg === 'boolean' ? /\d{4}年/ : categoryYearReg
              return (value: string, index: number) => {
                if (curIdx > index) years.clear()
                curIdx = index
                const res = value.match(reg)
                if (!res || !res[0]) return value
                let temp = value
                if (!years.has(res[0])) {
                  years.set(res[0], index)
                } else if (years.get(res[0]) !== index) {
                  temp = value.replace(res[0], '')
                }
                return temp.replace(/0(\d)(?=[月日-])/g, '$1')
              }
            })()
          : undefined,
        interval: xAxisConfig.interval,
        rotate: xAxisConfig.rotate,
        ...xAxisLabelFontConfig
      },
      data: xAxisData
    },
    yAxis: yAxisList.length ? yAxisList : {},
    dataZoom: [
      { type: 'inside' },
      {
        type: 'slider',
        // borderColor: '#AAAFBD',
        borderRadius: 0,
        backgroundColor: 'transparent',
        handleIcon,
        handleSize: dataZoom.height,
        handleStyle: {
          color: '#407FF9'
        },
        height: dataZoom.height,
        showDetail: false,
        brushSelect: false,
        bottom: dataZoom.bottom
      }
    ],
    series
  }

  return options
}
