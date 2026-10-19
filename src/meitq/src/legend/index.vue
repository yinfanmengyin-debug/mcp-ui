<template>
  <div
    ref="self"
    :class="{
      'is-collapse': collapse,
      'is-simple': simple
    }"
    :style="{
      position,
      right,
      bottom,
      zIndex
    }"
    class="mt-legend"
  >
    <!-- 左侧按钮 -->
    <div :class="{ 'need-dividers': showCollapse && showSimpleSwitch }" class="mt-legend__action">
      <i v-if="showSimpleSwitch" class="display-switch-icon" @click="simple = !simple">
        <DisplaySwitchIcon />
      </i>
      <i v-if="showCollapse" class="collapse-icon" @click="collapse = !collapse">
        <CollapseIcon />
      </i>
    </div>
    <!--图例内容 -->
    <div :id="contentId" class="mt-legend__content">
      <div class="mt-legend__content-container">
        <!-- 图例顶部 -->
        <div v-if="!simple" class="title-bar">
          <span class="title">{{ title }}</span>
          <ul v-if="showLayerCategorySwitch" class="layer-category">
            <li
              v-for="(category, index) in layerCategories"
              :key="index"
              :class="{ active: layerCategory === category }"
              @click="categoryChange(category)"
            >
              {{ categoryNameMap[category] }}
            </li>
          </ul>
          <slot v-else name="title-right" />
        </div>
        <div v-if="$slots['before-legend'] && (!simple || !hiddenSlot)" class="before-legend">
          <slot name="before-legend" />
        </div>
        <!-- 图例列表 -->
        <div v-if="legendList.length" class="legend-list">
          <div v-for="(legend, index) in legendList" :key="index" class="legend-item">
            <!-- 名称与图层控制 -->
            <div class="toolbar">
              <span class="name">{{ legend.name }}{{ legend.unit ? ` (${legend.unit})` : '' }}</span>
              <ul v-if="!simple" class="layers-type">
                <template v-if="legend.visible">
                  <li
                    v-for="(layer, idx) in legend[`${layerCategory}Layers`]"
                    :key="`${layerCategory}-layer-${idx}`"
                    :class="{ active: legend[getCheckedLayersKey()].includes(layer.type) }"
                    @click="layersChange(index, layer.type)"
                  >
                    <el-tooltip effect="light" placement="top" popper-class="layer-type-tooltip">
                      <template #content>
                        <div
                          v-if="
                            showContourFaceOpacityControl &&
                            layer.type === 'contourFace' &&
                            legend[getCheckedLayersKey()].includes(layer.type)
                          "
                          class="contour-face-opacity-control"
                        >
                          <span>{{ layer.explain }}</span>
                          <template v-if="syncContourFaceOpacity">
                            <el-slider
                              v-model="legendList[0].contourFaceOpacity"
                              :min="0"
                              :max="1"
                              :step="0.01"
                              :show-tooltip="false"
                              size="small"
                            />
                            <span> {{ +(legendList[0].contourFaceOpacity * 100).toFixed(10) }}% </span>
                          </template>
                          <template v-else>
                            <el-slider
                              v-model="legend.contourFaceOpacity"
                              :min="0"
                              :max="1"
                              :step="0.01"
                              :show-tooltip="false"
                              size="small"
                            />
                            <span> {{ +(legend.contourFaceOpacity * 100).toFixed(10) }}% </span>
                          </template>
                        </div>
                        <template v-else>{{ layer.explain }}</template>
                      </template>
                      <component :is="typeIconMap[layer.type]" />
                    </el-tooltip>
                  </li>
                </template>
                <li v-if="legend.showSwitcher" :class="{ active: legend.visible }" @click="legendVisibleChange(index)">
                  <template v-if="legend.visible">
                    <el-tooltip effect="light" placement="top" content="隐藏">
                      <OpenEyeIcon />
                    </el-tooltip>
                  </template>
                  <template v-else>
                    <el-tooltip effect="light" placement="top" content="显示">
                      <CloseEyeIcon />
                    </el-tooltip>
                  </template>
                </li>
              </ul>
            </div>
            <div
              :style="{
                width: colorBarMaxWidth,
                height: legend.visible ? 'auto' : 0,
                cursor: legend.colorCode ? 'pointer' : 'default'
              }"
              class="colors-labels"
              @click="legend.colorCode ? showApplyDialog(index, legend.colorCode) : undefined"
            >
              <ul class="colors">
                <li
                  v-for="(item, colorIndex) in legend.colors"
                  :key="colorIndex"
                  :class="{ 'more-than-color': legend.moreThanColor }"
                  :style="{
                    width: `${legend.width}px`,
                    height: `${legend.height}px`,
                    minWidth: `${legend.width}px`,
                    background: item
                  }"
                />
              </ul>
              <ul class="labels">
                <li
                  v-for="(item, labelIndex) in legend.labels"
                  :key="labelIndex"
                  :class="{ 'less-than-color': legend.lessThanColor }"
                  :style="{
                    width: `${legend.width}px`,
                    minWidth: `${legend.width}px`,
                    fontSize: `${labelFontSize}px`
                  }"
                >
                  {{
                    (legend.labelInterval ? !labelIndex || labelIndex % (legend.labelInterval + 1) === 0 : true)
                      ? item
                      : ''
                  }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- 无数据 -->
        <slot v-else name="empty">
          <div class="mt-legend__empty">暂无数据</div>
        </slot>
        <div v-if="$slots['after-legend']" class="after-legend">
          <slot name="after-legend" />
        </div>
      </div>
    </div>
    <template v-if="applyInfo.colorCode">
      <MtApplyColorBar
        v-if="options?.useV2Editor"
        v-model="applyInfo.visible"
        :color-code="applyInfo.colorCode"
        @apply="applyColorCode"
      />
      <ApplyColorCode v-else v-model="applyInfo.visible" :color-code="applyInfo.colorCode" @apply="applyColorCode" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { colorCodeInjectionKey } from '@/src/configProvider/keys'
import type {
  ColorCode,
  ContourFaceOpacityState,
  LayerCategory,
  LayerState,
  LayerType,
  LayerTypeOther,
  LegendConf,
  LegendInfo,
  LegendProps
} from './type'
import DisplaySwitchIcon from './icons/displaySwitchIcon.vue'
import CollapseIcon from './icons/collapseIcon.vue'
import OpenEyeIcon from './icons/openEyeIcon.vue'
import CloseEyeIcon from './icons/closeEyeIcon.vue'
import { computed, inject, markRaw, nextTick, type Ref, ref, watch } from 'vue'
import { categoryNameMap, explainsMap, typeIconMap } from './dict'
import './style/index.scss'
import ApplyColorCode from './components/applyColorCode.vue'
import MtApplyColorBar from '@/src/legend/components/v2/applyColorBar.vue'
import { cloneDeep, uniqueId } from 'lodash-es'
import { useElementVisibility } from '@vueuse/core'

const CONTOUR_LAYERS: LayerType[] = ['contourFace', 'contourLine', 'stationValue', 'gridValue']
const COUNTY_LAYERS: LayerType[] = ['contourFace', 'contourLine', 'stationValue']
const POINT_LAYERS: LayerType[] = ['pointMarker', 'pointValue', 'pointName', 'pointId']

defineOptions({ name: 'MtLegend' })
defineExpose({ updateLegend, getLayerState })

const props = withDefaults(defineProps<LegendProps>(), {
  info: undefined,
  position: 'absolute',
  right: 10,
  bottom: 10,
  zIndex: 999,
  title: '图层管理',
  collapse: false,
  showCollapse: true,
  showSimpleSwitch: true,
  showLayerCategorySwitch: true,
  layerCategory: 'contour',
  layerCategories: () => ['contour', 'county', 'point'],
  simple: false,
  colorBarMaxWidth: 400,
  labelFontSize: 12,
  labelFontFamily: 'Microsoft YaHei',
  labelMinGap: 10,
  mutualExclusion: true,
  showContourFaceOpacityControl: false,
  syncContourFaceOpacity: true,
  hiddenSlot: false
})

defineSlots<{
  // 图例为空时的插槽
  empty: () => void
  // 图例标题右侧插槽 showLayerCategorySwitch 为 false 时有效
  'title-right': () => void
  // 图例前面的插槽
  'before-legend': () => void
  // 图例后面的插槽
  'after-legend': () => void
}>()

const emit = defineEmits<{
  categoryChange: [category: LayerCategory]
  layersChange: [changes: LayerState[], allState: LayerState[]]
  visibleChange: [visible: boolean, name: string, index: number]
  contourFaceOpacityChange: [changes: ContourFaceOpacityState[], allState: ContourFaceOpacityState[]]
}>()

const options = inject(colorCodeInjectionKey)

const self = ref(null)
const selfIsVisible = useElementVisibility(self)

const contentId = uniqueId('mtLegendContent')

const ctx = document.createElement('canvas').getContext('2d')!
ctx!.font = `${props.labelFontSize ?? 12}px ${props.labelFontFamily ?? 'Microsoft YaHei'}`

// 图例窗口的位置
const right = computed(() => getCssSize(props.right))
const bottom = computed(() => getCssSize(props.bottom))
const colorBarMaxWidth = computed(() => getCssSize(props.colorBarMaxWidth))

// 是否简单模式
const simple = defineModel<boolean>('simple', { default: false })
// 是否折叠图例窗口
const collapse = defineModel<boolean>('collapse', { default: false })
// 当前选择的图层类别 contour: 色斑图 point: 散点图
const layerCategory = defineModel<LayerCategory>('layerCategory', { default: 'contour' }) as Ref<LayerCategory>
// 图例信息列表
const legendList = ref<LegendConf[]>([])

// 应用色标弹窗需要的数据
const applyInfo = ref<{
  visible: boolean
  index: number
  colorCode: ColorCode | undefined
}>({
  visible: false,
  index: -1,
  colorCode: undefined
})

watch(
  () => props.info,
  info => {
    if (!info || (Array.isArray(info) && !info.length)) {
      legendList.value = []
      return
    }
    const list = Array.isArray(info) ? info : [info]
    legendList.value = legendList2LegendConf(list)
    nextTick(updateContentWidth)
  },
  { immediate: true }
)

watch(selfIsVisible, visible => {
  if (visible) {
    updateContentWidth()
  }
})

watch(
  () => legendList.value.map(t => t.contourFaceOpacity),
  (newList: number[], oldList: number[]) => {
    let changes, allState
    if (props.syncContourFaceOpacity) {
      changes = legendList.value.map((item, index) => ({
        name: item.name,
        index,
        opacity: legendList.value[0].contourFaceOpacity
      }))
      allState = changes
    } else {
      const changeIndex = newList.findIndex((it, i) => it !== oldList[i])
      changes = [
        {
          name: legendList.value[changeIndex].name,
          index: changeIndex,
          opacity: newList[changeIndex]
        }
      ]
      allState = legendList.value.map((item, index) => ({
        name: item.name,
        index,
        opacity: newList[index]
      }))
    }
    emit('contourFaceOpacityChange', changes, allState)
  }
)

function updateContentWidth() {
  const el = document.getElementById(contentId)
  if (el) {
    const contentContainer = el.querySelector('.mt-legend__content-container')!
    el.style.width = `${contentContainer.clientWidth}px`
  }
}

// 规范化图层类型信息
function normalizeLayerTypes(layers: (LayerType | LayerTypeOther)[]): LayerTypeOther[] {
  return layers.map((it: LayerType | LayerTypeOther) =>
    typeof it === 'string' ? { type: it, explain: explainsMap[it] } : { type: it.type, explain: it.explain }
  )
}

function legendList2LegendConf(list: LegendInfo[], ignoreLayers = false) {
  const contourLayerSet = new Set<LayerType>()
  const countyLayerSet = new Set<LayerType>()
  const pointLayerSet = new Set<LayerType>()

  const tempLegendList = list.map(item => {
    const colors = originToList<string>(item.colors, item.delimiter)
    const levels = originToList<number>(item.levels, item.delimiter, Number)
    let labels = originToList<string>(item.labels, item.delimiter)
    if (!labels.length) {
      labels = levels.map(String)
    }

    // 当前色标的原始排序方式
    let rawSort: 'asc' | 'desc' = levels.length > 1 && levels[0] > levels[levels.length - 1] ? 'desc' : 'asc'
    // 当指定的排序方式与原本的排序方式为不一致时则反转顺序
    if (item.sort && item.sort !== rawSort) {
      levels.reverse()
      colors.reverse()
      labels.reverse()
    }
    // 色斑图图层
    let contourLayers: LayerTypeOther[] = []
    let checkedContourLayers: LayerType[] = []
    let countyLayers: LayerTypeOther[] = []
    let checkedCountyLayers: LayerType[] = []
    let pointLayers: LayerTypeOther[] = []
    let checkedPointLayers: LayerType[] = []
    if (!ignoreLayers) {
      contourLayers = normalizeLayerTypes(item.contourLayers ?? CONTOUR_LAYERS)
      checkedContourLayers = item.checkedContourLayers?.length
        ? [...item.checkedContourLayers].filter(layerType => contourLayers.some(it => it.type === layerType))
        : []
      if (props.mutualExclusion) {
        if (props.mutualExclusion === 'overall' && contourLayerSet.size) {
          // 整体互斥
          checkedContourLayers = []
        } else if (typeof props.mutualExclusion === 'boolean') {
          // 单个图例的互斥
          checkedContourLayers = checkedContourLayers.filter(layer => !contourLayerSet.has(layer))
        }
      }
      if (checkedContourLayers.length) {
        checkedContourLayers.forEach(layer => contourLayerSet.add(layer))
      }

      // 县级色斑图图层
      countyLayers = normalizeLayerTypes(item.countyLayers ?? COUNTY_LAYERS)
      checkedCountyLayers = item.checkedCountyLayers?.length
        ? [...item.checkedCountyLayers].filter(layerType => countyLayers.some(it => it.type === layerType))
        : []
      if (props.mutualExclusion) {
        if (props.mutualExclusion === 'overall' && countyLayerSet.size) {
          // 整体互斥
          checkedCountyLayers = []
        } else if (typeof props.mutualExclusion === 'boolean') {
          // 单个图例的互斥
          checkedCountyLayers = checkedCountyLayers.filter(layer => !countyLayerSet.has(layer))
        }
      }
      if (checkedCountyLayers.length) {
        checkedCountyLayers.forEach(layer => countyLayerSet.add(layer))
      }

      // 散点图图层
      pointLayers = normalizeLayerTypes(item.pointLayers ?? POINT_LAYERS)
      checkedPointLayers = item.checkedPointLayers?.length
        ? [...item.checkedPointLayers].filter(layerType => pointLayers.some(it => it.type === layerType))
        : []
      if (props.mutualExclusion) {
        if (props.mutualExclusion === 'overall' && pointLayerSet.size) {
          // 整体互斥
          checkedPointLayers = []
        } else if (typeof props.mutualExclusion === 'boolean') {
          // 单个图例的互斥
          checkedPointLayers = checkedPointLayers.filter(layer => !pointLayerSet.has(layer))
        }
      }
      if (checkedPointLayers.length) {
        checkedPointLayers.forEach(layer => pointLayerSet.add(layer))
      }
    }

    // 计算图例块的宽度
    let blockWidth
    let labelInterval = 0
    const moreThanColor = labels.length > colors.length
    const { labelMinGap } = props
    if (typeof item.width === 'number') {
      blockWidth = item.width
    } else if (typeof props.colorBarMaxWidth === 'number') {
      blockWidth = props.colorBarMaxWidth / (moreThanColor ? labels.length : colors.length)
      const maxWidth =
        labels.reduce((lastWidth: number, text: number | string) => {
          const { width: w } = ctx.measureText(String(text))
          return Math.max(w, lastWidth)
        }, 0) + labelMinGap

      // 图例文字间隔数量（隔几个显示一个）
      while ((labelInterval + 1) * blockWidth < maxWidth) {
        labelInterval++
      }
    } else {
      const minWidth = item.minWidth ?? 20
      const maxWidth =
        labels.reduce((pre, cur) => {
          const { width } = ctx.measureText(cur)
          return Math.max(pre, width)
        }, 0) + labelMinGap
      // 10px 为左右 padding
      blockWidth = Math.max(Math.ceil(maxWidth), minWidth)
    }

    let contourFaceOpacity = item.contourFaceOpacity ?? 1
    if (contourFaceOpacity > 1 || contourFaceOpacity < 0) {
      contourFaceOpacity = 1
    }

    return {
      name: item.name,
      unit: item.unit ?? '',
      colors: markRaw(colors),
      levels: markRaw(levels),
      labels: markRaw(labels),
      labelInterval,
      sort: item.sort ?? rawSort,
      colorCode: item.colorCode,
      contourLayers: markRaw(contourLayers),
      checkedContourLayers,
      countyLayers: markRaw(countyLayers),
      checkedCountyLayers,
      pointLayers: markRaw(pointLayers),
      checkedPointLayers,
      visible: item.visible ?? true,
      showSwitcher: item.showSwitcher ?? true,
      width: blockWidth,
      height: item.height ?? 12,
      lessThanColor: labels.length < colors.length,
      moreThanColor,
      contourFaceOpacity
    } as LegendConf
  })

  if (!tempLegendList.flatMap(item => item.checkedContourLayers).length) {
    tempLegendList[0].checkedContourLayers = [CONTOUR_LAYERS[0]]
  }
  if (!tempLegendList.flatMap(item => item.checkedCountyLayers).length) {
    tempLegendList[0].checkedCountyLayers = [COUNTY_LAYERS[0]]
  }
  if (!tempLegendList.flatMap(item => item.checkedPointLayers).length) {
    tempLegendList[0].checkedPointLayers = [POINT_LAYERS[0]]
  }

  if (props.colorBarMaxWidth === 'auto') {
    const [maxIndex, maxTotalWidth] = tempLegendList.reduce(
      (pre, cur, currentIndex) => {
        const curWidth = cur.width * (cur.moreThanColor ? cur.labels.length : cur.colors.length)
        const maxWidth = Math.max(curWidth, pre[1])
        return [maxWidth === curWidth ? currentIndex : pre[0], maxWidth]
      },
      [0, 0]
    )
    tempLegendList.forEach((legend, index) => {
      if (index === maxIndex) return
      legend.width = maxTotalWidth / (legend.moreThanColor ? legend.labels.length : legend.colors.length)
    })
  }
  return tempLegendList
}

function updateLegend(index: number, colors: string[], levels: number[], labels: string[] = [], colorCode?: ColorCode) {
  const info = props.info
  if (!info || (Array.isArray(info) && !info.length)) return
  const list = Array.isArray(info) ? info : [info]
  const otherLegendList = list.filter((_, i) => i !== index)
  let tempLegendList
  if (legendList.value.length) {
    tempLegendList = legendList.value
      .filter((_, i) => i !== index)
      .map((item, i) => ({
        ...otherLegendList[i],
        colors: item.colors,
        levels: item.levels,
        labels: item.labels
      }))
  } else {
    tempLegendList = [...otherLegendList]
  }
  const indexLegend = list[index]
  tempLegendList.splice(index, 0, {
    ...indexLegend,
    name: colorCode?.name ?? indexLegend.name,
    unit: colorCode?.unit ?? indexLegend.unit,
    colors,
    levels,
    labels,
    colorCode
  })
  const newLegendList = legendList2LegendConf(tempLegendList, true)
  legendList.value.forEach((item, i) => {
    if (i !== index) {
      item.width = newLegendList[i].width
      item.labelInterval = newLegendList[i].labelInterval
    } else {
      const conf = newLegendList[index]
      legendList.value[i] = {
        ...item,
        name: conf.name,
        unit: conf.unit,
        colors: conf.colors,
        levels: conf.levels,
        labels: conf.labels,
        width: conf.width,
        labelInterval: conf.labelInterval,
        lessThanColor: conf.lessThanColor,
        colorCode: conf.colorCode
      }
    }
  })
}

function categoryChange(category: LayerCategory) {
  layerCategory.value = category
  emit('categoryChange', category)
}

function getCheckedLayersKey() {
  let key: `checked${Capitalize<LayerCategory>}Layers`
  if (layerCategory.value === 'contour') {
    key = 'checkedContourLayers'
  } else if (layerCategory.value === 'county') {
    key = 'checkedCountyLayers'
  } else {
    key = 'checkedPointLayers'
  }
  return key
}

/**
 * 图层改变
 * @param index 图例索引
 * @param layer 色斑图图层名称
 * @param colorCode 色标信息
 */
function layersChange(index: number, layer?: LayerType, colorCode?: ColorCode) {
  let key = getCheckedLayersKey()
  const effectIndices = [index]
  if (layer) {
    legendList.value.forEach((legend, i) => {
      const layers = legend[key]
      if (index !== i) {
        if (props.mutualExclusion) {
          // 整体互斥
          if (props.mutualExclusion === 'overall' && layers.length) {
            effectIndices.push(i)
            // 清空该图例所有图层
            layers.splice(0, layers.length)
          }
          // 单个图例的互斥
          else if (typeof props.mutualExclusion === 'boolean' && layers.includes(layer)) {
            effectIndices.push(i)
            // 如果是单个图例的互斥则只删除当前图例的该图层
            layers.splice(layers.indexOf(layer), 1)
          }
        }
        return
      }
      // 如果是当前图例则切换图层
      if (layers.includes(layer)) {
        layers.splice(layers.indexOf(layer), 1)
      } else {
        layers.push(layer)
      }
    })
  }
  emit(
    'layersChange',
    effectIndices.map(i => {
      const legend = cloneDeep(legendList.value[i])
      return {
        name: legend.name,
        index: i,
        layers: legend[key],
        colors: legend.colors,
        levels: legend.levels,
        labels: legend.labels,
        colorCode: i === index ? colorCode ?? legend.colorCode : legend.colorCode
      }
    }),
    legendList.value.map((item, i) => {
      const legend = cloneDeep(item)
      return {
        name: legend.name,
        index: i,
        layers: legend[key],
        colors: legend.colors,
        levels: legend.levels,
        labels: legend.labels,
        colorCode: i === index ? colorCode ?? legend.colorCode : legend.colorCode
      }
    })
  )
}

/**
 * 图例显示/隐藏
 */
function legendVisibleChange(index: number) {
  const legend = legendList.value[index]
  legend.visible = !legend.visible
  if (!legend.visible) {
    legend.checkedContourLayers = []
    legend.checkedCountyLayers = []
    legend.checkedPointLayers = []
  }
  emit('visibleChange', legend.visible, legend.name, index)
}

/**
 * 获取css尺寸
 * @param size 设置的尺寸
 */
function getCssSize(size: number | string) {
  if (typeof size === 'number' || /^\d+$/.test(size)) return `${size}px`
  return size
}

/**
 * 将原始值转换为列表
 * @param {string | Array<string | number>} origin 原始值
 * @param {string} delimiter 当原始值为字符串时的分隔符
 * @param {(value: (string | number)) => T} call 对原始列表或原始字符串拆分后每个元素应用的方法
 * @return {T[]}
 */
function originToList<T = string>(
  origin?: string | Array<string | number>,
  delimiter?: string,
  call?: (value: string | number) => T
): T[] {
  if (!origin) return []
  let list: T[] = []
  if (typeof origin === 'string' && origin.trim() !== '') {
    const temp = origin.trim().split(delimiter ?? ',')
    list = call ? temp.map(call) : (temp as T[])
  } else if (Array.isArray(origin)) {
    list = call ? origin.map(call) : ([...origin] as T[])
  }
  return list
}

/**
 * 显示应用色标弹窗
 * @param index 图例索引
 * @param colorCode 色标信息
 */
function showApplyDialog(index: number, colorCode: ColorCode) {
  applyInfo.value = {
    visible: true,
    index,
    colorCode
  }
}

// 应用色标
function applyColorCode(colorCode: ColorCode) {
  const { index } = applyInfo.value
  const { colors, levels, levelLabels } = colorCode
  updateLegend(index, originToList(colors), originToList(levels, ',', Number), originToList(levelLabels), colorCode)
  layersChange(index, undefined, colorCode)
  applyInfo.value.visible = false
}

// 获取当前展示的图层状态
function getLayerState() {
  return legendList.value.map((item, index) => {
    const legend = cloneDeep(item)
    return {
      name: legend.name,
      index,
      layers: legend[getCheckedLayersKey()],
      colors: legend.colors,
      levels: legend.levels,
      labels: legend.labels,
      colorCode: legend.colorCode
    }
  })
}
</script>

<style lang="less" scoped></style>
