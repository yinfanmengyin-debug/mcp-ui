<template>
  <div
    ref="rootRef"
    class="mt-time-axis"
    :class="{ 'is-disabled': disabled }"
    :style="rootStyle"
  >
    <div
      ref="canvasRef"
      class="mt-time-axis__canvas"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'zrender/lib/canvas/canvas'
import { Group, Image as ZImage, Line, Rect, Text, init, type ZRenderType } from 'zrender'
import lastIcon from './icons/last.png'
import nextIcon from './icons/next.png'
import playIcon from './icons/pause.png'
import positionIcon from './icons/position.png'
import type { TimeAxisExpose, TimeAxisItem, TimeAxisValue } from './type'

defineOptions({ name: 'MtTimeAxis' })

interface AxisSlot {
  index: number
  label: string
  value: TimeAxisValue | null
  disabled: boolean
  skeleton: boolean
}

interface AxisLayout {
  width: number
  height: number
  paddingX: number
  trackLeft: number
  trackRight: number
  trackTop: number
  trackWidth: number
  trackHeight: number
  labelTop: number
  currentLabelTop: number
  controlLeft: number
  controlTop: number
  controlSize: number
  controlGap: number
}

interface AxisTheme {
  base: string
  primary: string
  primaryOpacity: string
  textPrimary: string
  textSecondary: string
  textPlaceholder: string
  border: string
  disabledBorder: string
  hoverBackground: string
}

interface AxisLabelNode {
  index: number
  text: string
  left: number
  right: number
  x: number
  align: 'left' | 'center' | 'right'
}

interface AxisHitArea {
  x: number
  y: number
  width: number
  height: number
}

interface AxisTickArea {
  index: number
  area: AxisHitArea
}

interface AxisLabelArea {
  index: number
  area: AxisHitArea
}

interface AxisRenderState {
  layout: AxisLayout
  slots: AxisSlot[]
  startIndex: number
  endIndex: number
  activeIndex: number
  thumbArea: AxisHitArea | null
  controlAreas: AxisHitArea[]
  tickAreas: AxisTickArea[]
  labelAreas: AxisLabelArea[]
  positionArea: AxisHitArea | null
}

// 这里统一描述字体在 canvas 中测量得到的高度数据，后续自动布局会直接复用。
interface AxisFontMetrics {
  ascent: number
  descent: number
  textHeight: number
}

const props = withDefaults(
  defineProps<{
    // 时间轴真实数据列表，顺序决定刻度顺序。
    list: TimeAxisItem[]
    // 当前选中值，支持外部通过 v-model 控制。
    modelValue?: TimeAxisValue | null
    // 是否禁用整个时间轴交互。
    disabled?: boolean
    // 数据不足时用于补齐骨架刻度的最大数量。
    skeletonCount?: number
    // 是否显示滑轨上方的当前时间标签。
    showCurrentLabel?: boolean
    // 是否显示右侧上一帧、播放、下一帧控制按钮。
    showControls?: boolean
    // 是否允许滚轮缩放时间轴可视范围。
    zoomable?: boolean
    // label 最小间距，用于控制刻度文本密度。
    minLabelGap?: number
    // 刻度最小间距，用于在高密度场景下对刻度做抽样稀释。
    minTickGap?: number
    // 自动播放时间间隔，单位毫秒。
    autoplayInterval?: number
    // 时间轴文本字号，会同步影响自动高度与布局计算。
    fontSize?: number
    // 时间轴文本字体，会用于 canvas 测量与实际绘制。
    fontFamily?: string
    // 刻度线左右可点击的扩展像素范围。
    tickHitPadding?: number
    // 拖动超出边界时的滚动阻尼，值越大拖动越慢。
    dragOverflowDamping?: number
  }>(),
  {
    // 默认可交互。
    disabled: false,
    // 默认最多补 15 个骨架刻度。
    skeletonCount: 5,
    // 默认显示当前时间标签。
    showCurrentLabel: true,
    // 默认显示右侧控制按钮。
    showControls: true,
    // 默认开启滚轮缩放。
    zoomable: true,
    // 默认 label 最小间距为 96px。
    minLabelGap: 96,
    // 默认刻度最小间距为 8px。
    minTickGap: 8,
    // 默认自动播放间隔为 200ms。
    autoplayInterval: 200,
    // 默认字号 14。
    fontSize: 14,
    // 默认字体族为 sans-serif。
    fontFamily: 'sans-serif',
    // 默认刻度命中范围左右各扩展 4px。
    tickHitPadding: 4,
    // 默认拖动越界阻尼为 4。
    dragOverflowDamping: 10
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: TimeAxisValue]
  change: [value: TimeAxisValue, item: TimeAxisItem]
  playChange: [value: boolean]
}>()

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)
const innerValue = ref<TimeAxisValue | null>(null)
const dragPreviewValue = ref<TimeAxisValue | null>(null)
const currentCursor = ref<'default' | 'pointer' | 'not-allowed' | 'grabbing'>('default')
const zoomLevel = ref(1)
const viewportStartIndex = ref(0)
const isPlaying = ref(false)
const isDragging = ref(false)
const isPointerDown = ref(false)

let zr: ZRenderType | null = null
let resizeObserver: ResizeObserver | null = null
let playTimer: number | null = null
let renderRafId = 0
let dragScrubRafId = 0
let stageGroup: Group | null = null
let lastRenderState: AxisRenderState | null = null
let dragMoved = false
let dragLocalX = 0
let pointerDownLocalX = 0
let pointerDownLocalY = 0
let dragLastOverflowScrubAt = 0

