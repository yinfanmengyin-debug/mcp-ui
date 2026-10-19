<template>
  <div class="mt-year-date-picker">
    <el-popover
      v-model:visible="visible"
      trigger="click"
      placement="bottom-start"
      :popper-class="'mt-year-date-picker__popover'"
      :width="popoverWidth"
      :disabled="disabled"
    >
      <template #reference>
        <div
          v-if="isRangeMode"
          class="mt-year-date-picker__range-reference"
          :class="{ 'is-disabled': disabled }"
        >
          <input
            v-model="rangeStartInputValue"
            name="start"
            class="mt-year-date-picker__range-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="startPlaceholder"
            :disabled="disabled"
            @change="handleRangeInputChange('start', ($event.target as HTMLInputElement).value)"
          />
          <span class="mt-year-date-picker__range-separator">
            {{ rangeSeparator }}
          </span>
          <input
            v-model="rangeEndInputValue"
            name="end"
            class="mt-year-date-picker__range-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="endPlaceholder"
            :disabled="disabled"
            @change="handleRangeInputChange('end', ($event.target as HTMLInputElement).value)"
          />
          <button
            v-if="clearable && hasValue && !disabled"
            type="button"
            class="mt-year-date-picker__clear"
            @click.stop="handleClear"
          >
            <el-icon>
              <CircleClose />
            </el-icon>
          </button>
          <el-icon class="mt-year-date-picker__suffix">
            <Calendar />
          </el-icon>
        </div>
        <el-input
          v-else
          v-model="inputValue"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          :placeholder="inputPlaceholder"
          :disabled="disabled"
          :clearable="clearable && hasValue && !disabled"
          @change="handleInputChange"
          @clear="handleClear"
        >
          <template #suffix>
            <el-icon class="mt-year-date-picker__suffix">
              <Calendar />
            </el-icon>
          </template>
        </el-input>
      </template>

      <div
        class="mt-year-date-picker__panels"
        :class="{ 'is-range': isRangeMode }"
      >
        <div class="mt-year-date-picker__panel">
          <div class="mt-year-date-picker__panel-header">
            <button
              type="button"
              class="mt-year-date-picker__nav"
              @click="changePanelPage(isRangeMode ? 'start' : 'single', -1)"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
            <span class="mt-year-date-picker__panel-title">
              {{ getPanelTitle(isRangeMode ? rangePanelStartYears[0] : singlePanelStartYear) }}
            </span>
            <button
              type="button"
              class="mt-year-date-picker__nav"
              @click="changePanelPage(isRangeMode ? 'start' : 'single', 1)"
            >
              <el-icon><DArrowRight /></el-icon>
            </button>
          </div>

          <div
            class="mt-year-date-picker__panel-body"
            :style="panelGridStyle"
          >
            <button
              v-for="year in getPanelYears(isRangeMode ? rangePanelStartYears[0] : singlePanelStartYear)"
              :key="`left-${year}`"
              type="button"
              class="mt-year-date-picker__year"
              :class="getYearClass(year, isRangeMode ? 'start' : 'single')"
              :disabled="isYearDisabled(year, isRangeMode ? 'start' : 'single')"
              @click="handleYearSelect(year, isRangeMode ? 'start' : 'single')"
            >
              {{ year }}
            </button>
          </div>
        </div>

        <div
          v-if="isRangeMode"
          class="mt-year-date-picker__panel"
        >
          <div class="mt-year-date-picker__panel-header">
            <button
              type="button"
              class="mt-year-date-picker__nav"
              @click="changePanelPage('end', -1)"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
            <span class="mt-year-date-picker__panel-title">
              {{ getPanelTitle(rangePanelStartYears[1]) }}
            </span>
            <button
              type="button"
              class="mt-year-date-picker__nav"
              @click="changePanelPage('end', 1)"
            >
              <el-icon><DArrowRight /></el-icon>
            </button>
          </div>

          <div
            class="mt-year-date-picker__panel-body"
            :style="panelGridStyle"
          >
            <button
              v-for="year in getPanelYears(rangePanelStartYears[1])"
              :key="`right-${year}`"
              type="button"
              class="mt-year-date-picker__year"
              :class="getYearClass(year, 'end')"
              :disabled="isYearDisabled(year, 'end')"
              @click="handleYearSelect(year, 'end')"
            >
              {{ year }}
            </button>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'
