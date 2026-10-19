<script setup lang="ts">
import { ElButton, ElInput } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import '../../style/v2/palette.scss'
import { uniqueId } from 'lodash-es'
import { onMounted, ref } from 'vue'
import { grayscale, rainbow } from './palette'

defineOptions({ name: 'MtPalette' })

const props = withDefaults(
  defineProps<{
    // 是否显示彩虹色 (默认true 否则仅显示灰度色)
    showRainbow?: boolean
  }>(),
  {
    showRainbow: true
  }
)
const emit = defineEmits<{
  (e: 'change', color: string): void
}>()

const RAD = Math.PI / 180

const svgId = uniqueId('PaletteSvg')
const svgWidth = ref(0)
const svgHeight = ref(0)

const selectedColor = ref('#FFFFFF')

// 透明度
const opacity = ref(0)

onMounted(() => {
  createPalette()
})

function createPalette() {
  const radius = 30
  const halfRadius = radius / 2
  const [startX, startY] = [10, 10 + halfRadius]
  const offsetX = halfRadius / Math.tan(30 * RAD)

  const rainbowMaxLength = rainbow.reduce((a, b) => Math.max(a, b.length), 0)
  const [rainbowWidth, rainbowHeight] = [
    offsetX * 2 * rainbowMaxLength,
    (radius + halfRadius) * rainbow.length + halfRadius
  ]

  const grayscaleMaxLength = grayscale.reduce((a, b) => Math.max(a, b.length), 0)
  const [grayscaleWidth, grayscaleHeight] = [
    offsetX * 2 * grayscaleMaxLength,
    (radius + halfRadius) * grayscale.length + halfRadius
  ]

  const sideWidth = rainbowWidth - grayscaleWidth
  const bigBlockOffsetX = (sideWidth - offsetX * 2) / 4
  const bigBlockRadius = bigBlockOffsetX * Math.tan(30 * RAD) * 2

  // 彩色色块与大灰度色块的间隔
  const gap = props.showRainbow ? 20 : 0
  const topHeight = props.showRainbow ? rainbowHeight + gap : 0

  const [width, height] = [10 * 2 + rainbowWidth, 10 * 2 + topHeight + bigBlockRadius * 2]
  svgWidth.value = width
  svgHeight.value = height

  const svg = document.getElementById(svgId) as unknown as SVGSVGElement
  const fragment = document.createDocumentFragment()

  if (props.showRainbow) {
    rainbow.forEach((colors, index) => {
      // 六边形的中心点坐标
      const centerX = startX + offsetX * (rainbowMaxLength - colors.length + 1)
      const centerY = startY + (radius + halfRadius) * index + halfRadius

      const polygons = createHexagons(colors, centerX, centerY, radius, offsetX)
      fragment.append(...polygons)
    })
  }
  grayscale.forEach((colors, index) => {
    // 六边形的中心点坐标
    const centerX = startX + bigBlockOffsetX * 2 + offsetX * (grayscaleMaxLength - colors.length + 2)
    const centerY = startY + topHeight + (radius + halfRadius) * index + radius

    const polygons = createHexagons(colors, centerX, centerY, radius, offsetX)
    fragment.append(...polygons)
  })

  // 大块灰度色块
  const whitePolygon = createPolygon(
    startX + bigBlockOffsetX,
    10 + topHeight + bigBlockRadius,
    bigBlockRadius,
    '#ffffff'
  )
  whitePolygon.classList.add('big-block')

  const blackPolygon = createPolygon(
    width - 10 - bigBlockOffsetX,
    10 + topHeight + bigBlockRadius,
    bigBlockRadius,
    '#000000'
  )
  blackPolygon.classList.add('big-block')

  fragment.append(whitePolygon, blackPolygon)

  svg.appendChild(fragment)
}

function createHexagons(colors: string[], centerX: number, centerY: number, radius: number, offsetX: number) {
  const polygons: SVGPolygonElement[] = []
  colors.forEach((color, subIndex) => {
    const ox = centerX + offsetX * (2 * subIndex)
    const polygon = createPolygon(ox, centerY, radius, color)
    polygons.push(polygon)
  })
  return polygons
}

function createPolygon(ox: number, oy: number, radius: number, color: string) {
  const points = []
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 + 30) * RAD
    const x = ox + Math.cos(angle) * radius
    const y = oy + Math.sin(angle) * radius
    points.push(`${x},${y}`)
  }
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  polygon.setAttribute('points', points.join(' '))
  polygon.setAttribute('fill', color)
  polygon.setAttribute('class', 'hex')
  polygon.innerHTML = `<title>${color.toUpperCase()}</title>`
  polygon.addEventListener('click', e => {
    const el = e.target as SVGPolygonElement
    selectedColor.value = el.getAttribute('fill')!.toUpperCase()
    // 移除之前的选中状态
    const previousSelected = el.parentElement?.querySelector('.selected')
    if (previousSelected) {
      previousSelected.classList.remove('selected')
    }
    // 设置当前元素的选中状态
    el.classList.add('selected')
    // 将选中项追加到 SVG 的末尾 以实现选中项在最上层
    el.parentNode?.appendChild(polygon)
  })
  return polygon
}

function confirm() {
  const colorWithOpacity =
    selectedColor.value +
    Math.round((100 - opacity.value) * 2.55)
      .toString(16)
      .toUpperCase()
      .padStart(2, '0')
  emit('change', colorWithOpacity)
}

function inputColor() {
  const color = selectedColor.value.trim()
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    selectedColor.value = color.toUpperCase()
  } else if (/^#[0-9A-Fa-f]{8}$/.test(color)) {
    selectedColor.value = color.toUpperCase().slice(0, 7)
  } else {
    selectedColor.value = '#FFFFFF'
  }
}
</script>

<template>
  <div class="mt-palette">
    <div class="palette-text">颜色：</div>
    <svg :id="svgId" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="palette-svg"></svg>
    <div class="footer">
      <!--<div class="opacity">-->
      <!--  <span>透明度:</span>-->
      <!--  <el-input-number-->
      <!--    v-model="opacity"-->
      <!--    :min="0"-->
      <!--    :max="100"-->
      <!--    :step="1"-->
      <!--    size="small"-->
      <!--    class="opacity-input"-->
      <!--    :controls="false"-->
      <!--  >-->
      <!--  </el-input-number>-->
      <!--</div>-->
      <!--<el-button type="primary" :disabled="!selectedColor" plain @click="confirm">确定</el-button>-->
      <div class="current-color">
        <div class="color-block" :style="`background-color: ${selectedColor}`" />
        <el-input
          v-model="selectedColor"
          class="color-value-input"
          :validate-event="false"
          size="small"
          @keyup.enter="inputColor"
          @blur="inputColor"
        />
      </div>
      <el-button type="primary" plain @click="emit('change', selectedColor)">确定</el-button>
    </div>
  </div>
</template>