const actualItems = computed(() => props.list.filter((item): item is TimeAxisItem => Boolean(item)))
const isModelControlled = computed(() => props.modelValue !== undefined)
const currentValue = computed(() => (isModelControlled.value ? (props.modelValue ?? null) : innerValue.value))
const currentRenderValue = computed(() => dragPreviewValue.value ?? currentValue.value)
// 这里对外部字体配置做一次兜底和归一化，避免传入非法值影响后续测量。
const resolvedFontSize = computed(() => Math.max(1, Number.isFinite(props.fontSize) ? props.fontSize : 12))
const resolvedFontFamily = computed(() => props.fontFamily.trim() || 'sans-serif')
// 这里统一归一化刻度点击扩展范围，hover 和 click 都会共用这个值。
const resolvedTickHitPadding = computed(() => Math.max(0, Math.round(props.tickHitPadding)))
// 这里控制拖动超出边界后的滚动阻尼，值越大滚动越慢。
const resolvedDragOverflowDamping = computed(() => Math.max(1, Number(props.dragOverflowDamping) || 4))
// 这里限制刻度最小像素间距，当前缩放密度过高时会自动按这个间距抽样显示刻度。
const resolvedMinTickGap = computed(() => Math.max(1, Number(props.minTickGap) || 8))
// 这里把字号和字体族拼成 canvas/zrender 都能直接使用的 font 字符串。
const axisFont = computed(() => `${resolvedFontSize.value}px ${resolvedFontFamily.value}`)
// 这里通过离屏 canvas 实时测量当前字体的真实文本高度，避免只按字号估算。
const measuredFontMetrics = computed(() => getFontMetrics())
// 这里统一根据字体测量结果推导时间轴各区域位置，并产出组件默认高度。
const axisMetrics = computed(() => {
  // 顶部留白，避免当前标签紧贴容器上边缘。
  const topPadding = 0
  // 当前选中标签显示在最上方时，从这条基线开始布局。
  const currentLabelTop = props.showCurrentLabel ? topPadding : 0
  // 当前选中标签占用的真实文本高度直接使用 canvas 测量结果。
  const currentLabelHeight = props.showCurrentLabel ? measuredFontMetrics.value.textHeight : 0
  // 当前标签与轨道之间保留一段间距，避免视觉上挤在一起。
  const currentLabelGap = props.showCurrentLabel ? Math.max(4, Math.round(resolvedFontSize.value * 0.33)) : topPadding
  // 轨道起始位置由顶部留白、当前标签高度和中间间距共同决定。
  const trackTop = currentLabelTop + currentLabelHeight + currentLabelGap
  // 轨道本身保持最小可点击高度，同时随字号略微放大。
  const trackHeight = Math.max(12, Math.round(resolvedFontSize.value))
  // 底部刻度文本放在轨道下方，并额外留出一点可读间距。
  const labelTop = trackTop + trackHeight + Math.max(6, Math.round(resolvedFontSize.value * 0.5))
  // 右侧控制按钮尺寸跟随字号变化，但保持最小操作面积。
  const controlSize = Math.max(20, Math.round(resolvedFontSize.value * 1.67))
  // 底部统一补一段留白，避免文本或按钮贴边。
  const bottomPadding = 0
  // 文本区域总高度 = 底部标签起点 + 文本真实高度 + 底部留白。
  const textHeight = labelTop + measuredFontMetrics.value.textHeight + bottomPadding
  // 控件区域在整体画布中垂直居中，因此只需要保证画布高度不小于按钮尺寸即可。
  const controlHeight = props.showControls ? controlSize : 0

  return {
    currentLabelTop,
    trackTop,
    trackHeight,
    labelTop,
    controlSize,
    autoHeight: Math.max(textHeight, controlHeight)
  }
})
// 这里把自动高度和字体样式同步到根节点，保证容器尺寸与绘制字体保持一致。
const rootStyle = computed(() => ({
  height: `${axisMetrics.value.autoHeight}px`,
  fontSize: `${resolvedFontSize.value}px`,
  fontFamily: resolvedFontFamily.value,
  cursor: currentCursor.value
}))

// 这里使用离屏 canvas 统一测量文本宽度，避免 label 计算和真实渲染出现明显偏差。
const measureCanvas = document.createElement('canvas')
const measureContext = measureCanvas.getContext('2d')

function getFontMetrics(): AxisFontMetrics {
  // 某些环境下如果 canvas 文本度量不可用，这里退回到基于字号的保底值。
  const fallbackAscent = Math.ceil(resolvedFontSize.value)
  const fallbackDescent = Math.max(2, Math.ceil(resolvedFontSize.value * 0.35))

  if (!measureContext) {
    return {
      ascent: fallbackAscent,
      descent: fallbackDescent,
      textHeight: fallbackAscent + fallbackDescent
    }
  }

  // 这里用同时包含上伸部和下伸部的字符组合测量，尽量拿到更接近真实视觉高度的结果。
  measureContext.font = axisFont.value
  const metrics = measureContext.measureText('Hg')
  const ascent = Math.max(1, Math.ceil(metrics.actualBoundingBoxAscent || fallbackAscent))
  const descent = Math.max(1, Math.ceil(metrics.actualBoundingBoxDescent || fallbackDescent))

  return {
    ascent,
    descent,
    textHeight: ascent + descent
  }
}

// 这个方法用于获取当前主题变量，所有颜色都从项目主题变量里读取，不直接手写颜色值。
function getTheme() {
  const sourceElement = rootRef.value ?? document.documentElement
  const styles = window.getComputedStyle(sourceElement)

  return {
    base: styles.getPropertyValue('--theme-base').trim() || 'transparent',
    primary: styles.getPropertyValue('--theme-primary').trim() || styles.getPropertyValue('--el-color-primary').trim(),
    primaryOpacity:
      styles.getPropertyValue('--theme-primary-opacity').trim() ||
      styles.getPropertyValue('--theme-hover-bg-color').trim(),
    textPrimary: styles.getPropertyValue('--theme-text-primary').trim() || 'currentColor',
    textSecondary: styles.getPropertyValue('--theme-text-secondary').trim() || 'currentColor',
    textPlaceholder: styles.getPropertyValue('--theme-text-placeholder').trim() || 'currentColor',
    border:
      styles.getPropertyValue('--theme-border-color').trim() || styles.getPropertyValue('--el-border-color').trim(),
    disabledBorder:
      styles.getPropertyValue('--theme-disabled-border-color-2').trim() ||
      styles.getPropertyValue('--el-border-color').trim(),
    hoverBackground:
      styles.getPropertyValue('--theme-hover-bg-color').trim() ||
      styles.getPropertyValue('--theme-component-color').trim()
  } satisfies AxisTheme
}

// 这个方法负责根据容器当前尺寸计算所有绘制区域，后续所有点位都基于这套布局数据。
function getLayout() {
  const width = canvasRef.value?.clientWidth ?? rootRef.value?.clientWidth ?? 0
  const { autoHeight, controlSize, currentLabelTop, labelTop, trackHeight, trackTop } = axisMetrics.value
  const height = canvasRef.value?.clientHeight ?? rootRef.value?.clientHeight ?? autoHeight
  // 给当前位置图标预留半宽内边距，保证左右边缘也能完整显示且仍与刻度中心对齐。
  const paddingX = 2
  const controlGap = 4
  const controlWidth = props.showControls ? controlSize * 3 + controlGap * 2 : 0
  const controlOffset = props.showControls ? controlWidth + 8 : 0
  const trackLeft = paddingX
  const trackRight = Math.max(trackLeft + 80, width - paddingX - controlOffset)
  const trackWidth = Math.max(60, trackRight - trackLeft)
  const controlTop = Math.max(0, Math.round((height - controlSize) / 2))

  return {
    width,
    height,
    paddingX,
    trackLeft,
    trackRight,
    trackTop,
    trackWidth,
    trackHeight,
    labelTop,
    currentLabelTop,
    controlLeft: trackRight + 8,
    controlTop,
    controlSize,
    controlGap
  } satisfies AxisLayout
}

