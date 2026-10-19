<script lang="ts" setup>
import './style/index.scss'
import { chartInjectionKey } from '@/src/configProvider/keys'
import type { MtChartAxisConfig, MtChartElement, MtChartProps, MtChartYAxisConfig } from './type'
import SortIcon from './icons/sortIcon.vue'
import SortAscIcon from './icons/sortAscIcon.vue'
import SortDescIcon from './icons/sortDescIcon.vue'
import FullScreenIcon from './icons/fullScreenIcon.vue'
import LineChartIcon from './icons/lineChartIcon.vue'
import BarChartIcon from './icons/barChartIcon.vue'
import DownloadImageIcon from './icons/downloadImageIcon.vue'
import DownloadDataIcon from './icons/downloadDataIcon.vue'
import ResetIcon from './icons/resetIcon.vue'
import { computed, h, inject, onBeforeUnmount, onMounted, reactive, ref, shallowReactive, watch } from 'vue'
import { debounce, merge, uniqueId } from 'lodash-es'
import type { ECharts, EChartsOption } from 'echarts/types/dist/echarts'
import * as echarts from 'echarts'
import MtSelection from '@/src/selection'
import MtFormItem from '@/src/formItem'
import { chartOptions } from '@/src/chart/options'
import { ElForm, ElPopover } from 'element-plus'
import 'element-plus/es/components/form/style/css'
import 'element-plus/es/components/popover/style/css'
import MtRadio from '../radio/index.vue'
import MtChartDownload from './components/charDownload.vue'
import { utils, writeFile } from 'xlsx'
import { useFullscreen } from '@/hooks/useFullscreen'
import { useResizeObserver } from '@vueuse/core'
import { saveAs } from 'file-saver'

defineOptions({ name: 'MtChart' })
const props = withDefaults(defineProps<MtChartProps>(), {
  theme: 'light',
  title: '',
  subtitle: '',
  showTitle: true,
  elements: () => [],
  list: () => [],
  multiple: false,
  defaultChecked: () => [],
  fixedElements: () => [],
  categoryProp: '',
  categoryYearReg: false,
  seriesType: 'line',
  xAxisName: '',
  yAxisName: '',
  xAxisConfig: undefined,
  yAxisConfig: undefined,
  showElementSelect: false,
  elementSelectLabel: '统计要素',
  elementSelectLocation: 'afterTitle',
  showToolbar: true,
  excludeToolbar: () => [],
  options: undefined,
  customSeries: undefined,
  afterSetOption: undefined,
  fullscreenTarget: 'body',
  fullscreenPadding: '20px',
  downloadImage: undefined,
  downloadData: undefined,
  chartDownloadCustomFn: undefined,
  showHiddenSeries: true,
  extraToolbars: () => []
})
defineSlots<{
  // 标题
  title: () => void
  'before-element-select': () => void
  'after-element-select': () => void
  'before-toolbar': () => void
  'after-toolbar': () => void
}>()

// 图表容器id
const mtChartContainerId = uniqueId('MtChartContainer')
const { isFullscreen, toggle } = useFullscreen({
  appendTo: props.fullscreenTarget,
  target: `#${mtChartContainerId}`,
  padding: props.fullscreenPadding,
  zIndex: 2000
})

const emit = defineEmits<{
  (e: 'toolbar-click', name: string, option: EChartsOption | undefined): void
}>()

defineExpose({
  getChart,
  getCanvas,
  downloadImage,
  downloadData,
  toggleFullscreen: toggle
})

const injectOptions = inject(chartInjectionKey, ref())

// 工具栏图标状态
const iconState = reactive({
  // 'asc' / 'desc'
  sortType: '',
  sortProp: '',
  // 'line' / 'bar'
  chartType: ''
})

