<script setup lang="ts">
import 'element-plus/es/components/form/style/css'
import 'element-plus/es/components/form-item/style/css'
import 'element-plus/es/components/row/style/css'
import 'element-plus/es/components/checkbox/style/css'
import 'element-plus/es/components/col/style/css'
import 'element-plus/es/components/collapse/style/css'
import 'element-plus/es/components/collapse-item/style/css'
import 'element-plus/es/components/icon/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/input-number/style/css'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/option/style/css'
import 'element-plus/es/components/select-v2/style/css'
import 'element-plus/es/components/popover/style/css'
import 'element-plus/es/components/radio/style/css'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/tabs/style/css'
import 'element-plus/es/components/tab-pane/style/css'

import '../../style/v2/colorBarEditorLegendForm.scss'
import MtPalette from './palette.vue'
import type { ColorCode } from '@/src/legend/type'
import { CirclePlus, Remove } from '@element-plus/icons-vue'
import { lerp, parse, RGBToHex, sRGB } from '@texel/color'
import {
  ElButton,
  ElCheckbox,
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElOption,
  ElPopover,
  ElRadio,
  ElRow,
  ElSelect,
  ElSelectV2,
  type FormInstance
} from 'element-plus'
import { cloneDeep, uniqueId } from 'lodash-es'
import { computed, inject, nextTick, reactive, ref, shallowRef, watch } from 'vue'
import {
  applyColorBarMinMaxInjectKey,
  type ColorBarEditorLegendFormCondition,
  type ColorBarEditorLegendFormInfo,
  type ColorBlock,
  colorSchemeList,
  type ColorStop,
  error,
  type QuickSettings,
  splitStr
} from './colorBarEditor'
import MtColorCustomSelector from './colorCustomSelector.vue'
import { colorCodeInjectionKey } from '@/src/configProvider/keys'

// 图例数量最大值
const MAX = 40
// 默认色块个数
const DEFAULT_COLOR_COUNT = 8

defineOptions({ name: 'MtColorBarEditorLegendForm' })

defineExpose({ getForm })

const props = defineProps<{ colorCode: ColorCode }>()

const injectVal = inject(applyColorBarMinMaxInjectKey)
const options = inject(colorCodeInjectionKey)
const minMax = computed(() => injectVal?.value ?? [0, 100])

// 表单项的验证规则
const required = { required: true, message: '', trigger: 'blur' }

// 默认的图例表单信息
const DEFAULT_FORM: Readonly<ColorBarEditorLegendFormInfo> = {
  name: '',
  unit: '',
  levelList: [],
  labelList: [],
  colorBarType: 1,
  dataType: 1,
  missingFlag: false,
  blankFlag: false,
  minBlank: undefined,
  maxBlank: undefined,
  partViewFlag: false,
  levelFormat: 0
}
const form = reactive<ColorBarEditorLegendFormInfo>(cloneDeep(DEFAULT_FORM))

const formRef = shallowRef<FormInstance>()

// 色块个数
const colorCount = ref(DEFAULT_COLOR_COUNT)
// 当前选中的配置方案
const colorSchemeValue = ref('0')
// 当前选中配色方案的渐变颜色列表
const currentGradient = shallowRef<string[]>([])

// 颜色选择器的唯一标识
const colorSelectorId = uniqueId('ColorSelectorWrapper')
// 颜色选择器的宽度
let colorSelectorWidth = 0
let colorStops: ColorStop[] = []
// 色块列表
const colorBlockList = ref<ColorBlock[]>([])
// 当前设置颜色的色块索引
const customColorIndex = ref(0)
// 当前设置颜色的色块颜色
const customColor = ref('#FFFFFF')

// 用于虚拟触发popover显示的元素
const virtualRef = shallowRef<HTMLDivElement>()
const popoverRef = shallowRef()

// 快速设置项
const quickSettings: QuickSettings = reactive({
  type: 'range',
  min: 0,
  max: 100,
  central: 0,
  interval: 5
})

// 图例设置的更多设置
const moreSettingActives = ref()

const colorSelectorMode = ref('default')

// 默认配色
const colorList = shallowRef([{ value: '0', colorList: [] }, ...(options?.value?.colors || []), ...colorSchemeList])
/*
  保存props.colorCode.colors的原始颜色/等级/标签列表
  其不会随内部色块列表变化而改变
 */
let original = {
  colors: [] as string[],
  levels: [] as number[],
  labels: [] as string[]
}

