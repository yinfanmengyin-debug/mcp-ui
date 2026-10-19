<template>
  <div class="mt-xun-picker">
    <el-popover
      v-model:visible="visible"
      trigger="click"
      placement="bottom-start"
      :popper-class="['mt-xun-picker__popover', showYear ? '' : 'noYear']"
      :width="popoverWidth"
      :disabled="disabled"
    >
      <template #reference>
        <div
          v-if="isRangeMode"
          class="mt-xun-picker__range-reference"
          :class="{ 'is-disabled': disabled }"
        >
          <input
            v-model="rangeStartInputValue"
            name="start"
            class="mt-xun-picker__range-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="startPlaceholder"
            :disabled="disabled"
            @change="handleRangeInputChange('start', ($event.target as HTMLInputElement).value)"
          />
          <span class="mt-xun-picker__range-separator">{{ rangeSeparator }}</span>
          <input
            v-model="rangeEndInputValue"
            name="end"
            class="mt-xun-picker__range-input"
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
            class="mt-xun-picker__clear"
            @click.stop="handleClear"
          >
            <el-icon><CircleClose /></el-icon>
          </button>
          <el-icon class="mt-xun-picker__suffix"><Calendar /></el-icon>
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
            <el-icon class="mt-xun-picker__suffix"><Calendar /></el-icon>
          </template>
        </el-input>
      </template>

      <div
        class="mt-xun-picker__panels"
        :class="{ 'is-range': isRangeMode }"
      >
        <div class="mt-xun-picker__panel">
          <div
            class="mt-xun-picker__panel-header"
            :class="{ 'is-month-only': !showYear }"
          >
            <button
              v-if="showYear"
              type="button"
              class="mt-xun-picker__nav"
              @click="changePanel('start', -1, 'year')"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
            <button
              type="button"
              class="mt-xun-picker__nav"
              @click="changePanel('start', -1, 'month')"
            >
              <el-icon><ArrowLeft /></el-icon>
            </button>
            <div class="mt-xun-picker__panel-title-actions">
              <button
                v-if="showYear"
                type="button"
                class="mt-xun-picker__panel-title-btn"
                @click="togglePanelView('start', 'year')"
              >
                {{ panelStartDate.year() }}年
              </button>
              <span
                v-if="showYear"
                class="mt-xun-picker__panel-title-separator"
              >
                -
              </span>
              <button
                type="button"
                class="mt-xun-picker__panel-title-btn"
                @click="togglePanelView('start', 'month')"
              >
                {{ panelStartDate.month() + 1 }}月
              </button>
            </div>
            <button
              type="button"
              class="mt-xun-picker__nav"
              @click="changePanel('start', 1, 'month')"
            >
              <el-icon><ArrowRight /></el-icon>
            </button>
            <button
              v-if="showYear"
              type="button"
              class="mt-xun-picker__nav"
              @click="changePanel('start', 1, 'year')"
            >
              <el-icon><DArrowRight /></el-icon>
            </button>
          </div>
          <div
            v-if="getPanelView('start') === 'default'"
            class="mt-xun-picker__panel-body"
          >
            <button
              v-for="xun in xunOptions"
              :key="`start-${xun.value}`"
              type="button"
              class="mt-xun-picker__xun"
              :class="
                getXunClass(
                  panelStartDate.year(),
                  panelStartDate.month() + 1,
                  xun.value,
                  isRangeMode ? 'start' : 'single'
                )
              "
              :disabled="
                isXunDisabled(
                  panelStartDate.year(),
                  panelStartDate.month() + 1,
                  xun.value,
                  isRangeMode ? 'start' : 'single'
                )
              "
              @click="
                handleXunSelect(
                  panelStartDate.year(),
                  panelStartDate.month() + 1,
                  xun.value,
                  isRangeMode ? 'start' : 'single'
                )
              "
            >
              {{ xun.label }}
            </button>
          </div>
          <div
            v-else-if="showYear && getPanelView('start') === 'year'"
            class="mt-xun-picker__year-panel-body"
          >
            <button
              v-for="year in startYearPanelYears"
              :key="`start-year-${year}`"
              type="button"
              class="mt-xun-picker__year-btn"
              :class="{ 'is-selected': panelStartDate.year() === year }"
              @click="handleQuickYearSelect(year, 'start')"
            >
              {{ year }}
            </button>
          </div>
          <div
            v-else
            class="mt-xun-picker__month-panel-body"
          >
            <button
              v-for="month in monthOptions"
              :key="`start-month-${month.value}`"
              type="button"
              class="mt-xun-picker__month-btn"
              :class="{ 'is-selected': panelStartDate.month() + 1 === month.value }"
              @click="handleQuickMonthSelect(month.value, 'start')"
            >
              {{ month.label }}
            </button>
          </div>
        </div>

        <div
          v-if="isRangeMode"
          class="mt-xun-picker__panel"
        >
          <div
            class="mt-xun-picker__panel-header"
            :class="{ 'is-month-only': !showYear }"
          >
            <button
              v-if="showYear"
              type="button"
              class="mt-xun-picker__nav"
              @click="changePanel('end', -1, 'year')"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
            <button
              type="button"
              class="mt-xun-picker__nav"
              @click="changePanel('end', -1, 'month')"
            >
              <el-icon><ArrowLeft /></el-icon>
            </button>
            <div class="mt-xun-picker__panel-title-actions">
              <button
                v-if="showYear"
                type="button"
                class="mt-xun-picker__panel-title-btn"
                @click="togglePanelView('end', 'year')"
              >
                {{ panelEndDate.year() }}年
              </button>
              <span
                v-if="showYear"
                class="mt-xun-picker__panel-title-separator"
              >
                -
              </span>
              <button
                type="button"
                class="mt-xun-picker__panel-title-btn"
                @click="togglePanelView('end', 'month')"
              >
                {{ panelEndDate.month() + 1 }}月
              </button>
            </div>
            <button
              type="button"
              class="mt-xun-picker__nav"
              @click="changePanel('end', 1, 'month')"
            >
              <el-icon><ArrowRight /></el-icon>
            </button>
            <button
              v-if="showYear"
              type="button"
              class="mt-xun-picker__nav"
              @click="changePanel('end', 1, 'year')"
            >
              <el-icon><DArrowRight /></el-icon>
            </button>
          </div>
          <div
            v-if="getPanelView('end') === 'default'"
            class="mt-xun-picker__panel-body"
          >
            <button
              v-for="xun in xunOptions"
              :key="`end-${xun.value}`"
              type="button"
              class="mt-xun-picker__xun"
              :class="getXunClass(panelEndDate.year(), panelEndDate.month() + 1, xun.value, 'end')"
              :disabled="isXunDisabled(panelEndDate.year(), panelEndDate.month() + 1, xun.value, 'end')"
              @click="handleXunSelect(panelEndDate.year(), panelEndDate.month() + 1, xun.value, 'end')"
            >
              {{ xun.label }}
            </button>
          </div>
          <div
            v-else-if="showYear && getPanelView('end') === 'year'"
            class="mt-xun-picker__year-panel-body"
          >
            <button
              v-for="year in endYearPanelYears"
              :key="`end-year-${year}`"
              type="button"
              class="mt-xun-picker__year-btn"
              :class="{ 'is-selected': panelEndDate.year() === year }"
              @click="handleQuickYearSelect(year, 'end')"
            >
              {{ year }}
            </button>
          </div>
          <div
            v-else
            class="mt-xun-picker__month-panel-body"
          >
            <button
              v-for="month in monthOptions"
              :key="`end-month-${month.value}`"
              type="button"
              class="mt-xun-picker__month-btn"
              :class="{ 'is-selected': panelEndDate.month() + 1 === month.value }"
              @click="handleQuickMonthSelect(month.value, 'end')"
            >
              {{ month.label }}
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
import { ArrowLeft, ArrowRight, Calendar, CircleClose, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import type { Dayjs } from 'dayjs'
import type {
  PanelType,
  SelectionMode,
  TimeListExpose,
  TimeListItem,
  XunDraft,
  XunModelValue,
  XunRangeDraft
} from '../type'
import { buildIndexedTimeList, buildSortedSelectedTimeList, normalizeTimeListStep } from '../timeList'

defineOptions({ name: 'MtXun' })

const xunOptions = [
  { label: '上旬', value: 1 },
  { label: '中旬', value: 2 },
  { label: '下旬', value: 3 }
]

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  label: `${index + 1}月`,
  value: index + 1
}))