const toolbarItems = computed(() => {
  const items: any[] = []

  // 排序
  if (hasRequiredProps.value && !props.excludeToolbar.includes('sort')) {
    items.push({
      name: 'sort',
      type: 'popover'
    })
  }

  // 全屏
  if (!props.excludeToolbar.includes('fullscreen')) {
    items.push({
      name: 'fullscreen',
      title: isFullscreen.value ? '取消全屏' : '全屏',
      class: { active: isFullscreen.value },
      onClick: () => toggle()
    })
  }

  // 折线图
  if (hasRequiredProps.value && !props.excludeToolbar.includes('lineChart')) {
    items.push({
      name: 'lineChart',
      title: '折线图',
      class: { active: iconState.chartType === 'line' },
      onClick: () => chartTypeChange('line')
    })
  }

  // 柱状图
  if (hasRequiredProps.value && !props.excludeToolbar.includes('barChart')) {
    items.push({
      name: 'barChart',
      title: '柱状图',
      class: { active: iconState.chartType === 'bar' },
      onClick: () => chartTypeChange('bar')
    })
  }


  // 下载图片
  if (!props.excludeToolbar.includes('downloadImage')) {
    items.push({
      name: 'downloadImage',
      title: '下载图片',
      onClick: () => downloadImage()
    })
  }

  // 下载数据
  if (!props.excludeToolbar.includes('downloadData')) {
    items.push({
      name: 'downloadData',
      title: '下载数据',
      onClick: () => downloadData()
    })
  }

  // 重置
  if (hasRequiredProps.value && !props.excludeToolbar.includes('reset')) {
    items.push({
      name: 'reset',
      title: '重置',
      onClick: () => reset()
    })
  }

  // 合并额外工具栏
  const toolbars = props.extraToolbars || []
  if (Array.isArray(toolbars)) {
    toolbars.forEach(item => {
      const newItem = {
        ...item,
        isExtra: true,
        onClick: () => {
          emit('toolbar-click', item.name, chart?.option)
        }
      }
      if (typeof item.index === 'number' && item.index >= 0) {
        items.splice(item.index, 0, newItem)
      } else {
        items.push(newItem)
      }
    })
  }
  return items
})

// 图表相关
const chart = shallowReactive<{
  // 图表id
  id: string
  // 图表容器元素
  el?: HTMLDivElement
  // 图表实例
  instance?: ECharts
  // 当前实例中维护的 option 对象, 每个组件的属性值都统一是一个数组
  option?: EChartsOption
}>({
  id: uniqueId('MtChart'),
  instance: undefined,
  option: undefined
})

useResizeObserver(
  () => chart.el,
  () => resize()
)

// 图片下载弹窗是否显示
const dialogVisible = ref(false)

// 单选时选中的要素
const selectedElement = ref<string>()
// 多选时选中的要素
const selectedElementList = ref<string[]>([])

// 是否有用于更新图表的必要属性
const hasRequiredProps = computed(() => props.list?.length && props.categoryProp)

// 当前需要固定选中的要素
let fixedElements: MtChartElement[] = []

// 主题
const theme = computed(() => injectOptions.value?.theme ?? props.theme)
// 字体配置
const fontOptions = computed(() => injectOptions.value?.fontOptions?.(false))
// 下载组件的字体配置
const downloadFontOptions = computed(() => injectOptions.value?.fontOptions?.(true))

// 要素列表与统计要素选项列表变化时重新设置选中项
watch(
  [() => props.elements, () => props.defaultChecked],
  debounce(([elements, defaultChecked]) => {
    fixedElements = []
    chart.instance?.clear()
    iconState.sortProp = elements[0]?.prop
    selectedElement.value = defaultChecked.length ? defaultChecked[0] : elements[0]?.prop
    selectedElementList.value = defaultChecked.length ? defaultChecked : [elements[0]?.prop]
  }, 50),
  { immediate: true }
)