// 是否使用过快速设置
let usedQuickSetting = false

watch(
  minMax,
  val => {
    quickSettings.min = val[0]
    quickSettings.max = val[1]
  },
  { immediate: true }
)

watch(
  () => props.colorCode,
  info => {
    formRef.value?.resetFields()
    colorSchemeValue.value = '0'
    customColorIndex.value = 0
    original = { colors: [], levels: [], labels: [] }
    usedQuickSetting = false

    // 重置表单
    colorBlockList.value = []
    Object.assign(form, cloneDeep(DEFAULT_FORM))

    if (info) {
      form.name = info.name
      form.unit = info.unit
      form.colorBarType = info.colorBarType
      form.dataType = info.dataType
      form.missingFlag = info.missingFlag
      form.blankFlag = info.blankFlag
      form.minBlank = info.minBlank
      form.maxBlank = info.maxBlank
      form.partViewFlag = info.partViewFlag
      form.levelFormat = info.levelFormat

      const colors = splitStr(info.colors)
      colorCount.value = colors.length || DEFAULT_COLOR_COUNT
      original = {
        colors,
        levels: splitStr(info.levels, Number),
        labels: splitStr(info.levelLabels)
      }
    }
    nextTick(colorSchemeChange)
  },
  { immediate: true }
)

// 色带方案变化时, 更新当前渐变色列表
function colorSchemeChange() {
  currentGradient.value = colorList.value.find(item => item.value === colorSchemeValue.value)?.colorList ?? []
  updateColorProps()
}

// 更新颜色相关属性
function updateColorProps() {
  const wrapper = document.getElementById(colorSelectorId)
  if (!wrapper) throw new Error('未找到颜色选择器容器')
  colorSelectorWidth = wrapper.clientWidth ?? 0

  colorStops = currentGradient.value.map((color, index) => ({
    pos: index / (currentGradient.value.length - 1),
    color: parse(color, sRGB)
  }))

  // 未选择色带 且 有传入colorCode时 则根据colors属性生成色块列表
  if (!colorStops.length && original.colors.length) {
    const widthAvg = colorSelectorWidth / (colorCount.value + 1)
    colorBlockList.value = Array.from({ length: colorCount.value }).map((_, index) => {
      return {
        x: Math.round(index * widthAvg + widthAvg),
        color: original.colors[index] ?? '#FFFFFF'
      }
    })
  } else {
    const length = colorCount.value + 1
    const widthAvg = colorSelectorWidth / length
    const posAvg = 1 / length
    colorBlockList.value = Array.from({ length: colorCount.value }).map((_, index) => {
      return {
        x: Math.round(index * widthAvg + widthAvg),
        color: getColorByPos(index * posAvg + posAvg)
      }
    })
  }
  if (customColorIndex.value >= colorBlockList.value.length) {
    customColorIndex.value = 0
  }

  /*
      如果 使用过快速设置 或 没有原始色标数值, 则使用快速设置生成数值列表
      否则 使用原值色标数值列表
   */
  if (usedQuickSetting || !original.levels.length) {
    quickSetting()
    form.labelList = Array.from({ length: colorCount.value }).fill('-') as string[]
  } else {
    form.levelList = Array.from({ length: colorCount.value - 1 }).map((_, index) => original.levels[index] ?? 0)
    form.labelList = Array.from({ length: colorCount.value }).map((_, index) => original.labels[index] ?? '-')
  }
}

/**
 * 根据位置获取颜色
 * @param pos 0 - 1
 */
function getColorByPos(pos: number) {
  if (!colorStops.length) return '#FFFFFF'

  // 找到此项 落在哪段 stop 中
  let a: ColorStop, b: ColorStop
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (pos >= colorStops[i].pos && pos <= colorStops[i + 1].pos) {
      a = colorStops[i]
      b = colorStops[i + 1]
      break
    }
  }
  // 转换成段内比例
  const t = (pos - a!.pos) / (b!.pos - a!.pos)
  // 插值
  const p = [lerp(a!.color[0], b!.color[0], t), lerp(a!.color[1], b!.color[1], t), lerp(a!.color[2], b!.color[2], t)]
  return RGBToHex(p)
}

