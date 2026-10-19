<script setup lang="ts">
import { ElButton, ElInput, ElInputNumber } from 'element-plus'
// @ts-ignore
import HueSlider from 'element-plus/es/components/color-picker/src/components/hue-slider'
// @ts-ignore
import SvPanel from 'element-plus/es/components/color-picker/src/components/sv-panel'
import 'element-plus/es/components/color-picker/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/input-number/style/css'
import 'element-plus/es/components/button/style/css'
import Color from 'element-plus/es/components/color-picker/src/utils/color'
import '../../style/v2/colorCustomSelector.scss'
import { reactive, ref, shallowRef, watch } from 'vue'

defineOptions({ name: 'MtColorCustomSelector' })

const emit = defineEmits<{
  (e: 'change', color: string): void
}>()

const props = defineProps<{
  color: string
}>()

// 颜色选择器绑定的颜色
const color = reactive(
  new Color({
    enableAlpha: false,
    format: 'hex',
    value: props.color
  })
) as Color
// 当前调色板颜色对应的rgb值
const rgbColor = shallowRef(color.toRgb())
// 当前调色板对应的十六进制
const colorValue = ref(color.value)

watch(
  () => props.color,
  () => {
    color.fromString(props.color)
  },
  { immediate: true }
)

// 调色板颜色改变时即改变选中的颜色
watch(
  () => color.value,
  () => {
    colorValue.value = color.value
    rgbColor.value = color.toRgb()
  }
)

// 当颜色的rgb值改变时更新color以及调色板显示
function rgbColorChange() {
  const { r, g, b } = rgbColor.value
  color.fromString(`rgb(${r},${g},${b})`)
}

function colorValueConfirm() {
  color.fromString(colorValue.value)
}
</script>

<template>
  <div class="mt-color-custom-selector">
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
    <div class="color-selector">
      <sv-panel ref="svPanel" :color="color" />
      <hue-slider ref="hue" class="hue-slider" :color="color" vertical />
    </div>
    <div class="current-color-wrapper">
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
      <el-button type="primary" plain @click="emit('change', colorValue)">确定</el-button>
    </div>
  </div>
</template>
