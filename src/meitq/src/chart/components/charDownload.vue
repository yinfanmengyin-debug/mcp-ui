<script lang="ts" setup>
import '../style/chartDownload.scss'
import { invisibleSymbol } from '../index'
import MtRadio from '../../radio/index.vue'
import MtSelection from '../../selection/index.vue'
import type {
  ECharts,
  EChartsOption,
  XAXisComponentOption,
  YAXisComponentOption,
  SeriesOption
} from 'echarts/types/dist/echarts'
import * as echarts from 'echarts'
import { onMounted, reactive, ref, shallowRef, watch, nextTick } from 'vue'
import {
  fontSizes,
  fontList,
  lineTypes,
  visibleTypes,
  lineWeights,
  legendPosition,
  seriesTypes,
  lineLabelPosition,
  barLabelPosition
} from './dict'
import type { MtChartFontOptions, MtChartGraphConfig } from '@/src/chart/type'
import { cloneDeep, debounce, merge, uniqueId } from 'lodash-es'
import { saveAs } from 'file-saver'

defineOptions({ name: 'MtChartDownload' })

const props = defineProps<{
  theme: string
  chartOption: EChartsOption
  chartTitle: string
  chartSubtitle?: string
  fontOptions?: MtChartFontOptions
  chartDownloadCustomFn?: (chart: ECharts) => void | Promise<void>
  // 在设置图表配置项后执行的回调函数
  afterSetOption?: (chart: ECharts, isDownload: boolean) => void
}>()

let chart: ECharts | undefined
const chartId = uniqueId('ChartDownload')

// 折叠面板所展示的面板名称
const activeNames = ref(['info'])

// 默认Y轴配置
const DEFAULT_YAXIS_CONF = {
  yAxisName: '',
  yAxisNameFontSize: props.fontOptions?.yAxis?.name?.fontSize ?? 12,
  yAxisNameFont: props.fontOptions?.yAxis?.name?.fontFamily ?? 'sans-serif',
  yAxisLabelFontSize: props.fontOptions?.yAxis?.label?.fontSize ?? 12,
  yAxisLabelFont: props.fontOptions?.yAxis?.label?.fontFamily ?? 'sans-serif',
  yAxisGap: undefined,
  yAxisLabelRotate: undefined,
  yAxisMinValue: undefined,
  yAxisMaxValue: undefined,
  // Y轴次刻度是否显示
  yAxisMinorTickVisible: false,
  // Y轴次刻度线分割数
  yAxisMinorTickSplitNumber: 5
}

const form = reactive({
  // 一级标题
  firstTitle: '',
  firstTitleFont: props.fontOptions?.title?.fontFamily ?? 'sans-serif',
  firstTitleFontSize: props.fontOptions?.title?.fontSize ?? 16,
  // 二级标题
  secondTitle: '',
  secondTitleFont: props.fontOptions?.subtitle?.fontFamily ?? 'sans-serif',
  secondTitleFontSize: props.fontOptions?.subtitle?.fontSize ?? 14,
  // 发布时间
  releaseTime: '',
  releaseTimeFont: props.fontOptions?.subtitle?.fontFamily ?? 'sans-serif',
  releaseTimeFontSize: props.fontOptions?.subtitle?.fontSize ?? 14,
  // X轴
  xAxisName: '',
  xAxisNameFontSize: props.fontOptions?.xAxis?.name?.fontSize ?? 12,
  xAxisNameFont: props.fontOptions?.xAxis?.name?.fontFamily ?? 'sans-serif',
  xAxisLabelFontSize: props.fontOptions?.xAxis?.label?.fontSize ?? 12,
  xAxisLabelFont: props.fontOptions?.xAxis?.label?.fontFamily ?? 'sans-serif',
  xAxisGap: undefined as number | undefined,
  xAxisLabelRotate: undefined as number | undefined,
  xAxisMinValue: '',
  xAxisMaxValue: '',
  // Y轴
  yAxisConf: [{ ...DEFAULT_YAXIS_CONF }],
  // 图例位置
  legendPosition: 'center',
  //  图例显隐
  legendVisible: true,
  // 图例字号
  legendFontSize: props.fontOptions?.legend?.fontSize ?? 12,
  // 图例字体
  legendFont: props.fontOptions?.legend?.fontFamily ?? 'sans-serif'
})