const xunLabelMap: Record<number, string> = {
  1: '上旬',
  2: '中旬',
  3: '下旬'
}

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
    disabledXuns?: string[]
    disabledDate?: (date: Dayjs, panel: PanelType) => boolean
  }>(),
  {
    mode: 'single',
    placeholder: '请选择旬',
    startPlaceholder: '开始旬',
    endPlaceholder: '结束旬',
    rangeSeparator: '至',
    disabled: false,
    clearable: true,
    showYear: true,
    valueFormat: 'YYYY-MM-DD HH:mm:00',
    disabledXuns: () => []
  }
)

const model = defineModel<XunModelValue>({ default: null })
const visible = ref(false)
const userInput = ref<string | null>(null)
const rangeUserInput = ref<[string | null, string | null]>([null, null])
const startPanelDate = ref(dayjs().startOf('month'))
const endPanelDate = ref(dayjs().startOf('month'))
const showYear = computed(() => props.showYear)
const startPanelView = ref<'default' | 'year' | 'month'>('default')
const endPanelView = ref<'default' | 'year' | 'month'>('default')
const startYearPanelStart = ref(getInitialYearPanelStart(startPanelDate.value.year()))
const endYearPanelStart = ref(getInitialYearPanelStart(endPanelDate.value.year()))

