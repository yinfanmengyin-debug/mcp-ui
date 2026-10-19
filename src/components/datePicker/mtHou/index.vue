<template>
  <div class="mt-hou-picker">
    <el-popover
      v-model:visible="visible"
      trigger="click"
      placement="bottom-start"
      :popper-class="['mt-hou-picker__popover', showYear ? '' : 'noYear']"
      :width="popoverWidth"
      :disabled="disabled"
    >
      <template #reference>
        <div
          v-if="isRangeMode"
          class="mt-hou-picker__range-reference"
          :class="{ 'is-disabled': disabled }"
        >
          <input
            v-model="rangeStartInputValue"
            name="start"
            class="mt-hou-picker__range-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="startPlaceholder"
            :disabled="disabled"
            @change="handleRangeInputChange('start', ($event.target as HTMLInputElement).value)"
          />
          <span class="mt-hou-picker__range-separator">{{ rangeSeparator }}</span>
          <input
            v-model="rangeEndInputValue"
            name="end"
            class="mt-hou-picker__range-input"
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
            class="mt-hou-picker__clear"
            @click.stop="handleClear"
          >
            <el-icon><CircleClose /></el-icon>
          </button>
          <el-icon class="mt-hou-picker__suffix"><Calendar /></el-icon>
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
            <el-icon class="mt-hou-picker__suffix"><Calendar /></el-icon>
          </template>
        </el-input>
      </template>

      <div
        class="mt-hou-picker__panels"
        :class="{ 'is-range': isRangeMode }"
      >
        <div class="mt-hou-picker__panel">
          <div
            class="mt-hou-picker__panel-header"
            :class="{ 'is-month-only': !showYear }"
          >
            <button
              v-if="showYear"
              type="button"
              class="mt-hou-picker__nav"
              @click="changePanel('start', -1, 'year')"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
            <button
              type="button"
              class="mt-hou-picker__nav"
              @click="changePanel('start', -1, 'month')"
            >
              <el-icon><ArrowLeft /></el-icon>
            </button>
            <div class="mt-hou-picker__panel-title-actions">
              <button
                v-if="showYear"
                type="button"
                class="mt-hou-picker__panel-title-btn"
                @click="togglePanelView('start', 'year')"
              >
                {{ panelStartDate.year() }}年
              </button>
              <span
                v-if="showYear"
                class="mt-hou-picker__panel-title-separator"
              >
                -
              </span>
              <button
                type="button"
                class="mt-hou-picker__panel-title-btn"
                @click="togglePanelView('start', 'month')"
              >
                {{ panelStartDate.month() + 1 }}月
              </button>
            </div>
            <button
              type="button"
              class="mt-hou-picker__nav"
              @click="changePanel('start', 1, 'month')"
            >
              <el-icon><ArrowRight /></el-icon>
            </button>
            <button
              v-if="showYear"
              type="button"
              class="mt-hou-picker__nav"
              @click="changePanel('start', 1, 'year')"
            >
              <el-icon><DArrowRight /></el-icon>
            </button>
          </div>
          <div
            v-if="getPanelView('start') === 'default'"
            class="mt-hou-picker__panel-body"
          >
            <button
              v-for="hou in houOptions"
              :key="`start-${hou.value}`"
              type="button"
              class="mt-hou-picker__hou"
              :class="
                getHouClass(
                  panelStartDate.year(),
                  panelStartDate.month() + 1,
                  hou.value,
                  isRangeMode ? 'start' : 'single'
                )
              "
              :disabled="
                isHouDisabled(
                  panelStartDate.year(),
                  panelStartDate.month() + 1,
                  hou.value,
                  isRangeMode ? 'start' : 'single'
                )
              "
              @click="
                handleHouSelect(
                  panelStartDate.year(),
                  panelStartDate.month() + 1,
                  hou.value,
                  isRangeMode ? 'start' : 'single'
                )
              "
            >
              {{ hou.label }}
            </button>
          </div>
          <div
            v-else-if="showYear && getPanelView('start') === 'year'"
            class="mt-hou-picker__year-panel-body"
          >
            <button
              v-for="year in startYearPanelYears"
              :key="`start-year-${year}`"
              type="button"
              class="mt-hou-picker__year-btn"
              :class="{ 'is-selected': panelStartDate.year() === year }"
              @click="handleQuickYearSelect(year, 'start')"
            >
              {{ year }}
            </button>
          </div>
          <div
            v-else
            class="mt-hou-picker__month-panel-body"
          >
            <button
              v-for="month in monthOptions"
              :key="`start-month-${month.value}`"
              type="button"
              class="mt-hou-picker__month-btn"
              :class="{ 'is-selected': panelStartDate.month() + 1 === month.value }"
              @click="handleQuickMonthSelect(month.value, 'start')"
            >
              {{ month.label }}
            </button>
          </div>
        </div>

        <div
          v-if="isRangeMode"
          class="mt-hou-picker__panel"
        >
          <div
            class="mt-hou-picker__panel-header"
            :class="{ 'is-month-only': !showYear }"
          >
            <button
              v-if="showYear"
              type="button"
              class="mt-hou-picker__nav"
              @click="changePanel('end', -1, 'year')"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
            <button
              type="button"
              class="mt-hou-picker__nav"
              @click="changePanel('end', -1, 'month')"
            >
              <el-icon><ArrowLeft /></el-icon>
            </button>
            <div class="mt-hou-picker__panel-title-actions">
              <button
                v-if="showYear"
                type="button"
                class="mt-hou-picker__panel-title-btn"
                @click="togglePanelView('end', 'year')"
              >
                {{ panelEndDate.year() }}年
              </button>
              <span
                v-if="showYear"
                class="mt-hou-picker__panel-title-separator"
              >
                -
              </span>
              <button
                type="button"
                class="mt-hou-picker__panel-title-btn"
                @click="togglePanelView('end', 'month')"
              >
                {{ panelEndDate.month() + 1 }}月
              </button>
            </div>
            <button
              type="button"
              class="mt-hou-picker__nav"
              @click="changePanel('end', 1, 'month')"
            >
              <el-icon><ArrowRight /></el-icon>
            </button>
            <button
              v-if="showYear"
              type="button"
              class="mt-hou-picker__nav"
              @click="changePanel('end', 1, 'year')"
            >
              <el-icon><DArrowRight /></el-icon>
            </button>
          </div>
          <div
            v-if="getPanelView('end') === 'default'"
            class="mt-hou-picker__panel-body"
          >
            <button
              v-for="hou in houOptions"
              :key="`end-${hou.value}`"
              type="button"
              class="mt-hou-picker__hou"
              :class="getHouClass(panelEndDate.year(), panelEndDate.month() + 1, hou.value, 'end')"
              :disabled="isHouDisabled(panelEndDate.year(), panelEndDate.month() + 1, hou.value, 'end')"
              @click="handleHouSelect(panelEndDate.year(), panelEndDate.month() + 1, hou.value, 'end')"
            >
              {{ hou.label }}
            </button>
          </div>
          <div
            v-else-if="showYear && getPanelView('end') === 'year'"
            class="mt-hou-picker__year-panel-body"
          >
            <button
              v-for="year in endYearPanelYears"
              :key="`end-year-${year}`"
              type="button"
              class="mt-hou-picker__year-btn"
              :class="{ 'is-selected': panelEndDate.year() === year }"
              @click="handleQuickYearSelect(year, 'end')"
            >
              {{ year }}
            </button>
          </div>
          <div
            v-else
            class="mt-hou-picker__month-panel-body"
          >
            <button
              v-for="month in monthOptions"
              :key="`end-month-${month.value}`"
              type="button"
              class="mt-hou-picker__month-btn"
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
import type { HouDraft, HouModelValue, HouRangeDraft, PanelType, SelectionMode, TimeListExpose, TimeListItem } from '../type'
import { buildIndexedTimeList, buildSortedSelectedTimeList, normalizeTimeListStep } from '../timeList'

