<template>
  <svg
    style="cursor: pointer"
    width="35"
    height="35"
    viewBox="0 0 35 35"
    fill="none"
    @mouseover="mouseEnter"
    @mouseout="mouseLeave"
  >
    <rect x="1" y="0.746582" width="33.2402" height="33.2402" rx="16.6201" :fill="fillUrl" :stroke="strokeUrl" />
    <path
      d="M15.6552 9.71729L7.10022 17.4479L15.6552 25.1785V17.4479L24.2101 25.1785V9.71729L15.6552 17.4479V9.71729Z"
      :fill="innerColor"
    />
    <defs>
      <linearGradient :id="fillId" x1="1" y1="33.9868" x2="56.7423" y2="33.3852" gradientUnits="userSpaceOnUse">
        <stop offset="0" :stop-color="polygonColors[0]" />
        <stop offset="1" :stop-color="polygonColors[1] ? polygonColors[1] : polygonColors[0]" />
      </linearGradient>
      <linearGradient :id="strokeId" x1="1" y1="33.9868" x2="56.7423" y2="33.3852" gradientUnits="userSpaceOnUse">
        <stop offset="0" :stop-color="polylineColors[0]" />
        <stop offset="1" :stop-color="polylineColors[1] ? polylineColors[1] : polylineColors[0]" />
      </linearGradient>
    </defs>
  </svg>
</template>
<script setup lang="ts">
import { usePlayControlColor } from '../hooks'

defineOptions({ name: 'PlayLastIcon' })

const props = withDefaults(
  defineProps<{
    playPolylineColors?: string[]
    playPolygonColors?: string[]
    hoverPolylineColors?: string[]
    hoverPolygonColors?: string[]
    playInnerColor?: string
    hoverInnerColor?: string
  }>(),
  {
    playPolylineColors: () => ['#168BE7', '#168BE7'],
    playPolygonColors: () => ['#fff'],
    hoverPolylineColors: () => ['#168BE7', '#168BE7'],
    hoverPolygonColors: () => ['#168BE7', '#168BE7'],
    playInnerColor: '#168BE7',
    hoverInnerColor: '#fff'
  }
)

const { polylineColors, polygonColors, innerColor, fillId, fillUrl, strokeId, strokeUrl, mouseEnter, mouseLeave } =
  usePlayControlColor(props)
</script>
