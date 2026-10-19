import type { AreaSelectorOptions } from '@/src/areaSelector/type'
import type { ChartInjectOptions } from '@/src/chart/type'
import {
  areaSelectorInjectionKey,
  chartInjectionKey,
  colorCodeInjectionKey,
  emptyInjectionKey,
  pageOfficeInjectionKey
} from '@/src/configProvider/keys'
import type { EmptyOptions } from '@/src/empty/type'
import type { ColorCodeOptions } from '@/src/legend/type'
import type { PageOfficeInjectOptions } from '@/src/pageOffice/type'
import withInstall, { SFCWithInstall } from '@/utils/withInstall'
import type { PropType } from 'vue'
import { computed, defineComponent, provide, renderSlot } from 'vue'
import type { ConfigProviderProps } from './type'

const configProviderProps = {
  areaSelector: {
    type: Object as PropType<AreaSelectorOptions>
  },
  colorCode: {
    type: Object as PropType<ColorCodeOptions>
  },
  empty: {
    type: Object as PropType<EmptyOptions>
  },
  chart: {
    type: Object as PropType<ChartInjectOptions>
  },
  pageOffice: {
    type: Object as PropType<PageOfficeInjectOptions>
  }
}

const configProvider = defineComponent({
  name: 'MtConfigProvider',
  props: configProviderProps,
  inheritAttrs: false,
  setup(props: ConfigProviderProps, { slots }) {
    provide(
      areaSelectorInjectionKey,
      computed(() => props.areaSelector)
    )
    provide(
      colorCodeInjectionKey,
      computed(() => props.colorCode)
    )
    provide(
      emptyInjectionKey,
      computed(() => props.empty)
    )
    provide(
      chartInjectionKey,
      computed(() => props.chart)
    )
    provide(
      pageOfficeInjectionKey,
      computed(() => props.pageOffice)
    )
    return () => renderSlot(slots, 'default')
  }
})

const MtConfigProvider: SFCWithInstall<typeof configProvider> = withInstall(configProvider, 'MtConfigProvider')
export default MtConfigProvider