watch(
  [
    () => props.list,
    () => props.xAxisName,
    () => props.yAxisName,
    () => props.xAxisConfig,
    () => props.yAxisConfig,
    () => props.options,
    () => iconState.chartType,
    fontOptions,
    selectedElement,
    selectedElementList
  ],
  debounce(updateChart, 50),
  { immediate: true }
)

watch(theme, () => {
  initChart(true)
})

onMounted(() => {
  if (chart.instance) return
  initChart()

  window.addEventListener('keydown', onEsc)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEsc)
  chart.instance?.dispose()
})

// 统计要素选项组件
const ElementSelection = () => {
  return h(MtFormItem, { label: props.elementSelectLabel }, () =>
    h(MtSelection, {
      modelValue: props.multiple ? selectedElementList.value : selectedElement.value,
      list: props.elements,
      labelField: 'name',
      valueField: 'prop',
      multiple: props.multiple,
      'onUpdate:modelValue': (val: string | string[]) => {
        if (props.multiple) {
          selectedElementList.value = val as string[]
        } else {
          selectedElement.value = val as string
        }
      }
    } as any)
  )
}

let hiddenSeriesNames: string[] = []
function initChart(update = false) {
  if (chart.instance) {
    hiddenSeriesNames = []
    chart.instance.dispose()
  }
  chart.el = document.getElementById(chart.id) as HTMLDivElement
  chart.instance = echarts.init(chart.el, theme.value === 'dark' ? 'dark' : undefined)

  if (!props.showHiddenSeries) {
    // 切换图例选中状态时记录被隐藏的series
    chart.instance.on('legendselectchanged', (evt: any) => {
      const selected: Record<string, boolean> = evt.selected
      hiddenSeriesNames = Object.entries(selected).reduce((names: string[], entry: [string, boolean]) => {
        if (!entry[1]) names.push(entry[0])
        return names
      }, [])
    })
  }
  update && updateChart()
}

// 更新图表
function updateChart() {
  let options: EChartsOption | undefined
  const selectedElements = (props.multiple ? selectedElementList.value : [selectedElement.value]).filter(
    element => typeof element === 'string'
  )
  if (hasRequiredProps.value) {
    fixedElements =
      typeof props.fixedElements === 'function' ? props.fixedElements(selectedElements) : props.fixedElements
    const seriesElements = [
      ...props.elements.filter(item => selectedElements.includes(item.prop)),
      ...fixedElements
    ].map(item => {
      const defaultSeriesType = item.seriesType || props.seriesType || 'line'
      return {
        ...item,
        yAxisName: item.yAxisName,
        seriesType: item.fixedSeriesType ? defaultSeriesType : iconState.chartType || defaultSeriesType
      } as MtChartElement
    })

    let list = [...props.list]
    if (iconState.sortType) {
      const sortElement = props.elements.find(item => item.prop === iconState.sortProp)!
      let dataSort = sortElement.dataSort
      if (!dataSort) {
        dataSort = (list: Record<string, any>[], sortType: 'asc' | 'desc') => {
          return sortType === 'asc'
            ? list.sort((a, b) => a[sortElement.prop] - b[sortElement.prop])
            : list.sort((a, b) => b[sortElement.prop] - a[sortElement.prop])
        }
      }
      list = dataSort(list, iconState.sortType as 'asc' | 'desc')
    }

    options = chartOptions(
      props.categoryProp,
      normalizeXAxisConfig(),
      normalizeYAxisConfig(),
      seriesElements,
      list,
      props.customSeries,
      props.categoryYearReg,
      fontOptions.value
    )
  }
  const customOptions =
    typeof props.options === 'function' ? props.options(selectedElements, theme.value) : props.options
  if (options && customOptions) {
    for (const key in customOptions) {
      if (!customOptions[key]) {
        options[key] = undefined
      }
    }
    if (customOptions.yAxis && !Array.isArray(customOptions.yAxis)) {
      customOptions.yAxis = [customOptions.yAxis]
    }
    options && merge(options, customOptions)
  }

  options ??= customOptions
  if (options && chart.instance) {
    chart.instance?.setOption(options, { notMerge: true })
    if (props.afterSetOption) {
      try {
        props.afterSetOption?.(chart.instance!, false)
      } catch (e) {
        console.error(e)
      }
    }
    chart.option = chart.instance?.getOption() as EChartsOption
  }
}