// 鼠标按下时, 使色块可拖动
function enableSlider(e: MouseEvent, index: number) {
  if (!(e.target as HTMLElement).classList.contains('slider')) return
  const wrapper = document.getElementById(colorSelectorId)
  if (!wrapper) return

  customColorIndex.value = index
  let draggable = true
  // 颜色选择器最左侧的屏幕坐标
  const leftSideX = wrapper.getBoundingClientRect().left
  let minX = 0,
    maxX = colorSelectorWidth
  if (index !== 0) {
    // 如果不是第一个色块, 则最小值为前一个色块的 x 值
    minX = colorBlockList.value[index - 1].x
  }
  if (index !== colorBlockList.value.length - 1) {
    // 如果不是最后一个色块, 则最大值为下一个色块的 x 值
    maxX = colorBlockList.value[index + 1].x
  }

  // 设置slider元素样式
  // const slider = e.target as HTMLDivElement

  document.body.style.cursor = 'move'
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)

  function onMove(e: MouseEvent) {
    if (!draggable) return
    const offset = e.clientX - leftSideX
    if (offset < minX || offset > maxX) return
    colorBlockList.value[index].x = offset
    // 未选择色带时, 拖动时不设置颜色
    if (!colorStops.length) return
    // 设置色块颜色
    colorBlockList.value[index].color = getColorByPos(offset / colorSelectorWidth)
  }

  function onUp() {
    draggable = false
    document.body.style.cursor = 'auto'
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
}

// 设置虚拟触发元素
function setVirtualRef(e: MouseEvent, index: number) {
  customColorIndex.value = index
  customColor.value = colorBlockList.value[index].color
  virtualRef.value = e.target as HTMLDivElement
}

// 数值列表的快速设置
function quickSetting() {
  usedQuickSetting = true
  const { type, min, max, interval, central } = quickSettings
  const levelCount = colorCount.value - 1
  let list
  switch (type) {
    case 'min': {
      list = Array.from({ length: levelCount }, (_, i) => min + i * interval)
      break
    }
    case 'max': {
      list = Array.from({ length: levelCount }, (_, i) => max - (levelCount - i - 1) * interval)
      break
    }
    case 'range': {
      const range = numberFixed(max - min)
      let interval = numberFixed(range / (levelCount - 1))

      // 根据小数点拆分
      const intervalStrArr = interval.toString().split('.')
      /*
          如果有小数则对小数部分进行处理
          如:
            0.013 -> 0.01
            0.015 -> 0.02
       */
      if (intervalStrArr.length > 1) {
        let decimal = intervalStrArr[1]
        let index = -1
        for (let i = 0; i < decimal.length; i++) {
          if (decimal[i] !== '0') {
            index = i
            break
          }
        }
        if (index !== -1) {
          // 此处 +2 是因为 slice 方法的第二个参数是不包含的
          // 需要保留 index + 1 位小数, 则需要截取到 index + 2
          decimal = decimal.slice(0, index + 2)
          interval = Number(Number(intervalStrArr[0] + '.' + decimal).toFixed(index + 1))
        }
      }

      list = Array.from({ length: levelCount }, (_, i) => min + i * interval)
      break
    }
    case 'center': {
      const centerIndex = Math.floor(levelCount / 2)
      const array = new Array(levelCount).fill(0)
      array[centerIndex] = central
      for (let i = centerIndex - 1; i >= 0; i--) {
        array[i] = central - (centerIndex - i) * interval
      }
      for (let i = centerIndex + 1; i < levelCount; i++) {
        array[i] = central + (i - centerIndex) * interval
      }
      list = array
      break
    }
  }
  // 处理小数精度问题
  // 0.2 * 3 = 0.6000000000000001 => 0.6
  form.levelList = list.map(numberFixed)
}

// 对数字进行小数点后10位的精度处理
function numberFixed(num: number): number {
  return Number(num.toFixed(10))
}

//通过自定义颜色选择器修改色块颜色
function colorBlockColorChange(color: string) {
  console.log('colorBlockColorChange', color)
  colorBlockList.value[customColorIndex.value].color = color
  popoverRef.value?.hide()
}