const isRangeMode = computed(() => props.mode === 'range')
const popoverWidth = computed(() => (isRangeMode.value ? 660 : 320))
const inputPlaceholder = computed(() =>
  isRangeMode.value ? `${props.startPlaceholder} ${props.rangeSeparator} ${props.endPlaceholder}` : props.placeholder
)
const panelStartDate = computed(() => startPanelDate.value)
const panelEndDate = computed(() => endPanelDate.value)

function getXunStartDay(xun: number) {
  if (xun === 2) return 11
  if (xun === 3) return 21
  return 1
}

function getXunFromDay(day: number) {
  if (day <= 10) return 1
  if (day <= 20) return 2
  return 3
}

function getXunDisplayText(year: number, month: number, xun: number) {
  return showYear.value
    ? `${year}-${month.toString().padStart(2, '0')}-${xunLabelMap[xun]}`
    : `${month}月-${xunLabelMap[xun]}`
}

function isCompleteDraft(draft: XunDraft | null): draft is { year: number; month: number; xun: number } {
  return draft !== null && draft.month !== null && draft.xun !== null
}

function parseXunValue(val: string | null | undefined) {
  if (!val) return null
  const normalized = val.trim()
  const labelMatch = normalized.match(/^(\d{4})[-/](\d{1,2})-(上旬|中旬|下旬|[123]旬)$/)
  if (labelMatch) {
    const year = parseInt(labelMatch[1], 10)
    const month = parseInt(labelMatch[2], 10)
    const label = labelMatch[3]
    const xun = label === '上旬' || label === '1旬' ? 1 : label === '中旬' || label === '2旬' ? 2 : 3
    if (month >= 1 && month <= 12) {
      return { year, month, xun }
    }
  }

  const parsed = dayjs(normalized)
  if (!parsed.isValid()) return null
  return {
    year: parsed.year(),
    month: parsed.month() + 1,
    xun: getXunFromDay(parsed.date())
  }
}

// 解析外部绑定值，支持旬文本和日期文本两类格式。
function parseExternalXunValue(val: string | null | undefined) {
  const draft = typeof val === 'string' ? parseUserTextToXun(val) : null
  if (isCompleteDraft(draft)) {
    return draft
  }
  return parseXunValue(val)
}

function formatXunValue(year: number, month: number, xun: number) {
  return dayjs()
    .year(year)
    .month(month - 1)
    .date(getXunStartDay(xun))
    .startOf('day')
    .format(props.valueFormat)
}

function getXunKey(year: number, month: number, xun: number) {
  return showYear.value ? `${year}-${month}-${xun}` : `${month}-${xun}`
}

function getXunKeyFromValue(value: string | null | undefined) {
  const parsed = parseXunValue(value)
  return parsed ? getXunKey(parsed.year, parsed.month, parsed.xun) : null
}

function isSameXunValue(value: string | null | undefined, year: number, month: number, xun: number) {
  return getXunKeyFromValue(value) === getXunKey(year, month, xun)
}

