<template>
  <div class="mt-date-picker">
    <el-form-item
      v-if="showTypes"
      class="timescale-con"
      :label="showTypesLabel ? '时间尺度：' : undefined"
      :label-width="showTypesLabel ? undefined : 0"
    >
      <mt-check-button
        :model-value="type"
        class="timescale"
        :list="timeScaleOptions"
        size="small"
        column="auto"
        :gap="8"
        @update:model-value="(val: any) => $emit('update:type', val)"
      />
    </el-form-item>
    <keep-alive>
      <component
        :is="component"
        :key="componentKey"
        :model-value="modelValue"
        :show-year="showYear"
        :setting="setting"
        :show-shortcuts="showShortcuts"
        :showSlots="showSlots"
        v-bind="$attrs"
        @update:model-value="updateModelValue"
      >
        <template #default>
          <slot name="default"></slot>
        </template>
      </component>
    </keep-alive>
    <shortcut-key
      v-if="showShortcuts"
      :model-value="modelValue"
      :type="type"
      :pre-append="preAppend"
      :suf-append="sufAppend"
      :re-list="reList"
      :fold="fold"
      :rowNum="rowNum"
      :colNum="colNum"
      @update:model-value="updateModelValue"
    >
    </shortcut-key>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'
import { computed, ComputedRef, ref, watch } from 'vue'
import ContinuousPeriodHourPicker from './continuousPeriod/continuousPeriodHour.vue'
import ContinuousPeriodDayPicker from './continuousPeriod/continuousPeriodDay.vue'
import ContinuousPeriodHouPicker from './continuousPeriod/continuousPeriodHou.vue'
import ContinuousPeriodXunPicker from './continuousPeriod/continuousPeriodXun.vue'
import ContinuousPeriodMonthPicker from './continuousPeriod/continuousPeriodMonth.vue'
import ContinuousPeriodSeasonPicker from './continuousPeriod/continuousPeriodSeason.vue'
import ContinuousPeriodYearPicker from './continuousPeriod/continuousPeriodYear.vue'
import SamePeriodDayPicker from './overTheSamePeriod/overTheSamePeriodDay.vue'
import SamePeriodHouPicker from './overTheSamePeriod/overTheSamePeriodHou.vue'
import SamePeriodXunPicker from './overTheSamePeriod/overTheSamePeriodXun.vue'
import SamePeriodMonthPicker from './overTheSamePeriod/overTheSamePeriodMonth.vue'
import SamePeriodSeasonPicker from './overTheSamePeriod/overTheSamePeriodSeason.vue'
import SamePeriodHourPicker from './overTheSamePeriod/overTheSamePeriodHour.vue'
import MtCheckButton from '../checkButton/index.vue'
import ShortcutKey from './shortcutKey/index.vue'
import './style/index.scss'
import type { Props, TimeScale } from './type'

defineOptions({
  name: 'MtDatePicker'
})

const props = withDefaults(defineProps<Props>(), {
  types: () => ['year', 'season', 'month', 'xun', 'hou', 'day', 'hour'],
  type: 'day',
  showTypes: true,
  showTypesLabel: true,
  samePeriod: false,
  showYear: true,
  showShortcuts: false,
  colNum: 1,
  rowNum: 3,
  showSlots: false
})

const emit = defineEmits<{
  'update:type': [val: TimeScale]
  'update:modelValue': [val: [Date, Date]]
}>()

// 时间尺度选项列表
const timeScaleOptions = computed(() =>
  (
    [
      { label: '时', value: 'hour' },
      { label: '日', value: 'day' },
      { label: '候', value: 'hou' },
      { label: '旬', value: 'xun' },
      { label: '月', value: 'month' },
      { label: '季', value: 'season' },
      { label: '年', value: 'year' }
    ] as { label: string; value: TimeScale }[]
  ).filter(item => props.types.some(t => t === item.value))
)

const currentType = ref(props.type)

const component = computed(() => {
  if (props.samePeriod) {
    return {
      day: SamePeriodDayPicker,
      hou: SamePeriodHouPicker,
      xun: SamePeriodXunPicker,
      hour: SamePeriodHourPicker,
      month: SamePeriodMonthPicker,
      season: SamePeriodSeasonPicker,
      year: ContinuousPeriodYearPicker
    }[currentType.value]!
  } else {
    return {
      hour: ContinuousPeriodHourPicker,
      day: ContinuousPeriodDayPicker,
      hou: ContinuousPeriodHouPicker,
      xun: ContinuousPeriodXunPicker,
      month: ContinuousPeriodMonthPicker,
      season: ContinuousPeriodSeasonPicker,
      year: ContinuousPeriodYearPicker
    }[currentType.value]!
  }
})

const componentKey = computed(() => `${currentType.value}${props.samePeriod ? 'samePeriod' : 'continuousPeriod'}`)

const valueMap = new Map<TimeScale, Array<Date | string>>()
watch(
  () => props.type,
  type => {
    if (valueMap.has(type)) {
      updateModelValue(cloneDeep(valueMap.get(type)) as [Date, Date])
    }
    currentType.value = type
  }
)

watch(
  () => props.modelValue,
  val => {
    valueMap.set(currentType.value, cloneDeep(val))
  }
)

function updateModelValue(val: [Date, Date]) {
  if (dayjs(val[0]).toString() !== dayjs(props.modelValue[0]).toString() || dayjs(val[1]).toString() !== dayjs(props.modelValue[1]).toString()) {
    emit('update:modelValue', val)
  }
}
</script>

<style lang="scss" scoped></style>
