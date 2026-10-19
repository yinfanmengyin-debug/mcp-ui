<template>
  <div class="mt-season-picker">
    <el-popover
      v-model:visible="visible"
      trigger="click"
      placement="bottom-start"
      :popper-class="['mt-season-picker__popover', showYear ? '' : 'noYear']"
      :width="popoverWidth"
      :disabled="disabled"
    >
      <template #reference>
        <div
          v-if="isRangeMode"
          class="mt-season-picker__range-reference"
          :class="{ 'is-disabled': disabled }"
        >
          <input
            v-model="rangeStartInputValue"
            name="start"
            class="mt-season-picker__range-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="startPlaceholder"
            :disabled="disabled"
            @change="handleRangeInputChange('start', ($event.target as HTMLInputElement).value)"
          />
          <span class="mt-season-picker__range-separator">
            {{ rangeSeparator }}
          </span>
          <input
            v-model="rangeEndInputValue"
            name="end"
            class="mt-season-picker__range-input"
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
            class="mt-season-picker__clear"
            @click.stop="handleClear"
          >
            <el-icon>
              <CircleClose />
            </el-icon>
          </button>
          <el-icon class="mt-season-picker__suffix">
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
            <el-icon class="mt-season-picker__suffix">
              <Calendar />
            </el-icon>
          </template>
        </el-input>
      </template>

      <div
        class="mt-season-picker__panels"
        :class="{ 'is-range': isRangeMode }"
      >
        <div class="mt-season-picker__panel">
          <div class="mt-season-picker__panel-header">
            <template v-if="showYear">
              <button
                type="button"
                class="mt-season-picker__nav"
                @click="changeYear('left', -1)"
              >
                <el-icon><DArrowLeft /></el-icon>
              </button>
              <button
                type="button"
                class="mt-season-picker__panel-title-btn"
                @click="toggleYearSelection('left')"
              >
                {{ isSelectingYearLeft ? `${leftYearPanelStart} ~ ${leftYearPanelStart + 15}` : leftYear }}
              </button>
              <button
                type="button"
                class="mt-season-picker__nav"
                @click="changeYear('left', 1)"
              >
                <el-icon><DArrowRight /></el-icon>
              </button>
            </template>
            <span
              v-else
              class="mt-season-picker__panel-title"
            >
              {{ isRangeMode ? '开始季节' : '季节' }}
            </span>
          </div>

          <div
            v-if="!showYear || !isSelectingYearLeft"
            class="mt-season-picker__panel-body"
          >
            <button
              v-for="season in seasons"
              :key="`left-${season.value}`"
              type="button"
              class="mt-season-picker__season"
              :class="getSeasonClass(leftYear, season.value, isRangeMode ? 'start' : 'single')"
              :disabled="isSeasonDisabled(leftYear, season.value, isRangeMode ? 'start' : 'single')"
              @click="handleSeasonSelect(leftYear, season.value, isRangeMode ? 'start' : 'single')"
            >
              {{ season.label }}
            </button>
          </div>
          <div
            v-else
            class="mt-season-picker__year-panel-body"
          >
            <button
              v-for="year in leftYearPanelYears"
              :key="`year-left-${year}`"
              type="button"
              class="mt-season-picker__year-btn"
              :class="{ 'is-selected': leftYear === year }"
              @click="handleYearSelect(year, 'left')"
            >
              {{ year }}
            </button>
          </div>
        </div>

        <div
          v-if="isRangeMode"
          class="mt-season-picker__panel"
        >
          <div class="mt-season-picker__panel-header">
            <template v-if="showYear">
              <button
                type="button"
                class="mt-season-picker__nav"
                @click="changeYear('right', -1)"
              >
                <el-icon><DArrowLeft /></el-icon>
              </button>
              <button
                type="button"
                class="mt-season-picker__panel-title-btn"
                @click="toggleYearSelection('right')"
              >
                {{ isSelectingYearRight ? `${rightYearPanelStart} ~ ${rightYearPanelStart + 15}` : rightYear }}
              </button>
              <button
                type="button"
                class="mt-season-picker__nav"
                @click="changeYear('right', 1)"
              >
                <el-icon><DArrowRight /></el-icon>
              </button>
            </template>
            <span
              v-else
              class="mt-season-picker__panel-title"
            >
              结束季节
            </span>
          </div>

          <div
            v-if="!showYear || !isSelectingYearRight"
            class="mt-season-picker__panel-body"
          >
            <button
              v-for="season in seasons"
              :key="`right-${season.value}`"
              type="button"
              class="mt-season-picker__season"
              :class="getSeasonClass(rightYear, season.value, 'end')"
              :disabled="isSeasonDisabled(rightYear, season.value, 'end')"
              @click="handleSeasonSelect(rightYear, season.value, 'end')"
            >
              {{ season.label }}
            </button>
          </div>
          <div
            v-else
            class="mt-season-picker__year-panel-body"
          >
            <button
              v-for="year in rightYearPanelYears"
              :key="`year-right-${year}`"
              type="button"
              class="mt-season-picker__year-btn"
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
import type {
  PanelType,
  SeasonCapableDayjs,
  SeasonDraft,
  SeasonModelValue,
  SeasonRangeDraft,
  SelectionMode,
  TimeListExpose,
  TimeListItem
} from '../type'
import { buildIndexedTimeList, buildSortedSelectedTimeList, normalizeTimeListStep } from '../timeList'