defineOptions({ name: 'MtHou' })

const houOptions = Array.from({ length: 6 }, (_, index) => ({
  label: `${index + 1}候`,
  value: index + 1
}))

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  label: `${index + 1}月`,
  value: index + 1
}))

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
    disabledHous?: string[]
    disabledDate?: (date: Dayjs, panel: PanelType) => boolean
  }>(),
  {
    mode: 'single',
    placeholder: '请选择侯',
    startPlaceholder: '开始侯',
    endPlaceholder: '结束侯',
    rangeSeparator: '至',
    disabled: false,
    clearable: true,
    showYear: true,
    valueFormat: 'YYYY-MM-DD HH:mm:00',
    disabledHous: () => []
  }
)

const model = defineModel<HouModelValue>({ default: null })
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

function getHouStartDay(hou: number) {
  return (hou - 1) * 5 + 1
}

function getHouFromDay(day: number) {
  return Math.min(6, Math.floor((day - 1) / 5) + 1)
}

function getHouDisplayText(year: number, month: number, hou: number) {
  return showYear.value ? `${year}-${month.toString().padStart(2, '0')}-${hou}候` : `${month}月-${hou}候`
}

function isCompleteDraft(draft: HouDraft | null): draft is { year: number; month: number; hou: number } {
  return draft !== null && draft.month !== null && draft.hou !== null
}