// // 图形配置
const graphs = ref<MtChartGraphConfig[]>([])
// x轴起始值/结束值选项列表
const xAxisOptions = shallowRef<string[]>([])
// 是否失去焦点
const isBlur = ref(false)

watch(
  () => props.chartOption,
  (option: EChartsOption) => {
    if (!option) return
    const xAxis = option.xAxis as XAXisComponentOption[]
    const yAxis = option.yAxis as YAXisComponentOption[]
    const series = option.series as SeriesOption[]
    const xAxisOps = ((xAxis[0] as any).data ?? []).map((item: number) => String(item))
    xAxisOptions.value = xAxisOps
    form.xAxisMinValue = xAxisOps[0]
    form.xAxisMaxValue = xAxisOps[xAxisOps.length - 1]
    form.xAxisName = xAxis[0]?.name ?? ''
    // @ts-ignore
    form.xAxisGap = xAxis[0]?.axisLabel?.interval
    form.xAxisLabelRotate = xAxis[0]?.axisLabel?.rotate

    form.yAxisConf = yAxis.map(item => ({
      ...DEFAULT_YAXIS_CONF,
      yAxisName: item.name ?? '',
      yAxisNameGap: item.nameGap ?? 0
    }))
    const seriesOptions = series ?? []
    form.firstTitle = props.chartTitle || ''
    form.secondTitle = props.chartSubtitle || ''

    // 根据 统计图的系列配置 初始化图形配置列表
    graphs.value = seriesOptions
      .filter(({ type }: any) => ['line', 'bar'].includes(type))
      .map((item: any) => {
        let barWidth = 5
        // 柱状图的宽度自适应
        if (item.data && item.data.length) {
          barWidth = Math.floor(
            ((700 - (yAxis[item.yAxisIndex ?? 0]?.nameGap ?? 0) - 80) / item?.data?.length - 5) / seriesOptions.length
          )
          if (barWidth < 1) {
            barWidth = 1
          } else if (barWidth > 20) {
            barWidth = 20
          }
        }
        let lineSymbol: 'dotted' | 'dashed' | 'circle' | 'none' = 'none'
        if (['dashed', 'dotted'].includes(item.lineStyle?.type)) {
          lineSymbol = item.lineStyle.type
        } else if (item.showSymbol) {
          lineSymbol = 'circle'
        }
        return {
          name: item.name,
          type: item.type,
          lineSymbol,
          lineWidth: item.lineStyle?.width ?? 2,
          lineColor: undefined,
          barWidth,
          barColor: undefined,
          visible: true,
          disabled: !item?.data?.every((item: any) => item !== null && item !== undefined),
          labelVisible: false,
          labelFontSize: props.fontOptions?.graph?.fontSize ?? 12,
          labelFontFamily: props.fontOptions?.graph?.fontFamily ?? 'sans-serif',
          lineLabelPosition: 'inside',
          barLabelPosition: 'inside'
        }
      })
  },
  { immediate: true }
)

watch(
  [() => form, graphs, isBlur],
  debounce(() => {
    if (isBlur.value) return
    draw()
  }, 100),
  { deep: true }
)

onMounted(() => {
  chart = echarts.init(document.getElementById(chartId)!)
  draw()
})