// 这个方法统一测量 label 宽度，后续碰撞检测和首尾收口都用这里的结果。
function measureLabelWidth(text: string) {
  if (!measureContext) {
    return Math.max(48, text.length * resolvedFontSize.value)
  }

  measureContext.font = axisFont.value
  return Math.ceil(measureContext.measureText(text).width)
}

// 这里根据容器宽度和 label 宽度估算当前时间轴最多适合展示多少个 label。
function getLabelCapacity(trackWidth: number, items: TimeAxisItem[]) {
  const fallbackWidth = props.minLabelGap
  const maxTextWidth = items.reduce(
    (maxWidth, item) => Math.max(maxWidth, measureLabelWidth(item.label) + 16),
    fallbackWidth
  )
  const labelWidth = Math.max(fallbackWidth, maxTextWidth)

  return Math.max(2, Math.floor(trackWidth / labelWidth))
}

// 这里根据当前容器的 label 容量反推最大缩放倍数，避免所有 label 已能展示时继续放大。
function getMaxZoomLevelByLabelCapacity(layout: AxisLayout, totalCount: number) {
  if (totalCount <= 2) {
    return 1
  }

  const labelCapacity = Math.min(totalCount, getLabelCapacity(layout.trackWidth, actualItems.value))
  const minVisibleCount = Math.max(2, labelCapacity)
  return Math.max(1, totalCount / minVisibleCount)
}

// 这个方法把鼠标事件转换为画布内坐标，后续点击和拖动命中都统一走这里。
function getLocalPoint(event: MouseEvent) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) {
    return {
      x: 0,
      y: 0
    }
  }

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

// 这个方法直接消费 zrender 提供的 offset 坐标，避免 DOM 冒泡层级带来的偏移误差。
function getOffsetPoint(offsetX: number, offsetY: number) {
  return {
    x: offsetX,
    y: offsetY
  }
}

// 这里统一做矩形命中判断，轨道、拖拽手柄和按钮区都会复用。
function isPointInArea(x: number, y: number, area: AxisHitArea | null) {
  if (!area) {
    return false
  }

  return x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
}

// 这里统一判断某个刻度是否对应真实且可点击的数据点。
function isClickableSlot(slot: AxisSlot | undefined) {
  return Boolean(slot && !slot.skeleton && !slot.disabled && slot.value !== null)
}

// 这里负责生成最终用于布局的插槽数据，真实数据不够时会自动补骨架插槽。
function buildSlots(layout: AxisLayout) {
  const items = actualItems.value
  const labelCapacity = getLabelCapacity(layout.trackWidth, items)
  const minimumSlots = items.length
    ? Math.min(props.skeletonCount, labelCapacity)
    : Math.min(props.skeletonCount, Math.max(2, labelCapacity))
  const totalSlots = items.length >= minimumSlots ? items.length : Math.max(items.length, minimumSlots)

  return Array.from({ length: Math.max(totalSlots, items.length, 1) }, (_, index) => {
    const item = items[index]

    return {
      index,
      label: item?.label ?? '',
      value: item?.value ?? null,
      disabled: item?.disabled ?? false,
      skeleton: !item
    } satisfies AxisSlot
  })
}

// 这里统一计算当前选中值在真实数据中的索引，骨架插槽不参与选中逻辑。
function getActiveIndex(slots: AxisSlot[]) {
  const matchedIndex = slots.findIndex(slot => !slot.skeleton && slot.value === currentRenderValue.value)
  if (matchedIndex > -1) {
    return matchedIndex
  }

  return slots.findIndex(slot => !slot.skeleton && !slot.disabled)
}

// 这里根据缩放级别计算当前可视区展示多少个插槽。
function getVisibleCount(totalCount: number) {
  if (totalCount <= 1) {
    return totalCount
  }

  return Math.min(totalCount, Math.max(2, Math.ceil(totalCount / zoomLevel.value)))
}

// 这个方法保证可视窗口起点始终合法，不会越界。
function clampViewportStart(totalCount: number, visibleCount: number, startIndex: number) {
  const maxStart = Math.max(0, totalCount - visibleCount)
  return Math.min(maxStart, Math.max(0, startIndex))
}

// 这里负责把全局插槽索引转换成当前画布上的 x 坐标。
function getSlotX(layout: AxisLayout, startIndex: number, endIndex: number, slotIndex: number) {
  if (endIndex <= startIndex) {
    return layout.trackLeft
  }

  const ratio = (slotIndex - startIndex) / (endIndex - startIndex)
  return layout.trackLeft + ratio * layout.trackWidth
}

// 这里只在刻度线左右 1px 范围内命中，点击不会再自动吸附到最近的数据点。
function findHitTickIndex(state: AxisRenderState, localX: number, localY: number) {
  const matchedTick = state.tickAreas.find(tickArea => isPointInArea(localX, localY, tickArea.area))

  if (!matchedTick) {
    return -1
  }

  return matchedTick.index
}

// 这里把连续拖拽位置映射成离散索引，并自动跳过骨架项和禁用项。
function findNearestClickableIndex(
  slots: AxisSlot[],
  rawIndex: number,
  roundMode: 'nearest' | 'floor' | 'ceil' = 'nearest'
) {
  if (!slots.length) {
    return -1
  }

  const roundedIndex =
    roundMode === 'floor' ? Math.floor(rawIndex) : roundMode === 'ceil' ? Math.ceil(rawIndex) : Math.round(rawIndex)
  const normalizedIndex = Math.min(slots.length - 1, Math.max(0, roundedIndex))

  if (isClickableSlot(slots[normalizedIndex])) {
    return normalizedIndex
  }

  for (let offset = 1; offset < slots.length; offset += 1) {
    const prevIndex = normalizedIndex - offset
    const nextIndex = normalizedIndex + offset

    if (prevIndex >= 0 && isClickableSlot(slots[prevIndex])) {
      return prevIndex
    }

    if (nextIndex < slots.length && isClickableSlot(slots[nextIndex])) {
      return nextIndex
    }
  }

  return -1
}

