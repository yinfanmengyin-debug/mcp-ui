<template>
  <div class="mt-color-code-editor">
    <el-form ref="formRef" :model="form" :label-width="90" hide-required-asterisk :show-message="false">
      <el-form-item v-if="canEditName" label="色标名称：" prop="name" :rules="required">
        <el-input v-model="form.name" placeholder="请输入色标名称" />
      </el-form-item>
      <el-form-item label="色标类型：">
        <el-radio-group v-model="colorCodeType">
          <el-radio v-for="(item, index) in colorCodeTypes" :key="index" :value="item.value">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="数值：">
        <el-radio-group v-model="valueType">
          <el-radio v-for="(item, index) in valueTypes" :key="index" :value="item.value">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="colorCodeAdaptive" label="小数位数：">
        <el-input-number
          v-model="form.adaptivePrecision"
          :controls="false"
          :precision="0"
          :step="1"
          :max="10"
          :min="0"
          size="small"
        />
        <el-tooltip content="当色标数值自适应产生小数时保留的小数位数">
          <el-icon class="tooltip-icon"><InfoFilled /></el-icon>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div class="color-select-container">
      <div class="color-list">
        <ul class="title-bar">
          <li>序号</li>
          <li>颜色</li>
          <!-- 仅在等级色标时展示 -->
          <li v-if="colorCodeHasLabel">等级</li>
          <li>数值</li>
        </ul>
        <div class="list-container">
          <ul class="no">
            <li v-if="showSpecialColor">-</li>
            <li v-for="i in innerColors.length" :key="i">
              {{ i }}
            </li>
            <li v-if="showSpecialColor">-</li>
          </ul>
          <ul class="colors">
            <li
              v-if="showSpecialColor"
              class="disabled"
              :style="{ background: specialColor[0].color }"
              :class="{ 'is-checked': currentColorIndex === -2 }"
            />
            <li
              v-for="(color, index) in innerColors"
              :key="index"
              :style="{ background: color }"
              :class="{ 'is-checked': currentColorIndex === index }"
              @click="currentColorIndex = index"
            />
            <li
              v-if="showSpecialColor"
              class="disabled"
              :style="{ background: specialColor[1].color }"
              :class="{ 'is-checked': currentColorIndex === -1 }"
            />
          </ul>
          <ul
            v-if="colorCodeHasLabel"
            class="labels"
            :class="{ 'less-than-color': innerColors.length > innerLabels.length }"
          >
            <li v-if="showSpecialColor" :style="{ background: specialColor[0].label }">
              <el-input v-model="specialColor[0].label" />
            </li>
            <li v-for="(_, index) in innerLabels" :key="index">
              <el-input v-model="innerLabels[index]" />
            </li>
            <li v-if="showSpecialColor" :style="{ background: specialColor[1].label }">
              <el-input v-model="specialColor[1].label" />
            </li>
          </ul>
          <ul class="levels" :class="{ 'less-than-color': innerColors.length > innerLevels.length }">
            <li v-if="showSpecialColor" :style="{ background: specialColor[0].level }">
              <ColorCodeLevel v-model="specialColor[0].level" :disabled="colorCodeAdaptive" />
            </li>
            <li v-for="(_, index) in innerLevels" :key="index">
              <ColorCodeLevel v-model="innerLevels[index]" :disabled="colorCodeAdaptive" />
            </li>
            <li v-if="showSpecialColor" :style="{ background: specialColor[1].level }">
              <ColorCodeLevel v-model="specialColor[1].level" :disabled="colorCodeAdaptive" />
            </li>
          </ul>
        </div>
      </div>
      <div class="color-setting">
        <div class="current-color">
          <div class="color-block" :style="`background-color: ${colorValue}`" />
          <el-input
            v-model="colorValue"
            class="color-value-input"
            :validate-event="false"
            size="small"
            @keyup.enter="colorValueConfirm"
            @blur="colorValueConfirm"
          />
        </div>
        <div class="color-selector">
          <sv-panel ref="svPanel" :color="color" />
          <hue-slider ref="hue" class="hue-slider" :color="color" vertical />
        </div>
        <div class="color-rgb">
          <div class="r">
            <span class="label">R：</span>
            <el-input-number
              v-model="rgbColor.r"
              size="small"
              :min="0"
              :max="255"
              :controls="false"
              @change="rgbColorChange"
            />
          </div>
          <div class="g">
            <span class="label">G：</span>
            <el-input-number
              v-model="rgbColor.g"
              size="small"
              :min="0"
              :max="255"
              :controls="false"
              @change="rgbColorChange"
            />
          </div>
          <div class="b">
            <span class="label">B：</span>
            <el-input-number
              v-model="rgbColor.b"
              size="small"
              :min="0"
              :max="255"
              :controls="false"
              @change="rgbColorChange"
            />
          </div>
        </div>
        <div class="edit-color-size">
          <span>等级划分</span>
          <el-icon @click="removeItem">
            <RemoveFilled />
          </el-icon>
          <el-icon @click="addItem">
            <CirclePlusFilled />
          </el-icon>
        </div>
        <div class="reset-buttons">
          <el-link type="primary" @click="resetColor"> 重置颜色 </el-link>
          <el-link type="primary" @click="resetLevel"> 重置数值 </el-link>
        </div>
      </div>
    </div>
    <div class="other-setting">
      <!--<el-checkbox v-model="form.handleMissVal">缺测值处理</el-checkbox>-->
      <!--<div class="missing-val-setting">-->
      <!--  当数值在-->
      <!--  <el-input-number v-model="form.minMissVal" :controls="false" size="small" />-->
      <!--  ~-->
      <!--  <el-input-number v-model="form.maxMissVal" :controls="false" size="small" />-->
      <!--  时设置为透明色-->
      <!--</div>-->
      <el-checkbox v-if="!colorCodeAdaptive || colorCodeHasLabel" v-model="form.addSpecialColor">
        色标头尾各增加一个等级，设置后参与出图，但在色标中不展示
      </el-checkbox>
      <div>
        <el-checkbox v-model="form.partViewFlag" :disabled="innerColors.length < 10">
          局部色标：出图时色标只展示数据范围内对应的部分色标
        </el-checkbox>
        <el-tooltip content="当色标等级超过10个才能勾选">
          <el-icon class="tooltip-icon"><InfoFilled /></el-icon>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CirclePlusFilled, RemoveFilled, InfoFilled } from '@element-plus/icons-vue'