function parseUserTextToXun(text: string): XunDraft | null {
  const normalizedText = text.trim()
  if (!showYear.value) {
    const monthMatch = normalizedText.match(/^(\d{1,2})(?:月)?$/)
    if (monthMatch) {
      const month = parseInt(monthMatch[1], 10)
      if (month >= 1 && month <= 12) {
        return { year: panelStartDate.value.year(), month, xun: null }
      }
    }
    const xunNoYearMatch = normalizedText.match(/^(\d{1,2})(?:月)?[-/\s]*(上旬|中旬|下旬|[123]旬)$/)
    if (xunNoYearMatch) {
      const month = parseInt(xunNoYearMatch[1], 10)
      const label = xunNoYearMatch[2]
      if (month >= 1 && month <= 12) {
        const xun = label === '上旬' || label === '1旬' ? 1 : label === '中旬' || label === '2旬' ? 2 : 3
        return { year: panelStartDate.value.year(), month, xun }
      }
    }
  }
  const yearOnlyMatch = normalizedText.match(/^(\d{4})$/)
  if (yearOnlyMatch) {
    return { year: parseInt(yearOnlyMatch[1], 10), month: null, xun: null }
  }

  const yearMonthMatch = normalizedText.match(/^(\d{4})[-/年\s]+(\d{1,2})(?:月)?$/)
  if (yearMonthMatch) {
    const year = parseInt(yearMonthMatch[1], 10)
    const month = parseInt(yearMonthMatch[2], 10)
    if (month >= 1 && month <= 12) {
      return { year, month, xun: null }
    }
  }

  const xunMatch = normalizedText.match(/^(\d{4})[-/年\s]+(\d{1,2})(?:月)?[-/\s]*(上旬|中旬|下旬|[123]旬)$/)
  if (xunMatch) {
    const year = parseInt(xunMatch[1], 10)
    const month = parseInt(xunMatch[2], 10)
    const label = xunMatch[3]
    if (month < 1 || month > 12) return null
    const xun = label === '上旬' || label === '1旬' ? 1 : label === '中旬' || label === '2旬' ? 2 : 3
    return { year, month, xun }
  }

  const parsed = dayjs(normalizedText)
  if (parsed.isValid() && /\d{4}.+\d{1,2}.+\d{1,2}/.test(normalizedText)) {
    return { year: parsed.year(), month: parsed.month() + 1, xun: getXunFromDay(parsed.date()) }
  }

  return null
}

function getSingleInputDraft() {
  if (props.mode !== 'single' || userInput.value === null) return null
  return parseUserTextToXun(userInput.value)
}

function getMultipleInputDrafts() {
  if (props.mode !== 'multiple' || userInput.value === null) return []
  return userInput.value
    .split(/[,，]/)
    .map(part => parseUserTextToXun(part))
    .filter((draft): draft is XunDraft => draft !== null)
}

function getRangeInputDraft(): XunRangeDraft {
  if (props.mode !== 'range') return [null, null]
  return [parseUserTextToXun(rangeUserInput.value[0] ?? ''), parseUserTextToXun(rangeUserInput.value[1] ?? '')]
}

const displayValue = computed(() => {
  if (props.mode === 'single') {
    const parsed = parseXunValue(model.value as string)
    return parsed ? getXunDisplayText(parsed.year, parsed.month, parsed.xun) : ''
  }
  if (props.mode === 'multiple') {
    return ((model.value as string[]) || [])
      .map(item => parseXunValue(item))
      .filter((item): item is NonNullable<ReturnType<typeof parseXunValue>> => item !== null)
      .map(item => getXunDisplayText(item.year, item.month, item.xun))
      .join(', ')
  }
  const [start, end] = (model.value as [string | null, string | null]) || [null, null]
  const startParsed = parseXunValue(start)
  const endParsed = parseXunValue(end)
  if (!startParsed && !endParsed) return ''
  return `${startParsed ? getXunDisplayText(startParsed.year, startParsed.month, startParsed.xun) : props.startPlaceholder} ${props.rangeSeparator} ${endParsed ? getXunDisplayText(endParsed.year, endParsed.month, endParsed.xun) : props.endPlaceholder}`
})

const inputValue = computed({
  get: () => (userInput.value !== null ? userInput.value : displayValue.value),
  set: (val: string) => {
    userInput.value = val
  }
})

