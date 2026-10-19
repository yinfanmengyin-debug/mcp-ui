// 图层类别对应的中文名称
import { LayerCategory, LayerType } from './type'
import { Component } from 'vue'
import ContourFaceIcon from './icons/contourFaceIcon.vue'
import ContourLineIcon from './icons/contourLineIcon.vue'
import StationValueIcon from './icons/stationValueIcon.vue'
import GridValueIcon from './icons/gridValueIcon.vue'
import PointMarkerIcon from './icons/pointMarkerIcon.vue'
import PointNameIcon from './icons/pointNameIcon.vue'
import windFieldIcon from './icons/windFieldIcon.vue'
import pointIdIcon from './icons/pointIdIcon.vue'

export const categoryNameMap: Record<LayerCategory, string> = {
  contour: '色斑图',
  county: '县级色斑图',
  point: '散点图'
}

export const typeIconMap: Record<LayerType, Component> = {
  contourFace: ContourFaceIcon,
  contourLine: ContourLineIcon,
  stationValue: StationValueIcon,
  stationName: PointNameIcon,
  windField: windFieldIcon,
  gridValue: GridValueIcon,
  pointMarker: PointMarkerIcon,
  pointValue: StationValueIcon,
  pointName: PointNameIcon,
  pointId: pointIdIcon
}

export const explainsMap: Record<LayerType, string> = {
  contourFace: '色斑图',
  contourLine: '等值线',
  gridValue: '格点数值',
  stationValue: '站点数值',
  stationName: '站点名称',
  pointMarker: '圆点图',
  pointValue: '站点数值',
  pointName: '站点名称',
  pointId: '站号',
  windField: '风矢'
}