import { ElForm } from 'element-plus'
import 'element-plus/es/components/form/style/css'
import Color from 'element-plus/es/components/color-picker/src/utils/color'
// @ts-ignore
import HueSlider from 'element-plus/es/components/color-picker/src/components/hue-slider'
// @ts-ignore
import SvPanel from 'element-plus/es/components/color-picker/src/components/sv-panel'
import 'element-plus/es/components/color-picker/style/css'
import { computed, reactive, ref, shallowRef, watch } from 'vue'
import type { ColorCode, ColorInfo, ColorItem } from '../type'
import ColorCodeLevel from './colorCodeLevel.vue'
import '../style/colorCodeEditor.scss'

defineOptions({ name: 'MtColorCodeEditor' })
defineExpose({ getColorInfo })

const props = defineProps<{
  // 若是编辑模式则传入需要编辑的色标信息
  editInfo?: ColorCode
  // 是否可以编辑色标名称
  canEditName?: boolean
}>()

const form = reactive({
  // 色标名称
  name: '',
  // 是否处理缺测值
  handleMissVal: false,
  // 缺测值范围最小值
  minMissVal: undefined as number | undefined,
  // 缺测值范围最大值
  maxMissVal: undefined as number | undefined,
  // 用于控制"色标头尾各增加一个等级，设置后参与出图，但在色标中不展示"
  addSpecialColor: false,
  // 是否做局部色标等级自适应
  partViewFlag: false,
  // 自适应时的小数位数
  adaptivePrecision: 2
})
// 表单的模板Ref
const formRef = shallowRef<InstanceType<typeof ElForm>>()
// 表单项的验证规则
const required = { required: true, message: '', trigger: 'blur' }