const rangeStartInputValue = computed({
  get() {
    if (rangeUserInput.value[0] !== null) return rangeUserInput.value[0]
    const [start] = (model.value as [string | null, string | null]) || [null, null]
    const parsed = parseXunValue(start)
    return parsed ? getXunDisplayText(parsed.year, parsed.month, parsed.xun) : ''
  },
  set(val: string) {
    rangeUserInput.value = [val, rangeUserInput.value[1]]
  }
})

const rangeEndInputValue = computed({
  get() {
    if (rangeUserInput.value[1] !== null) return rangeUserInput.value[1]
    const [, end] = (model.value as [string | null, string | null]) || [null, null]
    const parsed = parseXunValue(end)
    return parsed ? getXunDisplayText(parsed.year, parsed.month, parsed.xun) : ''
  },
  set(val: string) {
    rangeUserInput.value = [rangeUserInput.value[0], val]
  }
})

const hasValue = computed(() => {
  if (props.mode === 'range') return !!rangeStartInputValue.value || !!rangeEndInputValue.value
  if (userInput.value !== null && userInput.value.trim() !== '') return true
  if (props.mode === 'single') return !!model.value
  if (props.mode === 'multiple') return Array.isArray(model.value) && model.value.length > 0
  const [start, end] = (model.value as [string | null, string | null]) || [null, null]
  return !!start || !!end
})

const disabledXunSet = computed(() => {
  const set = new Set<string>()
  props.disabledXuns.forEach(item => {
    const parsed = showYear.value ? parseXunValue(item) : parseExternalXunValue(item)
    if (parsed) set.add(getXunKey(parsed.year, parsed.month, parsed.xun))
  })
  return set
})

function isXunDisabled(year: number, month: number, xun: number, panel: PanelType) {
  if (disabledXunSet.value.has(getXunKey(year, month, xun))) return true
  return (
    props.disabledDate?.(
      dayjs()
        .year(year)
        .month(month - 1)
        .date(getXunStartDay(xun))
        .startOf('day'),
      panel
    ) ?? false
  )
}

function getPanelDate(panel: 'start' | 'end') {
  return panel === 'start' ? startPanelDate.value : endPanelDate.value
}

function getPanelView(panel: 'start' | 'end') {
  return panel === 'start' ? startPanelView.value : endPanelView.value
}

function getPanelTitle(panel: 'start' | 'end') {
  return getPanelDate(panel).format('YYYY-MM')
}

function syncPanelDates() {
  if (props.mode === 'range') {
    const [draftStart, draftEnd] = getRangeInputDraft()
    const [start, end] = (model.value as [string | null, string | null]) || [null, null]
    const startParsed = draftStart ?? parseXunValue(start)
    const endParsed = draftEnd ?? parseXunValue(end)
    startPanelDate.value = startParsed
      ? dayjs()
          .year(startParsed.year)
          .month((startParsed.month ?? 1) - 1)
          .startOf('month')
      : dayjs().startOf('month')
    endPanelDate.value = endParsed
      ? dayjs()
          .year(endParsed.year)
          .month((endParsed.month ?? 1) - 1)
          .startOf('month')
      : dayjs().startOf('month')
    return
  }

  let anchor = dayjs().startOf('month')
  if (props.mode === 'single') {
    const parsed = getSingleInputDraft() ?? parseXunValue(model.value as string)
    if (parsed) {
      anchor = dayjs()
        .year(parsed.year)
        .month((parsed.month ?? 1) - 1)
        .startOf('month')
    }
  } else if (props.mode === 'multiple') {
    const drafts = getMultipleInputDrafts()
    const parsed = drafts.at(-1) ?? parseXunValue((((model.value as string[]) || []).at(-1) ?? null) as string | null)
    if (parsed) {
      anchor = dayjs()
        .year(parsed.year)
        .month((parsed.month ?? 1) - 1)
        .startOf('month')
    }
  }
  startPanelDate.value = anchor
}

function changePanel(panel: 'start' | 'end', step: number, unit: 'year' | 'month') {
  if (getPanelView(panel) === 'year' && unit === 'year') {
    if (panel === 'start') {
      startYearPanelStart.value += step * 16
    } else {
      endYearPanelStart.value += step * 16
    }
    return
  }
  if (!showYear.value && unit === 'year') {
    return
  }
  if (!showYear.value && unit === 'month') {
    const targetPanelDate = panel === 'start' ? startPanelDate.value : endPanelDate.value
    const nextMonth = targetPanelDate.month() + step
    if (nextMonth < 0 || nextMonth > 11) {
      return
    }
  }
  if (panel === 'start') {
    startPanelDate.value = startPanelDate.value.add(step, unit).startOf('month')
  } else {
    endPanelDate.value = endPanelDate.value.add(step, unit).startOf('month')
  }
}

