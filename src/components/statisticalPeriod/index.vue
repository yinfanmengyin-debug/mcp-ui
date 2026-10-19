<template>
  <div class="statistical-period">
    <MtCheckButton
      v-model="currentType"
      :list="typeOptions"
      :column="typeOptions.length"
      size="small"
    />

    <MtDate
      v-if="currentType === 'date'"
      ref="pickerRef"
      :model-value="currentStringValue"
      mode="range"
      class="statistical-period__picker"
      v-bind="currentPickerProps"
      :disabled-date="handleDisabledDate"
      @update:model-value="handleValueChange"
    />
    <MtDate
      v-else-if="currentType === 'hour'"
      ref="pickerRef"
      :model-value="currentStringValue"
      mode="range"
      class="statistical-period__picker"
      v-bind="currentPickerProps"
      :disabled-date="handleDisabledDate"
      :disabled-hours="handleDisabledHours"
      @update:model-value="handleValueChange"
    />
    <MtHou
      v-else-if="currentType === 'hou'"
      ref="pickerRef"
      :model-value="currentStringValue"
      mode="range"
      class="statistical-period__picker"
      v-bind="currentPickerProps"
      :disabled-date="handleDisabledDate"
      @update:model-value="handleValueChange"
    />
    <MtXun
      v-else-if="currentType === 'xun'"
      ref="pickerRef"
      :model-value="currentStringValue"
      mode="range"
      class="statistical-period__picker"
      v-bind="currentPickerProps"
      :disabled-date="handleDisabledDate"
      @update:model-value="handleValueChange"
    />
    <MtMonth
      v-else-if="currentType === 'month'"
      ref="pickerRef"
      :model-value="currentStringValue"
      mode="range"
      class="statistical-period__picker"
      v-bind="currentPickerProps"
      :disabled-date="handleDisabledDate"
      @update:model-value="handleValueChange"
    />
    <MtSeason
      v-else-if="currentType === 'season'"
      ref="pickerRef"
      :model-value="currentStringValue"
      mode="range"
      class="statistical-period__picker"
      v-bind="currentPickerProps"
      :disabled-date="handleDisabledDate"
      @update:model-value="handleValueChange"
    />
    <MtYear
      v-else
      ref="pickerRef"
      :model-value="currentYearValue"
      mode="range"
      class="statistical-period__picker"
      v-bind="currentPickerProps"
      :disabled-date="handleDisabledDate"
      @update:model-value="handleValueChange"
    />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'
import type { Dayjs } from 'dayjs'
import type { PanelType, TimeListExpose, TimeListItem, YearRangeValue } from '../datePicker/type'
import MtCheckButton from '../areaSelector/checkButton.vue'
import MtDate from '../datePicker/mtDate/index.vue'
import MtHou from '../datePicker/mtHou/index.vue'
import MtMonth from '../datePicker/mtMonth/index.vue'
import MtSeason from '../datePicker/mtSeason/index.vue'
import MtXun from '../datePicker/mtXun/index.vue'
import MtYear from '../datePicker/mtYear/index.vue'
import type {
  StatisticalPeriodConfig,
  StatisticalPeriodDisabledContext,
  StatisticalPeriodExpose,
  StatisticalPeriodItemConfig,
  StatisticalPeriodItems,
  StatisticalPeriodType,
  StatisticalPeriodTypeOption
} from './type'

defineOptions({ name: 'StatisticalPeriod' })

const defaultTypeOptions: StatisticalPeriodTypeOption[] = [
  { label: '时', value: 'hour' },
  { label: '日', value: 'date' },
  { label: '侯', value: 'hou' },
  { label: '旬', value: 'xun' },
  { label: '月', value: 'month' },
  { label: '季', value: 'season' },
  { label: '年', value: 'year' }
]

const typeLabelMap: Record<StatisticalPeriodType, string> = {
  date: '日期',
  hour: '时间',
  hou: '侯',
  xun: '旬',
  month: '月份',
  season: '季节',
  year: '年份'
}

const emptyItemMap: StatisticalPeriodItems = {
  date: { value: null, defaultValue: null },
  hour: { value: null, defaultValue: null },
  hou: { value: null, defaultValue: null },
  xun: { value: null, defaultValue: null },
  month: { value: null, defaultValue: null },
  season: { value: null, defaultValue: null },
  year: { value: null, defaultValue: null }
}

const props = defineProps<{
  config: StatisticalPeriodConfig
}>()

const emit = defineEmits<{
  'update:config': [value: StatisticalPeriodConfig]
  change: [value: StatisticalPeriodConfig]
}>()