function parseHouValue(val: string | null | undefined) {
  if (!val) return null
  const normalized = val.trim()
  const labelMatch = normalized.match(/^(\d{4})[-/](\d{1,2})-(\d)候$/)
  if (labelMatch) {
    const year = parseInt(labelMatch[1], 10)
    const month = parseInt(labelMatch[2], 10)
    const hou = parseInt(labelMatch[3], 10)
    if (month >= 1 && month <= 12 && hou >= 1 && hou <= 6) {
      return { year, month, hou }
    }
  }

  const parsed = dayjs(normalized)
  if (!parsed.isValid()) return null
  return {
    year: parsed.year(),
    month: parsed.month() + 1,
    hou: getHouFromDay(parsed.date())
  }
}

// 解析外部绑定值，支持侯文本和日期文本两类格式。
function parseExternalHouValue(val: string | null | undefined) {
  const draft = typeof val === 'string' ? parseUserTextToHou(val) : null
  if (isCompleteDraft(draft)) {
    return draft
  }
  return parseHouValue(val)
}

function formatHouValue(year: number, month: number, hou: number) {
  return dayjs()
    .year(year)
    .month(month - 1)
    .date(getHouStartDay(hou))
    .startOf('day')
    .format(props.valueFormat)
}

function getHouKey(year: number, month: number, hou: number) {
  return showYear.value ? `${year}-${month}-${hou}` : `${month}-${hou}`
}

function getHouKeyFromValue(value: string | null | undefined) {
  const parsed = parseHouValue(value)
  return parsed ? getHouKey(parsed.year, parsed.month, parsed.hou) : null
}

function isSameHouValue(value: string | null | undefined, year: number, month: number, hou: number) {
  return getHouKeyFromValue(value) === getHouKey(year, month, hou)
}

function parseUserTextToHou(text: string): HouDraft | null {
  const normalizedText = text.trim()
  if (!showYear.value) {
    const monthMatch = normalizedText.match(/^(\d{1,2})(?:月)?$/)
    if (monthMatch) {
      const month = parseInt(monthMatch[1], 10)
      if (month >= 1 && month <= 12) {
        return { year: panelStartDate.value.year(), month, hou: null }
      }
    }
    const houNoYearMatch = normalizedText.match(/^(\d{1,2})(?:月)?[-/\s]*(\d)候$/)
    if (houNoYearMatch) {
      const month = parseInt(houNoYearMatch[1], 10)
      const hou = parseInt(houNoYearMatch[2], 10)
      if (month >= 1 && month <= 12 && hou >= 1 && hou <= 6) {
        return { year: panelStartDate.value.year(), month, hou }
      }
    }
  }
  const yearOnlyMatch = normalizedText.match(/^(\d{4})$/)
  if (yearOnlyMatch) {
    return { year: parseInt(yearOnlyMatch[1], 10), month: null, hou: null }
  }

  const yearMonthMatch = normalizedText.match(/^(\d{4})[-/年\s]+(\d{1,2})(?:月)?$/)
  if (yearMonthMatch) {
    const year = parseInt(yearMonthMatch[1], 10)
    const month = parseInt(yearMonthMatch[2], 10)
    if (month >= 1 && month <= 12) {
      return { year, month, hou: null }
    }
  }

  const houMatch = normalizedText.match(/^(\d{4})[-/年\s]+(\d{1,2})(?:月)?[-/\s]*(\d)候$/)
  if (houMatch) {
    const year = parseInt(houMatch[1], 10)
    const month = parseInt(houMatch[2], 10)
    const hou = parseInt(houMatch[3], 10)
    if (month >= 1 && month <= 12 && hou >= 1 && hou <= 6) {
      return { year, month, hou }
    }
  }

  const parsed = dayjs(normalizedText)
  if (parsed.isValid() && /\d{4}.+\d{1,2}.+\d{1,2}/.test(normalizedText)) {
    return { year: parsed.year(), month: parsed.month() + 1, hou: getHouFromDay(parsed.date()) }
  }

  return null
}

