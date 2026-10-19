import type { App, Component, Plugin, Ref } from 'vue'
import { isRef, ref } from 'vue'
import { areaSelectorInjectionKey } from './configProvider'
import type { AreaSelectorOptions } from './areaSelector/type'

import AreaSelector from './areaSelector/index.vue'
import Collapse from './collapse/index.vue'
import ContentTab from './contentTab/index.vue'
import DashHeader from './dashHeader/index.vue'
import DataForm from './dataForm/index.vue'
import MtDate from './datePicker/mtDate/index.vue'
import MtHou from './datePicker/mtHou/index.vue'
import MtMonth from './datePicker/mtMonth/index.vue'
import MtSeason from './datePicker/mtSeason/index.vue'
import MtXun from './datePicker/mtXun/index.vue'
import MtYear from './datePicker/mtYear/index.vue'
import Empty from './empty/index.vue'
import PageLayout from './pageLayout/index.vue'
import PanelItem from './panelItem/index.vue'
import PublicDialog from './publicDialog/index.vue'
import RadioList from './radioList/index.vue'
import StatisticalPeriod from './statisticalPeriod/index.vue'
import SubAreaCascader from './subAreaCascader/index.vue'
import TimeAxis from './timeAxis/index.vue'

import 'amfe-flexible'
import 'element-plus/dist/index.css'
import './theme.css'
import './assets/iconfont/common/iconfont.css'
import './assets/iconfont/project/iconfont.css'

export const version = '0.1.0'

export const components: Record<string, Component> = {
  AreaSelector,
  Collapse,
  ContentTab,
  DashHeader,
  DataForm,
  MtDate,
  MtHou,
  MtMonth,
  MtSeason,
  MtXun,
  MtYear,
  Empty,
  PageLayout,
  PanelItem,
  PublicDialog,
  RadioList,
  StatisticalPeriod,
  SubAreaCascader,
  TimeAxis
}

export interface MeitqBasicComponentsOptions {
  areaSelector?: AreaSelectorOptions | Ref<AreaSelectorOptions | undefined>
}

export function install(app: App, options: MeitqBasicComponentsOptions = {}) {
  const areaSelectorOptions = isRef(options.areaSelector) ? options.areaSelector : ref(options.areaSelector)
  app.provide(areaSelectorInjectionKey, areaSelectorOptions)

  Object.entries(components).forEach(([name, component]) => {
    app.component(name, component)
  })
}

const plugin: Plugin = { install }

export default plugin

export {
  AreaSelector,
  Collapse,
  ContentTab,
  DashHeader,
  DataForm,
  Empty,
  MtDate,
  MtHou,
  MtMonth,
  MtSeason,
  MtXun,
  MtYear,
  PageLayout,
  PanelItem,
  PublicDialog,
  RadioList,
  StatisticalPeriod,
  SubAreaCascader,
  TimeAxis
}

export type * from './areaSelector/type'
export type * from './dataForm/type'
export type * from './datePicker/type'
export type * from './statisticalPeriod/type'
export type * from './subAreaCascader/type'
export type * from './timeAxis/type'
