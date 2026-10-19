<template>
  <div class="mt-month-picker">
    <el-popover
      v-model:visible="visible"
      trigger="click"
      placement="bottom-start"
      :popper-class="['mt-month-picker__popover', showYear ? '' : 'noYear']"
      :width="popoverWidth"
      :disabled="disabled"
    >
      <template #reference>
        <div
          v-if="isRangeMode"
          class="mt-month-picker__range-reference"
          :class="{ 'is-disabled': disabled }"
        >
          <input
            v-model="rangeStartInputValue"
            name="start"
            class="mt-month-picker__range-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="startPlaceholder"
            :disabled="disabled"
            @change="handleRangeInputChange('start', ($event.target as HTMLInputElement).value)"
          />
          <span class="mt-month-picker__range-separator">
            {{ rangeSeparator }}
          </span>
          <input
            v-model="rangeEndInputValue"
            name="end"
            class="mt-month-picker__range-input"
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
            class="mt-month-picker__clear"
            @click.stop="handleClear"
          >
            <el-icon>
              <CircleClose />
            </el-icon>
          </button>
          <el-icon class="mt-month-picker__suffix">
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
            <el-icon class="mt-month-picker__suffix">
              <Calendar />
            </el-icon>
          </template>
        </el-input>
      </template>

      <div
        class="mt-month-picker__panels"
        :class="{ 'is-range': isRangeMode }"
      >
        <div class="mt-month-picker__panel">
          <div class="mt-month-picker__panel-header">
            <template v-if="showYear">
              <button
              type="button"
              class="mt-month-picker__nav"
              @click="changeYear('left', -1)"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
              <button
              type="button"
              class="mt-month-picker__panel-title-btn"
              @click="toggleYearSelection('left')"
            >
              {{ isSelectingYearLeft ? `${leftYearPanelStart} ~ ${leftYearPanelStart + 15}` : leftYear }}
            </button>
              <button
              type="button"
              class="mt-month-picker__nav"
              @click="changeYear('left', 1)"
            >
              <el-icon><DArrowRight /></el-icon>
            </button>
            </template>
            <span
              v-else
              class="mt-month-picker__panel-title"
            >
              {{ isRangeMode ? '开始月份' : '月份' }}
            </span>
          </div>

          <div
            v-if="!showYear || !isSelectingYearLeft"
            class="mt-month-picker__panel-body"
          >
            <button
              v-for="month in months"
              :key="`left-${month.value}`"
              type="button"
              class="mt-month-picker__month"
              :class="getMonthClass(leftYear, month.value, isRangeMode ? 'start' : 'single')"
              :disabled="isMonthDisabled(leftYear, month.value, isRangeMode ? 'start' : 'single')"
              @click="handleMonthSelect(leftYear, month.value, isRangeMode ? 'start' : 'single')"
            >
              {{ month.label }}
            </button>
          </div>
          <div
            v-else
            class="mt-month-picker__year-panel-body"
          >
            <button
              v-for="year in leftYearPanelYears"
              :key="`year-left-${year}`"
              type="button"
              class="mt-month-picker__year-btn"
              :class="{ 'is-selected': leftYear === year }"
              @click="handleYearSelect(year, 'left')"
            >
              {{ year }}
            </button>
          </div>
        </div>

        <div
          v-if="isRangeMode"
          class="mt-month-picker__panel"
        >
          <div class="mt-month-picker__panel-header">
            <template v-if="showYear">
              <button
              type="button"
              class="mt-month-picker__nav"
              @click="changeYear('right', -1)"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
              <button
              type="button"
              class="mt-month-picker__panel-title-btn"
              @click="toggleYearSelection('right')"
            >
              {{ isSelectingYearRight ? `${rightYearPanelStart} ~ ${rightYearPanelStart + 15}` : rightYear }}
            </button>
              <button
              type="button"
              class="mt-month-picker__nav"
              @click="changeYear('right', 1)"
            >
              <el-icon><DArrowRight /></el-icon>
            </button>
            </template>
            <span
              v-else
              class="mt-month-picker__panel-title"
            >
              结束月份
            </span>
          </div>

          <div
            v-if="!showYear || !isSelectingYearRight"
            class="mt-month-picker__panel-body"
          >
            <button
              v-for="month in months"
              :key="`right-${month.value}`"
              type="button"
              class="mt-month-picker__month"
              :class="getMonthClass(rightYear, month.value, 'end')"
              :disabled="isMonthDisabled(rightYear, month.value, 'end')"
              @click="handleMonthSelect(rightYear, month.value, 'end')"
            >
              {{ month.label }}
            </button>
          </div>
          <div
            v-else
            class="mt-month-picker__year-panel-body"
          >
            <button
              v-for="year in rightYearPanelYears"
              :key="`year-right-${year}`"
              type="button"
              class="mt-month-picker__year-btn"
              :class="{ 'is-selected': rightYear === year }"
              @click="handleYearSelect(year, 'right')"
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
import type { MonthDraft, MonthModelValue, MonthRangeDraft, PanelType, SelectionMode, TimeListExpose, TimeListItem } from '../type'
import { buildIndexedTimeList, buildSortedSelectedTimeList, normalizeTimeListStep } from '../timeList'