function getInitialYearPanelStart(year: number) {
  return Math.floor(year / 10) * 10
}

const startYearPanelYears = computed(() => {
  return Array.from({ length: 16 }, (_, index) => startYearPanelStart.value + index)
})

const endYearPanelYears = computed(() => {
  return Array.from({ length: 16 }, (_, index) => endYearPanelStart.value + index)
})

function togglePanelView(panel: 'start' | 'end', view: 'year' | 'month') {
  if (!showYear.value && view === 'year') {
    return
  }
  const currentView = getPanelView(panel)
  const nextView = currentView === view ? 'default' : view
  if (panel === 'start') {
    startPanelView.value = nextView
    if (nextView === 'year') {
      startYearPanelStart.value = getInitialYearPanelStart(startPanelDate.value.year())
    }
  } else {
    endPanelView.value = nextView
    if (nextView === 'year') {
      endYearPanelStart.value = getInitialYearPanelStart(endPanelDate.value.year())
    }
  }
}

function handleQuickYearSelect(year: number, panel: 'start' | 'end') {
  if (panel === 'start') {
    startPanelDate.value = startPanelDate.value.year(year).startOf('month')
    startPanelView.value = 'default'
  } else {
    endPanelDate.value = endPanelDate.value.year(year).startOf('month')
    endPanelView.value = 'default'
  }
}

function handleQuickMonthSelect(month: number, panel: 'start' | 'end') {
  if (panel === 'start') {
    startPanelDate.value = startPanelDate.value.month(month - 1).startOf('month')
    startPanelView.value = 'default'
  } else {
    endPanelDate.value = endPanelDate.value.month(month - 1).startOf('month')
    endPanelView.value = 'default'
  }
}

function validateRangeOrder(start: string | null, end: string | null) {
  if (!showYear.value) return
  if (!start || !end) return
  if (dayjs(start).isAfter(dayjs(end))) {
    model.value = [null, null]
    Message.warning('开始旬不能大于结束旬')
  }
}

function updateRangeModelFromInput() {
  const startParsed = parseUserTextToXun(rangeStartInputValue.value)
  const endParsed = parseUserTextToXun(rangeEndInputValue.value)
  let newStart = isCompleteDraft(startParsed)
    ? formatXunValue(startParsed.year, startParsed.month, startParsed.xun)
    : null
  let newEnd = isCompleteDraft(endParsed) ? formatXunValue(endParsed.year, endParsed.month, endParsed.xun) : null

  if (isCompleteDraft(startParsed) && isXunDisabled(startParsed.year, startParsed.month, startParsed.xun, 'start')) {
    newStart = null
    rangeUserInput.value[0] = null
  }
  if (isCompleteDraft(endParsed) && isXunDisabled(endParsed.year, endParsed.month, endParsed.xun, 'end')) {
    newEnd = null
    rangeUserInput.value[1] = null
  }

  model.value = [newStart, newEnd]
  validateRangeOrder(newStart, newEnd)
}

function handleInputChange(val: string) {
  const normalizedValue = val.trim()
  if (!normalizedValue) {
    userInput.value = null
    handleClear()
    syncPanelDates()
    return
  }

  if (props.mode === 'single') {
    const parsed = parseUserTextToXun(normalizedValue)
    if (isCompleteDraft(parsed)) {
      if (isXunDisabled(parsed.year, parsed.month, parsed.xun, 'single')) {
        userInput.value = null
        handleClear()
        syncPanelDates()
        return
      }
      userInput.value = normalizedValue
      model.value = formatXunValue(parsed.year, parsed.month, parsed.xun)
    } else {
      userInput.value = normalizedValue
    }
  } else if (props.mode === 'multiple') {
    const parsedValues = normalizedValue
      .split(/[,，]/)
      .map(part => parseUserTextToXun(part.trim()))
      .filter(isCompleteDraft)
    const validDrafts = parsedValues.filter(draft => !isXunDisabled(draft.year, draft.month, draft.xun, 'single'))
    if (validDrafts.length === 0 && parsedValues.length > 0) {
      userInput.value = null
      model.value = []
      syncPanelDates()
      return
    }
    userInput.value = validDrafts.map(draft => getXunDisplayText(draft.year, draft.month, draft.xun)).join(', ')
    const newValues = validDrafts.map(draft => formatXunValue(draft.year, draft.month, draft.xun))
    if (newValues.length > 0) {
      model.value = [...new Set(newValues)].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
    }
  }

  syncPanelDates()
}