// 这里计算长刻度步长，保证长短刻度会根据宽度和缩放比例自动变化。
function getMajorTickStep(visibleCount: number, trackWidth: number) {
  if (visibleCount <= 2) {
    return 1
  }

  const preferredCount = Math.max(2, Math.floor(trackWidth / Math.max(props.minLabelGap, 72)))
  return Math.max(1, Math.ceil((visibleCount - 1) / preferredCount))
}

// 这里根据当前可视宽度和最小刻度间距计算抽样步长，避免刻度过密时挤成一团。
function getTickRenderStep(visibleCount: number, trackWidth: number) {
  if (visibleCount <= 2) {
    return 1
  }

  const slotGap = trackWidth / Math.max(1, visibleCount - 1)
  return Math.max(1, Math.ceil(resolvedMinTickGap.value / Math.max(1, slotGap)))
}

// 这里生成 label 候选项，然后做碰撞检测，只留下不会越界且不重叠的一组 label。
function buildVisibleLabels(layout: AxisLayout, slots: AxisSlot[], startIndex: number, endIndex: number) {
  const candidatePriorityMap = new Map<number, number>()
  const visibleCount = endIndex - startIndex + 1
  const majorStep = getMajorTickStep(visibleCount, layout.trackWidth)
  const visibleItems = slots
    .slice(startIndex, endIndex + 1)
    .filter(slot => !slot.skeleton)
    .map(slot => ({
      label: slot.label,
      value: slot.value as TimeAxisValue
    }))
  const canShowAllLabels =
    visibleItems.length > 0 && visibleItems.length <= getLabelCapacity(layout.trackWidth, visibleItems)

  if (canShowAllLabels) {
    for (let index = startIndex; index <= endIndex; index += 1) {
      if (!slots[index]?.skeleton) {
        candidatePriorityMap.set(index, 80)
      }
    }
  }

  for (let index = startIndex; index <= endIndex; index += majorStep) {
    const currentPriority = candidatePriorityMap.get(index) ?? 0
    candidatePriorityMap.set(index, Math.max(currentPriority, 60))
  }

  const candidates = Array.from(candidatePriorityMap.entries())
    .map(([index, priority]) => ({ index, priority }))
    .filter(candidate => !slots[candidate.index]?.skeleton)
    .sort((prev, next) => next.priority - prev.priority || prev.index - next.index)

  const accepted: AxisLabelNode[] = []

  candidates.forEach(candidate => {
    const text = slots[candidate.index]?.label ?? ''
    const width = measureLabelWidth(text) + 12
    const x = getSlotX(layout, startIndex, endIndex, candidate.index)
    const centeredLeft = x - width / 2
    const centeredRight = x + width / 2

    if (centeredLeft < layout.trackLeft || centeredRight > layout.trackRight) {
      return
    }

    const clampedLeft = centeredLeft
    const clampedRight = centeredRight
    const hasCollision = accepted.some(item => !(clampedRight < item.left - 6 || clampedLeft > item.right + 6))

    if (!hasCollision) {
      accepted.push({
        index: candidate.index,
        text,
        left: clampedLeft,
        right: clampedRight,
        x,
        align: 'center'
      })
    }
  })

  return accepted.sort((prev, next) => prev.left - next.left)
}

// 这个方法负责把当前时间标签限制在轨道边界内，并放到上方展示。
function getCurrentLabelNode(
  layout: AxisLayout,
  slots: AxisSlot[],
  startIndex: number,
  endIndex: number,
  activeIndex: number
) {
  if (!props.showCurrentLabel || activeIndex < startIndex || activeIndex > endIndex || activeIndex < 0) {
    return null
  }

  const text = slots[activeIndex]?.label ?? ''
  const width = measureLabelWidth(text) + 12
  const x = getSlotX(layout, startIndex, endIndex, activeIndex)
  const left = Math.min(layout.trackRight - width, Math.max(layout.trackLeft, x - width / 2))

  return {
    text,
    x: left + width / 2
  }
}

// 这个方法负责维护内部选中值，并向外同步 v-model。
function scrollValueIntoViewport(value: TimeAxisValue) {
  const layout = getLayout()
  const slots = buildSlots(layout)
  const visibleCount = getVisibleCount(slots.length)
  const targetIndex = slots.findIndex(slot => !slot.skeleton && !slot.disabled && slot.value === value)

  if (targetIndex < 0) {
    return
  }

  const startIndex = clampViewportStart(slots.length, visibleCount, viewportStartIndex.value)
  const endIndex = Math.min(slots.length - 1, startIndex + visibleCount - 1)

  if (targetIndex < startIndex) {
    viewportStartIndex.value = clampViewportStart(slots.length, visibleCount, targetIndex)
    return
  }

  if (targetIndex > endIndex) {
    viewportStartIndex.value = clampViewportStart(slots.length, visibleCount, targetIndex - visibleCount + 1)
  }
}

function updateCurrentValue(value: TimeAxisValue, options?: { keepVisible?: boolean }) {
  const item = actualItems.value.find(currentItem => currentItem.value === value && !currentItem.disabled)
  if (!item) {
    return
  }

  if (options?.keepVisible) {
    scrollValueIntoViewport(item.value)
  }

  innerValue.value = item.value
  emit('update:modelValue', item.value)
  emit('change', item.value, item)
}

// 这里在真实数据变化时做一次默认值兜底，保证时间轴始终有可用的当前值。
function syncCurrentValue() {
  const items = actualItems.value

  if (!items.length) {
    innerValue.value = null
    return
  }

  if (items.some(item => item.value === currentValue.value && !item.disabled)) {
    innerValue.value = currentValue.value
    return
  }

  const firstEnabledItem = items.find(item => !item.disabled)
  innerValue.value = firstEnabledItem?.value ?? null

  if (firstEnabledItem && !isModelControlled.value) {
    emit('update:modelValue', firstEnabledItem.value)
  }
}

// 这个方法用于重置缩放状态，方便外部或内部直接恢复到完整视图。
function resetZoom() {
  zoomLevel.value = 1
  viewportStartIndex.value = 0
  scheduleRender()
}

// 这里是上一帧切换逻辑，只在真实数据中移动，不会落到骨架刻度上。
function prev(step = 1) {
  const items = actualItems.value.filter(item => !item.disabled)
  const currentIndexValue = items.findIndex(item => item.value === currentValue.value)
  if (!items.length) {
    return
  }

  const nextIndex = currentIndexValue > -1 ? Math.max(0, currentIndexValue - Math.max(1, Math.trunc(step))) : 0
  updateCurrentValue(items[nextIndex].value, { keepVisible: true })
}

