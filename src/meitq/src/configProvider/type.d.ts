import type { ChartInjectOptions } from '@/src/chart/type'
import type { ColorCodeOptions } from '@/src/legend/type'
import type { AreaSelectorOptions } from '@/src/areaSelector/type'
import type { EmptyOptions } from '@/src/empty/type'
import type { PageOfficeInjectOptions } from '@/src/pageOffice/type'

export interface ConfigProviderProps {
  // 区域选择器的区域选项列表
  areaSelector?: AreaSelectorOptions
  // 色标设置选项数据
  colorCode?: ColorCodeOptions
  // 空状态组件props
  empty?: EmptyOptions
  // 图表组件注入选项
  chart?: ChartInjectOptions
  // PageOffice组件注入选项
  pageOffice?: PageOfficeInjectOptions
}