/**
 * 规范化yAxisConfig配置<br>
 * 源于添加yAxisConfig配置后兼容旧版本的yAxisName
 */
function normalizeYAxisConfig(): MtChartYAxisConfig[] {
  if (Array.isArray(props.yAxisConfig)) {
    return (
      typeof props.yAxisName[0] === 'string' ? props.yAxisConfig.map(name => ({ name })) : props.yAxisConfig
    ) as MtChartAxisConfig[]
  }
  if (props.yAxisConfig) {
    return [typeof props.yAxisConfig === 'string' ? { name: props.yAxisConfig } : props.yAxisConfig]
  }

  if (Array.isArray(props.yAxisName)) {
    return props.yAxisName.map(name => ({ name }))
  }

  return props.yAxisName ? [{ name: props.yAxisName }] : []
}

function normalizeXAxisConfig() {
  if (props.xAxisConfig) {
    return typeof props.xAxisConfig === 'string' ? { name: props.xAxisConfig } : props.xAxisConfig
  }
  return { name: props.xAxisName ?? '' }
}

// 最后一次排序的要素
let lastSortProp = ''

/**
 * 设置排序类型
 * @param index 0 - asc, 1 - desc, 2 - none
 */
function sort(index: number) {
  const sortType = ['asc', 'desc', ''][index]
  if (iconState.sortProp !== lastSortProp || iconState.sortType !== sortType) {
    lastSortProp = iconState.sortProp
    iconState.sortType = sortType
    updateChart()
  }
}

/**
 * 切换图表序列显示类型
 * @param type
 */
function chartTypeChange(type: 'line' | 'bar' | 'heatmap') {
  iconState.chartType = iconState.chartType === type ? '' : type
}

/**
 * 获取canvas
 * @param title 标题(若不指定则使用props.title 若props.title为空则不添加标题)
 * @param subtitle 副标题(若不指定则使用props.subtitle 若props.subtitle为空则不添加副标题)
 */