// 这里是下一帧切换逻辑，只在真实数据中移动，不会落到骨架刻度上。
function next(step = 1) {
  const items = actualItems.value.filter(item => !item.disabled)
  const currentIndexValue = items.findIndex(item => item.value === currentValue.value)
  if (!items.length) {
    return
  }

  const normalizedStep = Math.max(1, Math.trunc(step))
  const nextIndex = currentIndexValue > -1 ? Math.min(items.length - 1, currentIndexValue + normalizedStep) : 0
  updateCurrentValue(items[nextIndex].value, { keepVisible: true })
}

// 这里统一清理播放定时器，避免组件卸载或切换时残留后台任务。
function clearPlayTimer() {
  if (playTimer !== null) {
    window.clearInterval(playTimer)
    playTimer = null
  }
}

// 这个方法开启自动播放，并按固定时间间隔向后推进当前时间。
function play() {
  if (props.disabled || isPlaying.value || actualItems.value.length <= 1) {
    return
  }

  isPlaying.value = true
  emit('playChange', true)
  clearPlayTimer()

  playTimer = window.setInterval(() => {
    const items = actualItems.value.filter(item => !item.disabled)
    const currentIndexValue = items.findIndex(item => item.value === currentValue.value)

    if (currentIndexValue >= items.length - 1) {
      pause()
      return
    }

    updateCurrentValue(items[currentIndexValue + 1].value, { keepVisible: true })
  }, props.autoplayInterval)
}

// 这个方法关闭自动播放，并同步当前播放状态给外部。
function pause() {
  if (!isPlaying.value) {
    return
  }

  isPlaying.value = false
  emit('playChange', false)
  clearPlayTimer()
}

// 这个方法用于在播放和暂停之间切换，右侧中间按钮会直接调用它。
function togglePlay() {
  if (isPlaying.value) {
    pause()
    return
  }

  play()
}

// 这个方法根据鼠标滚轮缩放可视窗口，并尽量让缩放中心跟随鼠标位置。
function handleWheel(event: WheelEvent) {
  if (!props.zoomable || props.disabled || !canvasRef.value || !zr) {
    return
  }

  event.preventDefault()

  const layout = getLayout()
  const slots = buildSlots(layout)

  if (slots.length <= 2) {
    return
  }

  const currentVisibleCount = getVisibleCount(slots.length)
  const startIndex = clampViewportStart(slots.length, currentVisibleCount, viewportStartIndex.value)
  const endIndex = Math.min(slots.length - 1, startIndex + currentVisibleCount - 1)
  const hasHiddenData = startIndex > 0 || endIndex < slots.length - 1
  const wantsPan = hasHiddenData && (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey)

  if (wantsPan) {
    const panDelta = Math.abs(event.deltaX) > 0 ? event.deltaX : event.deltaY
    const panStep = Math.max(1, Math.round(Math.abs(panDelta) / 60))
    const direction = panDelta > 0 ? 1 : -1
    viewportStartIndex.value = clampViewportStart(
      slots.length,
      currentVisibleCount,
      viewportStartIndex.value + direction * panStep
    )
    scheduleRender()
    return
  }

  const rect = canvasRef.value.getBoundingClientRect()
  const localX = Math.min(layout.trackRight, Math.max(layout.trackLeft, event.clientX - rect.left))
  const anchorRatio = layout.trackWidth > 0 ? (localX - layout.trackLeft) / layout.trackWidth : 0
  const anchorIndex = startIndex + anchorRatio * Math.max(1, endIndex - startIndex)
  const maxZoomLevel = getMaxZoomLevelByLabelCapacity(layout, slots.length)
  const nextZoomLevel = event.deltaY < 0 ? zoomLevel.value * 1.25 : zoomLevel.value / 1.25

  zoomLevel.value = Math.min(maxZoomLevel, Math.max(1, nextZoomLevel))

  const nextVisibleCount = getVisibleCount(slots.length)
  const nextStartIndex = Math.round(anchorIndex - anchorRatio * Math.max(1, nextVisibleCount - 1))
  viewportStartIndex.value = clampViewportStart(slots.length, nextVisibleCount, nextStartIndex)

  scheduleRender()
}

// 这里返回时间轴主体可交互区域，点击和拖拽都会基于它判断是否进入时间轴交互。
function getTimelineInteractiveArea(layout: AxisLayout): AxisHitArea {
  return {
    x: layout.trackLeft - 10,
    y: 0,
    width: layout.trackWidth + 20,
    height: layout.labelTop + 20
  }
}

function setCanvasCursor(cursor: 'default' | 'pointer' | 'not-allowed' | 'grabbing') {
  currentCursor.value = cursor

  if (rootRef.value) {
    rootRef.value.style.cursor = cursor
  }

  if (canvasRef.value) {
    canvasRef.value.style.cursor = cursor
    const canvasElement = canvasRef.value.querySelector('canvas')
    if (canvasElement instanceof HTMLCanvasElement) {
      canvasElement.style.cursor = cursor
    }
  }

  if (zr && typeof zr.setCursorStyle === 'function') {
    zr.setCursorStyle(cursor)
  }
}

// 这里根据当前命中区域更新鼠标样式，只有真正可交互的元素才显示 pointer。
function updateCursorByPoint(localX: number, localY: number) {
  if (props.disabled || !lastRenderState) {
    setCanvasCursor(props.disabled ? 'not-allowed' : 'default')
    return
  }

  if (isDragging.value) {
    setCanvasCursor('grabbing')
    return
  }

  const isTickHover = lastRenderState.tickAreas.some(tickArea => isPointInArea(localX, localY, tickArea.area))
  const isLabelHover = lastRenderState.labelAreas.some(labelArea => isPointInArea(localX, localY, labelArea.area))
  const isPositionHover = isPointInArea(localX, localY, lastRenderState.positionArea)
  const isControlHover = lastRenderState.controlAreas.some(area => isPointInArea(localX, localY, area))

  setCanvasCursor(isTickHover || isLabelHover || isPositionHover || isControlHover ? 'pointer' : 'default')
}

// 这里根据本地坐标命中具体刻度线后再切换时间点，不再做最近项吸附。
function selectByLocalPoint(localX: number, localY: number) {
  if (props.disabled || !lastRenderState) {
    return
  }

  const { slots } = lastRenderState
  const labelHitIndex =
    lastRenderState.labelAreas.find(labelArea => isPointInArea(localX, localY, labelArea.area))?.index ?? -1
  const targetIndex = labelHitIndex > -1 ? labelHitIndex : findHitTickIndex(lastRenderState, localX, localY)

  if (targetIndex > -1 && isClickableSlot(slots[targetIndex])) {
    pause()
    updateCurrentValue(slots[targetIndex].value as TimeAxisValue)
  }
}