const typeOptions = computed(() => {
  if (props.config.types?.length) {
    return props.config.types
  }

  const configuredTypes = defaultTypeOptions.filter(option => {
    const item = props.config.items?.[option.value]
    return (
      item && (hasValue(item.value) || hasValue(item.defaultValue) || item.limit || item.pickerProps || item.format)
    )
  })

  return configuredTypes.length ? configuredTypes : defaultTypeOptions
})

const currentType = computed<StatisticalPeriodType>({
  get() {
    return props.config.type
  },
  set(value) {
    handleTypeChange(value)
  }
})

const currentItem = computed(() => getCurrentItem(props.config, props.config.type))

const currentStringValue = computed<[string | null, string | null] | null>(
  () => currentItem.value.value as [string | null, string | null] | null
)

const currentYearValue = computed<YearRangeValue | null>(() => currentItem.value.value as YearRangeValue | null)
const initializedTypes = ref<Partial<Record<StatisticalPeriodType, boolean>>>({})
const pickerRef = ref<TimeListExpose | null>(null)

const currentPickerProps = computed(() => {
  const label = typeLabelMap[props.config.type]
  const { pickerProps = {}, format } = currentItem.value
  const hourProps =
    props.config.type === 'hour'
      ? {
          showHour: true,
          showMinute: false
        }
      : {}
  return {
    startPlaceholder: `开始${label}`,
    endPlaceholder: `结束${label}`,
    format,
    ...hourProps,
    ...pickerProps
  }
})

watch(
  () => props.config.type,
  type => {
    ensureTypeInitialized(type)
  },
  { immediate: true }
)

watch(
  () => typeOptions.value.map(item => item.value),
  values => {
    if (!values.length || values.includes(props.config.type)) {
      return
    }

    handleTypeChange(values[0])
  },
  { immediate: true }
)

function handleTypeChange(type: StatisticalPeriodType) {
  const nextConfig = cloneConfig(props.config)
  nextConfig.type = type

  if (!initializedTypes.value[type]) {
    const nextItem = getCurrentItem(nextConfig, type)
    if (!hasValue(nextItem.value) && hasValue(nextItem.defaultValue)) {
      nextItem.value = cloneValue(nextItem.defaultValue)
    }
  }

  initializedTypes.value[type] = true

  emitConfig(nextConfig)
}

function handleValueChange(value: unknown) {
  const nextConfig = cloneConfig(props.config)
  const nextItem = getCurrentItem(nextConfig, nextConfig.type)
  nextItem.value = cloneValue(value)
  initializedTypes.value[nextConfig.type] = true
  emitConfig(nextConfig)
}

function ensureTypeInitialized(type: StatisticalPeriodType) {
  if (initializedTypes.value[type]) {
    return
  }

  const item = getCurrentItem(props.config, type)
  if (hasValue(item.value)) {
    initializedTypes.value[type] = true
    return
  }

  if (!hasValue(item.defaultValue)) {
    initializedTypes.value[type] = true
    return
  }

  const nextConfig = cloneConfig(props.config)
  const nextItem = getCurrentItem(nextConfig, type)
  nextItem.value = cloneValue(nextItem.defaultValue)
  initializedTypes.value[type] = true
  emitConfig(nextConfig)
}

function handleDisabledDate(date: Dayjs, panel: PanelType, rangeValue?: [Dayjs | null, Dayjs | null]) {
  const type = props.config.type
  const item = currentItem.value
  if (type === 'hour') {
    return isHourDateDisabled(date, panel, item.value, item.limit, rangeValue)
  }

  const normalizedDate = normalizePeriodDate(date, type)
  const limit = item.limit

  if (isOutOfLimitRange(normalizedDate, type, limit)) {
    return true
  }

  if (isOutOfSpanRange(normalizedDate, panel, type, item.value, limit?.maxSpan)) {
    return true
  }

  const context: StatisticalPeriodDisabledContext = {
    type,
    config: props.config
  }
  return item.disabledDate?.(normalizedDate, panel, context) ?? false
}

function handleDisabledHours(panel: PanelType, selectedDate?: Dayjs | null, rangeValue?: [Dayjs | null, Dayjs | null]) {
  if (props.config.type !== 'hour' || !selectedDate) {
    return []
  }

  const baseDate = selectedDate.startOf('day')
  const disabledHours: number[] = []

  for (let hour = 0; hour < 24; hour += 1) {
    const candidate = baseDate.hour(hour).startOf('hour')
    if (isHourCandidateDisabled(candidate, panel, currentItem.value, rangeValue)) {
      disabledHours.push(hour)
    }
  }

  return disabledHours
}

function emitConfig(value: StatisticalPeriodConfig) {
  emit('update:config', value)
  emit('change', value)
}