import { ElMessage as Message } from 'element-plus'
import { Calendar, CircleClose, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import type { Dayjs } from 'dayjs'
import type {
  DisabledDateValue,
  PanelType,
  SelectionMode,
  TimeListExpose,
  TimeListItem,
  YearModelValue,
  YearRangeValue
} from '../type'
import { buildIndexedTimeList, buildSortedSelectedTimeList, normalizeTimeListStep } from '../timeList'

defineOptions({ name: 'MtYear' })

type NormalizedYearRangeValue = [number | null, number | null]

const props = withDefaults(
  defineProps<{
    mode?: SelectionMode
    placeholder?: string
    startPlaceholder?: string
    endPlaceholder?: string
    rangeSeparator?: string
    valueFormat?: string
    disabled?: boolean
    clearable?: boolean
    pageSize?: number
    columns?: number
    disabledYears?: number[]
    disabledDates?: DisabledDateValue[]
    disabledDate?: (date: Dayjs, panel: PanelType) => boolean
  }>(),
  {
    mode: 'single',
    placeholder: '请选择年份',
    startPlaceholder: '开始年份',
    endPlaceholder: '结束年份',
    rangeSeparator: '至',
    valueFormat: 'YYYY-MM-DD HH:mm:00',
    disabled: false,
    clearable: true,
    pageSize: 16,
    columns: 4,
    disabledYears: () => [],
    disabledDates: () => []
  }
)

const model = defineModel<YearModelValue>({ default: null })

const visible = ref(false)
const currentYear = dayjs().year()
const singlePanelStartYear = ref(getInitialPanelStart(currentYear))
const rangePanelStartYears = ref<[number, number]>([
  getInitialPanelStart(currentYear),
  getInitialPanelStart(currentYear) + getSafePageSize()
])

const rangeUserInput = ref<[string | null, string | null]>([null, null])
const userInput = ref<string | null>(null)

const isRangeMode = computed(() => props.mode === 'range')
const normalizedPageSize = computed(() => Math.max(1, Math.trunc(props.pageSize)))
const normalizedColumns = computed(() => {
  const rawColumns = Math.max(1, Math.trunc(props.columns))
  return Math.min(rawColumns, normalizedPageSize.value)
})
const popoverWidth = computed(() => (isRangeMode.value ? 660 : 320))
const panelGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${normalizedColumns.value}, minmax(0, 1fr))`
}))

const inputPlaceholder = computed(() =>
  isRangeMode.value ? `${props.startPlaceholder} ${props.rangeSeparator} ${props.endPlaceholder}` : props.placeholder
)

const rangeStartInputValue = computed({
  get() {
    if (rangeUserInput.value[0] !== null) {
      return rangeUserInput.value[0]
    }
    const [start] = rangeValue.value
    return start !== null ? start.toString() : ''
  },
  set(val: string) {
    rangeUserInput.value = [val, rangeUserInput.value[1]]
  }
})

const rangeEndInputValue = computed({
  get() {
    if (rangeUserInput.value[1] !== null) {
      return rangeUserInput.value[1]
    }
    const [, end] = rangeValue.value
    return end !== null ? end.toString() : ''
  },
  set(val: string) {
    rangeUserInput.value = [rangeUserInput.value[0], val]
  }
})

const singleValue = computed(() => (props.mode === 'single' ? normalizeYear(model.value) : null))

const multipleValue = computed(() => (props.mode === 'multiple' ? normalizeYearList(model.value) : []))

const rangeValue = computed<NormalizedYearRangeValue>(() => (props.mode === 'range' ? normalizeRange(model.value) : [null, null]))

const hasValue = computed(() => {
  if (props.mode === 'range') {
    return !!rangeStartInputValue.value || !!rangeEndInputValue.value
  }

  if (userInput.value !== null && userInput.value.trim() !== '') {
    return true
  }

  if (props.mode === 'single') {
    return singleValue.value !== null
  }
  if (props.mode === 'multiple') {
    return multipleValue.value.length > 0
  }
  const [startYear, endYear] = rangeValue.value
  return startYear !== null || endYear !== null
})

const displayText = computed(() => {
  if (props.mode === 'single') {
    return singleValue.value?.toString() ?? ''
  }
  if (props.mode === 'multiple') {
    return multipleValue.value.join(', ')
  }

  const [startYear, endYear] = rangeValue.value
  if (startYear === null && endYear === null) {
    return ''
  }

  return `${startYear ?? props.startPlaceholder} ${props.rangeSeparator} ${endYear ?? props.endPlaceholder}`
})

const inputValue = computed({
  get() {
    return userInput.value !== null ? userInput.value : displayText.value
  },
  set(val: string) {
    userInput.value = val
  }
})

function handleInputChange(val: string) {
  const normalizedValue = val.trim()

  if (!normalizedValue) {
    userInput.value = null
    handleClear()
    syncPanelYears()
    return
  }

  if (props.mode === 'single') {
    const yearParsed = parseInt(normalizedValue, 10)
    if (!isNaN(yearParsed)) {
      if (isYearDisabled(yearParsed, 'single')) {
        userInput.value = null
        handleClear()
        syncPanelYears()
        return
      }
      userInput.value = normalizedValue
      model.value = formatYearValue(yearParsed)
    } else {
      userInput.value = normalizedValue
    }
  } else if (props.mode === 'multiple') {
    const newValues = normalizedValue
      .split(/[,，]/)
      .map(part => parseInt(part.trim(), 10))
      .filter(year => !isNaN(year))

    const validValues = newValues.filter(year => !isYearDisabled(year, 'single'))

    if (validValues.length === 0 && newValues.length > 0) {
      userInput.value = null
      model.value = []
      syncPanelYears()
      return
    }

    userInput.value = validValues.join(', ')

    if (validValues.length > 0) {
      model.value = [...new Set(validValues)].sort((a, b) => a - b)
    }
  }
}

function handleRangeInputChange(panel: 'start' | 'end', val: string) {
  const normalizedValue = val.trim()
  if (panel === 'start') {
    rangeUserInput.value = [normalizedValue || null, rangeUserInput.value[1]]
  } else {
    rangeUserInput.value = [rangeUserInput.value[0], normalizedValue || null]
  }

  if (!rangeUserInput.value[0] && !rangeUserInput.value[1]) {
    handleClear()
    syncPanelYears()
    return
  }

  const startParsed = rangeUserInput.value[0] ? parseInt(rangeUserInput.value[0], 10) : null
  const endParsed = rangeUserInput.value[1] ? parseInt(rangeUserInput.value[1], 10) : null

  let newStart = startParsed && !isNaN(startParsed) ? startParsed : null
  let newEnd = endParsed && !isNaN(endParsed) ? endParsed : null

  if (newStart !== null && isYearDisabled(newStart, 'start')) {
    newStart = null
    rangeUserInput.value[0] = null
  }
  if (newEnd !== null && isYearDisabled(newEnd, 'end')) {
    newEnd = null
    rangeUserInput.value[1] = null
  }

  model.value = [newStart !== null ? formatYearValue(newStart) : null, newEnd !== null ? formatYearValue(newEnd) : null]
  validateRangeOrder(newStart, newEnd)
  syncPanelYears()
}

const disabledYearSet = computed(() => {
  const years = new Set<number>()

  props.disabledYears.forEach(year => {
    if (Number.isInteger(year)) {
      years.add(year)
    }
  })

  props.disabledDates.forEach(item => {
    if (typeof item === 'number' && Number.isInteger(item) && item >= 1000 && item <= 9999) {
      years.add(item)
      return
    }

    const parsed = dayjs(item)
    if (parsed.isValid()) {
      years.add(parsed.year())
    }
  })

  return years
})

watch(
  [() => props.mode, normalizedPageSize],
  () => {
    syncPanelYears()
  },
  { immediate: true }
)

watch(
  () => visible.value,
  isVisible => {
    if (isVisible) {
      userInput.value = null
      rangeUserInput.value = [null, null]
      syncPanelYears()
    }
  }
)

function isSameModelValue(valueA: YearModelValue, valueB: YearModelValue) {
  return JSON.stringify(valueA) === JSON.stringify(valueB)
}

function sanitizeYearModelValue(): YearModelValue {
  if (props.mode === 'single') {
    const year = normalizeYear(model.value)
    if (year === null || isYearDisabled(year, 'single')) {
      return null
    }
    return formatYearValue(year)
  }

  if (props.mode === 'multiple') {
    return normalizeYearList(model.value)
      .filter(year => !isYearDisabled(year, 'single'))
      .map(year => formatYearValue(year))
  }

  const [startYear, endYear] = normalizeRange(model.value)
  return [
    startYear !== null && !isYearDisabled(startYear, 'start') ? formatYearValue(startYear) : null,
    endYear !== null && !isYearDisabled(endYear, 'end') ? formatYearValue(endYear) : null
  ]
}

watch(
  [() => model.value, () => props.mode, disabledYearSet, () => props.disabledDate],
  () => {
    const sanitizedValue = sanitizeYearModelValue()
    if (!isSameModelValue(sanitizedValue, model.value)) {
      model.value = sanitizedValue
      return
    }
    if (!visible.value) {
      syncPanelYears()
    }
  },
  { immediate: true, deep: true }
)

function getSafePageSize() {
  return Math.max(1, Math.trunc(props.pageSize))
}

function normalizeYear(value: unknown) {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim()
    if (!normalized) {
      return null
    }

    if (/^\d{4}$/.test(normalized)) {
      return parseInt(normalized, 10)
    }

    const parsed = dayjs(normalized)
    if (parsed.isValid()) {
      return parsed.year()
    }
  }

  return null
}

function normalizeYearList(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.map(item => normalizeYear(item)).filter((year): year is number => year !== null))].sort(
    (yearA, yearB) => yearA - yearB
  )
}

function normalizeRange(value: unknown): NormalizedYearRangeValue {
  if (!Array.isArray(value)) {
    return [null, null]
  }

  return [normalizeYear(value[0]), normalizeYear(value[1])]
}

function formatYearValue(year: number) {
  return dayjs().year(year).startOf('year').format(props.valueFormat)
}

function getInitialPanelStart(year: number) {
  return Math.floor(year / 10) * 10
}

function getPanelTitle(startYear: number) {
  return `${startYear}~${startYear + normalizedPageSize.value - 1}`
}

function getPanelYears(startYear: number) {
  return Array.from({ length: normalizedPageSize.value }, (_, index) => startYear + index)
}

function syncPanelYears() {
  if (props.mode === 'range') {
    const [startYear, endYear] = rangeValue.value
    const leftStartYear = getInitialPanelStart(startYear ?? currentYear)
    const rightStartYear = getInitialPanelStart(endYear ?? currentYear)
    rangePanelStartYears.value = [leftStartYear, rightStartYear]
    return
  }

  const anchorYear =
    props.mode === 'multiple' ? (multipleValue.value.at(-1) ?? currentYear) : (singleValue.value ?? currentYear)

  singlePanelStartYear.value = getInitialPanelStart(anchorYear)
}

function changePanelPage(panel: PanelType, direction: -1 | 1) {
  const step = normalizedPageSize.value * direction
  if (panel === 'single') {
    singlePanelStartYear.value += step
    return
  }
  if (panel === 'start') {
    rangePanelStartYears.value = [rangePanelStartYears.value[0] + step, rangePanelStartYears.value[1]]
    return
  }
  rangePanelStartYears.value = [rangePanelStartYears.value[0], rangePanelStartYears.value[1] + step]
}

function validateRangeOrder(startYear: number | null, endYear: number | null) {
  if (startYear === null || endYear === null) {
    return
  }
  if (startYear > endYear) {
    model.value = [null, null]
    Message.warning('开始年份不能大于结束年份')
  }
}

function isYearDisabled(year: number, panel: PanelType) {
  if (disabledYearSet.value.has(year)) {
    return true
  }
  return props.disabledDate?.(dayjs().year(year).startOf('year'), panel) ?? false
}

function handleYearSelect(year: number, panel: PanelType) {
  rangeUserInput.value = [null, null]
  if (isYearDisabled(year, panel)) {
    return
  }

  if (props.mode === 'single') {
    model.value = formatYearValue(year)
    visible.value = false
    return
  }

  if (props.mode === 'multiple') {
    const selectedYears = new Set(multipleValue.value)
    if (selectedYears.has(year)) {
      selectedYears.delete(year)
    } else {
      selectedYears.add(year)
    }
    model.value = [...selectedYears].sort((yearA, yearB) => yearA - yearB).map(item => formatYearValue(item))
    return
  }

  const [startYear, endYear] = rangeValue.value
  if (panel === 'start') {
    if (startYear === year) {
      model.value = [null, endYear !== null ? formatYearValue(endYear) : null]
      return
    }
    model.value = [formatYearValue(year), endYear !== null ? formatYearValue(endYear) : null]
    validateRangeOrder(year, endYear)
    return
  }
  if (endYear === year) {
    model.value = [startYear !== null ? formatYearValue(startYear) : null, null]
    return
  }
  model.value = [startYear !== null ? formatYearValue(startYear) : null, formatYearValue(year)]
  validateRangeOrder(startYear, year)
}

function handleClear() {
  userInput.value = null
  rangeUserInput.value = [null, null]
  if (props.mode === 'single') {
    model.value = null
    return
  }

  if (props.mode === 'multiple') {
    model.value = []
    return
  }

  model.value = [null, null]
}

function createYearTimeItem(year: number): TimeListItem {
  return {
    label: String(year),
    value: formatYearValue(year)
  }
}

function getSelectedTimeList(step = 1) {
  const normalizedStep = normalizeTimeListStep(step)

  if (props.mode === 'single') {
    return singleValue.value !== null ? [createYearTimeItem(singleValue.value)] : []
  }

  if (props.mode === 'multiple') {
    return buildSortedSelectedTimeList(multipleValue.value, year => year, createYearTimeItem)
  }

  const [startYear, endYear] = rangeValue.value
  if (startYear === null && endYear === null) {
    return []
  }
  if (startYear === null) {
    return endYear === null ? [] : [createYearTimeItem(endYear)]
  }
  if (endYear === null) {
    return [createYearTimeItem(startYear)]
  }

  return buildIndexedTimeList(startYear, endYear, normalizedStep, createYearTimeItem)
}

function getYearClass(year: number, panel: PanelType) {
  if (props.mode === 'range' && (rangeUserInput.value[0] !== null || rangeUserInput.value[1] !== null)) {
    let isDraftSelected
    const startDraft = rangeUserInput.value[0] ? parseInt(rangeUserInput.value[0], 10) : null
    const endDraft = rangeUserInput.value[1] ? parseInt(rangeUserInput.value[1], 10) : null

    if (panel === 'start') {
      isDraftSelected = startDraft !== null && !isNaN(startDraft) && startDraft === year
    } else if (panel === 'end') {
      isDraftSelected = endDraft !== null && !isNaN(endDraft) && endDraft === year
    } else {
      isDraftSelected =
        (startDraft !== null && !isNaN(startDraft) && startDraft === year) ||
        (endDraft !== null && !isNaN(endDraft) && endDraft === year)
    }

    return {
      'is-selected': isDraftSelected,
      'is-disabled': isYearDisabled(year, panel)
    }
  }

  return {
    'is-selected': isYearSelected(year, panel),
    'is-disabled': isYearDisabled(year, panel)
  }
}

function isYearSelected(year: number, panel: PanelType) {
  if (props.mode === 'single') {
    return singleValue.value === year
  }

  if (props.mode === 'multiple') {
    return multipleValue.value.includes(year)
  }

  const [startYear, endYear] = rangeValue.value
  if (panel === 'start') {
    return startYear === year
  }
  if (panel === 'end') {
    return endYear === year
  }
  return startYear === year || endYear === year
}

defineExpose<TimeListExpose>({
  getSelectedTimeList
})
</script>

<style lang="scss">
@use './index';
</style>