// 这里按 Cesium Timeline 的 scrub 思路处理拖动：在可视区内改当前值，超出左右边界时继续带动窗口滚动。
function scrubByLocalX(localX: number) {
  if (props.disabled || !lastRenderState) {
    return
  }

  const { layout, slots, startIndex, endIndex } = lastRenderState
  const visibleCount = endIndex - startIndex + 1
  const denominator = Math.max(1, visibleCount - 1)
  const trackWidth = Math.max(1, layout.trackWidth)
  const slotPixelWidth = denominator > 0 ? trackWidth / denominator : trackWidth
  const safeSlotPixelWidth = Math.max(1, slotPixelWidth)
  let rawIndex = startIndex + ((localX - layout.trackLeft) / trackWidth) * denominator
  let roundMode: 'nearest' | 'floor' | 'ceil' = 'nearest'

  if (localX < layout.trackLeft) {
    rawIndex = startIndex - (layout.trackLeft - localX) / (safeSlotPixelWidth * resolvedDragOverflowDamping.value)
    roundMode = 'floor'
  } else if (localX > layout.trackRight) {
    rawIndex = endIndex + (localX - layout.trackRight) / (safeSlotPixelWidth * resolvedDragOverflowDamping.value)
    roundMode = 'ceil'
  }

  const targetIndex = findNearestClickableIndex(slots, rawIndex, roundMode)

  if (targetIndex < 0) {
    return
  }

  let viewportChanged = false
  if (targetIndex < startIndex) {
    viewportStartIndex.value = clampViewportStart(slots.length, visibleCount, targetIndex)
    viewportChanged = true
  } else if (targetIndex > endIndex) {
    viewportStartIndex.value = clampViewportStart(slots.length, visibleCount, targetIndex - visibleCount + 1)
    viewportChanged = true
  }

  const targetValue = slots[targetIndex]?.value as TimeAxisValue | null

  if (targetValue !== null && dragPreviewValue.value !== targetValue) {
    dragPreviewValue.value = targetValue
    scheduleRender()
    return
  }

  if (viewportChanged) {
    scheduleRender()
  }
}

function stopDragScrubLoop() {
  if (dragScrubRafId) {
    window.cancelAnimationFrame(dragScrubRafId)
    dragScrubRafId = 0
  }
}

function startDragScrubLoop() {
  stopDragScrubLoop()
  dragLastOverflowScrubAt = 0

  const run = () => {
    if (!isPointerDown.value) {
      dragScrubRafId = 0
      return
    }

    const state = lastRenderState
    if (state && (dragLocalX < state.layout.trackLeft || dragLocalX > state.layout.trackRight)) {
      const now = performance.now()
      const overflowInterval = Math.max(16, resolvedDragOverflowDamping.value * 12)

      if (dragLastOverflowScrubAt === 0 || now - dragLastOverflowScrubAt >= overflowInterval) {
        dragLastOverflowScrubAt = now
        dragMoved = true
        scrubByLocalX(dragLocalX)
      }
    }

    dragScrubRafId = window.requestAnimationFrame(run)
  }

  dragScrubRafId = window.requestAnimationFrame(run)
}

interface ZrPointerEvent {
  offsetX: number
  offsetY: number
  event?: MouseEvent
}

// 这里处理画布点击，包括右侧控制按钮点击和轨道点击切换。
function handleZrClick(event: ZrPointerEvent) {
  if (props.disabled || !lastRenderState) {
    return
  }

  if (dragMoved) {
    dragMoved = false
    return
  }

  const point = getOffsetPoint(event.offsetX, event.offsetY)
  const { controlAreas, layout } = lastRenderState
  const buttonIndex = controlAreas.findIndex(area => isPointInArea(point.x, point.y, area))

  if (buttonIndex === 0) {
    pause()
    prev(1)
    return
  }

  if (buttonIndex === 1) {
    togglePlay()
    return
  }

  if (buttonIndex === 2) {
    pause()
    next(1)
    return
  }

  const trackArea = getTimelineInteractiveArea(layout)

  if (isPointInArea(point.x, point.y, trackArea)) {
    selectByLocalPoint(point.x, point.y)
  }
}

// 这里在按下鼠标时进入 Cesium 风格的 scrub 模式，后续移动会实时更新当前时间。
function handleZrMouseDown(event: ZrPointerEvent) {
  if (props.disabled || !lastRenderState) {
    return
  }

  const point = getOffsetPoint(event.offsetX, event.offsetY)
  const { controlAreas, thumbArea, layout } = lastRenderState

  if (controlAreas.some(area => isPointInArea(point.x, point.y, area))) {
    return
  }

  const trackArea = getTimelineInteractiveArea(layout)

  if (!isPointInArea(point.x, point.y, trackArea) && !isPointInArea(point.x, point.y, thumbArea)) {
    return
  }

  event.event?.preventDefault()
  dragMoved = false
  isPointerDown.value = true
  isDragging.value = false
  pointerDownLocalX = point.x
  pointerDownLocalY = point.y
  dragLocalX = point.x
  startDragScrubLoop()
  window.addEventListener('mousemove', handleDocumentMouseMove)
  window.addEventListener('mouseup', handleDocumentMouseUp)
}

// 这里在拖动过程中持续切换当前时间，实现拖拽切换效果。
function handleDocumentMouseMove(event: MouseEvent) {
  if (!isPointerDown.value) {
    return
  }

  const point = getLocalPoint(event)
  const moveDistance = Math.hypot(point.x - pointerDownLocalX, point.y - pointerDownLocalY)

  dragLocalX = point.x

  if (!isDragging.value) {
    if (moveDistance < 3) {
      return
    }

    isDragging.value = true
    dragMoved = true
    dragPreviewValue.value = currentValue.value
    setCanvasCursor('grabbing')
  } else {
    dragMoved = true
    setCanvasCursor('grabbing')
  }

  if (lastRenderState && (point.x < lastRenderState.layout.trackLeft || point.x > lastRenderState.layout.trackRight)) {
    return
  }

  scrubByLocalX(point.x)
}