// 添加色标项
function addLegendItem(direction: 'left' | 'right') {
  const current = colorBlockList.value[customColorIndex.value]
  let x
  if (direction === 'left') {
    const before = customColorIndex.value === 0 ? undefined : colorBlockList.value[customColorIndex.value - 1]
    x = before ? (current.x - before.x) / 2 + before.x : current.x / 2
    // 添加新的色块
    colorBlockList.value.splice(customColorIndex.value, 0, {
      x,
      color: getColorByPos(x / colorSelectorWidth)
    })
    form.levelList.splice(customColorIndex.value, 0, 0)
    // 往左侧添加色块后, 需要将 customColorIndex 向右移动一位 以保持选中原来的色块
    customColorIndex.value = customColorIndex.value + 1
  } else {
    const after =
      customColorIndex.value === colorBlockList.value.length - 1
        ? undefined
        : colorBlockList.value[customColorIndex.value + 1]
    x = after ? (after.x - current.x) / 2 + current.x : (colorSelectorWidth - current.x) / 2 + current.x
    // 添加新的色块
    colorBlockList.value.splice(customColorIndex.value + 1, 0, {
      x,
      color: getColorByPos(x / colorSelectorWidth)
    })
    form.levelList.splice(customColorIndex.value + 1, 0, 0)
  }
  form.labelList.splice(customColorIndex.value, 0, '-')
  colorCount.value = colorBlockList.value.length
}

// 删除色标项
function removeLegendItem() {
  if (colorBlockList.value.length <= 2) throw new Error('色标项不能少于2个')
  colorBlockList.value.splice(customColorIndex.value, 1)
  form.labelList.splice(customColorIndex.value, 1)
  if (customColorIndex.value >= form.levelList.length) {
    form.levelList.splice(form.levelList.length - 1, 1)
    customColorIndex.value = form.levelList.length
  } else {
    form.levelList.splice(customColorIndex.value, 1)
  }
  colorCount.value = colorBlockList.value.length
}

async function getForm(): Promise<ColorBarEditorLegendFormCondition> {
  try {
    await formRef.value?.validateField()
  } catch (e: any) {
    error('请输入色标名称', e)
  }

  if (form.colorBarType === 2 && form.labelList.some(item => !item)) {
    error('请检查色标等级是否输入完整')
  }

  const colors = [...colorBlockList.value.map(item => item.color)]
  // 判断是否有相同颜色
  for (let i = 0; i < colors.length - 1; i++) {
    if (colors[i] === colors[i + 1]) {
      error('请检查色标颜色是否设置正确')
    }
  }

  const levels = form.dataType === 2 ? [] : [...form.levelList]
  const labels = [...form.labelList]

  if (levels.length > 1) {
    // 判断色标数值列表是否为升序
    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i] >= levels[i + 1]) {
        error('请检查色标数值是否设置正确')
      }
    }
  }

  if (form.blankFlag && (form.minBlank === undefined || form.maxBlank === undefined)) {
    error('请设置色标两侧的最小值、最大值')
  }

  return {
    name: form.name,
    unit: form.unit,
    colors: colors.join(),
    levels: form.dataType === 1 ? levels.join() : '',
    levelLabels: form.colorBarType === 2 ? labels.join() : '',
    style: '1',
    colorBarType: form.colorBarType,
    dataType: form.dataType,
    missingFlag: form.missingFlag,
    // 此版本这两个参数未用到
    minMissing: undefined,
    maxMissing: undefined,
    blankFlag: form.blankFlag,
    minBlank: form.blankFlag ? form.minBlank : undefined,
    maxBlank: form.blankFlag ? form.maxBlank : undefined,
    partViewFlag: form.partViewFlag,
    levelFormat: form.levelFormat
  }
}
</script>