function handleRangeInputChange(panel: 'start' | 'end', val: string) {
  const normalizedValue = val.trim()
  rangeUserInput.value =
    panel === 'start'
      ? [normalizedValue || null, rangeUserInput.value[1]]
      : [rangeUserInput.value[0], normalizedValue || null]

  if (!rangeUserInput.value[0] && !rangeUserInput.value[1]) {
    handleClear()
    syncPanelDates()
    return
  }

  updateRangeModelFromInput()
  syncPanelDates()
}

function handleXunSelect(year: number, month: number, xun: number, panel: PanelType) {
  userInput.value = null
  rangeUserInput.value = [null, null]
  if (isXunDisabled(year, month, xun, panel)) return

  const value = formatXunValue(year, month, xun)
  if (props.mode === 'single') {
    model.value = value
    visible.value = false
    return
  }
  if (props.mode === 'multiple') {
    const current = [...((model.value as string[] | null) ?? [])]
    const index = current.findIndex(item => isSameXunValue(item, year, month, xun))
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(value)
    }
    current.sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
    model.value = current
    return
  }

  const [start, end] = (model.value as [string | null, string | null]) || [null, null]
  if (panel === 'start') {
    if (start && isSameXunValue(start, year, month, xun)) {
      model.value = [null, end]
      return
    }
    model.value = [value, end]
    validateRangeOrder(value, end)
    return
  }
  if (end && isSameXunValue(end, year, month, xun)) {
    model.value = [start, null]
    return
  }
  model.value = [start, value]
  validateRangeOrder(start, value)
}

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

function getXunAbsoluteIndex(year: number, month: number, xun: number) {
  return year * 36 + (month - 1) * 3 + (xun - 1)
}

function parseXunSelectionValue(value: string | null | undefined) {
  return parseExternalXunValue(value)
}

function createXunTimeItem(year: number, month: number, xun: number): TimeListItem {
  return {
    label: getXunDisplayText(year, month, xun),
    value: formatXunValue(year, month, xun)
  }
}

function getSelectedTimeList(step = 1) {
  const normalizedStep = normalizeTimeListStep(step)

  if (props.mode === 'single') {
    const parsed = parseXunSelectionValue(model.value as string | null)
    return parsed ? [createXunTimeItem(parsed.year, parsed.month, parsed.xun)] : []
  }

  if (props.mode === 'multiple') {
    const selectedValues = ((model.value as string[] | null) ?? [])
      .map(item => parseXunSelectionValue(item))
      .filter((item): item is { year: number; month: number; xun: number } => item !== null)

    return buildSortedSelectedTimeList(
      selectedValues,
      item => getXunAbsoluteIndex(item.year, item.month, item.xun),
      item => createXunTimeItem(item.year, item.month, item.xun)
    )
  }

  const [start, end] = (model.value as [string | null, string | null]) || [null, null]
  const startParsed = parseXunSelectionValue(start)
  const endParsed = parseXunSelectionValue(end)

  if (!startParsed && !endParsed) {
    return []
  }
  if (!startParsed) {
    return endParsed ? [createXunTimeItem(endParsed.year, endParsed.month, endParsed.xun)] : []
  }
  if (!endParsed) {
    return [createXunTimeItem(startParsed.year, startParsed.month, startParsed.xun)]
  }

  const startIndex = getXunAbsoluteIndex(startParsed.year, startParsed.month, startParsed.xun)
  let endIndex = getXunAbsoluteIndex(endParsed.year, endParsed.month, endParsed.xun)
  if (!showYear.value && endIndex < startIndex) {
    endIndex += 36
  }

  return buildIndexedTimeList(startIndex, endIndex, normalizedStep, index => {
    const year = Math.floor(index / 36)
    const monthIndex = index % 36
    const month = Math.floor(monthIndex / 3) + 1
    const xun = (monthIndex % 3) + 1
    return createXunTimeItem(year, month, xun)
  })
}

