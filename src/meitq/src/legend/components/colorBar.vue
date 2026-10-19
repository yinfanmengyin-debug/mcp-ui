<template>
  <div class="mt-color-bar">
    <div class="title-bar">
      <span>{{ name }}{{ unit ? ` (${unit})` : '' }}</span>
      <!--<span v-if="unit"> 单位: {{unit ?? ''}}</span>-->
    </div>
    <div class="color-bar">
      <ul class="colors">
        <li
          v-for="(color, index) in colorList"
          :key="index"
          :style="{
            width: itemWidth,
            height: itemHeight,
            backgroundColor: color
          }"
        />
      </ul>
      <ul v-if="labelList.length" class="labels" :class="{ 'less-than-color': labelList.length < colorList.length }">
        <li
          v-for="(label, index) in labelList"
          :key="index"
          :style="{
            width: itemWidth,
            height: itemHeight,
            lineHeight: itemHeight
          }"
        >
          {{ label }}
        </li>
      </ul>
      <ul v-else-if="levels.length" class="levels" :class="{ 'less-than-color': levelList.length < colorList.length }">
        <li
          v-for="(level, index) in levelList"
          :key="index"
          :style="{
            width: itemWidth,
            height: itemHeight,
            lineHeight: itemHeight
          }"
        >
          {{ level }}
        </li>
      </ul>
      <div
        v-else
        class="no-levels"
        :style="{
          height: itemHeight,
          lineHeight: itemHeight
        }"
      >
        数值自适应
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import '../style/colorBar.scss'

defineOptions({ name: 'MtColorBar' })

const ctx = document.createElement('canvas').getContext('2d')!
ctx.font = getComputedStyle(document.body).font

const props = withDefaults(
  defineProps<{
    // 色标名称
    name: string
    // 色标单位
    unit?: string
    // 颜色列表 支持传入字符串数组 或 颜色由逗号分隔的字符串
    colors: string[] | string
    // 数值列表 支持传入数字数组 或 数值由逗号分隔的字符串
    levels?: number[] | string
    // 标签列表 支持传入字符串数组 或 标签由逗号分隔的字符串
    labels?: string[] | string
    // 色标项的宽度
    width?: string | number
    // 色标项的高度
    height?: string | number
    // 色标项宽度是否根据文字宽度自适应 若为true 则width属性为最小宽度
    autoWidth?: boolean
  }>(),
  {
    width: 30,
    height: 12,
    unit: '',
    colors: '',
    levels: '',
    labels: '',
    autoWidth: true
  }
)

// 颜色列表
const colorList = computed(() => {
  if (Array.isArray(props.colors)) return props.colors
  return props.colors.split(',')
})
// 数值列表
const levelList = computed(() => {
  if (Array.isArray(props.levels)) return props.levels
  return props.levels ? props.levels.split(',').map(Number) : []
})
// 标签(等级)列表
const labelList = computed(() => {
  if (Array.isArray(props.labels)) return props.labels
  return props.labels ? props.labels.split(',') : []
})

const itemHeight = computed(() => {
  if (typeof props.height === 'number' || !isNaN(props.height as unknown as number)) {
    return `${props.height}px`
  }
  return props.height
})
const itemWidth = computed(() => {
  let width = Number(String(props.width).replace('px', ''))
  if (props.autoWidth) {
    const textList = [...levelList.value, ...labelList.value]
    let maxTextWidth = 0
    textList.forEach(text => {
      const width = ctx.measureText(`${text}`).width
      if (width > maxTextWidth) maxTextWidth = width
    })
    // maxTextWidth += 10
    width = maxTextWidth < width ? width : maxTextWidth
  }
  return `${width}px`
})
</script>