<template>
  <div class="mt-color-bar-editor-legend-form mt-color-bar-editor-form-wrapper">
    <div class="form-title">图例编辑/预览</div>
    <el-form ref="formRef" :model="form" :label-width="100">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="色标名称：" prop="name" :rules="required">
            <el-input v-model="form.name" placeholder="请输入色标名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单位：" prop="unit">
            <el-input v-model="form.unit" placeholder="请输入色标单位" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="色块个数：">
            <el-input-number
              v-model="colorCount"
              class="color-count"
              placeholder="请输入色块个数"
              :min="2"
              :max="MAX"
              :step="1"
              step-strictly
              :precision="0"
              :controls="false"
              :value-on-clear="9"
              @change="updateColorProps"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="配色选择：">
            <el-select-v2
              v-model="colorSchemeValue"
              :options="colorList"
              popper-class="mt-color-scheme-list-popper"
              placeholder="请选择色标方案"
              @change="colorSchemeChange"
            >
              <template #default="{ item }">
                <div v-if="!item.colorList.length" class="custom-color">自定义色标各等级色值</div>
                <div
                  v-else
                  class="color-scheme"
                  :style="`background: linear-gradient(to right, ${item.colorList.join(',')})`"
                />
              </template>
              <template #label>
                <div v-if="!currentGradient.length" class="custom-color">自定义色标各等级色值</div>
                <div
                  v-else
                  class="color-scheme"
                  :style="`background: linear-gradient(to right, ${currentGradient.join(',')})`"
                />
              </template>
            </el-select-v2>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="颜色设置：">
            <div
              :id="colorSelectorId"
              class="color-selector-wrapper"
              :style="`background: linear-gradient(to right, ${currentGradient.join(',')})`"
            >
              <div
                v-for="(block, index) in colorBlockList"
                :key="index"
                class="slider"
                :class="{ slider: true, active: index === customColorIndex }"
                :style="`transform: translateX(${block.x}px);`"
                @mousedown="e => enableSlider(e, index)"
              >
                <div
                  class="color-block"
                  :style="`background: ${block.color};`"
                  @mouseenter="e => setVirtualRef(e, index)"
                />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="自定义：" class="no-form-content" />
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="色标数值：">
            <el-checkbox v-model="form.dataType" :true-value="2" :false-value="1">
              色标数值根据出图数据范围自动匹配
            </el-checkbox>
          </el-form-item>
        </el-col>
        <el-col v-if="form.dataType === 2" :span="12">
          <el-form-item label="数值精度：">
            <el-select v-model="form.levelFormat">
              <el-option label="百分位" :value="-2" />
              <el-option label="十分位" :value="-1" />
              <el-option label="个位" :value="0" />
              <el-option label="一位小数" :value="1" />
              <el-option label="二位小数" :value="2" />
              <el-option label="三位小数" :value="3" />
              <el-option label="四位小数" :value="4" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item>
            <div class="color-bar-container">
              <!-- 色标颜色列表 -->
              <div class="colors">
                <div
                  v-for="(block, index) in colorBlockList"
                  :key="index"
                  :class="{ color: true, active: index === customColorIndex }"
                  :style="`background: ${block.color}`"
                  @mouseenter="customColorIndex = index"
                >
                  <div v-if="index === customColorIndex" class="add-or-remove">
                    <el-icon :size="18" title="左侧添加" @click.stop="addLegendItem('left')">
                      <CirclePlus />
                    </el-icon>
                    <el-icon :size="18" title="删除">
                      <Remove @click.stop="removeLegendItem" />
                    </el-icon>
                    <el-icon :size="18" title="右侧添加" @click.stop="addLegendItem('right')">
                      <CirclePlus />
                    </el-icon>
                  </div>
                </div>
              </div>
              <!-- 色标数值列表 -->
              <div :class="{ levels: true, 'no-offset': form.blankFlag }">
                <template v-for="(_, index) in form.levelList" :key="index">
                  <div class="level-wrapper">
                    <el-input-number
                      v-if="form.blankFlag && index === 0"
                      class="level start-level"
                      v-model="form.minBlank"
                      :controls="false"
                      :value-on-clear="0"
                      :disabled="form.dataType === 2"
                      size="small"
                      placeholder="最小值"
                    />
                    <el-input-number
                      class="level"
                      v-model="form.levelList[index]"
                      :controls="false"
                      :value-on-clear="0"
                      :disabled="form.dataType === 2"
                      size="small"
                    />
                    <el-input-number
                      v-if="form.blankFlag && index === form.levelList.length - 1"
                      v-model="form.maxBlank"
                      class="level end-level"
                      :controls="false"
                      :value-on-clear="0"
                      :disabled="form.dataType === 2"
                      size="small"
                      placeholder="最大值"
                    />
                  </div>
                </template>
                <div class="empty-placeholder"></div>
              </div>
              <!-- 色标等级标签 -->
              <div v-if="form.colorBarType === 2" class="labels">
                <el-input
                  v-for="(_, index) in form.labelList"
                  :key="index"
                  class="label"
                  v-model="form.labelList[index]"
                  size="small"
                />
              </div>
            </div>
            <div class="other-settings">
              <el-checkbox v-model="form.colorBarType" :true-value="2" :false-value="1"> 设置为等级色标</el-checkbox>
              <el-popover
                v-if="form.dataType === 1"
                placement="top-start"
                :width="340"
                trigger="click"
                popper-class="mt-color-bar-quick-setting-popover"
              >
                <template #reference>
                  <div class="quick-setting-name">快速设置</div>
                </template>
                <template #default>
                  <div class="quick-setting-title">快速对色标数值进行填充</div>
                  <ul class="quick-setting-list">
                    <li>
                      <el-radio v-model="quickSettings.type" value="min" />
                      <div class="flex-setting-item">
                        <span>最小值：</span>
                        <el-input-number
                          v-model="quickSettings.min"
                          :controls="false"
                          size="small"
                          :disabled="quickSettings.type !== 'min'"
                          :value-on-clear="0"
                        />
                      </div>
                      <div class="flex-setting-item">
                        <span>间隔：</span>
                        <el-input-number
                          v-model="quickSettings.interval"
                          :controls="false"
                          size="small"
                          :min="0"
                          :disabled="quickSettings.type !== 'min'"
                          :value-on-clear="5"
                        />
                      </div>
                    </li>
                    <li>
                      <el-radio v-model="quickSettings.type" value="max" />
                      <div class="flex-setting-item">
                        <span>最大值：</span>
                        <el-input-number
                          v-model="quickSettings.max"
                          :controls="false"
                          size="small"
                          :disabled="quickSettings.type !== 'max'"
                          :value-on-clear="100"
                        />
                      </div>
                      <div class="flex-setting-item">
                        <span>间隔：</span>
                        <el-input-number
                          v-model="quickSettings.interval"
                          :controls="false"
                          size="small"
                          :min="0"
                          :disabled="quickSettings.type !== 'max'"
                          :value-on-clear="5"
                        />
                      </div>
                    </li>
                    <li>
                      <el-radio v-model="quickSettings.type" value="range" />
                      <div class="flex-setting-item">
                        <span>最小值：</span>
                        <el-input-number
                          v-model="quickSettings.min"
                          :controls="false"
                          size="small"
                          :disabled="quickSettings.type !== 'range'"
                          :value-on-clear="0"
                        />
                      </div>
                      <div class="flex-setting-item">
                        <span>最大值：</span>
                        <el-input-number
                          v-model="quickSettings.max"
                          :controls="false"
                          size="small"
                          :disabled="quickSettings.type !== 'range'"
                          :value-on-clear="100"
                        />
                      </div>
                    </li>
                    <li>
                      <el-radio v-model="quickSettings.type" value="center" />
                      <div class="flex-setting-item">
                        <span>中心：</span>
                        <el-input-number
                          v-model="quickSettings.central"
                          :controls="false"
                          size="small"
                          :disabled="quickSettings.type !== 'center'"
                        />
                      </div>
                      <div class="flex-setting-item">
                        <span>间隔：</span>
                        <el-input-number
                          v-model="quickSettings.interval"
                          :controls="false"
                          size="small"
                          :min="0"
                          :disabled="quickSettings.type !== 'center'"
                          :value-on-clear="5"
                        />
                      </div>
                    </li>
                    <li class="confirm-button">
                      <el-button type="primary" plain @click="quickSetting">确定</el-button>
                    </li>
                  </ul>
                </template>
              </el-popover>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-collapse v-model="moreSettingActives">
            <el-collapse-item title="更多设置：" name="legendFormMortSetting">
              <ul class="more-setting-list">
                <li>
                  <el-checkbox v-model="form.partViewFlag"> 根据数值范围进行色卡数量的增减</el-checkbox>
                </li>
                <li>
                  <el-checkbox v-model="form.blankFlag">
                    在色标头尾各增加一个数值设置方格, 限定两侧等级的最大、最小范围
                  </el-checkbox>
                </li>
                <li>
                  <el-checkbox v-model="form.missingFlag"> 对应出图点位数据缺测时, 统一设置为透明色</el-checkbox>
                </li>
              </ul>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
    </el-form>
    <el-popover ref="popoverRef" :virtual-ref="virtualRef" trigger="click" virtual-triggering :width="240">
      <ul class="mt-color-bar-editor-color-selector-mode-switch">
        <li class="mode" :class="{ active: colorSelectorMode === 'default' }" @click="colorSelectorMode = 'default'">
          标准
        </li>
        <li class="mode" :class="{ active: colorSelectorMode === 'custom' }" @click="colorSelectorMode = 'custom'">
          自定义
        </li>
      </ul>
      <div class="mt-color-bar-editor-color-selector">
        <MtPalette v-if="colorSelectorMode === 'default'" @change="colorBlockColorChange" />
        <MtColorCustomSelector v-else :color="customColor" @change="colorBlockColorChange" />
      </div>
    </el-popover>
  </div>
</template>

<style scoped lang="scss"></style>
