<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="35"
    height="35"
    viewBox="0 0 35 35"
    fill="none"
    @mouseover="mouseEnter"
    @mouseout="mouseLeave"
  >
    <rect
      width="33.2402"
      height="33.2402"
      rx="16.6201"
      transform="matrix(-1 0 0 1 34.2402 1)"
      :fill="fillUrl"
      :stroke="strokeUrl"
    />
    <rect x="12.7248" y="9.61914" width="3" height="16" :fill="innerColor" />
    <rect x="19.5154" y="9.61914" width="3" height="16" :fill="innerColor" />
    <defs>
      <linearGradient
        :id="fillId"
        x1="-1.39322e-07"
        y1="33.2402"
        x2="55.7423"
        y2="32.6386"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" :stop-color="polygonColors[0]" />
        <stop offset="1" :stop-color="polygonColors[1] ? polygonColors[1] : polygonColors[0]" />
      </linearGradient>
      <linearGradient
        :id="strokeId"
        x1="-1.39322e-07"
        y1="33.2402"
        x2="55.7423"
        y2="32.6386"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" :stop-color="polylineColors[0]" />
        <stop offset="1" :stop-color="polylineColors[1] ? polylineColors[1] : polylineColors[0]" />
      </linearGradient>
    </defs>
  </svg>
</template>
<script setup lang="ts">
import { usePlayControlColor } from '../hooks'

defineOptions({ name: 'PlayPauseIcon' })

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
