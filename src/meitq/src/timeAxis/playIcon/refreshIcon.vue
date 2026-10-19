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
    <rect
      width="33.2402"
      height="33.2402"
      rx="16.6201"
      transform="matrix(-1 0 0 1 34.5928 0.760254)"
      :fill="fillUrl"
      :stroke="strokeUrl"
    />
    <path
      d="M12.5211 11.9681C15.394 9.09533 19.9389 8.89123 23.0516 11.3525L21.2248 11.3543L21.2267 13.1571L25.2197 13.1533C25.4561 13.153 25.683 13.0599 25.8514 12.894C26.0198 12.728 26.1163 12.5025 26.12 12.2661L26.1821 8.36203L24.3796 8.33338L24.3518 10.0856C20.529 6.90943 14.8288 7.11094 11.2464 10.6935C9.39878 12.5411 8.38585 14.9973 8.39366 17.6102L10.1964 17.6048C10.1898 15.4756 11.0156 13.4737 12.5211 11.9681ZM25.7491 17.1503C25.7557 19.2797 24.93 21.2813 23.4244 22.787C21.9253 24.2861 19.9321 25.1119 17.8119 25.1119C15.9679 25.1119 14.2205 24.4868 12.8101 23.3379L14.7382 23.3361L14.7364 21.5333L10.7434 21.5371C10.507 21.5374 10.2801 21.6305 10.1117 21.7964C9.94325 21.9624 9.84678 22.1879 9.84305 22.4243L9.78076 26.3284L11.5833 26.357L11.6099 24.6851C13.3518 26.1287 15.521 26.9149 17.8117 26.9149C20.4134 26.9149 22.8593 25.9017 24.6989 24.0621C26.5465 22.2146 27.5596 19.7582 27.5516 17.1453L25.7491 17.1503ZM11.6312 23.3551L11.6314 23.3387H11.6474L11.6312 23.3551Z"
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

defineOptions({ name: 'RefreshIcon' })

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
