import type { ChartInjectOptions } from '@/src/chart/type'
import type { PageOfficeInjectOptions } from '@/src/pageOffice/type'
import type { InjectionKey, Ref } from 'vue'
import type { ColorCodeOptions } from '@/src/legend/type'
import type { AreaSelectorOptions } from '@/src/areaSelector/type'
import type { EmptyOptions } from '@/src/empty/type'

// 色标选项数据的注入名
export const colorCodeInjectionKey = Symbol('colorCodeInjectionKey') as InjectionKey<Ref<ColorCodeOptions | undefined>>

// 区域选择器的区域选项列表的注入名
export const areaSelectorInjectionKey = Symbol('areaInjectionKey') as InjectionKey<Ref<AreaSelectorOptions | undefined>>

// 空状态组件props的注入名
export const emptyInjectionKey = Symbol('emptyInjectionKey') as InjectionKey<Ref<EmptyOptions | undefined>>

// 图表组件的注入名
export const chartInjectionKey = Symbol('chartInjectionKey') as InjectionKey<Ref<ChartInjectOptions | undefined>>

// PageOffice组件的注入名
export const pageOfficeInjectionKey = Symbol('pageOfficeInjectionKey') as InjectionKey<
  Ref<PageOfficeInjectOptions | undefined>
>