function hasDraftSelection(year: number, month: number, xun: number, panel: PanelType) {
  if (props.mode === 'single') {
    const draft = getSingleInputDraft()
    return isCompleteDraft(draft) && draft.year === year && draft.month === month && draft.xun === xun
  }
  if (props.mode === 'multiple') {
    return getMultipleInputDrafts().some(
      draft => isCompleteDraft(draft) && draft.year === year && draft.month === month && draft.xun === xun
    )
  }
  const [startDraft, endDraft] = getRangeInputDraft()
  if (panel === 'start') {
    return (
      isCompleteDraft(startDraft) && startDraft.year === year && startDraft.month === month && startDraft.xun === xun
    )
  }
  if (panel === 'end') {
    return isCompleteDraft(endDraft) && endDraft.year === year && endDraft.month === month && endDraft.xun === xun
  }
  return false
}

function getXunClass(year: number, month: number, xun: number, panel: PanelType) {
  if (
    (props.mode === 'range' && (rangeUserInput.value[0] !== null || rangeUserInput.value[1] !== null)) ||
    userInput.value !== null
  ) {
    return {
      'is-selected': hasDraftSelection(year, month, xun, panel),
      'is-disabled': isXunDisabled(year, month, xun, panel)
    }
  }

  let isSelected = false
  if (props.mode === 'single') {
    isSelected = isSameXunValue(model.value as string | null, year, month, xun)
  } else if (props.mode === 'multiple') {
    isSelected = Array.isArray(model.value) && model.value.some(item => isSameXunValue(item, year, month, xun))
  } else {
    const [start, end] = (model.value as [string | null, string | null]) || [null, null]
    isSelected = panel === 'start' ? isSameXunValue(start, year, month, xun) : isSameXunValue(end, year, month, xun)
  }

  return {
    'is-selected': isSelected,
    'is-disabled': isXunDisabled(year, month, xun, panel)
  }
}

watch(
  () => visible.value,
  isVisible => {
    if (isVisible) {
      userInput.value = null
      rangeUserInput.value = [null, null]
      startPanelView.value = 'default'
      endPanelView.value = 'default'
      syncPanelDates()
    }
  }
)

defineExpose<TimeListExpose>({
  getSelectedTimeList
})

function isSameModelValue(valueA: XunModelValue, valueB: XunModelValue) {
  return JSON.stringify(valueA) === JSON.stringify(valueB)
}

function sanitizeXunModelValue(): XunModelValue {
  if (props.mode === 'single') {
    const parsed = parseExternalXunValue(typeof model.value === 'string' ? model.value : null)
    if (!parsed || isXunDisabled(parsed.year, parsed.month, parsed.xun, 'single')) {
      return null
    }
    return formatXunValue(parsed.year, parsed.month, parsed.xun)
  }

  if (props.mode === 'multiple') {
    if (!Array.isArray(model.value)) {
      return []
    }

    return [
      ...new Set(
        model.value
          .map(item => (typeof item === 'string' ? parseExternalXunValue(item) : null))
          .filter((item): item is { year: number; month: number; xun: number } => item !== null)
          .filter(item => !isXunDisabled(item.year, item.month, item.xun, 'single'))
          .map(item => formatXunValue(item.year, item.month, item.xun))
      )
    ].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
  }

  const [start, end] = Array.isArray(model.value) ? model.value : [null, null]
  const startParsed = typeof start === 'string' ? parseExternalXunValue(start) : null
  const endParsed = typeof end === 'string' ? parseExternalXunValue(end) : null

  return [
    startParsed && !isXunDisabled(startParsed.year, startParsed.month, startParsed.xun, 'start')
      ? formatXunValue(startParsed.year, startParsed.month, startParsed.xun)
      : null,
    endParsed && !isXunDisabled(endParsed.year, endParsed.month, endParsed.xun, 'end')
      ? formatXunValue(endParsed.year, endParsed.month, endParsed.xun)
      : null
  ]
}

watch(
  [() => model.value, () => props.mode, disabledXunSet, () => props.disabledDate],
  () => {
    const sanitizedValue = sanitizeXunModelValue()
    if (!isSameModelValue(sanitizedValue, model.value)) {
      model.value = sanitizedValue
      return
    }
    if (!visible.value) {
      syncPanelDates()
    }
  },
  { deep: true, immediate: true }
)
</script>

<style scoped lang="scss">
@use './index';
</style>