defineOptions({ name: 'MtSeason' })

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
    disabledSeasons?: string[]
    disabledDate?: (date: Dayjs, panel: PanelType) => boolean
  }>(),
  {
    mode: 'single',
    placeholder: '请选择季节',
    startPlaceholder: '开始季节',
    endPlaceholder: '结束季节',
    rangeSeparator: '至',
    disabled: false,
    clearable: true,
    showYear: true,
    valueFormat: 'YYYY-MM-DD HH:mm:00',
    disabledSeasons: () => []
  }
)

const model = defineModel<SeasonModelValue>({ default: null })

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

const seasons = [
  { label: '春季', value: 1 },
  { label: '夏季', value: 2 },
  { label: '秋季', value: 3 },
  { label: '冬季', value: 4 }
]

const seasonLabels: Record<number, string> = { 1: '春', 2: '夏', 3: '秋', 4: '冬' }

// 生成年份-季节的展示文本。
function getSeasonDisplayText(year: number, season: number) {
  return showYear.value ? `${year}-${seasonLabels[season]}` : `${seasonLabels[season]}季`
}

// 返回带季节扩展能力的 dayjs 实例。
function getSeasonDayjs(value?: string | number | Date | Dayjs) {
  return (value ? dayjs(value) : dayjs()) as SeasonCapableDayjs
}

// 判断草稿是否已经完整到“年+季节”。
function isCompleteDraft(draft: SeasonDraft | null): draft is { year: number; season: number } {
  return draft !== null && draft.season !== null
}

// 计算日期所属的季节年份，冬季的 1-2 月归到上一年。
function getSeasonYear(date: SeasonCapableDayjs) {
  const season = date.season()
  const month = date.month()
  if (season === 4 && month < 2) {
    return date.year() - 1
  }

  return date.year()
}

// 将外部值解析成标准的“季节年份+季节序号”。
function parseSeasonValue(val: string | null | undefined): { year: number; season: number } | null {
  if (!val) return null
  const d = getSeasonDayjs(val)
  if (!d.isValid()) return null
  return {
    year: getSeasonYear(d),
    season: d.season()
  }
}

// 解析外部绑定值，支持季节文本和日期文本两类格式。
function parseExternalSeasonValue(val: string | null | undefined) {
  const draft = typeof val === 'string' ? parseUserTextToSeason(val) : null
  if (isCompleteDraft(draft)) {
    return draft
  }
  return parseSeasonValue(val)
}

// 按当前 valueFormat 生成最终存储值。
function formatSeasonValue(year: number, season: number): string {
  return (getSeasonDayjs().year(year) as SeasonCapableDayjs).season(season).startOf('season').format(props.valueFormat)
}

// 生成用于比较的季节键。
function getSeasonKey(year: number, season: number) {
  return showYear.value ? `${year}-${season}` : `${season}`
}