function getCurrentItem(config: StatisticalPeriodConfig, type: StatisticalPeriodType) {
  const item = config.items[type]
  if (item) {
    return item as StatisticalPeriodItemConfig<unknown>
  }
  return cloneValue(emptyItemMap[type]) as StatisticalPeriodItemConfig<unknown>
}

function cloneConfig(config: StatisticalPeriodConfig): StatisticalPeriodConfig {
  return {
    ...config,
    ...(config.types ? { types: config.types.map(item => ({ ...item })) } : {}),
    items: {
      ...config.items,
      date: cloneItem(config.items.date, emptyItemMap.date),
      hour: cloneItem(config.items.hour, emptyItemMap.hour),
      hou: cloneItem(config.items.hou, emptyItemMap.hou),
      xun: cloneItem(config.items.xun, emptyItemMap.xun),
      month: cloneItem(config.items.month, emptyItemMap.month),
      season: cloneItem(config.items.season, emptyItemMap.season),
      year: cloneItem(config.items.year, emptyItemMap.year)
    }
  }
}

function cloneItem<TValue>(
  item: StatisticalPeriodItemConfig<TValue> | undefined,
  fallback: StatisticalPeriodItemConfig<TValue>
) {
  const source = item ?? fallback
  return {
    ...source,
    value: cloneValue(source.value),
    defaultValue: cloneValue(source.defaultValue),
    format: source.format,
    limit: source.limit ? { ...source.limit } : undefined,
    pickerProps: source.pickerProps ? { ...source.pickerProps } : undefined
  }
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return [...value] as T
  }
  if (value && typeof value === 'object') {
    return { ...(value as Record<string, unknown>) } as T
  }
  return value
}

function hasValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.some(item => item !== null && item !== undefined && item !== '')
  }
  return value !== null && value !== undefined && value !== ''
}

function isOutOfLimitRange(
  candidate: Dayjs,
  type: StatisticalPeriodType,
  limit?: StatisticalPeriodItemConfig<unknown>['limit']
) {
  if (!limit) return false

  const minDate = parseLimitDate(limit.min, type)
  const maxDate = parseLimitDate(limit.max, type)
  const min = minDate ? toPeriodIndex(minDate, type) : null
  const max = maxDate ? toPeriodIndex(maxDate, type) : null
  const candidateIndex = toPeriodIndex(candidate, type)

  if (min !== null && candidateIndex < min) {
    return true
  }

  return max !== null && candidateIndex > max
}

function isOutOfSpanRange(
  candidate: Dayjs,
  panel: PanelType,
  type: StatisticalPeriodType,
  value: unknown,
  maxSpan?: number
) {
  if (!maxSpan || maxSpan < 1) return false

  const [start, end] = getRangeBoundary(value, type)
  const candidateIndex = toPeriodIndex(candidate, type)

  if (panel === 'end' && start) {
    const startIndex = toPeriodIndex(start, type)
    return candidateIndex < startIndex || candidateIndex > startIndex + maxSpan - 1
  }

  if (panel === 'start' && end) {
    const endIndex = toPeriodIndex(end, type)
    return candidateIndex > endIndex || candidateIndex < endIndex - maxSpan + 1
  }

  return false
}

function isHourDateDisabled(
  date: Dayjs,
  panel: PanelType,
  value: unknown,
  limit?: StatisticalPeriodItemConfig<unknown>['limit'],
  rangeValue?: [Dayjs | null, Dayjs | null]
) {
  const baseDate = date.startOf('day')

  for (let hour = 0; hour < 24; hour += 1) {
    const candidate = baseDate.hour(hour).startOf('hour')
    if (!isHourCandidateDisabled(candidate, panel, { value, limit }, rangeValue)) {
      return false
    }
  }

  return true
}

function isHourCandidateDisabled(
  candidate: Dayjs,
  panel: PanelType,
  item: Pick<StatisticalPeriodItemConfig<unknown>, 'value' | 'limit' | 'disabledDate'>,
  rangeValue?: [Dayjs | null, Dayjs | null]
) {
  if (isOutOfLimitRange(candidate, 'hour', item.limit)) {
    return true
  }

  if (isOutOfHourSpanRange(candidate, panel, item.value, item.limit?.maxSpan, rangeValue)) {
    return true
  }

  const context: StatisticalPeriodDisabledContext = {
    type: 'hour',
    config: props.config
  }
  return item.disabledDate?.(candidate, panel, context) ?? false
}