// 色标类型
const colorCodeType = ref(1)
const colorCodeTypes = [
  { label: '数值色标', value: 1 },
  { label: '等级色标', value: 2 }
]
// 色标的数值类型
const valueType = ref(1)
const valueTypes = [
  { label: '固定数值', value: 1 },
  { label: '自适应', value: 2 }
]
// 色标配置是否包含等级标签项
const colorCodeHasLabel = computed(() => colorCodeType.value === 2)
// 色标配置是否为自适应
const colorCodeAdaptive = computed(() => valueType.value === 2)

// 色标的颜色、标签、数值列表
const innerColors = reactive<string[]>(['#ffffff', '#ffffff'])
const innerLabels = reactive<string[]>(['', ''])
const innerLevels = reactive<number[]>([0])

// 特殊色标项（"色标头尾各增加一个等级，设置后参与出图，但在色标中不展示"）
const specialColor = ref<ColorItem[]>([])
// 是否显示特殊色标项
const showSpecialColor = computed(() => form.addSpecialColor && (!colorCodeAdaptive.value || colorCodeHasLabel.value))

// 颜色选择器绑定的颜色
const color = reactive(
  new Color({
    enableAlpha: false,
    format: 'hex',
    value: innerColors[0] ?? '#ffffff'
  })
) as Color
// 当前选中的颜色对应的索引 当选择的是特殊颜色时小于零分别为-2和-1 其中-2表示第一个,-1表示第二个
const currentColorIndex = ref(0)
// 当前调色板颜色对应的rgb值
const rgbColor = shallowRef(color.toRgb())
// 当前调色板对应的十六进制
const colorValue = ref(color.value)

// 在组件挂载前先将传入的编辑信息更新到表单
watch(
  () => props.editInfo,
  info => {
    formRef.value?.clearValidate()
    if (!info) return
    colorCodeType.value = info.colorBarType
    valueType.value = info.dataType
    form.name = info.name
    form.handleMissVal = info.missingFlag
    form.minMissVal = info.minMissing
    form.maxMissVal = info.maxMissing
    if (info.blankFlag) {
      specialColor.value = [
        { color: '#ffffff', level: info.minBlank ?? 0, label: '' },
        { color: '#ffffff', level: info.maxBlank ?? 0, label: '' }
      ]
    }
    form.addSpecialColor = info.blankFlag
    form.partViewFlag = info.partViewFlag
    form.adaptivePrecision = info.levelFormat ?? 2

    // 传入需要编辑的色标信息改变时更新内部的颜色、数值、标签列表
    innerColors.splice(0, innerColors.length, ...(info.colors ? info.colors?.split(',') ?? [] : []))
    innerLevels.splice(
      0,
      innerLevels.length,
      ...(info.levels ? info.levels?.split(',')?.map(Number) ?? [] : new Array(innerColors.length - 1).fill(0))
    )
    innerLabels.splice(0, innerLabels.length, ...(info.levelLabels ? info.levelLabels?.split(',') ?? [] : []))
    if (innerColors.length && innerLabels.length !== innerColors.length) {
      innerLabels.length = innerColors.length
      innerLabels.fill('')
    }
  },
  { immediate: true }
)

watch(
  currentColorIndex,
  index => {
    color.fromString(index < 0 ? specialColor.value[index + 2].color : innerColors[index])
  },
  { immediate: true }
)

// 添加/移除特殊色标项
watch(
  () => form.addSpecialColor,
  value => {
    if (value) {
      specialColor.value = [
        { color: '#ffffff', level: 0, label: '' },
        { color: '#ffffff', level: 0, label: '' }
      ]
    } else {
      specialColor.value = []
      if (currentColorIndex.value < 0) {
        currentColorIndex.value = 0
      }
    }
  }
)
// 调色板颜色改变时即改变选中的颜色
watch(
  () => color.value,
  () => {
    let index = currentColorIndex.value
    if (index < 0) {
      index += 2
      specialColor.value[index].color = color.value
    } else {
      innerColors[index] = color.value
    }
    colorValue.value = color.value
    rgbColor.value = color.toRgb()
  },
  { immediate: true }
)