async function draw() {
  await nextTick()
  if (!chart) return
  // 图表的原始配置
  const sourceOption = cloneDeep(props.chartOption) as any
  const title = []
  const titleColor = props.theme === 'light' ? '#333' : '#fff'
  let top = 0
  const { firstTitle, firstTitleFontSize, firstTitleFont, legendFontSize, legendFont, legendVisible } = form
  let size = firstTitleFontSize ?? 20
  title.push({
    text: firstTitle,
    show: !!firstTitle,
    textAlign: 'center',
    left: '50%',
    textStyle: {
      color: titleColor,
      fontSize: size,
      lineHeight: size,
      fontFamily: firstTitleFont,
      fontWeight: props.fontOptions?.title?.fontWeight
    }
  })
  if (firstTitle) top += size + 10

  const { secondTitle, secondTitleFontSize, secondTitleFont } = form
  size = secondTitleFontSize ?? 18
  title.push({
    text: secondTitle,
    show: !!secondTitle,
    textAlign: 'center',
    top,
    left: '50%',
    textStyle: {
      color: titleColor,
      fontSize: size,
      lineHeight: size,
      fontFamily: secondTitleFont,
      fontWeight: props.fontOptions?.subtitle?.fontWeight
    }
  })
  if (secondTitle) top += size + 10

  const { releaseTime, releaseTimeFontSize, releaseTimeFont } = form
  size = releaseTimeFontSize ?? 14
  title.push({
    text: releaseTime ? `发布时间：${releaseTime}` : '',
    show: !!releaseTime,
    top,
    left: '65%',
    textStyle: {
      color: titleColor,
      fontSize: size,
      lineHeight: size,
      fontFamily: releaseTimeFont,
      fontWeight: props.fontOptions?.subtitle?.fontWeight
    }
  })
  if (releaseTime) top += size + 10

  const legendData: any[] = []
  // 图形配置
  if (legendVisible) {
    graphs.value.forEach((graph, index) => {
      const item = sourceOption.series[index]
      if (graph.type === 'line') {
        sourceOption.series[index] = merge(item, {
          name: graph.name,
          type: 'line',
          // 点线、虚线和直线需要一个看不见的symbol才能显示label, 否则label仅在鼠标移入才能显示
          symbol: {
            none: invisibleSymbol,
            circle: 'circle',
            dashed: invisibleSymbol,
            dotted: invisibleSymbol
          }[graph.lineSymbol],
          symbolSize: 6,
          showSymbol: true,
          smooth: item.smooth ?? true,
          itemStyle: {
            color: graph.lineColor
          },
          label: {
            show: graph.labelVisible,
            position: graph.lineLabelPosition,
            fontSize: graph.labelFontSize,
            fontFamily: graph.labelFontFamily,
            fontWeight: props.fontOptions?.graph?.fontWeight
          },
          lineStyle: {
            width: graph.lineWidth,
            type: {
              none: 'solid',
              circle: 'solid',
              dashed: 'dashed',
              dotted: 'dotted'
            }[graph.lineSymbol]
          }
        })
        if (graph.visible) {
          legendData.push({
            name: graph.name,
            textStyle: {
              fontSize: legendFontSize,
              fontFamily: legendFont
            },
            // 线的类型不同对应图例中的icon不同
            icon: {
              none: 'path://M0,0L40,0L40,3L0,3Z',
              circle: 'inherit',
              dashed: 'path://M0,0H10V3H0Z M12,0H22V3H12Z M24,0H34V3H24Z M36,0H46V3H36Z',
              dotted: 'path://M0,0H2V1H0Z M4,0H6V1H4Z M8,0H10V1H8Z M12,0H14V1H12Z'
            }[graph.lineSymbol]
          })
        }
      } else {
        sourceOption.series[index] = merge(item, {
          name: graph.name,
          type: 'bar',
          barWidth: graph.barWidth,
          label: {
            show: graph.labelVisible,
            position: graph.barLabelPosition,
            fontSize: graph.labelFontSize,
            fontFamily: graph.labelFontFamily,
            fontWeight: props.fontOptions?.graph?.fontWeight
          },
          itemStyle: {
            color: graph.barColor
          }
        })
        if (graph.visible) {
          legendData.push({
            name: graph.name,
            textStyle: {
              fontSize: legendFontSize,
              fontFamily: legendFont
            },
            icon: 'rect'
          })
        }
      }
    })
  }

  const {
    xAxisName,
    xAxisNameFontSize,
    xAxisNameFont,
    xAxisLabelFontSize,
    xAxisLabelFont,
    xAxisGap,
    xAxisLabelRotate,
    xAxisMinValue,
    xAxisMaxValue,
    yAxisConf
  } = form
  const {
    grid: [sourceGrid],
    xAxis: [{ data: xAxisData }]
  } = sourceOption
  const legendPadding = [5, sourceGrid.right, 5, sourceGrid.left]
  const legend = {
    left: { left: 0, padding: legendPadding },
    center: { left: 'center', padding: legendPadding },
    right: { left: 'right', padding: legendPadding }
  }[form.legendPosition]
  let isCustomAxis = false

  let rotatedH = 0
  let rotatedW = 0
  // 若x轴的标签发生旋转, 则需要计算旋转后标签的高度和宽度
  if (xAxisLabelRotate) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    ctx.font = `${xAxisLabelFontSize}px ${xAxisLabelFont}`
    let maxLabelWidth = 0
    const { actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(xAxisData[0])
    const labelHeight = actualBoundingBoxAscent + actualBoundingBoxDescent
    xAxisData.forEach((item: string) => {
      const { width } = ctx.measureText(item)
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

  const option = merge(sourceOption, {
    title,
    grid: [
      {
        top: top + 40,
        right: Math.max(sourceGrid.right, (xAxisLabelRotate ?? 0) < 0 ? rotatedW : 0),
        bottom: Math.max(20, rotatedH + 10),
        left: Math.max(sourceGrid.left, (xAxisLabelRotate ?? 0) > 0 ? rotatedW : 0)
      }
    ],
    legend: [{ top, ...legend, textStyle: props.fontOptions?.legend }],
    xAxis: sourceOption.xAxis.map(() => ({
      name: isCustomAxis ? '' : xAxisName,
      nameTextStyle: {
        fontSize: xAxisNameFontSize,
        fontFamily: xAxisNameFont,
        fontWeight: props.fontOptions?.xAxis?.name?.fontWeight
      },
      min: xAxisMinValue,
      max: xAxisMaxValue,
      axisLabel: {
        interval: xAxisGap,
        fontFamily: xAxisLabelFont,
        fontSize: xAxisLabelFontSize,
        fontWeight: props.fontOptions?.xAxis?.label?.fontWeight,
        rotate: xAxisLabelRotate
      }
    })),
    yAxis: sourceOption.yAxis.map((_: any, index: number) => {
      const {
        yAxisName,
        yAxisNameFont,
        yAxisNameFontSize,
        yAxisMinValue,
        yAxisMaxValue,
        yAxisGap,
        yAxisLabelFont,
        yAxisLabelFontSize,
        yAxisLabelRotate,
        yAxisMinorTickVisible,
        yAxisMinorTickSplitNumber
      } = yAxisConf[index]
      return {
        name: yAxisName.length ? yAxisName : undefined,
        nameTextStyle: {
          fontSize: yAxisNameFontSize,
          fontFamily: yAxisNameFont,
          fontWeight: props.fontOptions?.yAxis?.name?.fontWeight
        },
        min: yAxisMinValue,
        max: yAxisMaxValue,
        interval: yAxisGap,
        axisLabel: {
          fontFamily: yAxisLabelFont,
          fontSize: yAxisLabelFontSize,
          rotate: yAxisLabelRotate,
          fontWeight: props.fontOptions?.yAxis?.label?.fontWeight
        },
        minorTick: {
          show: yAxisMinorTickVisible,
          splitNumber: yAxisMinorTickSplitNumber ?? 5
        }
      }
    })
  })
  option.dataZoom = []

  // 此处过滤需要考虑 series的数量大于graphs的数量 因为series中包含"custom"而graphs中没有
  // 所以graphs[index]?.visible并不一定是true或false 还有可能是undefined
  option.series = sourceOption.series.filter((_: any, index: number) => graphs.value[index]?.visible !== false)
  option.legend[0].data = legendData

  // 若图例为可滚动翻页的图例时, 在下载组件中需全部展示则需将图例修改为普通图例
  if (option.legend[0].type === 'scroll') {
    option.legend[0].type = 'plain'

    await new Promise(resolve => {
      const chartEl = document.getElementById(chartId)!
      const chartElStyle = getComputedStyle(chartEl)

      const tempEl = document.createElement('div')
      tempEl.style.width = chartElStyle.width
      tempEl.style.height = chartElStyle.height
      const tempChart = echarts.init(tempEl) as any
      // 通过临时绘制chart来获取绘制后的legend的实际高度
      tempChart.on('finished', () => {
        const componentModel = tempChart.getModel().getComponent('legend')
        // 获取图例组件视图
        const componentView = tempChart.getViewOfComponentModel(componentModel)
        // 获取图例的包围盒信息
        const rect = componentView.group.getBoundingRect()
        // 此处的10为legend与grid的间距
        option.grid[0].top = top + 10 + rect.height
        resolve(void 0)
      })
      tempChart.setOption(cloneDeep(option), { replaceMerge: ['legend'] })
    })
  }
  chart!.setOption(option, { notMerge: true })
  props.afterSetOption?.(chart!, true)
}

// 下载
function download() {
  if (props.chartDownloadCustomFn) {
    props.chartDownloadCustomFn(chart!)
    return
  }
  let backgroundColor = chart?.getOption()?.backgroundColor
  backgroundColor = typeof backgroundColor === 'string' ? backgroundColor : props.theme === 'light' ? '#fff' : '#000'
  const url = chart!.getDataURL({ backgroundColor })
  saveAs(url, `${props.chartTitle || '统计图'}.png`)
}
</script>

<template>
  <div class="mt-chart-download">
    <div class="chart-config">
      <el-collapse v-model="activeNames">
        <el-collapse-item name="info" title="图片信息">
          <el-form :model="form" label-width="80px" size="small">
            <el-form-item label="一级标题">
              <el-input v-model="form.firstTitle" placeholder="请输入内容" size="small" />
              <MtSelection v-model="form.firstTitleFontSize" :list="fontSizes" size="small" />
            </el-form-item>
            <el-form-item label-width="0">
              <MtRadio v-model="form.firstTitleFont" :list="fontList" />
            </el-form-item>
            <el-form-item label="二级标题">
              <el-input v-model="form.secondTitle" placeholder="请输入内容" size="small" />
              <MtSelection v-model="form.secondTitleFontSize" :list="fontSizes" size="small" />
            </el-form-item>
            <el-form-item label-width="0">
              <MtRadio v-model="form.secondTitleFont" :list="fontList" />
            </el-form-item>
            <el-form-item label="发布时间">
              <el-input v-model="form.releaseTime" placeholder="请输入内容" size="small" />
              <MtSelection v-model="form.releaseTimeFontSize" :list="fontSizes" size="small" />
            </el-form-item>
            <el-form-item label-width="0">
              <MtRadio v-model="form.releaseTimeFont" :list="fontList" size="small" />
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item name="xAxis" title="X轴">
          <el-form :model="form" label-width="80px">
            <el-form-item label="名称">
              <el-input v-model="form.xAxisName" placeholder="请输入内容" size="small" />
              <MtSelection v-model="form.xAxisNameFontSize" :list="fontSizes" size="small" />
            </el-form-item>
            <el-form-item label-width="0">
              <MtRadio v-model="form.xAxisNameFont" :list="fontList" size="small" />
            </el-form-item>
            <el-form-item label="标签">
              字号
              <MtSelection v-model="form.xAxisLabelFontSize" :list="fontSizes" size="small" />
            </el-form-item>
            <el-form-item label-width="0">
              <MtRadio v-model="form.xAxisLabelFont" :list="fontList" size="small" />
            </el-form-item>
            <el-form-item label="间隔">
              <el-input-number
                v-model="form.xAxisGap"
                :controls="false"
                :min="0"
                placeholder="默认自适应"
                size="small"
              />
            </el-form-item>
            <el-form-item label="标签角度">
              <el-input-number
                v-model="form.xAxisLabelRotate"
                :controls="false"
                :max="90"
                :min="-90"
                placeholder="可设置-90度到90度"
                size="small"
              />
            </el-form-item>
            <el-form-item label="起始值">
              <MtSelection v-model="form.xAxisMinValue" :list="xAxisOptions" class="full-width" size="small" />
            </el-form-item>
            <el-form-item label="结束值">
              <MtSelection v-model="form.xAxisMaxValue" :list="xAxisOptions" class="full-width" size="small" />
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item
          v-for="(_, index) in form.yAxisConf"
          :key="index"
          :title="`Y轴${form.yAxisConf.length > 1 ? index + 1 : ''}`"
          name="yAxis"
        >
          <el-form :model="form" label-width="80px">
            <el-form-item label="名称">
              <el-input v-model="form.yAxisConf[index].yAxisName" placeholder="请输入内容" size="small" />
              <MtSelection v-model="form.yAxisConf[index].yAxisNameFontSize" :list="fontSizes" size="small" />
            </el-form-item>
            <el-form-item label-width="0">
              <MtRadio v-model="form.yAxisConf[index].yAxisNameFont" :list="fontList" size="small" />
            </el-form-item>
            <el-form-item label="标签">
              字号
              <MtSelection v-model="form.yAxisConf[index].yAxisLabelFontSize" :list="fontSizes" size="small" />
            </el-form-item>
            <el-form-item label-width="0">
              <MtRadio v-model="form.yAxisConf[index].yAxisLabelFont" :list="fontList" size="small" />
            </el-form-item>
            <el-form-item label="间隔">
              <el-input-number
                v-model="form.yAxisConf[index].yAxisGap"
                :controls="false"
                placeholder="默认自适应"
                size="small"
              />
            </el-form-item>
            <el-form-item label="标签角度">
              <el-input-number
                v-model="form.yAxisConf[index].yAxisLabelRotate"
                :controls="false"
                :max="90"
                :min="-90"
                placeholder="可设置-90度到90度"
                size="small"
              />
            </el-form-item>
            <el-form-item label="起始值">
              <el-input-number
                v-model="form.yAxisConf[index].yAxisMinValue"
                :controls="false"
                placeholder="默认自适应"
                size="small"
              />
            </el-form-item>
            <el-form-item label="结束值">
              <el-input-number
                v-model="form.yAxisConf[index].yAxisMaxValue"
                :controls="false"
                placeholder="默认自适应"
                size="small"
              />
            </el-form-item>
            <el-form-item class="align-item-start" label="次刻度">
              <div class="block">
                <MtRadio v-model="form.yAxisConf[index].yAxisMinorTickVisible" :list="visibleTypes" size="small" />
              </div>
              <div class="block">
                分段数
                <el-input-number
                  v-model="form.yAxisConf[index].yAxisMinorTickSplitNumber"
                  :controls="false"
                  :max="10"
                  :min="1"
                  class="split-number"
                  size="small"
                />
              </div>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item name="graph" title="图形">
          <el-form class="graph-form" label-width="80px">
            <el-form-item label="图例">
              <div class="block">
                <MtRadio v-model="form.legendPosition" :list="legendPosition" size="small" />
              </div>
            </el-form-item>
            <div class="legend-list-name">
              <div v-for="(item, index) in graphs" :key="index" class="legend-block">
                <label>图例{{ index + 1 }}名称：</label>
                <el-input v-model="item.name" size="small" @focus="isBlur = true" @blur="isBlur = false"></el-input>
              </div>
              <div class="legend-block">
                <label>字号：</label>
                <MtSelection
                  v-model="form.legendFontSize"
                  :list="fontSizes"
                  class="label-font-size-selection"
                  size="small"
                />
              </div>
              <div class="legend-block">
                <MtRadio v-model="form.legendFont" :list="fontList" size="small" />
              </div>
              <div class="legend-block">
                <label>状态：</label>
                <MtRadio v-model="form.legendVisible" :list="visibleTypes" size="small" />
              </div>
            </div>
            <template v-for="(graph, index) in graphs" :key="index">
              <el-form-item :class="{ 'align-item-start': true, disabled: graph.disabled }" :label="graph.name">
                <div class="block">
                  形状
                  <MtRadio v-model="graph.type" :disabled="graph.disabled" :list="seriesTypes" size="small" />
                </div>
                <template v-if="graph.type === 'line'">
                  <div class="block">
                    样式
                    <MtSelection v-model="graph.lineSymbol" :disabled="graph.disabled" :list="lineTypes" size="small" />
                  </div>
                  <div class="block">
                    粗细
                    <MtSelection
                      v-model="graph.lineWidth"
                      :disabled="graph.disabled"
                      :list="lineWeights"
                      size="small"
                    />
                  </div>
                  <div class="block">
                    颜色
                    <el-color-picker v-model="graph.lineColor" :disabled="graph.disabled" size="small" />
                  </div>
                </template>
                <template v-else>
                  <div class="block">
                    宽度
                    <el-input-number
                      v-model="graph.barWidth"
                      :controls="false"
                      :disabled="graph.disabled"
                      size="small"
                    />
                  </div>
                  <div class="block">
                    颜色
                    <el-color-picker v-model="graph.barColor" :disabled="graph.disabled" size="small" />
                  </div>
                </template>
                <div class="block">
                  状态
                  <MtRadio v-model="graph.visible" :disabled="graph.disabled" :list="visibleTypes" size="small" />
                </div>
              </el-form-item>
              <el-form-item
                :class="{ 'align-item-start': true, disabled: graph.disabled, 'no-border': true }"
                label="数值标签"
              >
                <div class="block">
                  <MtRadio v-model="graph.labelVisible" :disabled="graph.disabled" :list="visibleTypes" size="small" />
                  <MtSelection
                    v-model="graph.labelFontSize"
                    :disabled="graph.disabled"
                    :list="fontSizes"
                    class="label-font-size-selection"
                    size="small"
                  />
                </div>
              </el-form-item>
              <el-form-item :class="{ disabled: graph.disabled }" label-width="0">
                <MtRadio v-model="graph.labelFontFamily" :disabled="graph.disabled" :list="fontList" />
              </el-form-item>
              <el-form-item class="no-border" label="数值位置" />
              <el-form-item :class="{ disabled: graph.disabled }" label-width="0">
                <template v-if="graph.type === 'line'">
                  <MtRadio
                    v-model="graph.lineLabelPosition"
                    :disabled="graph.disabled"
                    :list="lineLabelPosition"
                    size="small"
                  />
                </template>
                <template v-else>
                  <MtRadio
                    v-model="graph.barLabelPosition"
                    :disabled="graph.disabled"
                    :list="barLabelPosition"
                    size="small"
                  />
                </template>
              </el-form-item>
            </template>
          </el-form>
        </el-collapse-item>
      </el-collapse>
      <div class="download-box">
        <el-button type="primary" @click="download"> 下载</el-button>
      </div>
    </div>
    <div class="chart-container">
      <div :id="chartId" class="chart-image" />
    </div>
  </div>
</template>
