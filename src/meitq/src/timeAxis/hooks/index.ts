import { onMounted, ref, computed } from 'vue'
import { createGuid } from '../utils'

export function usePlayControlColor(props: any) {
  const polylineColors = ref<string[]>([])
  const polygonColors = ref<string[]>([])
  const innerColor = ref<string>('')
  const uuid = ref<string>(createGuid())
  const fillId = computed(() => `mt_icon_fill_${uuid.value}`)
  const strokeId = computed(() => `mt_icon_stroke_${uuid.value}`)
  const fillUrl = computed(() => `url(#mt_icon_fill_${uuid.value})`)
  const strokeUrl = computed(() => `url(#mt_icon_stroke_${uuid.value})`)

  function mouseEnter() {
    polylineColors.value = props.hoverPolylineColors
    polygonColors.value = props.hoverPolygonColors
    innerColor.value = props.hoverInnerColor
  }

  function mouseLeave() {
    polylineColors.value = props.playPolylineColors
    polygonColors.value = props.playPolygonColors
    innerColor.value = props.playInnerColor
  }

  onMounted(() => {
    polylineColors.value = props.playPolylineColors
    polygonColors.value = props.playPolygonColors
    innerColor.value = props.playInnerColor
  })

  return { polylineColors, polygonColors, innerColor, fillId, fillUrl, strokeId, strokeUrl, mouseEnter, mouseLeave }
}