function getSingleInputDraft() {
  if (props.mode !== 'single' || userInput.value === null) return null
  return parseUserTextToHou(userInput.value)
}

function getMultipleInputDrafts() {
  if (props.mode !== 'multiple' || userInput.value === null) return []
  return userInput.value
    .split(/[,，]/)
    .map(part => parseUserTextToHou(part))
    .filter((draft): draft is HouDraft => draft !== null)
}

function getRangeInputDraft(): HouRangeDraft {
  if (props.mode !== 'range') return [null, null]
  return [parseUserTextToHou(rangeUserInput.value[0] ?? ''), parseUserTextToHou(rangeUserInput.value[1] ?? '')]
}

const displayValue = computed(() => {
  if (props.mode === 'single') {
    const parsed = parseHouValue(model.value as string)
    return parsed ? getHouDisplayText(parsed.year, parsed.month, parsed.hou) : ''
  }
  if (props.mode === 'multiple') {
    return ((model.value as string[]) || [])
      .map(item => parseHouValue(item))
      .filter((item): item is NonNullable<ReturnType<typeof parseHouValue>> => item !== null)
      .map(item => getHouDisplayText(item.year, item.month, item.hou))
      .join(', ')
  }
  const [start, end] = (model.value as [string | null, string | null]) || [null, null]
  const startParsed = parseHouValue(start)
  const endParsed = parseHouValue(end)
  if (!startParsed && !endParsed) return ''
  return `${startParsed ? getHouDisplayText(startParsed.year, startParsed.month, startParsed.hou) : props.startPlaceholder} ${props.rangeSeparator} ${endParsed ? getHouDisplayText(endParsed.year, endParsed.month, endParsed.hou) : props.endPlaceholder}`
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
    const parsed = parseHouValue(start)
    return parsed ? getHouDisplayText(parsed.year, parsed.month, parsed.hou) : ''
  },
  set(val: string) {
    rangeUserInput.value = [val, rangeUserInput.value[1]]
  }
})