function getCanvas(title?: string, subtitle?: string) {
  title = title ?? props.title
  subtitle = subtitle ?? props.subtitle
  const chartCanvas = chart.el?.querySelector('canvas')!
  const newCanvas = document.createElement('canvas')
  let backgroundColor = chart?.instance?.getOption()?.backgroundColor
  backgroundColor = typeof backgroundColor === 'string' ? backgroundColor : theme.value === 'light' ? '#fff' : '#000'
  if (!title && !subtitle) {
    newCanvas.width = chartCanvas.width
    newCanvas.height = chartCanvas.height
    const ctx = newCanvas.getContext('2d')!
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
    ctx.drawImage(chartCanvas, 0, 0)
    return newCanvas
  }

  const chartCtx = chartCanvas.getContext('2d')!

  const titleColor = theme.value === 'light' ? '#333' : '#fff'
  let [titleH, subtitleH] = [0, 0]
  let titleFont, subtitleFont
  if (title) {
    chartCtx.save()
    // 从DOM中获取title元素的计算样式
    const titleEl = document.querySelector(`#${mtChartContainerId} .mt-chart-title`)
    const computedStyle = titleEl ? getComputedStyle(titleEl) : undefined
    // 若未获取到title元素则设置默认样式
    const fontFamily = computedStyle?.fontFamily ?? 'sans-serif'
    const fontWeight = computedStyle?.fontWeight ?? 'bold'
    const fontSize = computedStyle?.fontSize ?? '18px'

    const { title: t } = fontOptions.value ?? {}
    titleFont = `${t?.fontWeight ?? fontWeight} ${t?.fontSize ? `${t.fontSize}px` : fontSize} ${t?.fontFamily ?? fontFamily}`
    chartCtx.font = titleFont

    chartCtx.textAlign = 'center'
    chartCtx.textBaseline = 'middle'
    chartCtx.restore()
    const metrics = chartCtx.measureText(title)
    titleH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  }
  if (subtitle) {
    chartCtx.save()
    // 从DOM中获取副title元素的计算样式
    const subtitleEl = document.querySelector(`#${mtChartContainerId} .mt-chart-subtitle`)
    const computedStyle = subtitleEl ? getComputedStyle(subtitleEl) : undefined
    // 若未获取到副title元素则设置默认样式
    const fontFamily = computedStyle?.fontFamily ?? 'sans-serif'
    const fontWeight = computedStyle?.fontWeight ?? 'normal'
    const fontSize = computedStyle?.fontSize ?? '14px'

    const { subtitle: t } = fontOptions.value ?? {}
    subtitleFont = `${t?.fontWeight ?? fontWeight} ${t?.fontSize ? `${t.fontSize}px` : fontSize} ${t?.fontFamily ?? fontFamily}`
    chartCtx.font = subtitleFont
    chartCtx.textAlign = 'center'
    chartCtx.textBaseline = 'middle'
    chartCtx.restore()
    const metrics = chartCtx.measureText(subtitle)
    subtitleH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 5
  }

  const titleGap = title && subtitle ? 10 : 0
  const addHeight = 20 + titleH + titleGap + subtitleH + 10

  newCanvas.width = chartCanvas.width
  newCanvas.height = chartCanvas.height + addHeight

  const ctx = newCanvas.getContext('2d')!
  ctx.save()
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
  ctx.drawImage(chartCanvas, 0, addHeight)

  if (title) {
    ctx.font = titleFont!
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = titleColor
    ctx.fillText(title, newCanvas.width / 2, 20 + titleH / 2)
  }
  if (subtitle) {
    ctx.font = subtitleFont!
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = titleColor
    ctx.fillText(subtitle, newCanvas.width / 2, 20 + titleH + titleGap + subtitleH / 2)
  }
  ctx.restore()
  return newCanvas
}

function getTitle() {
  let title = props.title
  if (props.subtitle) {
    title += `(${props.subtitle})`
  }
  return title
}

// 触发下载图片
async function downloadImage() {
  if (props.downloadImage) {
    props.downloadImage()
    return
  }

  if (!hasRequiredProps.value) {
    const canvas = getCanvas()
    saveAs(canvas.toDataURL(), getTitle() ?? `统计图${Date.now()}.png`)
    return
  }

  if (!props.showHiddenSeries && Array.isArray(chart.option?.series) && chart.option?.series.length) {
    chart.option.series = chart.option.series.filter(item => !hiddenSeriesNames.includes(item.name as string))
  }
  dialogVisible.value = true
}

// 触发下载数据
async function downloadData() {
  if (props.downloadData) {
    props.downloadData()
    return
  }
  if (!hasRequiredProps.value) return

  const allElements = [...props.elements, ...fixedElements]

  // 下载数据
  const rows = [['', ...allElements.map(item => item.name)]]

  props.list.forEach((item: Record<string, any>) => {
    rows.push([item[props.categoryProp], ...allElements.map(element => item[element.prop])])
  })

  const sheet = utils.aoa_to_sheet(rows)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, sheet)
  writeFile(wb, `${getTitle() ?? `统计图数据${Date.now()}`}.xlsx`)
}

/**
 * 重置图表
 */
function reset() {
  iconState.sortType = ''
  iconState.chartType = ''
}

function resize() {
  if (!chart.instance) return
  chart.instance.resize()
  if (props.afterSetOption) {
    try {
      props.afterSetOption(chart.instance, false)
    } catch (e) {
      console.warn(e)
    }
  }
}

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggle()
  }
}