// 从外部值生成可比较的季节键。
function getSeasonKeyFromValue(value: string | null | undefined) {
  const parsed = parseSeasonValue(value)
  if (!parsed) {
    return null
  }

  return getSeasonKey(parsed.year, parsed.season)
}

// 判断某个值是否与指定季节语义相同。
function isSameSeasonValue(value: string | null | undefined, year: number, season: number) {
  return getSeasonKeyFromValue(value) === getSeasonKey(year, season)
}

// 解析用户手动输入的年份、季节或日期文本。
function parseUserTextToSeason(text: string): SeasonDraft | null {
  const normalizedText = text.trim()
  if (!showYear.value) {
    const seasonOnlyMatch = normalizedText.match(/^(春|夏|秋|冬|[1-4])(季)?$/)
    if (seasonOnlyMatch) {
      const seasonStr = seasonOnlyMatch[1]
      let season = 1
      if (seasonStr === '春' || seasonStr === '1') season = 1
      else if (seasonStr === '夏' || seasonStr === '2') season = 2
      else if (seasonStr === '秋' || seasonStr === '3') season = 3
      else if (seasonStr === '冬' || seasonStr === '4') season = 4
      return { year: leftYear.value, season }
    }
  }
  const yearOnlyMatch = normalizedText.match(/^(\d{4})$/)
  if (yearOnlyMatch) {
    return {
      year: parseInt(yearOnlyMatch[1], 10),
      season: null
    }
  }

  const yearDraftMatch = normalizedText.match(/^(\d{4})(?:[-/年\s]+)$/)
  if (yearDraftMatch) {
    return {
      year: parseInt(yearDraftMatch[1], 10),
      season: null
    }
  }

  const match = normalizedText.match(/^(\d{4})[-/年\s]*(春|夏|秋|冬|[1-4])(季)?$/)
  if (match) {
    const year = parseInt(match[1], 10)
    const seasonStr = match[2]
    let season = 1
    if (seasonStr === '春' || seasonStr === '1') season = 1
    else if (seasonStr === '夏' || seasonStr === '2') season = 2
    else if (seasonStr === '秋' || seasonStr === '3') season = 3
    else if (seasonStr === '冬' || seasonStr === '4') season = 4
    return { year, season }
  }

  const dateMatch = normalizedText.match(
    /^(\d{4})([-/])(\d{1,2})(?:\2(\d{1,2}))?$|^(\d{4})年(\d{1,2})月(?:([1-9]|[12]\d|3[01])日?)$/
  )
  if (dateMatch) {
    const d = getSeasonDayjs(normalizedText)
    if (d.isValid()) {
      return { year: getSeasonYear(d), season: d.season() }
    }
  }

  const chineseDateMatch = normalizedText.match(/^(\d{4})年(\d{1,2})月(\d{1,2})?日?$/)
  if (chineseDateMatch) {
    const normalizedChineseDate = normalizedText
      .replace('年', '-')
      .replace('月', '-')
      .replace('日', '')
      .replace(/-$/, '')
    const d = getSeasonDayjs(normalizedChineseDate)
    if (d.isValid()) {
      return { year: getSeasonYear(d), season: d.season() }
    }
  }

  return null
}

// 读取单选模式下的输入草稿。
function getSingleInputDraft() {
  if (props.mode !== 'single' || userInput.value === null) {
    return null
  }
  return parseUserTextToSeason(userInput.value)
}

// 读取多选模式下的输入草稿列表。
function getMultipleInputDrafts() {
  if (props.mode !== 'multiple' || userInput.value === null) {
    return []
  }

  return userInput.value
    .split(/[,，]/)
    .map(part => parseUserTextToSeason(part))
    .filter((draft): draft is SeasonDraft => draft !== null)
}

// 读取范围模式下的开始/结束输入草稿。
function getRangeInputDraft(): SeasonRangeDraft {
  if (props.mode !== 'range') {
    return [null, null]
  }

  return [parseUserTextToSeason(rangeUserInput.value[0] ?? ''), parseUserTextToSeason(rangeUserInput.value[1] ?? '')]
}