const rangeEndInputValue = computed({
  get() {
    if (rangeUserInput.value[1] !== null) return rangeUserInput.value[1]
    const [, end] = (model.value as [string | null, string | null]) || [null, null]
    const parsed = parseHouValue(end)
    return parsed ? getHouDisplayText(parsed.year, parsed.month, parsed.hou) : ''
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

const disabledHouSet = computed(() => {
  const set = new Set<string>()
  props.disabledHous.forEach(item => {
    const parsed = showYear.value ? parseHouValue(item) : parseExternalHouValue(item)
    if (parsed) set.add(getHouKey(parsed.year, parsed.month, parsed.hou))
  })
  return set
})

function isHouDisabled(year: number, month: number, hou: number, panel: PanelType) {
  if (disabledHouSet.value.has(getHouKey(year, month, hou))) return true
  return (
    props.disabledDate?.(
      dayjs()
        .year(year)
        .month(month - 1)
        .date(getHouStartDay(hou))
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
    const startParsed = draftStart ?? parseHouValue(start)
    const endParsed = draftEnd ?? parseHouValue(end)
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
    const parsed = getSingleInputDraft() ?? parseHouValue(model.value as string)
    if (parsed) {
      anchor = dayjs()
        .year(parsed.year)
        .month((parsed.month ?? 1) - 1)
        .startOf('month')
    }
  } else if (props.mode === 'multiple') {
    const drafts = getMultipleInputDrafts()
    const parsed = drafts.at(-1) ?? parseHouValue((((model.value as string[]) || []).at(-1) ?? null) as string | null)
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
    Message.warning('开始侯不能大于结束侯')
  }
}

function updateRangeModelFromInput() {
  const startParsed = parseUserTextToHou(rangeStartInputValue.value)
  const endParsed = parseUserTextToHou(rangeEndInputValue.value)
  let newStart = isCompleteDraft(startParsed)
    ? formatHouValue(startParsed.year, startParsed.month, startParsed.hou)
    : null
  let newEnd = isCompleteDraft(endParsed) ? formatHouValue(endParsed.year, endParsed.month, endParsed.hou) : null

  if (isCompleteDraft(startParsed) && isHouDisabled(startParsed.year, startParsed.month, startParsed.hou, 'start')) {
    newStart = null
    rangeUserInput.value[0] = null
  }
  if (isCompleteDraft(endParsed) && isHouDisabled(endParsed.year, endParsed.month, endParsed.hou, 'end')) {
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
    const parsed = parseUserTextToHou(normalizedValue)
    if (isCompleteDraft(parsed)) {
      if (isHouDisabled(parsed.year, parsed.month, parsed.hou, 'single')) {
        userInput.value = null
        handleClear()
        syncPanelDates()
        return
      }
      userInput.value = normalizedValue
      model.value = formatHouValue(parsed.year, parsed.month, parsed.hou)
    } else {
      userInput.value = normalizedValue
    }
  } else if (props.mode === 'multiple') {
    const parsedValues = normalizedValue
      .split(/[,，]/)
      .map(part => parseUserTextToHou(part.trim()))
      .filter(isCompleteDraft)
    const validDrafts = parsedValues.filter(draft => !isHouDisabled(draft.year, draft.month, draft.hou, 'single'))
    if (validDrafts.length === 0 && parsedValues.length > 0) {
      userInput.value = null
      model.value = []
      syncPanelDates()
      return
    }
    userInput.value = validDrafts.map(draft => getHouDisplayText(draft.year, draft.month, draft.hou)).join(', ')
    const newValues = validDrafts.map(draft => formatHouValue(draft.year, draft.month, draft.hou))
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

function handleHouSelect(year: number, month: number, hou: number, panel: PanelType) {
  userInput.value = null
  rangeUserInput.value = [null, null]
  if (isHouDisabled(year, month, hou, panel)) return

  const value = formatHouValue(year, month, hou)
  if (props.mode === 'single') {
    model.value = value
    visible.value = false
    return
  }
  if (props.mode === 'multiple') {
    const current = [...((model.value as string[] | null) ?? [])]
    const index = current.findIndex(item => isSameHouValue(item, year, month, hou))
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
    if (start && isSameHouValue(start, year, month, hou)) {
      model.value = [null, end]
      return
    }
    model.value = [value, end]
    validateRangeOrder(value, end)
    return
  }
  if (end && isSameHouValue(end, year, month, hou)) {
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

function getHouAbsoluteIndex(year: number, month: number, hou: number) {
  return year * 72 + (month - 1) * 6 + (hou - 1)
}

function parseHouSelectionValue(value: string | null | undefined) {
  return parseExternalHouValue(value)
}

function createHouTimeItem(year: number, month: number, hou: number): TimeListItem {
  return {
    label: getHouDisplayText(year, month, hou),
    value: formatHouValue(year, month, hou)
  }
}

function getSelectedTimeList(step = 1) {
  const normalizedStep = normalizeTimeListStep(step)

  if (props.mode === 'single') {
    const parsed = parseHouSelectionValue(model.value as string | null)
    return parsed ? [createHouTimeItem(parsed.year, parsed.month, parsed.hou)] : []
  }

  if (props.mode === 'multiple') {
    const selectedValues = ((model.value as string[] | null) ?? [])
      .map(item => parseHouSelectionValue(item))
      .filter((item): item is { year: number; month: number; hou: number } => item !== null)

    return buildSortedSelectedTimeList(
      selectedValues,
      item => getHouAbsoluteIndex(item.year, item.month, item.hou),
      item => createHouTimeItem(item.year, item.month, item.hou)
    )
  }

  const [start, end] = (model.value as [string | null, string | null]) || [null, null]
  const startParsed = parseHouSelectionValue(start)
  const endParsed = parseHouSelectionValue(end)

  if (!startParsed && !endParsed) {
    return []
  }
  if (!startParsed) {
    return endParsed ? [createHouTimeItem(endParsed.year, endParsed.month, endParsed.hou)] : []
  }
  if (!endParsed) {
    return [createHouTimeItem(startParsed.year, startParsed.month, startParsed.hou)]
  }

  const startIndex = getHouAbsoluteIndex(startParsed.year, startParsed.month, startParsed.hou)
  let endIndex = getHouAbsoluteIndex(endParsed.year, endParsed.month, endParsed.hou)
  if (!showYear.value && endIndex < startIndex) {
    endIndex += 72
  }

  return buildIndexedTimeList(startIndex, endIndex, normalizedStep, index => {
    const year = Math.floor(index / 72)
    const monthIndex = index % 72
    const month = Math.floor(monthIndex / 6) + 1
    const hou = (monthIndex % 6) + 1
    return createHouTimeItem(year, month, hou)
  })
}

function hasDraftSelection(year: number, month: number, hou: number, panel: PanelType) {
  if (props.mode === 'single') {
    const draft = getSingleInputDraft()
    return isCompleteDraft(draft) && draft.year === year && draft.month === month && draft.hou === hou
  }
  if (props.mode === 'multiple') {
    return getMultipleInputDrafts().some(
      draft => isCompleteDraft(draft) && draft.year === year && draft.month === month && draft.hou === hou
    )
  }
  const [startDraft, endDraft] = getRangeInputDraft()
  if (panel === 'start') {
    return (
      isCompleteDraft(startDraft) && startDraft.year === year && startDraft.month === month && startDraft.hou === hou
    )
  }
  if (panel === 'end') {
    return isCompleteDraft(endDraft) && endDraft.year === year && endDraft.month === month && endDraft.hou === hou
  }
  return false
}

function getHouClass(year: number, month: number, hou: number, panel: PanelType) {
  if (
    (props.mode === 'range' && (rangeUserInput.value[0] !== null || rangeUserInput.value[1] !== null)) ||
    userInput.value !== null
  ) {
    return {
      'is-selected': hasDraftSelection(year, month, hou, panel),
      'is-disabled': isHouDisabled(year, month, hou, panel)
    }
  }

  let isSelected = false
  if (props.mode === 'single') {
    isSelected = isSameHouValue(model.value as string | null, year, month, hou)
  } else if (props.mode === 'multiple') {
    isSelected = Array.isArray(model.value) && model.value.some(item => isSameHouValue(item, year, month, hou))
  } else {
    const [start, end] = (model.value as [string | null, string | null]) || [null, null]
    isSelected = panel === 'start' ? isSameHouValue(start, year, month, hou) : isSameHouValue(end, year, month, hou)
  }

  return {
    'is-selected': isSelected,
    'is-disabled': isHouDisabled(year, month, hou, panel)
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

function isSameModelValue(valueA: HouModelValue, valueB: HouModelValue) {
  return JSON.stringify(valueA) === JSON.stringify(valueB)
}

function sanitizeHouModelValue(): HouModelValue {
  if (props.mode === 'single') {
    const parsed = parseExternalHouValue(typeof model.value === 'string' ? model.value : null)
    if (!parsed || isHouDisabled(parsed.year, parsed.month, parsed.hou, 'single')) {
      return null
    }
    return formatHouValue(parsed.year, parsed.month, parsed.hou)
  }

  if (props.mode === 'multiple') {
    if (!Array.isArray(model.value)) {
      return []
    }

    return [
      ...new Set(
        model.value
          .map(item => (typeof item === 'string' ? parseExternalHouValue(item) : null))
          .filter((item): item is { year: number; month: number; hou: number } => item !== null)
          .filter(item => !isHouDisabled(item.year, item.month, item.hou, 'single'))
          .map(item => formatHouValue(item.year, item.month, item.hou))
      )
    ].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
  }

  const [start, end] = Array.isArray(model.value) ? model.value : [null, null]
  const startParsed = typeof start === 'string' ? parseExternalHouValue(start) : null
  const endParsed = typeof end === 'string' ? parseExternalHouValue(end) : null

  return [
    startParsed && !isHouDisabled(startParsed.year, startParsed.month, startParsed.hou, 'start')
      ? formatHouValue(startParsed.year, startParsed.month, startParsed.hou)
      : null,
    endParsed && !isHouDisabled(endParsed.year, endParsed.month, endParsed.hou, 'end')
      ? formatHouValue(endParsed.year, endParsed.month, endParsed.hou)
      : null
  ]
}

watch(
  [() => model.value, () => props.mode, disabledHouSet, () => props.disabledDate],
  () => {
    const sanitizedValue = sanitizeHouModelValue()
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