// 这里结束拖动并清理全局事件监听。
function handleDocumentMouseUp(event?: MouseEvent) {
  const previewValue = dragPreviewValue.value
  isPointerDown.value = false
  isDragging.value = false
  dragPreviewValue.value = null
  stopDragScrubLoop()
  window.removeEventListener('mousemove', handleDocumentMouseMove)
  window.removeEventListener('mouseup', handleDocumentMouseUp)

  if (dragMoved && previewValue !== null && previewValue !== currentValue.value) {
    pause()
    updateCurrentValue(previewValue)
  }

  if (event) {
    const point = getLocalPoint(event)
    updateCursorByPoint(point.x, point.y)
    return
  }

  setCanvasCursor(props.disabled ? 'not-allowed' : 'default')
}

function handleZrMouseMove(event: ZrPointerEvent) {
  updateCursorByPoint(event.offsetX, event.offsetY)
}

function handleZrGlobalOut() {
  setCanvasCursor(props.disabled ? 'not-allowed' : 'default')
}

// 这个方法负责创建 zrender 实例，只会在组件挂载后执行一次。
function initZr() {
  if (!canvasRef.value || zr) {
    return
  }

  zr = init(canvasRef.value, {
    renderer: 'canvas'
  })
  stageGroup = new Group()
  zr.add(stageGroup)
  zr.on('click', handleZrClick)
  zr.on('mousedown', handleZrMouseDown)
  zr.on('mousemove', handleZrMouseMove)
  zr.on('globalout', handleZrGlobalOut)
}

// 这里在组件尺寸变化时调用 zrender 的 resize，并触发一次完整重绘。
function refreshLayout() {
  zr?.resize()
  scheduleRender()
}

// 这个方法统一做渲染节流，避免 resize 和滚轮缩放时重复高频重绘。
function scheduleRender() {
  if (renderRafId) {
    window.cancelAnimationFrame(renderRafId)
  }

  renderRafId = window.requestAnimationFrame(() => {
    renderRafId = 0
    renderScene()
  })
}

// 这里是时间轴的核心绘制方法，轨道、骨架、刻度、label、按钮都在这里统一完成。
function renderScene() {
  if (!zr || !stageGroup) {
    return
  }

  const currentStageGroup = stageGroup

  const layout = getLayout()
  const theme = getTheme()
  const slots = buildSlots(layout)
  const activeIndex = getActiveIndex(slots)
  const visibleCount = getVisibleCount(slots.length)

  viewportStartIndex.value = clampViewportStart(slots.length, visibleCount, viewportStartIndex.value)

  const startIndex = clampViewportStart(slots.length, visibleCount, viewportStartIndex.value)
  const endIndex = Math.min(slots.length - 1, startIndex + visibleCount - 1)
  const majorTickStep = getMajorTickStep(endIndex - startIndex + 1, layout.trackWidth)
  const tickRenderStep = getTickRenderStep(endIndex - startIndex + 1, layout.trackWidth)
  const visibleLabels = buildVisibleLabels(layout, slots, startIndex, endIndex)
  const currentLabelNode = getCurrentLabelNode(layout, slots, startIndex, endIndex, activeIndex)
  const activeX = activeIndex > -1 ? getSlotX(layout, startIndex, endIndex, activeIndex) : layout.trackLeft
  const activeWidth = Math.max(0, Math.min(layout.trackWidth, activeX - layout.trackLeft))
  const controlAreas: AxisHitArea[] = []
  const tickAreas: AxisTickArea[] = []
  const labelAreas: AxisLabelArea[] = []
  const positionWidth = 4
  const positionArea =
    activeIndex > -1
      ? {
          x: activeX - positionWidth / 2,
          y: layout.trackTop,
          width: positionWidth,
          height: layout.trackHeight
        }
      : null

  currentStageGroup.removeAll()

  // 这里先绘制基础轨道底板。
  currentStageGroup.add(
    new Rect({
      shape: {
        x: layout.trackLeft,
        y: layout.trackTop,
        width: layout.trackWidth,
        height: layout.trackHeight,
        r: 0
      },
      style: {
        fill: theme.primaryOpacity
      },
      silent: true
    })
  )

  // 这里绘制当前时间之前的高亮区，满足“从开始高亮到当前选中值”的需求。
  currentStageGroup.add(
    new Rect({
      shape: {
        x: layout.trackLeft,
        y: layout.trackTop,
        width: activeWidth,
        height: layout.trackHeight,
        r: 0
      },
      style: {
        fill: theme.primary
      },
      silent: true
    })
  )

  // 这里循环绘制所有可视刻度，长短刻度和骨架刻度会自动区分样式。
  for (let index = startIndex; index <= endIndex; index += 1) {
    const slot = slots[index]
    const visibleOffset = index - startIndex
    const shouldRenderTick =
      index === startIndex || index === endIndex || index === activeIndex || visibleOffset % tickRenderStep === 0

    if (!shouldRenderTick) {
      continue
    }

    const x = getSlotX(layout, startIndex, endIndex, index)
    const isMajor =
      visibleOffset % majorTickStep === 0 || index === startIndex || index === endIndex || index === activeIndex
    const tickHeight = isMajor ? layout.trackHeight * 0.8 : Math.max(1, Math.round(layout.trackHeight * 0.6))
    const tickY = layout.trackTop + (layout.trackHeight - tickHeight) / 2
    const tickColor = slot.skeleton ? theme.disabledBorder : theme.border

    if (isClickableSlot(slot)) {
      tickAreas.push({
        index,
        area: {
          x: x - resolvedTickHitPadding.value,
          y: tickY,
          width: Math.max(1, resolvedTickHitPadding.value * 2),
          height: tickHeight
        }
      })
    }

    currentStageGroup.add(
      new Line({
        shape: {
          x1: x,
          y1: tickY,
          x2: x,
          y2: tickY + tickHeight
        },
        style: {
          stroke: tickColor,
          lineWidth: 1
        },
        silent: true
      })
    )
  }

  // 这里绘制经过碰撞检测后的 label，首尾 label 会自动收口，不超出容器边界。
  visibleLabels.forEach(labelNode => {
    if (isClickableSlot(slots[labelNode.index])) {
      const labelWidth = Math.max(1, labelNode.right - labelNode.left)
      labelAreas.push({
        index: labelNode.index,
        area: {
          x: labelNode.left,
          y: layout.labelTop,
          width: labelWidth,
          height: measuredFontMetrics.value.textHeight
        }
      })
    }

    currentStageGroup.add(
      new Text({
        style: {
          x: labelNode.x,
          y: layout.labelTop,
          text: labelNode.text,
          fill: labelNode.index === activeIndex ? theme.textPrimary : theme.textSecondary,
          font: axisFont.value,
          align: labelNode.align,
          verticalAlign: 'top'
        },
        silent: true
      })
    )
  })

  // 这里绘制上方当前时间标签，是否显示完全由 showCurrentLabel 控制。
  if (currentLabelNode) {
    currentStageGroup.add(
      new Text({
        style: {
          x: currentLabelNode.x,
          y: layout.currentLabelTop,
          text: currentLabelNode.text,
          fill: theme.textPrimary,
          font: axisFont.value,
          align: 'center',
          verticalAlign: 'top'
        },
        silent: true
      })
    )
  }

  // 这里绘制当前位置指示图标，它会跟随当前选中值一起移动。
  if (activeIndex > -1) {
    stageGroup.add(
      new ZImage({
        style: {
          image: positionIcon,
          x: positionArea?.x,
          y: positionArea?.y,
          width: positionArea?.width,
          height: positionArea?.height
        },
        silent: true
      })
    )
  }

  // 这里在画布右侧绘制上一帧、播放、下一帧按钮，风格跟你给的图保持一致。
  if (props.showControls) {
    const controlIcons = [lastIcon, playIcon, nextIcon]

    controlIcons.forEach((icon, buttonIndex) => {
      const buttonX = layout.controlLeft + buttonIndex * (layout.controlSize + layout.controlGap)
      const iconWidth = 8
      const iconHeight = 12
      const iconX = buttonX + Math.round((layout.controlSize - iconWidth) / 2)
      const iconY = layout.controlTop + Math.round((layout.controlSize - iconHeight) / 2)
      const buttonRect = new Rect({
        shape: {
          x: buttonX,
          y: layout.controlTop,
          width: layout.controlSize,
          height: layout.controlSize,
          r: 0
        },
        style: {
          fill: theme.primary,
          stroke: theme.base,
          lineWidth: 1
        }
      })

      buttonRect.silent = true
      currentStageGroup.add(buttonRect)
      controlAreas.push({
        x: buttonX,
        y: layout.controlTop,
        width: layout.controlSize,
        height: layout.controlSize
      })

      // 这里中间按钮在播放状态下改成两根竖线，其余状态继续使用图标资源。
      if (buttonIndex === 1 && isPlaying.value) {
        const pauseBarWidth = 2
        const pauseBarHeight = 10
        const pauseBarGap = 4
        const pauseGroupWidth = pauseBarWidth * 2 + pauseBarGap
        const pauseStartX = buttonX + Math.round((layout.controlSize - pauseGroupWidth) / 2)
        const pauseY = layout.controlTop + Math.round((layout.controlSize - pauseBarHeight) / 2)

        currentStageGroup.add(
          new Rect({
            shape: {
              x: pauseStartX,
              y: pauseY,
              width: pauseBarWidth,
              height: pauseBarHeight
            },
            style: {
              fill: theme.base
            },
            silent: true
          })
        )

        currentStageGroup.add(
          new Rect({
            shape: {
              x: pauseStartX + pauseBarWidth + pauseBarGap,
              y: pauseY,
              width: pauseBarWidth,
              height: pauseBarHeight
            },
            style: {
              fill: theme.base
            },
            silent: true
          })
        )
      } else {
        currentStageGroup.add(
          new ZImage({
            style: {
              image: icon,
              x: iconX,
              y: iconY,
              width: iconWidth,
              height: iconHeight
            },
            silent: true
          })
        )
      }
    })
  }

  lastRenderState = {
    layout,
    slots,
    startIndex,
    endIndex,
    activeIndex,
    thumbArea:
      activeIndex > -1
        ? {
            x: activeX - 12,
            y: 0,
            width: 24,
            height: layout.labelTop + 20
          }
        : null,
    controlAreas,
    tickAreas,
    labelAreas,
    positionArea
  }

  zr.refreshImmediately()
}

