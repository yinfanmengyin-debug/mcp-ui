<script lang="ts" setup>
import './style/index.scss'
import { createGuid, deepObjectMerge, disableScroll, enableScroll } from '@/src/timeAxis/utils'
import { ElTooltip } from 'element-plus'
import { debounce } from 'lodash-es'
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import lastIcon from './playIcon/lastIcon.vue'
import nextIcon from './playIcon/nextIcon.vue'
import pauseIcon from './playIcon/pauseIcon.vue'
import playIcon from './playIcon/playIcon.vue'
import refreshIcon from './playIcon/refreshIcon.vue'
import TimeAxis from './timeAxis'
import type { TimeAxisConfig, TimeAxisItem } from './types'

defineOptions({ name: 'MtTimeAxis' })

const uuid = ref('')
const timeAxisConfig = inject<TimeAxisConfig>('timeAxisConfig')
const progress = ref<HTMLDivElement | null>(null)
const slider = ref<HTMLDivElement | null>(null)
const sliderBar = ref<HTMLDivElement | null>(null)
const sliderTick = ref<HTMLDivElement | null>(null)
const sliderMarks = ref<HTMLDivElement | null>(null)
const tooltip = ref<typeof ElTooltip | null>(null)
const timeAxis = ref<TimeAxis>()
const props = withDefaults(
  defineProps<{
    modelValue: string
    config: TimeAxisConfig
    autoHeight?: boolean // 是否自适应高度
    autoUpdate?: boolean // 是否自动更新
  }>(),
  {
    modelValue: undefined,
    autoUpdate: true,
    autoHeight: false,
    config: () => ({
      unit: 'year',
      ratio: 1,
      control: true,
      formatList: ['YYYY'],
      controlStyle: {},
      blockStyle: {},
      sliderStyle: {}
    })
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  refresh: [value: () => void]
  change: [value: TimeAxisItem<any>]
  clickStart: any
  startPlay: any
}>()

defineExpose({
  setData,
  play,
  pause,
  next,
  last,
  instance: timeAxis,
  originData: computed(() => timeAxis.value?.originData),
  playing: computed(() => timeAxis.value?.playStatus)
})

function setData(current?: string) {
  timeAxis.value?.setData(current)
}

function play() {
  timeAxis.value?.play()
}

function pause() {
  timeAxis.value?.pause()
}

function next() {
  timeAxis.value?.next()
}

function last() {
  timeAxis.value?.last()
}

const iconStyleConfig = computed(() => {
  const controlStyle = deepObjectMerge(
    timeAxisConfig?.controlStyle ? { ...timeAxisConfig.controlStyle } : {},
    props.config.controlStyle || {}
  )
  return {
    playPolylineColors: controlStyle?.playPolylineColors,
    playPolygonColors: controlStyle?.playPolygonColors,
    hoverPolylineColors: controlStyle?.hoverPolylineColors,
    hoverPolygonColors: controlStyle?.hoverPolygonColors,
    playInnerColor: controlStyle?.playInnerColor,
    hoverInnerColor: controlStyle?.hoverInnerColor
  }
})

const showControl = computed(() => timeAxis.value && timeAxis.value.options.control && timeAxis.value.formatData.length)

function tabClick(e: any, index: number) {
  const pos = parseFloat(e.index)
  const current = timeAxis.value!.formatData[index][pos]
  // 当只有一层时间轴就不需要更新了
  timeAxis.value?.updateFormatData(current.value)
  timeAxis.value?.updateFormatId(current.value)
  if (timeAxis.value!.playing) {
    timeAxis.value!.resetRequestLength()
  }
}

// 刷新
function refresh() {
  emit('refresh', timeAxis.value!.update.bind(timeAxis.value!))
}

// 选中日期发生变化
watch(
  () => timeAxis.value?.current,
  value => {
    emit('update:modelValue', value!)
    emit('change', {
      value: value!,
      data: timeAxis.value!.getData(),
      last: timeAxis.value!.getLastDate(),
      next: timeAxis.value!.getNextDate(),
      index: timeAxis.value!.currentIndex!
    })
  }
)

watch(props.config, debounce(createAxis, 50))

async function createAxis() {
  await createNewAxis(getConfig())
}

async function createNewAxis(config: TimeAxisConfig) {
  timeAxis.value = new TimeAxis({ ...config, startPlay: startPlaying })
  await nextTick()
  timeAxis.value.createSlider(
    progress.value,
    slider.value,
    sliderBar.value,
    sliderTick.value,
    sliderMarks.value,
    tooltip.value
  )
}

function onSliderMouseDown(event: MouseEvent | TouchEvent) {
  timeAxis.value?.onSliderMouseDown(event)
}

function onButtonDown() {
  timeAxis.value?.onButtonDown()
}

function onButtonMove(event: MouseEvent | TouchEvent) {
  timeAxis.value?.onButtonMove(event)
}

function handleMouseEnter() {
  timeAxis.value?.handleMouseEnter()
}

function handleMouseLeave() {
  timeAxis.value?.handleMouseLeave()
}

function onWheel(event: WheelEvent) {
  timeAxis.value?.onWheel(event)
}

function getConfig() {
  let share = true
  const singleConfig = { ...props.config }
  if (singleConfig.blockStyle || singleConfig.controlStyle || singleConfig.sliderStyle) {
    share = false
  }
  const blockStyle = deepObjectMerge(
    timeAxisConfig?.blockStyle ? { ...timeAxisConfig.blockStyle } : {},
    singleConfig.blockStyle || {}
  )
  const sliderStyle = deepObjectMerge(
    timeAxisConfig?.sliderStyle ? { ...timeAxisConfig.sliderStyle } : {},
    singleConfig.sliderStyle || {}
  )
  singleConfig.blockStyle = { ...blockStyle }
  singleConfig.sliderStyle = { ...sliderStyle }
  const config: TimeAxisConfig = {
    ...(timeAxisConfig || {}),
    ...(singleConfig || {}),
    uuid: uuid.value,
    current: props.modelValue
  }
  config.share = share
  return config
}

const config = computed(getConfig)

function clickPlay () {
  timeAxis.value?.play()
  emit('clickStart')
}

function startPlaying () {
  emit('startPlay')
}

onMounted(async () => {
  if (!uuid.value) {
    uuid.value = createGuid()
  }
  await createNewAxis(getConfig())
})
</script>
<template>
  <div :id="`mt-${uuid}`" :class="[config.share ? 'mt-share' : `mt-${uuid}`]" class="mt-axis">
    <!--方块时间轴-->
    <div
      v-if="timeAxis && timeAxis.options.type === 'block' && timeAxis.formatData.length"
      :class="{ 'auto-height': props.autoHeight }"
      class="axis-block"
    >
      <el-tabs
        v-for="(axis, index) in timeAxis.formatData"
        :key="index"
        v-model="timeAxis.formatIds[index]"
        :stretch="true"
        class="block-list"
        type="card"
        @tab-click="(e: any) => tabClick(e, index)"
      >
        <el-tab-pane
          v-for="(item, _idx) in axis"
          :key="_idx"
          :disabled="item.disabled"
          :label="item.label"
          :name="_idx"
        />
      </el-tabs>
    </div>
    <!--刻度时间轴-->
    <div
      v-else-if="timeAxis && timeAxis.options.type === 'slider' && timeAxis.formatData.length"
      :key="timeAxis?.key"
      ref="slider"
      class="axis-slider"
      @mouseenter="() => disableScroll()"
      @mouseleave="() => enableScroll()"
      @wheel="onWheel"
    >
      <div class="axis-slider-wrapper">
        <div ref="progress" class="axis-slider-progress" @click="onButtonMove">
          <div ref="sliderBar" class="axis-slider-bar"></div>
          <el-tooltip
            ref="tooltip"
            :visible="
              (timeAxis.sliderConfig.tooltipVisible || timeAxis.options?.alwaysTooltip) && timeAxis.tooltipVisible
            "
            persistent
            placement="top"
            popper-class="axis-slider-label-tooltip"
          >
            <template #content>
              <span class="axis-slider-label">{{ timeAxis.sliderConfig.label }}</span>
            </template>
            <div
              ref="axis-slider-button"
              :style="{ left: timeAxis.sliderConfig.buttonPosition }"
              class="axis-slider-button"
              @blur="handleMouseLeave"
              @focus="handleMouseEnter"
              @mousedown="onButtonDown"
              @mouseenter="handleMouseEnter"
              @mouseleave="handleMouseLeave"
              @touchstart="onButtonDown"
            ></div>
          </el-tooltip>
        </div>
        <div class="axis-slider-drag" @mousedown="onSliderMouseDown" @touchstart="onSliderMouseDown">
          <div ref="sliderTick" class="axis-slider-tick" style="height: 16px">
            <div
              v-for="(item, index) in timeAxis.sliderData"
              :key="index"
              :class="{ 'long-tick': item.showLabel, 'tick-disabled': item.disabled }"
              :style="{ width: item.width, height: item.height, left: item.left }"
              :title="item.label"
              class="tick"
            ></div>
          </div>
          <div ref="sliderMarks" class="axis-slider-marks" style="height: 14px">
            <div
              v-for="(item, index) in timeAxis.sliderData"
              v-show="item.showLabel"
              :key="index"
              :style="{ left: item.left }"
              class="mark"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="center-no-date">时间轴暂无数据...</div>
    <div v-if="showControl" id="mt-axis-play-control" class="axis-play-control">
      <div class="control-item">
        <div class="icon" @click="() => timeAxis?.last(true)">
          <last-icon
            :hover-inner-color="iconStyleConfig.hoverInnerColor"
            :hover-polygon-colors="iconStyleConfig.hoverPolygonColors"
            :hover-polyline-colors="iconStyleConfig.hoverPolylineColors"
            :play-inner-color="iconStyleConfig.playInnerColor"
            :play-polygon-colors="iconStyleConfig.playPolygonColors"
            :play-polyline-colors="iconStyleConfig.playPolylineColors"
          ></last-icon>
        </div>
        <div class="name">上时段</div>
      </div>
      <div class="control-item">
        <div class="icon" @click="() => (!timeAxis?.playing ? clickPlay() : timeAxis?.pause())">
          <play-icon
            v-if="!timeAxis?.playing"
            :hover-inner-color="iconStyleConfig.hoverInnerColor"
            :hover-polygon-colors="iconStyleConfig.hoverPolygonColors"
            :hover-polyline-colors="iconStyleConfig.hoverPolylineColors"
            :play-inner-color="iconStyleConfig.playInnerColor"
            :play-polygon-colors="iconStyleConfig.playPolygonColors"
            :play-polyline-colors="iconStyleConfig.playPolylineColors"
          ></play-icon>
          <pause-icon
            v-else
            :hover-inner-color="iconStyleConfig.hoverInnerColor"
            :hover-polygon-colors="iconStyleConfig.hoverPolygonColors"
            :hover-polyline-colors="iconStyleConfig.hoverPolylineColors"
            :play-inner-color="iconStyleConfig.playInnerColor"
            :play-polygon-colors="iconStyleConfig.playPolygonColors"
            :play-polyline-colors="iconStyleConfig.playPolylineColors"
          ></pause-icon>
        </div>
        <div class="name">播放</div>
      </div>
      <div class="control-item">
        <div class="icon" @click="() => timeAxis?.next(true)">
          <next-icon
            :hover-inner-color="iconStyleConfig.hoverInnerColor"
            :hover-polygon-colors="iconStyleConfig.hoverPolygonColors"
            :hover-polyline-colors="iconStyleConfig.hoverPolylineColors"
            :play-inner-color="iconStyleConfig.playInnerColor"
            :play-polygon-colors="iconStyleConfig.playPolygonColors"
            :play-polyline-colors="iconStyleConfig.playPolylineColors"
          ></next-icon>
        </div>
        <div class="name">下时段</div>
      </div>
      <div v-if="!props.autoUpdate" class="control-item">
        <div class="icon" @click="refresh">
          <refresh-icon
            :hover-inner-color="iconStyleConfig.hoverInnerColor"
            :hover-polygon-colors="iconStyleConfig.hoverPolygonColors"
            :hover-polyline-colors="iconStyleConfig.hoverPolylineColors"
            :play-inner-color="iconStyleConfig.playInnerColor"
            :play-polygon-colors="iconStyleConfig.playPolygonColors"
            :play-polyline-colors="iconStyleConfig.playPolylineColors"
          ></refresh-icon>
        </div>
        <div class="name">刷新</div>
      </div>
    </div>
  </div>
</template>