const displayValue = computed(() => {
  if (props.mode === 'single') {
    const parsed = parseSeasonValue(model.value as string)
    return parsed ? getSeasonDisplayText(parsed.year, parsed.season) : ''
  }
  if (props.mode === 'multiple') {
    const arr = (model.value as string[]) || []
    return arr
      .map(v => {
        const parsed = parseSeasonValue(v)
        return parsed ? getSeasonDisplayText(parsed.year, parsed.season) : ''
      })
      .filter(Boolean)
      .join(', ')
  }
  if (props.mode === 'range') {
    const [start, end] = (model.value as [string | null, string | null]) || [null, null]
    const startParsed = parseSeasonValue(start)
    const endParsed = parseSeasonValue(end)
    if (!startParsed && !endParsed) return ''
    const startStr = startParsed ? getSeasonDisplayText(startParsed.year, startParsed.season) : props.startPlaceholder
    const endStr = endParsed ? getSeasonDisplayText(endParsed.year, endParsed.season) : props.endPlaceholder
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
    const startParsed = parseSeasonValue(start)
    return startParsed ? getSeasonDisplayText(startParsed.year, startParsed.season) : ''
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
    const endParsed = parseSeasonValue(end)
    return endParsed ? getSeasonDisplayText(endParsed.year, endParsed.season) : ''
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

const disabledSeasonSet = computed(() => {
  const seasons = new Set<string>()
  props.disabledSeasons.forEach(item => {
    const parsed = showYear.value ? parseSeasonValue(item) : parseExternalSeasonValue(item)
    if (parsed) {
      seasons.add(getSeasonKey(parsed.year, parsed.season))
    }
  })
  return seasons
})

function isSeasonDisabled(year: number, season: number, panel: PanelType) {
  const key = getSeasonKey(year, season)
  if (disabledSeasonSet.value.has(key)) {
    return true
  }
  return (
    props.disabledDate?.((getSeasonDayjs().year(year) as SeasonCapableDayjs).season(season).startOf('season'), panel) ??
    false
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

function isSameModelValue(valueA: SeasonModelValue, valueB: SeasonModelValue) {
  return JSON.stringify(valueA) === JSON.stringify(valueB)
}

function sanitizeSeasonModelValue(): SeasonModelValue {
  if (props.mode === 'single') {
    const parsed = parseExternalSeasonValue(typeof model.value === 'string' ? model.value : null)
    if (!parsed || isSeasonDisabled(parsed.year, parsed.season, 'single')) {
      return null
    }
    return formatSeasonValue(parsed.year, parsed.season)
  }

  if (props.mode === 'multiple') {
    if (!Array.isArray(model.value)) {
      return []
    }

    return [
      ...new Set(
        model.value
          .map(item => (typeof item === 'string' ? parseExternalSeasonValue(item) : null))
          .filter((item): item is { year: number; season: number } => item !== null)
          .filter(item => !isSeasonDisabled(item.year, item.season, 'single'))
          .map(item => formatSeasonValue(item.year, item.season))
      )
    ].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
  }

  const [start, end] = Array.isArray(model.value) ? model.value : [null, null]
  const startParsed = typeof start === 'string' ? parseExternalSeasonValue(start) : null
  const endParsed = typeof end === 'string' ? parseExternalSeasonValue(end) : null

  return [
    startParsed && !isSeasonDisabled(startParsed.year, startParsed.season, 'start')
      ? formatSeasonValue(startParsed.year, startParsed.season)
      : null,
    endParsed && !isSeasonDisabled(endParsed.year, endParsed.season, 'end')
      ? formatSeasonValue(endParsed.year, endParsed.season)
      : null
  ]
}

// 当 model.value 改变且面板没打开时，同步面板年份，这样输入框改变时也能同步面板
watch(
  [() => model.value, () => props.mode, disabledSeasonSet, () => props.disabledDate],
  () => {
    const sanitizedValue = sanitizeSeasonModelValue()
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
    const startParsed = draftStart ?? parseSeasonValue(start)
    const endParsed = draftEnd ?? parseSeasonValue(end)
    const currentYear = dayjs().year()

    leftYear.value = startParsed?.year ?? currentYear
    rightYear.value = endParsed?.year ?? currentYear
  } else {
    let anchorYear = dayjs().year()
    if (props.mode === 'single') {
      const parsed = getSingleInputDraft() ?? parseSeasonValue(model.value as string)
      if (parsed) anchorYear = parsed.year
    } else if (props.mode === 'multiple') {
      const inputDrafts = getMultipleInputDrafts()
      if (inputDrafts.length > 0) {
        anchorYear = inputDrafts.at(-1)?.year ?? anchorYear
      } else {
        const arr = (model.value as string[]) || []
        if (arr.length > 0) {
          const parsed = parseSeasonValue(arr[arr.length - 1])
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
    Message.warning('开始季节不能大于结束季节')
  }
}

// 将范围输入框内容回写到 model。
function updateRangeModelFromInput() {
  const startParsed = parseUserTextToSeason(rangeStartInputValue.value)
  const endParsed = parseUserTextToSeason(rangeEndInputValue.value)

  let newStart = isCompleteDraft(startParsed) ? formatSeasonValue(startParsed.year, startParsed.season) : null
  let newEnd = isCompleteDraft(endParsed) ? formatSeasonValue(endParsed.year, endParsed.season) : null

  if (isCompleteDraft(startParsed) && isSeasonDisabled(startParsed.year, startParsed.season, 'start')) {
    newStart = null
    rangeUserInput.value[0] = null
  }
  if (isCompleteDraft(endParsed) && isSeasonDisabled(endParsed.year, endParsed.season, 'end')) {
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
    const parsed = parseUserTextToSeason(normalizedValue)
    if (isCompleteDraft(parsed)) {
      if (isSeasonDisabled(parsed.year, parsed.season, 'single')) {
        userInput.value = null
        handleClear()
        syncPanelYears()
        return
      }
      userInput.value = normalizedValue
      model.value = formatSeasonValue(parsed.year, parsed.season)
    } else {
      userInput.value = normalizedValue
    }
  } else if (props.mode === 'multiple') {
    const parsedValues = parseMultipleInputValue(normalizedValue)
      .map(part => parseUserTextToSeason(part))
      .filter(isCompleteDraft)

    const validDrafts = parsedValues.filter(draft => !isSeasonDisabled(draft.year, draft.season, 'single'))

    if (validDrafts.length === 0 && parsedValues.length > 0) {
      userInput.value = null
      model.value = []
      syncPanelYears()
      return
    }

    userInput.value = validDrafts.map(draft => getSeasonDisplayText(draft.year, draft.season)).join(', ')

    const newValues = validDrafts.map(draft => formatSeasonValue(draft.year, draft.season))

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
function handleSeasonSelect(year: number, season: number, panel: PanelType) {
  userInput.value = null
  rangeUserInput.value = [null, null]

  if (isSeasonDisabled(year, season, panel)) {
    return
  }

  if (props.mode === 'single') {
    model.value = formatSeasonValue(year, season)
    visible.value = false
    return
  }

  if (props.mode === 'multiple') {
    const valStr = formatSeasonValue(year, season)
    const current = [...((model.value as string[] | null) ?? [])]
    const index = current.findIndex(item => isSameSeasonValue(item, year, season))
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(valStr)
    }
    current.sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
    model.value = current
    return
  }

  const valStr = formatSeasonValue(year, season)
  const [start, end] = (model.value as [string | null, string | null]) || [null, null]
  if (panel === 'start') {
    if (start && isSameSeasonValue(start, year, season)) {
      model.value = [null, end]
      return
    }
    model.value = [valStr, end]
    validateRangeOrder(valStr, end)
    return
  }

  if (end && isSameSeasonValue(end, year, season)) {
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

function getSeasonAbsoluteIndex(year: number, season: number) {
  return year * 4 + (season - 1)
}

function parseSeasonSelectionValue(value: string | null | undefined) {
  return parseExternalSeasonValue(value)
}

function createSeasonTimeItem(year: number, season: number): TimeListItem {
  return {
    label: getSeasonDisplayText(year, season),
    value: formatSeasonValue(year, season)
  }
}

function getSelectedTimeList(step = 1) {
  const normalizedStep = normalizeTimeListStep(step)

  if (props.mode === 'single') {
    const parsed = parseSeasonSelectionValue(model.value as string | null)
    return parsed ? [createSeasonTimeItem(parsed.year, parsed.season)] : []
  }

  if (props.mode === 'multiple') {
    const selectedValues = ((model.value as string[] | null) ?? [])
      .map(item => parseSeasonSelectionValue(item))
      .filter((item): item is { year: number; season: number } => item !== null)

    return buildSortedSelectedTimeList(
      selectedValues,
      item => getSeasonAbsoluteIndex(item.year, item.season),
      item => createSeasonTimeItem(item.year, item.season)
    )
  }

  const [start, end] = (model.value as [string | null, string | null]) || [null, null]
  const startParsed = parseSeasonSelectionValue(start)
  const endParsed = parseSeasonSelectionValue(end)

  if (!startParsed && !endParsed) {
    return []
  }
  if (!startParsed) {
    return endParsed ? [createSeasonTimeItem(endParsed.year, endParsed.season)] : []
  }
  if (!endParsed) {
    return [createSeasonTimeItem(startParsed.year, startParsed.season)]
  }

  const startIndex = getSeasonAbsoluteIndex(startParsed.year, startParsed.season)
  let endIndex = getSeasonAbsoluteIndex(endParsed.year, endParsed.season)
  if (!showYear.value && endIndex < startIndex) {
    endIndex += 4
  }

  return buildIndexedTimeList(startIndex, endIndex, normalizedStep, index => {
    const year = Math.floor(index / 4)
    const season = (index % 4) + 1
    return createSeasonTimeItem(year, season)
  })
}

// 判断草稿态下某个季节是否应被高亮为选中。
function hasDraftSelection(year: number, season: number, panel: PanelType) {
  if (props.mode === 'single') {
    const draft = getSingleInputDraft()
    return isCompleteDraft(draft) && draft.year === year && draft.season === season
  }
  if (props.mode === 'multiple') {
    return getMultipleInputDrafts().some(draft => draft.year === year && draft.season === season)
  }
  const [startDraft, endDraft] = getRangeInputDraft()
  if (panel === 'start') {
    return isCompleteDraft(startDraft) && startDraft.year === year && startDraft.season === season
  }
  if (panel === 'end') {
    return isCompleteDraft(endDraft) && endDraft.year === year && endDraft.season === season
  }
  return (
    (isCompleteDraft(startDraft) && startDraft.year === year && startDraft.season === season) ||
    (isCompleteDraft(endDraft) && endDraft.year === year && endDraft.season === season)
  )
}

// 生成季节按钮的选中和范围样式状态。
function getSeasonClass(year: number, season: number, panel: PanelType) {
  if (
    (props.mode === 'range' && (rangeUserInput.value[0] !== null || rangeUserInput.value[1] !== null)) ||
    userInput.value !== null
  ) {
    return {
      'is-selected': hasDraftSelection(year, season, panel),
      'is-disabled': isSeasonDisabled(year, season, panel)
    }
  }
  let isSelected = false
  if (props.mode === 'single') {
    isSelected = isSameSeasonValue(model.value as string | null, year, season)
  } else if (props.mode === 'multiple') {
    isSelected = Array.isArray(model.value) && model.value.some(item => isSameSeasonValue(item, year, season))
  } else if (props.mode === 'range') {
    const [start, end] = (model.value as [string | null, string | null]) || [null, null]
    if (panel === 'start') {
      isSelected = isSameSeasonValue(start, year, season)
    } else if (panel === 'end') {
      isSelected = isSameSeasonValue(end, year, season)
    } else {
      isSelected = isSameSeasonValue(start, year, season) || isSameSeasonValue(end, year, season)
    }
  }

  return {
    'is-selected': isSelected,
    'is-disabled': isSeasonDisabled(year, season, panel)
  }
}

defineExpose<TimeListExpose>({
  getSelectedTimeList
})
</script>

<style scoped lang="scss">
@use './index';
</style>