function isOutOfHourSpanRange(
  candidate: Dayjs,
  panel: PanelType,
  value: unknown,
  maxSpan?: number,
  rangeValue?: [Dayjs | null, Dayjs | null]
) {
  if (!maxSpan || maxSpan < 1) {
    return false
  }

  const [start, end] = getHourRangeBoundary(value, rangeValue)
  const candidateIndex = toPeriodIndex(candidate, 'hour')

  if (panel === 'end' && start) {
    const startIndex = toPeriodIndex(start, 'hour')
    return candidateIndex < startIndex || candidateIndex > startIndex + maxSpan - 1
  }

  if (panel === 'start' && end) {
    const endIndex = toPeriodIndex(end, 'hour')
    return candidateIndex > endIndex || candidateIndex < endIndex - maxSpan + 1
  }

  return false
}

function getRangeBoundary(value: unknown, type: StatisticalPeriodType) {
  if (type === 'year') {
    const [start, end] = (value as YearRangeValue | null) ?? [null, null]
    return [
      parseYearBoundary(start, type),
      parseYearBoundary(end, type)
    ] as const
  }

  const [start, end] = (value as [string | null, string | null] | null) ?? [null, null]
  return [
    typeof start === 'string' ? normalizePeriodDate(dayjs(start), type) : null,
    typeof end === 'string' ? normalizePeriodDate(dayjs(end), type) : null
  ] as const
}

function getHourRangeBoundary(value: unknown, rangeValue?: [Dayjs | null, Dayjs | null]) {
  if (rangeValue) {
    const [start, end] = rangeValue
    return [start ? normalizePeriodDate(start, 'hour') : null, end ? normalizePeriodDate(end, 'hour') : null] as const
  }

  return getRangeBoundary(value, 'hour')
}

function parseYearBoundary(value: YearRangeValue[number], type: StatisticalPeriodType) {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return normalizePeriodDate(dayjs().year(value).startOf('year'), type)
  }

  if (typeof value === 'string') {
    const parsed = dayjs(value)
    if (parsed.isValid()) {
      return normalizePeriodDate(parsed, type)
    }
  }

  return null
}

function parseLimitDate(value: unknown, type: StatisticalPeriodType) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (type === 'year' && typeof value === 'number') {
    return dayjs().year(value).startOf('year')
  }

  const parsed = dayjs(value as string | number | Date | Dayjs)
  if (!parsed.isValid()) {
    return null
  }
  return normalizePeriodDate(parsed, type)
}

function normalizePeriodDate(date: Dayjs, type: StatisticalPeriodType) {
  if (type === 'year') {
    return date.startOf('year')
  }

  if (type === 'season') {
    const season = getSeason(date)
    return (date.startOf('year') as Dayjs & { season: (value: number) => Dayjs }).season(season).startOf('day')
  }

  if (type === 'month') {
    return date.startOf('month')
  }

  if (type === 'hour') {
    return date.startOf('hour')
  }

  if (type === 'xun') {
    const xun = getXun(date)
    const dayOfMonth = xun === 1 ? 1 : xun === 2 ? 11 : 21
    return date.startOf('month').date(dayOfMonth).startOf('day')
  }

  if (type === 'hou') {
    const hou = getHou(date)
    return date
      .startOf('month')
      .date((hou - 1) * 5 + 1)
      .startOf('day')
  }

  return date.startOf('day')
}

function toPeriodIndex(date: Dayjs, type: StatisticalPeriodType) {
  if (type === 'year') {
    return date.year()
  }

  if (type === 'season') {
    return date.year() * 4 + getSeason(date) - 1
  }

  if (type === 'month') {
    return date.year() * 12 + date.month()
  }

  if (type === 'hour') {
    return Math.floor(date.startOf('hour').valueOf() / (60 * 60 * 1000))
  }

  if (type === 'xun') {
    return date.year() * 36 + date.month() * 3 + getXun(date) - 1
  }

  if (type === 'hou') {
    return date.year() * 72 + date.month() * 6 + getHou(date) - 1
  }

  return Math.floor(date.startOf('day').valueOf() / (24 * 60 * 60 * 1000))
}

function getSeason(date: Dayjs) {
  return (date as Dayjs & { season: () => number }).season()
}

function getXun(date: Dayjs) {
  const dayOfMonth = date.date()
  if (dayOfMonth <= 10) return 1
  if (dayOfMonth <= 20) return 2
  return 3
}

function getHou(date: Dayjs) {
  return Math.min(Math.floor((date.date() - 1) / 5) + 1, 6)
}

function getSelectedTimeList(step = 1): TimeListItem[] {
  return pickerRef.value?.getSelectedTimeList(step) ?? []
}

defineExpose<StatisticalPeriodExpose>({
  getSelectedTimeList
})
</script>

<style scoped lang="scss">
.statistical-period {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  :deep(.el-button--default) {
    background-color: var(--theme-unchoose-bg-color);
  }
}

.statistical-period__picker {
  width: 100%;
}
</style>