defineOptions({ name: 'MtMonth' })

const props = withDefaults(
  defineProps<{
    mode?: SelectionMode
    placeholder?: string
    startPlaceholder?: string
    endPlaceholder?: string
    rangeSeparator?: string
    disabled?: boolean
    clearable?: boolean
    showYear?: boolean
    valueFormat?: string
    disabledMonths?: string[]
    disabledDate?: (date: Dayjs, panel: PanelType) => boolean
  }>(),
  {
    mode: 'single',
    placeholder: '请选择月份',
    startPlaceholder: '开始月份',
    endPlaceholder: '结束月份',
    rangeSeparator: '至',
    disabled: false,
    clearable: true,
    showYear: true,
    valueFormat: 'YYYY-MM-DD HH:mm:00',
    disabledMonths: () => []
  }
)

const model = defineModel<MonthModelValue>({ default: null })

const visible = ref(false)
const leftYear = ref(dayjs().year())
const rightYear = ref(dayjs().year())
const userInput = ref<string | null>(null)
const rangeUserInput = ref<[string | null, string | null]>([null, null])

const isSelectingYearLeft = ref(false)
const isSelectingYearRight = ref(false)
const leftYearPanelStart = ref(getInitialYearPanelStart(dayjs().year()))
const rightYearPanelStart = ref(getInitialYearPanelStart(dayjs().year()))
const showYear = computed(() => props.showYear)

const isRangeMode = computed(() => props.mode === 'range')
const popoverWidth = computed(() => (isRangeMode.value ? 660 : 320))
const inputPlaceholder = computed(() =>
  isRangeMode.value ? `${props.startPlaceholder} ${props.rangeSeparator} ${props.endPlaceholder}` : props.placeholder
)