// 获取色标信息
function getColorInfo(): ColorInfo {
  if (props.canEditName && !form.name) {
    throw new Error('请输入色标名称')
  }
  if (!colorCodeAdaptive.value && !innerLevels.length) {
    throw new Error('请定义色标后再进行保存')
  }
  if (colorCodeHasLabel.value && innerLabels.some(item => !item)) {
    throw new Error('请检查色标等级是否输入完整')
  }

  const colors = [...innerColors]
  const levels = colorCodeAdaptive.value ? [] : [...innerLevels]
  const levelLabels = [...innerLabels]

  if (levels.length > 1) {
    let isAsc = true
    let isDesc = true
    // 判断色标数值列表是否为升序或降序
    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i] > levels[i + 1]) {
        isAsc = false
        break
      }
    }
    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i] < levels[i + 1]) {
        isDesc = false
        break
      }
    }
    if (!isAsc && !isDesc) {
      throw new Error('请检查色标的数值顺序是否正确')
    }
  }

  return {
    colors: colors.join(','),
    levels: colorCodeAdaptive.value ? '' : levels.join(','),
    levelLabels: colorCodeHasLabel.value ? levelLabels.join(',') : '',
    style: '0',
    name: form.name,
    colorBarType: colorCodeType.value,
    dataType: valueType.value,
    missingFlag: form.handleMissVal,
    minMissing: form.minMissVal,
    maxMissing: form.maxMissVal,
    blankFlag: form.addSpecialColor,
    minBlank: form.addSpecialColor ? specialColor.value[0].level : undefined,
    maxBlank: form.addSpecialColor ? specialColor.value[1].level : undefined,
    partViewFlag: form.partViewFlag,
    levelFormat: form.adaptivePrecision
  }
}

// 当颜色的rgb值改变时更新color以及调色板显示
function rgbColorChange() {
  const { r, g, b } = rgbColor.value
  color.fromString(`rgb(${r},${g},${b})`)
}

// 删除色标项
function removeItem() {
  if (currentColorIndex.value < 0) {
    throw new Error('该色标项只能通过取消勾选对应配置项进行移除')
  }
  if (innerColors.length === 2) {
    innerColors.splice(0, innerColors.length)
    innerLabels.splice(0, innerLabels.length)
    innerLevels.splice(0, innerLevels.length)
    return
  }
  innerColors.splice(currentColorIndex.value, 1)
  innerLabels.splice(currentColorIndex.value, 1)
  const splice = innerLevels.splice(currentColorIndex.value, 1)
  if (!splice.length) {
    // 若未能成功删除元素则再删除一下前一个元素（颜色比数值多一个，所以颜色的索引位置可能对应没有数值）
    const newIndex = currentColorIndex.value - 1
    innerLevels.splice(newIndex < 0 ? 0 : newIndex, 1)
  }
  // 当前颜色的索引不为0 且 索引大于等于颜色长度时则将索引置为最后一个元素的索引
  if (currentColorIndex.value && currentColorIndex.value >= innerColors.length) {
    currentColorIndex.value = innerColors.length - 1
  }
}

// 添加色标项
function addItem() {
  if (innerColors.length === 0) {
    innerColors.splice(0, innerColors.length, '#ffffff', '#ffffff')
    innerLabels.splice(0, innerLabels.length, '', '')
    innerLevels.splice(0, innerLevels.length, 0)
    return
  }
  let index
  // 确定当前选中的索引是否为特殊颜色项的负数索引
  if (currentColorIndex.value >= 0) {
    index = currentColorIndex.value
  } else if (currentColorIndex.value === -2) {
    index = -1
  } else {
    index = innerColors.length - 1
  }
  innerColors.splice(index + 1, 0, '#ffffff')
  innerLabels.splice(index + 1, 0, '')
  // 数值比颜色少一个
  if (innerLevels.length < innerColors.length - 1) {
    innerLevels.splice(index < 0 ? 0 : index, 0, 0)
  } else {
    innerLevels.splice(index + 1, 0, 0)
  }
  currentColorIndex.value = index + 1
}

// 重置颜色
function resetColor() {
  innerColors.fill('#ffffff')
}

// 重置数值
function resetLevel() {
  innerLevels.fill(0)
}

function colorValueConfirm() {
  color.fromString(colorValue.value)
}
</script>