function getChart() {
  return chart.instance
}
</script>

<template>
  <div :id="mtChartContainerId" :class="{ fullscreen: isFullscreen }" class="mt-chart" v-bind="$attrs">
    <el-form v-if="showElementSelect && elementSelectLocation === 'beforeTitle'" class="mt-chart-form" inline>
      <slot v-if="$slots['before-element-select']" name="before-element-select" />
      <ElementSelection />
      <slot v-if="$slots['after-element-select']" name="after-element-select" />
    </el-form>
    <div v-if="showTitle && (title || subtitle || !!$slots.title)" class="mt-chart-title__container">
      <slot name="title">
        <div class="mt-chart-title-container">
          <div v-if="title" class="mt-chart-title">{{ title }}</div>
          <div v-if="subtitle" class="mt-chart-subtitle">{{ subtitle }}</div>
        </div>
      </slot>
    </div>
    <el-form v-if="showElementSelect && elementSelectLocation === 'afterTitle'" class="mt-chart-form" inline>
      <slot v-if="$slots['before-element-select']" name="before-element-select" />
      <ElementSelection />
      <slot v-if="$slots['after-element-select']" name="after-element-select" />
    </el-form>
    <div class="mt-chart__container">
      <ul v-if="showToolbar">
        <slot name="before-toolbar" />
        <template v-for="item in toolbarItems" :key="item.name">
          <el-popover v-if="item.name === 'sort'" append-to="body" trigger="click" width="fit-content">
            <template #reference>
              <li class="sort" title="排序">
                <SortAscIcon v-if="iconState.sortType === 'asc'" />
                <SortDescIcon v-else-if="iconState.sortType === 'desc'" />
                <SortIcon v-else />
              </li>
            </template>
            <div class="mt-chart-series-sort-setting">
              <MtRadio v-model="iconState.sortProp" :list="elements" label-field="name" value-field="prop" />
              <div class="button-group">
                <el-button size="small" type="primary" @click="sort(0)">升序</el-button>
                <el-button size="small" type="primary" @click="sort(1)">降序</el-button>
                <el-button size="small" type="primary" @click="sort(2)">默认</el-button>
              </div>
            </div>
          </el-popover>
          <li v-else :class="[item.name, item.class]" :title="item.title" @click="item.onClick">
            <template v-if="item.isExtra">
              <div v-if="typeof item.icon === 'string' && item.icon.includes('<')" v-html="item.icon" />
              <i v-else-if="typeof item.icon === 'string'" :class="item.icon" />
              <component :is="item.icon" v-else />
            </template>
            <template v-else>
              <FullScreenIcon v-if="item.name === 'fullscreen'" />
              <BarChartIcon v-else-if="item.name === 'heatChart'" />
              <LineChartIcon v-else-if="item.name === 'lineChart'" />
              <BarChartIcon v-else-if="item.name === 'barChart'" />
              <DownloadImageIcon v-else-if="item.name === 'downloadImage'" />
              <DownloadDataIcon v-else-if="item.name === 'downloadData'" />
              <ResetIcon v-else-if="item.name === 'reset'" />
            </template>
          </li>
        </template>
        <slot name="after-toolbar" />
      </ul>
      <div :id="chart.id" class="mt-chart-el" />
    </div>
  </div>
  <el-dialog
    v-model="dialogVisible"
    :close-on-click-modal="false"
    :width="1050"
    :z-index="2001"
    append-to-body
    draggable
    title="图片设置"
  >
    <MtChartDownload
      v-if="dialogVisible && chart.option"
      :after-set-option="afterSetOption"
      :chart-download-custom-fn="chartDownloadCustomFn"
      :chart-option="chart.option"
      :chart-subtitle="subtitle"
      :chart-title="title"
      :font-options="downloadFontOptions"
      :theme="theme"
    />
  </el-dialog>
</template>