const months = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}月`,
  value: i + 1
}))

// 生成年份-月份的展示文本。
function getMonthDisplayText(year: number, month: number) {
  return showYear.value ? `${year}-${month.toString().padStart(2, '0')}` : `${month}月`
}

// 判断草稿是否已经完整到“年+月份”。
function isCompleteDraft(draft: MonthDraft | null): draft is { year: number; month: number } {
  return draft !== null && draft.month !== null
}

// 将外部值解析成标准的“年份+月份序号”。
function parseMonthValue(val: string | null | undefined): { year: number; month: number } | null {
  if (!val) return null
  const d = dayjs(val)
  if (!d.isValid()) return null
  return {
    year: d.year(),
    month: d.month() + 1 // dayjs month is 0-indexed
  }
}

// 解析外部绑定值，支持月份文本和日期文本两类格式。
function parseExternalMonthValue(val: string | null | undefined) {
  const draft = typeof val === 'string' ? parseUserTextToMonth(val) : null
  if (isCompleteDraft(draft)) {
    return draft
  }
  return parseMonthValue(val)
}

// 按当前 valueFormat 生成最终存储值。
function formatMonthValue(year: number, month: number): string {
  return dayjs()
    .year(year)
    .month(month - 1)
    .startOf('month')
    .format(props.valueFormat)
}

// 生成用于比较的月份键。
function getMonthKey(year: number, month: number) {
  return showYear.value ? `${year}-${month}` : `${month}`
}

// 从外部值生成可比较的月份键。
function getMonthKeyFromValue(value: string | null | undefined) {
  const parsed = parseMonthValue(value)
  if (!parsed) {
    return null
  }

  return getMonthKey(parsed.year, parsed.month)
}

// 判断某个值是否与指定月份语义相同。
function isSameMonthValue(value: string | null | undefined, year: number, month: number) {
  return getMonthKeyFromValue(value) === getMonthKey(year, month)
}

// 解析用户手动输入的年份、月份或日期文本。
function parseUserTextToMonth(text: string): MonthDraft | null {
  const normalizedText = text.trim()

  if (!showYear.value) {
    const monthOnlyMatch = normalizedText.match(/^([01]?\d)(?:月)?$/)
    if (monthOnlyMatch) {
      const month = parseInt(monthOnlyMatch[1], 10)
      if (month >= 1 && month <= 12) {
        return { year: leftYear.value, month }
      }
    }

    const parsedWithoutYear = dayjs(normalizedText)
    if (parsedWithoutYear.isValid() && /\d{4}.+\d{1,2}/.test(normalizedText)) {
      return { year: parsedWithoutYear.year(), month: parsedWithoutYear.month() + 1 }
    }
  }

  // 仅年份 2025
  const yearOnlyMatch = normalizedText.match(/^(\d{4})$/)
  if (yearOnlyMatch) {
    return {
      year: parseInt(yearOnlyMatch[1], 10),
      month: null
    }
  }

  // 年份加分隔符，例如 2025-
  const yearDraftMatch = normalizedText.match(/^(\d{4})(?:[-/年\s]+)$/)
  if (yearDraftMatch) {
    return {
      year: parseInt(yearDraftMatch[1], 10),
      month: null
    }
  }

  // 年份加月份 例如 2025-06, 2025/6, 2025年6月, 2025-6月
  const monthMatch = normalizedText.match(/^(\d{4})[-/年\s]*([01]?\d)(?:月)?$/)
  if (monthMatch) {
    const year = parseInt(monthMatch[1], 10)
    const month = parseInt(monthMatch[2], 10)
    if (month >= 1 && month <= 12) {
      return { year, month }
    }
  }

  // 完整日期 例如 2025-06-01
  const dateMatch = normalizedText.match(/^(\d{4})[-/年\s]+([01]?\d)[-/月\s]+([0-3]?\d)(?:日)?$/)
  if (dateMatch) {
    const year = parseInt(dateMatch[1], 10)
    const month = parseInt(dateMatch[2], 10)
    if (month >= 1 && month <= 12) {
      return { year, month }
    }
  }

  return null
}

// 读取单选模式下的输入草稿。
function getSingleInputDraft() {
  if (props.mode !== 'single' || userInput.value === null) {
    return null
  }
  return parseUserTextToMonth(userInput.value)
}

// 读取多选模式下的输入草稿列表。
function getMultipleInputDrafts() {
  if (props.mode !== 'multiple' || userInput.value === null) {
    return []
  }

  return userInput.value
    .split(/[,，]/)
    .map(part => parseUserTextToMonth(part))
    .filter((draft): draft is MonthDraft => draft !== null)
}

// 读取范围模式下的开始/结束输入草稿。
function getRangeInputDraft(): MonthRangeDraft {
  if (props.mode !== 'range') {
    return [null, null]
  }

  return [parseUserTextToMonth(rangeUserInput.value[0] ?? ''), parseUserTextToMonth(rangeUserInput.value[1] ?? '')]
}

const displayValue = computed(() => {
  if (props.mode === 'single') {
    const parsed = parseMonthValue(model.value as string)
    return parsed ? getMonthDisplayText(parsed.year, parsed.month) : ''
  }
  if (props.mode === 'multiple') {
    const arr = (model.value as string[]) || []
    return arr
      .map(v => {
        const parsed = parseMonthValue(v)
        return parsed ? getMonthDisplayText(parsed.year, parsed.month) : ''
      })
      .filter(Boolean)
      .join(', ')
  }
  if (props.mode === 'range') {
    const [start, end] = (model.value as [string | null, string | null]) || [null, null]
    const startParsed = parseMonthValue(start)
    const endParsed = parseMonthValue(end)
    if (!startParsed && !endParsed) return ''
    const startStr = startParsed ? getMonthDisplayText(startParsed.year, startParsed.month) : props.startPlaceholder
    const endStr = endParsed ? getMonthDisplayText(endParsed.year, endParsed.month) : props.endPlaceholder
    return `${startStr} ${props.rangeSeparator} ${endStr}`
  }
  return ''
})

const inputValue = computed({
  get() {
    return userInput.value !== null ? userInput.value : displayValue.value
  },
  set(val) {
    userInput.value = val
  }
})

// 管理范围模式开始输入框的显示与编辑值。
const rangeStartInputValue = computed({
  get() {
    if (rangeUserInput.value[0] !== null) {
      return rangeUserInput.value[0]
    }

    const [start] = (model.value as [string | null, string | null]) || [null, null]
    const startParsed = parseMonthValue(start)
    return startParsed ? getMonthDisplayText(startParsed.year, startParsed.month) : ''
  },
  set(val: string) {
    rangeUserInput.value = [val, rangeUserInput.value[1]]
  }
})

// 管理范围模式结束输入框的显示与编辑值。
const rangeEndInputValue = computed({
  get() {
    if (rangeUserInput.value[1] !== null) {
      return rangeUserInput.value[1]
    }

    const [, end] = (model.value as [string | null, string | null]) || [null, null]
    const endParsed = parseMonthValue(end)
    return endParsed ? getMonthDisplayText(endParsed.year, endParsed.month) : ''
  },
  set(val: string) {
    rangeUserInput.value = [rangeUserInput.value[0], val]
  }
})

const hasValue = computed(() => {
  if (props.mode === 'range') {
    return !!rangeStartInputValue.value || !!rangeEndInputValue.value
  }

  if (userInput.value !== null && userInput.value.trim() !== '') {
    return true
  }

  if (props.mode === 'single') return !!model.value
  if (props.mode === 'multiple') return Array.isArray(model.value) && model.value.length > 0
  if (props.mode === 'range') {
    const [start, end] = (model.value as [string | null, string | null]) || [null, null]
    return !!start || !!end
  }
  return false
})

const disabledMonthSet = computed(() => {
  const monthsSet = new Set<string>()
  props.disabledMonths.forEach(item => {
    const parsed = showYear.value ? parseMonthValue(item) : parseExternalMonthValue(item)
    if (parsed) {
      monthsSet.add(getMonthKey(parsed.year, parsed.month))
    }
  })
  return monthsSet
})

function isMonthDisabled(year: number, month: number, panel: PanelType) {
  const key = getMonthKey(year, month)
  if (disabledMonthSet.value.has(key)) {
    return true
  }
  return (
    props.disabledDate?.(
      dayjs()
        .year(year)
        .month(month - 1)
        .startOf('month'),
      panel
    ) ?? false
  )
}

const leftYearPanelYears = computed(() => {
  return Array.from({ length: 16 }, (_, index) => leftYearPanelStart.value + index)
})

const rightYearPanelYears = computed(() => {
  return Array.from({ length: 16 }, (_, index) => rightYearPanelStart.value + index)
})

watch(
  () => visible.value,
  isVisible => {
    if (isVisible) {
      userInput.value = null
      rangeUserInput.value = [null, null]
      isSelectingYearLeft.value = false
      isSelectingYearRight.value = false
      syncPanelYears()
    }
  }
)

function isSameModelValue(valueA: MonthModelValue, valueB: MonthModelValue) {
  return JSON.stringify(valueA) === JSON.stringify(valueB)
}

function sanitizeMonthModelValue(): MonthModelValue {
  if (props.mode === 'single') {
    const parsed = parseExternalMonthValue(typeof model.value === 'string' ? model.value : null)
    if (!parsed || isMonthDisabled(parsed.year, parsed.month, 'single')) {
      return null
    }
    return formatMonthValue(parsed.year, parsed.month)
  }

  if (props.mode === 'multiple') {
    if (!Array.isArray(model.value)) {
      return []
    }

    return [
      ...new Set(
        model.value
          .map(item => (typeof item === 'string' ? parseExternalMonthValue(item) : null))
          .filter((item): item is { year: number; month: number } => item !== null)
          .filter(item => !isMonthDisabled(item.year, item.month, 'single'))
          .map(item => formatMonthValue(item.year, item.month))
      )
    ].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
  }

  const [start, end] = Array.isArray(model.value) ? model.value : [null, null]
  const startParsed = typeof start === 'string' ? parseExternalMonthValue(start) : null
  const endParsed = typeof end === 'string' ? parseExternalMonthValue(end) : null

  return [
    startParsed && !isMonthDisabled(startParsed.year, startParsed.month, 'start')
      ? formatMonthValue(startParsed.year, startParsed.month)
      : null,
    endParsed && !isMonthDisabled(endParsed.year, endParsed.month, 'end')
      ? formatMonthValue(endParsed.year, endParsed.month)
      : null
  ]
}

// 当 model.value 改变且面板没打开时，同步面板年份，这样输入框改变时也能同步面板
watch(
  [() => model.value, () => props.mode, disabledMonthSet, () => props.disabledDate],
  () => {
    const sanitizedValue = sanitizeMonthModelValue()
    if (!isSameModelValue(sanitizedValue, model.value)) {
      model.value = sanitizedValue
      return
    }
    if (!visible.value) {
      syncPanelYears()
    }
  },
  { deep: true, immediate: true }
)

// 根据当前值或输入草稿同步左右面板年份。
function syncPanelYears() {
  if (props.mode === 'range') {
    const [draftStart, draftEnd] = getRangeInputDraft()
    const [start, end] = (model.value as [string | null, string | null]) || [null, null]
    const startParsed = draftStart ?? parseMonthValue(start)
    const endParsed = draftEnd ?? parseMonthValue(end)
    const currentYear = dayjs().year()

    leftYear.value = startParsed?.year ?? currentYear
    rightYear.value = endParsed?.year ?? currentYear
  } else {
    let anchorYear = dayjs().year()
    if (props.mode === 'single') {
      const parsed = getSingleInputDraft() ?? parseMonthValue(model.value as string)
      if (parsed) anchorYear = parsed.year
    } else if (props.mode === 'multiple') {
      const inputDrafts = getMultipleInputDrafts()
      if (inputDrafts.length > 0) {
        anchorYear = inputDrafts.at(-1)?.year ?? anchorYear
      } else {
        const arr = (model.value as string[]) || []
        if (arr.length > 0) {
          const parsed = parseMonthValue(arr[arr.length - 1])
          if (parsed) anchorYear = parsed.year
        }
      }
    }
    leftYear.value = anchorYear
  }
}

// 统一清理输入值前后的空白。
function normalizeInputValue(val: string) {
  return val.trim()
}

function getInitialYearPanelStart(year: number) {
  return Math.floor(year / 10) * 10
}

function toggleYearSelection(panel: 'left' | 'right') {
  if (!showYear.value) {
    return
  }
  if (panel === 'left') {
    isSelectingYearLeft.value = !isSelectingYearLeft.value
    if (isSelectingYearLeft.value) {
      leftYearPanelStart.value = getInitialYearPanelStart(leftYear.value)
    }
  } else {
    isSelectingYearRight.value = !isSelectingYearRight.value
    if (isSelectingYearRight.value) {
      rightYearPanelStart.value = getInitialYearPanelStart(rightYear.value)
    }
  }
}

function handleYearSelect(year: number, panel: 'left' | 'right') {
  if (panel === 'left') {
    leftYear.value = year
    isSelectingYearLeft.value = false
  } else {
    rightYear.value = year
    isSelectingYearRight.value = false
  }
}

// 切换左右面板年份，范围模式下左右面板互不联动。
function changeYear(panel: 'left' | 'right', step: number) {
  if (!showYear.value) {
    return
  }
  if (panel === 'left') {
    if (isSelectingYearLeft.value) {
      leftYearPanelStart.value += step * 16
    } else {
      leftYear.value += step
    }
  } else {
    if (isSelectingYearRight.value) {
      rightYearPanelStart.value += step * 16
    } else {
      rightYear.value += step
    }
  }
}

// 解析多选模式的逗号分隔输入。
function parseMultipleInputValue(val: string) {
  return normalizeInputValue(val)
    .split(/[,，]/)
    .map(part => part.trim())
    .filter(Boolean)
}

// 在范围模式下校验开始和结束的先后关系，并给出提示。
function validateRangeOrder(start: string | null, end: string | null) {
  if (!showYear.value) {
    return
  }
  if (!start || !end) {
    return
  }

  if (dayjs(start).isAfter(dayjs(end))) {
    model.value = [null, null]
    Message.warning('开始月份不能大于结束月份')
  }
}

// 将范围输入框内容回写到 model。
function updateRangeModelFromInput() {
  const startParsed = parseUserTextToMonth(rangeStartInputValue.value)
  const endParsed = parseUserTextToMonth(rangeEndInputValue.value)

  let newStart = isCompleteDraft(startParsed) ? formatMonthValue(startParsed.year, startParsed.month) : null
  let newEnd = isCompleteDraft(endParsed) ? formatMonthValue(endParsed.year, endParsed.month) : null

  if (isCompleteDraft(startParsed) && isMonthDisabled(startParsed.year, startParsed.month, 'start')) {
    newStart = null
    rangeUserInput.value[0] = null
  }
  if (isCompleteDraft(endParsed) && isMonthDisabled(endParsed.year, endParsed.month, 'end')) {
    newEnd = null
    rangeUserInput.value[1] = null
  }

  model.value = [newStart, newEnd]
  validateRangeOrder(newStart, newEnd)
}

// 处理单选和多选模式的输入框提交。
function handleInputChange(val: string) {
  const normalizedValue = normalizeInputValue(val)

  if (!normalizedValue) {
    userInput.value = null
    handleClear()
    syncPanelYears()
    return
  }

  if (props.mode === 'single') {
    const parsed = parseUserTextToMonth(normalizedValue)
    if (isCompleteDraft(parsed)) {
      if (isMonthDisabled(parsed.year, parsed.month, 'single')) {
        userInput.value = null
        handleClear()
        syncPanelYears()
        return
      }
      userInput.value = normalizedValue
      model.value = formatMonthValue(parsed.year, parsed.month)
    } else {
      userInput.value = normalizedValue
    }
  } else if (props.mode === 'multiple') {
    const parsedValues = parseMultipleInputValue(normalizedValue)
      .map(part => parseUserTextToMonth(part))
      .filter(isCompleteDraft)

    const validDrafts = parsedValues.filter(draft => !isMonthDisabled(draft.year, draft.month, 'single'))

    if (validDrafts.length === 0 && parsedValues.length > 0) {
      userInput.value = null
      model.value = []
      syncPanelYears()
      return
    }

    userInput.value = validDrafts.map(draft => getMonthDisplayText(draft.year, draft.month)).join(', ')

    const newValues = validDrafts.map(draft => formatMonthValue(draft.year, draft.month))

    if (newValues.length > 0) {
      model.value = [...new Set(newValues)].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
    }
  }

  syncPanelYears()
}

// 处理范围模式单侧输入框变更。
function handleRangeInputChange(panel: 'start' | 'end', val: string) {
  const normalizedValue = normalizeInputValue(val)
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

  updateRangeModelFromInput()
  syncPanelYears()
}

// 处理面板按钮点击，并根据模式更新选中值。
function handleMonthSelect(year: number, month: number, panel: PanelType) {
  userInput.value = null
  rangeUserInput.value = [null, null]

  if (isMonthDisabled(year, month, panel)) {
    return
  }

  if (props.mode === 'single') {
    model.value = formatMonthValue(year, month)
    visible.value = false
    return
  }

  if (props.mode === 'multiple') {
    const valStr = formatMonthValue(year, month)
    const current = [...((model.value as string[] | null) ?? [])]
    const index = current.findIndex(item => isSameMonthValue(item, year, month))
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(valStr)
    }
    current.sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
    model.value = current
    return
  }

  const valStr = formatMonthValue(year, month)
  const [start, end] = (model.value as [string | null, string | null]) || [null, null]
  if (panel === 'start') {
    if (start && isSameMonthValue(start, year, month)) {
      model.value = [null, end]
      return
    }
    model.value = [valStr, end]
    validateRangeOrder(valStr, end)
    return
  }

  if (end && isSameMonthValue(end, year, month)) {
    model.value = [start, null]
    return
  }
  model.value = [start, valStr]
  validateRangeOrder(start, valStr)
}

// 清空当前模式下的所有输入和值。
function handleClear() {
  userInput.value = null
  rangeUserInput.value = [null, null]
  if (props.mode === 'single') {
    model.value = null
  } else if (props.mode === 'multiple') {
    model.value = []
  } else {
    model.value = [null, null]
  }
}

function getMonthAbsoluteIndex(year: number, month: number) {
  return year * 12 + (month - 1)
}

function parseMonthSelectionValue(value: string | null | undefined) {
  return parseExternalMonthValue(value)
}

function createMonthTimeItem(year: number, month: number): TimeListItem {
  return {
    label: getMonthDisplayText(year, month),
    value: formatMonthValue(year, month)
  }
}

function getSelectedTimeList(step = 1) {
  const normalizedStep = normalizeTimeListStep(step)

  if (props.mode === 'single') {
    const parsed = parseMonthSelectionValue(model.value as string | null)
    return parsed ? [createMonthTimeItem(parsed.year, parsed.month)] : []
  }

  if (props.mode === 'multiple') {
    const selectedValues = ((model.value as string[] | null) ?? [])
      .map(item => parseMonthSelectionValue(item))
      .filter((item): item is { year: number; month: number } => item !== null)

    return buildSortedSelectedTimeList(
      selectedValues,
      item => getMonthAbsoluteIndex(item.year, item.month),
      item => createMonthTimeItem(item.year, item.month)
    )
  }

  const [start, end] = (model.value as [string | null, string | null]) || [null, null]
  const startParsed = parseMonthSelectionValue(start)
  const endParsed = parseMonthSelectionValue(end)

  if (!startParsed && !endParsed) {
    return []
  }
  if (!startParsed) {
    return endParsed ? [createMonthTimeItem(endParsed.year, endParsed.month)] : []
  }
  if (!endParsed) {
    return [createMonthTimeItem(startParsed.year, startParsed.month)]
  }

  const startIndex = getMonthAbsoluteIndex(startParsed.year, startParsed.month)
  let endIndex = getMonthAbsoluteIndex(endParsed.year, endParsed.month)
  if (!showYear.value && endIndex < startIndex) {
    endIndex += 12
  }

  return buildIndexedTimeList(startIndex, endIndex, normalizedStep, index => {
    const year = Math.floor(index / 12)
    const month = (index % 12) + 1
    return createMonthTimeItem(year, month)
  })
}

// 判断草稿态下某个月份是否应被高亮为选中。
function hasDraftSelection(year: number, month: number, panel: PanelType) {
  if (props.mode === 'single') {
    const draft = getSingleInputDraft()
    return isCompleteDraft(draft) && draft.year === year && draft.month === month
  }
  if (props.mode === 'multiple') {
    return getMultipleInputDrafts().some(draft => draft.year === year && draft.month === month)
  }
  const [startDraft, endDraft] = getRangeInputDraft()
  if (panel === 'start') {
    return isCompleteDraft(startDraft) && startDraft.year === year && startDraft.month === month
  }
  if (panel === 'end') {
    return isCompleteDraft(endDraft) && endDraft.year === year && endDraft.month === month
  }
  return (
    (isCompleteDraft(startDraft) && startDraft.year === year && startDraft.month === month) ||
    (isCompleteDraft(endDraft) && endDraft.year === year && endDraft.month === month)
  )
}

// 生成月份按钮的选中和范围样式状态。
function getMonthClass(year: number, month: number, panel: PanelType) {
  if (
    (props.mode === 'range' && (rangeUserInput.value[0] !== null || rangeUserInput.value[1] !== null)) ||
    userInput.value !== null
  ) {
    return {
      'is-selected': hasDraftSelection(year, month, panel),
      'is-disabled': isMonthDisabled(year, month, panel)
    }
  }
  let isSelected = false
  if (props.mode === 'single') {
    isSelected = isSameMonthValue(model.value as string | null, year, month)
  } else if (props.mode === 'multiple') {
    isSelected = Array.isArray(model.value) && model.value.some(item => isSameMonthValue(item, year, month))
  } else if (props.mode === 'range') {
    const [start, end] = (model.value as [string | null, string | null]) || [null, null]
    if (panel === 'start') {
      isSelected = isSameMonthValue(start, year, month)
    } else if (panel === 'end') {
      isSelected = isSameMonthValue(end, year, month)
    } else {
      isSelected = isSameMonthValue(start, year, month) || isSameMonthValue(end, year, month)
    }
  }

  return {
    'is-selected': isSelected,
    'is-disabled': isMonthDisabled(year, month, panel)
  }
}

defineExpose<TimeListExpose>({
  getSelectedTimeList
})
</script>

<style scoped lang="scss">
@use './index';
</style>