// 这里在组件挂载后初始化 zrender、监听尺寸变化，并把滚轮缩放能力挂到容器上。
onMounted(async () => {
  await nextTick()
  initZr()
  syncCurrentValue()
  refreshLayout()

  if (canvasRef.value) {
    canvasRef.value.addEventListener('wheel', handleWheel, { passive: false })
  }

  if (rootRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      refreshLayout()
    })

    resizeObserver.observe(rootRef.value)
  }

  window.addEventListener('resize', refreshLayout, { passive: true })
  window.visualViewport?.addEventListener('resize', refreshLayout)
})

// 这里在组件卸载时统一清理实例、事件和定时器，避免内存泄漏。
onBeforeUnmount(() => {
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('wheel', handleWheel)
  }

  resizeObserver?.disconnect()
  resizeObserver = null
  clearPlayTimer()

  if (renderRafId) {
    window.cancelAnimationFrame(renderRafId)
  }

  stopDragScrubLoop()

  window.removeEventListener('resize', refreshLayout)
  window.visualViewport?.removeEventListener('resize', refreshLayout)
  handleDocumentMouseUp()
  zr?.dispose()
  zr = null
  stageGroup = null
  lastRenderState = null
})

// 这里监听外部数据变化，重新同步选中项、缩放窗口和绘制结果。
watch(
  () => props.list,
  () => {
    dragPreviewValue.value = null
    syncCurrentValue()
    resetZoom()
    scheduleRender()
  },
  { deep: true, immediate: true }
)

// 这里监听外部 v-model 变化，确保受控模式下也能实时重绘。
watch(
  () => props.modelValue,
  () => {
    if (dragPreviewValue.value !== null && dragPreviewValue.value === props.modelValue) {
      dragPreviewValue.value = null
    }
    syncCurrentValue()
    scheduleRender()
  },
  { immediate: true }
)

// 这里监听播放状态和缩放状态，只要内部状态变化就重新绘制。
watch([zoomLevel, viewportStartIndex, isPlaying], () => {
  scheduleRender()
})

// 这里监听字体和布局开关变化，配置更新后立即重新计算容器高度并重绘。
watch(
  [
    () => props.fontSize,
    () => props.fontFamily,
    () => props.showCurrentLabel,
    () => props.showControls,
    () => props.tickHitPadding
  ],
  () => {
    refreshLayout()
  }
)

watch(
  () => props.disabled,
  disabled => {
    setCanvasCursor(disabled ? 'not-allowed' : 'default')
  },
  { immediate: true }
)

defineExpose<TimeAxisExpose>({
  refreshLayout,
  resetZoom,
  prev,
  next,
  play,
  pause,
  togglePlay
})
</script>

<style scoped lang="scss">
@use './index';
</style>
