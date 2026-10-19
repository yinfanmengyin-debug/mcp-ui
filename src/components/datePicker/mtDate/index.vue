<template>
  <div class="mt-date-picker">
    <el-popover
      v-model:visible="visible"
      trigger="click"
      placement="bottom-start"
      :popper-class="['mt-date-picker__popover', showYear ? '' : 'noYear']"
      :width="popoverWidth"
      :disabled="disabled"
    >
      <template #reference>
        <div
          v-if="isRangeMode"
          class="mt-date-picker__range-reference"
          :class="{ 'is-disabled': disabled }"
        >
          <input
            v-model="rangeStartInputValue"
            name="start"
            class="mt-date-picker__range-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="startPlaceholder"
            :disabled="disabled"
            @change="handleRangeInputChange('start', ($event.target as HTMLInputElement).value)"
          />
          <span class="mt-date-picker__range-separator">
            {{ rangeSeparator }}
          </span>
          <input
            v-model="rangeEndInputValue"
            name="end"
            class="mt-date-picker__range-input"
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
            class="mt-date-picker__clear"
            @click.stop="handleClear"
          >
            <el-icon>
              <CircleClose />
            </el-icon>
          </button>
          <el-icon class="mt-date-picker__suffix">
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
            <el-icon class="mt-date-picker__suffix">
              <Calendar />
            </el-icon>
          </template>
        </el-input>
      </template>

      <div
        class="mt-date-picker__panels"
        :class="{ 'is-range': isRangeMode }"
      >
        <div class="mt-date-picker__panel">
          <div
            class="mt-date-picker__panel-header"
            :class="{ 'is-month-only': !showYear }"
          >
            <button
              v-if="showYear"
              type="button"
              class="mt-date-picker__nav"
              @mousedown.stop.prevent
              @click.stop="changePanel('left', -1, 'year')"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
            <button
              type="button"
              class="mt-date-picker__nav"
              @mousedown.stop.prevent
              @click.stop="changePanel('left', -1, 'month')"
            >
              <el-icon><ArrowLeft /></el-icon>
            </button>
            <div class="mt-date-picker__panel-title-actions">
              <button
                v-if="showYear"
                type="button"
                class="mt-date-picker__panel-title-btn"
                @click.stop="togglePanelView('left', 'year')"
              >
                {{ getPanelDate('left').year() }}年
              </button>
              <span
                v-if="showYear"
                class="mt-date-picker__panel-title-separator"
              >
                -
              </span>
              <button
                type="button"
                class="mt-date-picker__panel-title-btn"
                @click.stop="togglePanelView('left', 'month')"
              >
                {{ getPanelDate('left').month() + 1 }}月
              </button>
            </div>
            <button
              type="button"
              class="mt-date-picker__nav"
              @mousedown.stop.prevent
              @click.stop="changePanel('left', 1, 'month')"
            >
              <el-icon><ArrowRight /></el-icon>
            </button>
            <button
              v-if="showYear"
              type="button"
              class="mt-date-picker__nav"
              @mousedown.stop.prevent
              @click.stop="changePanel('left', 1, 'year')"
            >
              <el-icon><DArrowRight /></el-icon>
            </button>
          </div>

          <template v-if="getPanelView('left') === 'date'">
            <div class="mt-date-picker__weekdays">
              <span
                v-for="label in weekLabels"
                :key="`left-week-${label}`"
                class="mt-date-picker__weekday"
              >
                {{ label }}
              </span>
            </div>

            <div class="mt-date-picker__calendar">
              <template v-for="cell in leftCalendarCells">
                <button
                  v-if="cell.date"
                  :key="`left-date-${cell.key}`"
                  type="button"
                  class="mt-date-picker__date"
                  :class="getDateCellClass(cell.date, cell.currentMonth, isRangeMode ? 'start' : 'single')"
                  :disabled="isDateDisabled(cell.date, isRangeMode ? 'start' : 'single')"
                  @click="handleDateSelect(cell.date, isRangeMode ? 'start' : 'single')"
                >
                  {{ cell.date.date() }}
                </button>
                <span
                  v-else
                  :key="`left-${cell.key}`"
                  class="mt-date-picker__date is-placeholder"
                ></span>
              </template>
            </div>
          </template>
          <div
            v-else-if="showYear && getPanelView('left') === 'year'"
            class="mt-date-picker__year-panel-body"
          >
            <button
              v-for="year in leftYearPanelYears"
              :key="`left-year-${year}`"
              type="button"
              class="mt-date-picker__year-btn"
              :class="{ 'is-selected': getPanelDate('left').year() === year }"
              @click="handleQuickYearSelect(year, 'left')"
            >
              {{ year }}
            </button>
          </div>
          <div
            v-else
            class="mt-date-picker__month-panel-body"
          >
            <button
              v-for="month in monthOptions"
              :key="`left-month-${month.value}`"
              type="button"
              class="mt-date-picker__month-btn"
              :class="{ 'is-selected': getPanelDate('left').month() + 1 === month.value }"
              @click="handleQuickMonthSelect(month.value, 'left')"
            >
              {{ month.label }}
            </button>
          </div>

          <div
            v-if="showHourPanel && getPanelView('left') === 'date'"
            class="mt-date-picker__time-section"
          >
            <div
              class="mt-date-picker__time-picker"
              :class="{ 'is-disabled': isHourDisabled(isRangeMode ? 'start' : 'single') }"
            >
              <div
                class="mt-date-picker__time-columns"
                :class="{ 'is-single-column': !showMinute }"
              >
                <div
                  :ref="el => setTimeColumnRef(isRangeMode ? 'start' : 'single', 'hour', el)"
                  class="mt-date-picker__time-column"
                >
                  <button
                    v-for="hour in getAvailableHours(isRangeMode ? 'start' : 'single')"
                    :key="`left-hour-${hour}`"
                    type="button"
                    class="mt-date-picker__time-option"
                    :class="{ 'is-selected': getSelectedTimePart(isRangeMode ? 'start' : 'single', 'hour') === hour }"
                    :data-selected="
                      getSelectedTimePart(isRangeMode ? 'start' : 'single', 'hour') === hour ? 'true' : 'false'
                    "
                    :disabled="isHourDisabled(isRangeMode ? 'start' : 'single')"
                    @click="handleTimeUnitSelect(isRangeMode ? 'start' : 'single', 'hour', hour)"
                  >
                    {{ formatTimeUnit(hour) }}时
                  </button>
                </div>
                <div
                  v-if="showMinute"
                  :ref="el => setTimeColumnRef(isRangeMode ? 'start' : 'single', 'minute', el)"
                  class="mt-date-picker__time-column"
                >
                  <button
                    v-for="minute in getAvailableMinutesForSelectedHour(isRangeMode ? 'start' : 'single')"
                    :key="`left-minute-${minute}`"
                    type="button"
                    class="mt-date-picker__time-option"
                    :class="{
                      'is-selected': getSelectedTimePart(isRangeMode ? 'start' : 'single', 'minute') === minute
                    }"
                    :data-selected="
                      getSelectedTimePart(isRangeMode ? 'start' : 'single', 'minute') === minute ? 'true' : 'false'
                    "
                    :disabled="isHourDisabled(isRangeMode ? 'start' : 'single')"
                    @click="handleTimeUnitSelect(isRangeMode ? 'start' : 'single', 'minute', minute)"
                  >
                    {{ formatTimeUnit(minute) }}分
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="isRangeMode"
          class="mt-date-picker__panel"
        >
          <div
            class="mt-date-picker__panel-header"
            :class="{ 'is-month-only': !showYear }"
          >
            <button
              v-if="showYear"
              type="button"
              class="mt-date-picker__nav"
              @mousedown.stop.prevent
              @click.stop="changePanel('right', -1, 'year')"
            >
              <el-icon><DArrowLeft /></el-icon>
            </button>
            <button
              type="button"
              class="mt-date-picker__nav"
              @mousedown.stop.prevent
              @click.stop="changePanel('right', -1, 'month')"
            >
              <el-icon><ArrowLeft /></el-icon>
            </button>
            <div class="mt-date-picker__panel-title-actions">
              <button
                v-if="showYear"
                type="button"
                class="mt-date-picker__panel-title-btn"
                @click.stop="togglePanelView('right', 'year')"
              >
                {{ getPanelDate('right').year() }}年
              </button>
              <span
                v-if="showYear"
                class="mt-date-picker__panel-title-separator"
              >
                -
              </span>
              <button
                type="button"
                class="mt-date-picker__panel-title-btn"
                @click.stop="togglePanelView('right', 'month')"
              >
                {{ getPanelDate('right').month() + 1 }}月
              </button>
            </div>
            <button
              type="button"
              class="mt-date-picker__nav"
              @mousedown.stop.prevent
              @click.stop="changePanel('right', 1, 'month')"
            >
              <el-icon><ArrowRight /></el-icon>
            </button>
            <button
              v-if="showYear"
              type="button"
              class="mt-date-picker__nav"
              @mousedown.stop.prevent
              @click.stop="changePanel('right', 1, 'year')"
            >
              <el-icon><DArrowRight /></el-icon>
            </button>
          </div>

          <template v-if="getPanelView('right') === 'date'">
            <div class="mt-date-picker__weekdays">
              <span
                v-for="label in weekLabels"
                :key="`right-week-${label}`"
                class="mt-date-picker__weekday"
              >
                {{ label }}
              </span>
            </div>

            <div class="mt-date-picker__calendar">
              <template v-for="cell in rightCalendarCells">
                <button
                  v-if="cell.date"
                  :key="`right-date-${cell.key}`"
                  type="button"
                  class="mt-date-picker__date"
                  :class="getDateCellClass(cell.date, cell.currentMonth, 'end')"
                  :disabled="isDateDisabled(cell.date, 'end')"
                  @click="handleDateSelect(cell.date, 'end')"
                >
                  {{ cell.date.date() }}
                </button>
                <span
                  v-else
                  :key="`right-${cell.key}`"
                  class="mt-date-picker__date is-placeholder"
                ></span>
              </template>
            </div>
          </template>
          <div
            v-else-if="showYear && getPanelView('right') === 'year'"
            class="mt-date-picker__year-panel-body"
          >
            <button
              v-for="year in rightYearPanelYears"
              :key="`right-year-${year}`"
              type="button"
              class="mt-date-picker__year-btn"
              :class="{ 'is-selected': getPanelDate('right').year() === year }"
              @click="handleQuickYearSelect(year, 'right')"
            >
              {{ year }}
            </button>
          </div>
          <div
            v-else
            class="mt-date-picker__month-panel-body"
          >
            <button
              v-for="month in monthOptions"
              :key="`right-month-${month.value}`"
              type="button"
              class="mt-date-picker__month-btn"
              :class="{ 'is-selected': getPanelDate('right').month() + 1 === month.value }"
              @click="handleQuickMonthSelect(month.value, 'right')"
            >
              {{ month.label }}
            </button>
          </div>

          <div
            v-if="showHourPanel && getPanelView('right') === 'date'"
            class="mt-date-picker__time-section"
          >
            <div
              class="mt-date-picker__time-picker"
              :class="{ 'is-disabled': isHourDisabled('end') }"
            >
              <div
                class="mt-date-picker__time-columns"
                :class="{ 'is-single-column': !showMinute }"
              >
                <div
                  :ref="el => setTimeColumnRef('end', 'hour', el)"
                  class="mt-date-picker__time-column"
                >
                  <button
                    v-for="hour in getAvailableHours('end')"
                    :key="`right-hour-${hour}`"
                    type="button"
                    class="mt-date-picker__time-option"
                    :class="{ 'is-selected': getSelectedTimePart('end', 'hour') === hour }"
                    :data-selected="getSelectedTimePart('end', 'hour') === hour ? 'true' : 'false'"
                    :disabled="isHourDisabled('end')"
                    @click="handleTimeUnitSelect('end', 'hour', hour)"
                  >
                    {{ formatTimeUnit(hour) }}时
                  </button>
                </div>
                <div
                  v-if="showMinute"
                  :ref="el => setTimeColumnRef('end', 'minute', el)"
                  class="mt-date-picker__time-column"
                >
                  <button
                    v-for="minute in getAvailableMinutesForSelectedHour('end')"
                    :key="`right-minute-${minute}`"
                    type="button"
                    class="mt-date-picker__time-option"
                    :class="{ 'is-selected': getSelectedTimePart('end', 'minute') === minute }"
                    :data-selected="getSelectedTimePart('end', 'minute') === minute ? 'true' : 'false'"
                    :disabled="isHourDisabled('end')"
                    @click="handleTimeUnitSelect('end', 'minute', minute)"
                  >
                    {{ formatTimeUnit(minute) }}分
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="showHourPanel"
        class="mt-date-picker__footer"
      >
        <button
          type="button"
          class="mt-date-picker__footer-btn"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          type="button"
          class="mt-date-picker__footer-btn is-primary"
          :disabled="confirmDisabled"
          @click="handleConfirm"
        >
          确认
        </button>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage as Message } from 'element-plus'
import { ArrowLeft, ArrowRight, Calendar, CircleClose, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import type { Dayjs } from 'dayjs'
import type { DateDraft, DateModelValue, PanelType, SelectionMode, TimeListExpose, TimeListItem } from '../type'
import { buildSortedSelectedTimeList, normalizeTimeListStep } from '../timeList'

defineOptions({ name: 'MtDate' })

type DateCell = {
  key: string
  date: Dayjs | null
  currentMonth: boolean
}

type DatePanelKey = 'left' | 'right'
type DatePanelView = 'date' | 'year' | 'month'
type TimeUnit = 'hour' | 'minute'

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
    showHour?: boolean
    showMinute?: boolean
    hourStep?: number
    minuteStep?: number
    format?: string
    valueFormat?: string
    disabledDates?: string[]
    disabledDate?: (date: Dayjs, panel: PanelType, rangeValue?: [Dayjs | null, Dayjs | null]) => boolean
    disabledHours?: (
      panel: PanelType,
      selectedDate?: Dayjs | null,
      rangeValue?: [Dayjs | null, Dayjs | null]
    ) => number[]
    disabledMinutes?: (hour: number, panel: PanelType) => number[]
  }>(),
  {
    mode: 'single',
    placeholder: '请选择日期',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    rangeSeparator: '至',
    disabled: false,
    clearable: true,
    showYear: true,
    showHour: false,
    showMinute: true,
    hourStep: 1,
    minuteStep: 1,
    disabledDates: () => []
  }
)

const model = defineModel<DateModelValue>({ default: null })

const visible = ref(false)
const userInput = ref<string | null>(null)
const rangeUserInput = ref<[string | null, string | null]>([null, null])
const leftPanelDate = ref(dayjs().startOf('month'))
const rightPanelDate = ref(dayjs().add(1, 'month').startOf('month'))
const pendingSingle = ref<Dayjs | null>(null)
const pendingRange = ref<[Dayjs | null, Dayjs | null]>([null, null])
const activeRangePanel = ref<'start' | 'end' | null>(null)
const multipleAnchorMonth = ref<Dayjs | null>(null)
const keepVisibleOnInternalAction = ref(false)
const leftPanelView = ref<DatePanelView>('date')
const rightPanelView = ref<DatePanelView>('date')
const leftYearPanelStart = ref(getInitialYearPanelStart(dayjs().year()))
const rightYearPanelStart = ref(getInitialYearPanelStart(dayjs().year()))
const timeColumnRefs = {
  single: {
    hour: ref<HTMLElement | null>(null),
    minute: ref<HTMLElement | null>(null)
  },
  start: {
    hour: ref<HTMLElement | null>(null),
    minute: ref<HTMLElement | null>(null)
  },
  end: {
    hour: ref<HTMLElement | null>(null),
    minute: ref<HTMLElement | null>(null)
  }
} as const

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  label: `${index + 1}月`,
  value: index + 1
}))
const fullHours = Array.from({ length: 24 }, (_, index) => index)
const fullMinutes = Array.from({ length: 60 }, (_, index) => index)

const isRangeMode = computed(() => props.mode === 'range')
const showYear = computed(() => props.showYear)
const showHourPanel = computed(() => props.showHour && props.mode !== 'multiple')
const showMinute = computed(() => props.showMinute)
const popoverWidth = computed(() => (isRangeMode.value ? 720 : 360))
const hourStep = computed(() => normalizeStep(props.hourStep))
const minuteStep = computed(() => normalizeStep(props.minuteStep))
const inputPlaceholder = computed(() =>
  isRangeMode.value ? `${props.startPlaceholder} ${props.rangeSeparator} ${props.endPlaceholder}` : props.placeholder
)

interface PanelTimeAvailability {
  configuredDisabledHours: number[]
  resolvedDisabledHours: number[]
  availableHours: number[]
  configuredDisabledMinutesMap: Record<number, number[]>
  availableMinutesMap: Record<number, number[]>
}

function setTimeColumnRef(panel: PanelType, unit: TimeUnit, element: unknown) {
  timeColumnRefs[panel][unit].value = element instanceof HTMLElement ? element : null
}

function formatTimeUnit(value: number) {
  return String(value).padStart(2, '0')
}

function normalizeStep(step: number | undefined) {
  const normalized = Number(step)
  return Number.isFinite(normalized) && normalized > 0 ? Math.floor(normalized) : 1
}

function sanitizeDisabledUnit(values: number[] | undefined, max: number) {
  if (!Array.isArray(values)) {
    return []
  }

  return Array.from(new Set(values.filter(value => Number.isInteger(value) && value >= 0 && value <= max))).sort(
    (a, b) => a - b
  )
}

function computeConfiguredDisabledHours(panel: PanelType) {
  const disabled = new Set<number>()

  if (hourStep.value > 1) {
    fullHours.forEach(hour => {
      if (hour % hourStep.value !== 0) {
        disabled.add(hour)
      }
    })
  }

  sanitizeDisabledUnit(
    props.disabledHours?.(
      panel,
      getSelectedDateForDisabledContext(panel),
      getHourRangeSelectionForDisabledContext(panel)
    ),
    23
  ).forEach(hour => disabled.add(hour))

  return Array.from(disabled).sort((a, b) => a - b)
}

function computeConfiguredDisabledMinutes(hour: number, panel: PanelType) {
  const disabled = new Set<number>()

  if (!showMinute.value) {
    fullMinutes.forEach(minute => {
      if (minute !== 0) {
        disabled.add(minute)
      }
    })
  }

  if (minuteStep.value > 1) {
    fullMinutes.forEach(minute => {
      if (minute % minuteStep.value !== 0) {
        disabled.add(minute)
      }
    })
  }

  sanitizeDisabledUnit(props.disabledMinutes?.(hour, panel), 59).forEach(minute => disabled.add(minute))

  return Array.from(disabled).sort((a, b) => a - b)
}

function buildPanelTimeAvailability(panel: PanelType): PanelTimeAvailability {
  const configuredDisabledHours = computeConfiguredDisabledHours(panel)
  const configuredDisabledHourSet = new Set(configuredDisabledHours)
  const resolvedDisabledHourSet = new Set(configuredDisabledHours)
  const configuredDisabledMinutesMap: Record<number, number[]> = {}
  const availableMinutesMap: Record<number, number[]> = {}

  fullHours.forEach(hour => {
    const configuredDisabledMinutes = computeConfiguredDisabledMinutes(hour, panel)
    configuredDisabledMinutesMap[hour] = configuredDisabledMinutes

    if (configuredDisabledHourSet.has(hour)) {
      availableMinutesMap[hour] = []
      return
    }

    const disabledMinutes = new Set(configuredDisabledMinutes)
    const availableMinutes = fullMinutes.filter(minute => !disabledMinutes.has(minute))
    availableMinutesMap[hour] = availableMinutes

    if (!availableMinutes.length) {
      resolvedDisabledHourSet.add(hour)
    }
  })

  const resolvedDisabledHours = Array.from(resolvedDisabledHourSet).sort((a, b) => a - b)
  const availableHours = fullHours.filter(hour => !resolvedDisabledHourSet.has(hour))

  return {
    configuredDisabledHours,
    resolvedDisabledHours,
    availableHours,
    configuredDisabledMinutesMap,
    availableMinutesMap
  }
}

const singlePanelTimeAvailability = computed(() => buildPanelTimeAvailability('single'))
const startPanelTimeAvailability = computed(() => buildPanelTimeAvailability('start'))
const endPanelTimeAvailability = computed(() => buildPanelTimeAvailability('end'))

function getPanelTimeAvailability(panel: PanelType) {
  if (panel === 'single') {
    return singlePanelTimeAvailability.value
  }
  if (panel === 'start') {
    return startPanelTimeAvailability.value
  }
  return endPanelTimeAvailability.value
}

function getAvailableMinutesForHour(hour: number, panel: PanelType) {
  return getPanelTimeAvailability(panel).availableMinutesMap[hour] ?? []
}

function getResolvedDisabledHours(panel: PanelType) {
  return getPanelTimeAvailability(panel).resolvedDisabledHours
}

function getResolvedDisabledMinutes(hour: number, panel: PanelType) {
  if (getResolvedDisabledHours(panel).includes(hour)) {
    return [...fullMinutes]
  }

  return getPanelTimeAvailability(panel).configuredDisabledMinutesMap[hour] ?? []
}

function getAvailableHours(panel: PanelType) {
  return getPanelTimeAvailability(panel).availableHours
}

function getAvailableMinutesForSelectedHour(panel: PanelType) {
  const selected = panel === 'single' ? getSelectedSingleDate() : getSelectedRangeDate(panel)
  const hour = selected?.hour()
  if (typeof hour === 'number' && !Number.isNaN(hour)) {
    return getAvailableMinutesForHour(hour, panel)
  }

  const fallbackHour = getAvailableHours(panel)[0]
  return typeof fallbackHour === 'number' ? getAvailableMinutesForHour(fallbackHour, panel) : []
}

function pickNearestValue(values: number[], preferred: number) {
  if (!values.length) {
    return null
  }

  return values.reduce<number | null>((closest, value) => {
    if (closest === null) {
      return value
    }

    const currentDistance = Math.abs(value - preferred)
    const closestDistance = Math.abs(closest - preferred)
    if (currentDistance === closestDistance) {
      return value < closest ? value : closest
    }
    return currentDistance < closestDistance ? value : closest
  }, null)
}

function resolveAvailableTime(
  panel: PanelType,
  preferred: Dayjs | { hour: number; minute: number } | null | undefined
) {
  const source = preferred ?? dayjs()
  const preferredHour = dayjs.isDayjs(source) ? source.hour() : source.hour
  const preferredMinute = showMinute.value ? (dayjs.isDayjs(source) ? source.minute() : source.minute) : 0
  const hour = pickNearestValue(getAvailableHours(panel), preferredHour)

  if (hour === null) {
    return null
  }

  const minute = pickNearestValue(getAvailableMinutesForHour(hour, panel), preferredMinute)
  if (minute === null) {
    return null
  }

  return { hour, minute }
}

function applyPreferredTime(
  date: Dayjs,
  panel: PanelType,
  preferred?: Dayjs | { hour: number; minute: number } | null
) {
  if (!props.showHour) {
    return normalizeDate(date)
  }

  const resolvedTime = resolveAvailableTime(panel, preferred)
  if (!resolvedTime) {
    return null
  }

  return normalizeDate(date.hour(resolvedTime.hour).minute(resolvedTime.minute))
}

function isTimeDisabled(date: Dayjs, panel: PanelType) {
  if (!props.showHour) {
    return false
  }

  const hour = date.hour()
  const minute = showMinute.value ? date.minute() : 0
  if (getResolvedDisabledHours(panel).includes(hour)) {
    return true
  }

  return getResolvedDisabledMinutes(hour, panel).includes(minute)
}

function getResolvedValueFormat() {
  if (props.valueFormat) {
    return props.valueFormat
  }
  return 'YYYY-MM-DD HH:mm:00'
}

function getResolvedDisplayFormat() {
  if (props.format) {
    return props.format
  }
  if (props.valueFormat) {
    return props.valueFormat
  }
  if (showYear.value) {
    return props.showHour ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'
  }
  return props.showHour ? 'MM-DD HH:mm' : 'MM-DD'
}

function getDisplayText(date: Dayjs) {
  return date.format(getResolvedDisplayFormat())
}

function getDateKey(date: Dayjs) {
  return showYear.value ? date.format('YYYY-MM-DD') : date.format('MM-DD')
}

function hasExplicitTime(value: string | null | undefined) {
  return typeof value === 'string' && /(?:\s|T)\d{1,2}(?::\d{1,2})?$/.test(value.trim())
}

function applyCurrentTime(date: Dayjs, panel: PanelType) {
  return applyPreferredTime(date, panel, dayjs())
}

function normalizeDate(date: Dayjs) {
  if (props.showHour) {
    return date
      .minute(showMinute.value ? date.minute() : 0)
      .second(0)
      .millisecond(0)
  }
  return date.startOf('day')
}

function buildDateFromDraft(draft: DateDraft) {
  if (draft.month === null || draft.day === null) {
    return null
  }

  const date = dayjs(new Date(draft.year, draft.month - 1, draft.day, draft.hour ?? 0, draft.minute ?? 0, 0, 0))
  if (!date.isValid() || date.year() !== draft.year || date.month() !== draft.month - 1 || date.date() !== draft.day) {
    return null
  }

  return normalizeDate(date)
}

function isCompleteDraft(draft: DateDraft | null): draft is DateDraft & { month: number; day: number } {
  return draft !== null && draft.month !== null && draft.day !== null
}

function parseUserTextToDate(text: string): DateDraft | null {
  const normalizedText = text
    .trim()
    .replace(/\//g, '-')
    .replace(/年/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .replace(/时/g, ':00')
    .replace(/分/g, '')
    .replace(/T/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/-$/, '')

  if (!normalizedText) {
    return null
  }

  if (!showYear.value) {
    const monthDayMatch = normalizedText.match(/^([01]?\d)[-/月\s]+([0-3]?\d)(?:日)?(?:\s+(\d{1,2})(?::(\d{1,2}))?)?$/)
    if (monthDayMatch) {
      const month = Number(monthDayMatch[1])
      const day = Number(monthDayMatch[2])
      const hour = monthDayMatch[3] ? Number(monthDayMatch[3]) : null
      const minute = monthDayMatch[4] ? Number(monthDayMatch[4]) : 0

      if (
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= 31 &&
        (hour === null || (hour >= 0 && hour <= 23)) &&
        minute >= 0 &&
        minute <= 59
      ) {
        return {
          year: leftPanelDate.value.year(),
          month,
          day,
          hour,
          minute: hour !== null ? minute : null
        }
      }
    }

    const parsedWithoutYear = dayjs(normalizedText)
    if (parsedWithoutYear.isValid() && /\d{4}.+\d{1,2}.+\d{1,2}/.test(normalizedText)) {
      return {
        year: parsedWithoutYear.year(),
        month: parsedWithoutYear.month() + 1,
        day: parsedWithoutYear.date(),
        hour: parsedWithoutYear.hour(),
        minute: parsedWithoutYear.minute()
      }
    }
  }

  const match = normalizedText.match(/^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?(?:\s+(\d{1,2})(?::(\d{1,2}))?)?$/)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = match[2] ? Number(match[2]) : null
  const day = match[3] ? Number(match[3]) : null
  const hour = match[4] ? Number(match[4]) : null
  const minute = match[5] ? Number(match[5]) : 0

  if (month !== null && (month < 1 || month > 12)) {
    return null
  }
  if (day !== null && (day < 1 || day > 31)) {
    return null
  }
  if (hour !== null && (hour < 0 || hour > 23)) {
    return null
  }
  if (minute < 0 || minute > 59) {
    return null
  }

  return {
    year,
    month,
    day,
    hour,
    minute: hour !== null ? minute : null
  }
}

function parseDateValue(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const draft = parseUserTextToDate(value)
  if (isCompleteDraft(draft)) {
    const parsed = buildDateFromDraft(draft)
    if (parsed) {
      return parsed
    }
  }

  const date = dayjs(value)
  if (!date.isValid()) {
    return null
  }
  return normalizeDate(date)
}

function parseDateValueWithDefaultTime(value: string | null | undefined, panel: PanelType = 'single') {
  const parsed = parseDateValue(value)
  if (!parsed) {
    return null
  }

  if (props.showHour && !hasExplicitTime(value)) {
    return applyCurrentTime(parsed, panel)
  }

  return isTimeDisabled(parsed, panel) ? null : parsed
}

function formatModelValue(date: Dayjs) {
  return normalizeDate(date).format(getResolvedValueFormat())
}

function getModelRangeValue() {
  return Array.isArray(model.value) ? (model.value as [string | null, string | null]) : [null, null]
}

const displayValue = computed(() => {
  if (props.mode === 'single') {
    const parsed = parseDateValueWithDefaultTime(model.value as string | null, 'single')
    return parsed ? getDisplayText(parsed) : ''
  }

  if (props.mode === 'multiple') {
    return ((model.value as string[]) || [])
      .map(item => parseDateValue(item))
      .filter((item): item is Dayjs => item !== null)
      .map(item => getDisplayText(item))
      .join(', ')
  }

  const [start, end] = getModelRangeValue()
  const startParsed = parseDateValueWithDefaultTime(start, 'start')
  const endParsed = parseDateValueWithDefaultTime(end, 'end')
  if (!startParsed && !endParsed) {
    return ''
  }

  const startText = startParsed ? getDisplayText(startParsed) : props.startPlaceholder
  const endText = endParsed ? getDisplayText(endParsed) : props.endPlaceholder
  return `${startText} ${props.rangeSeparator} ${endText}`
})

const inputValue = computed({
  get() {
    return userInput.value !== null ? userInput.value : displayValue.value
  },
  set(value: string) {
    userInput.value = value
  }
})

const rangeStartInputValue = computed({
  get() {
    if (rangeUserInput.value[0] !== null) {
      return rangeUserInput.value[0]
    }

    const [start] = getModelRangeValue()
    const parsed = parseDateValueWithDefaultTime(start, 'start')
    return parsed ? getDisplayText(parsed) : ''
  },
  set(value: string) {
    rangeUserInput.value = [value, rangeUserInput.value[1]]
  }
})

const rangeEndInputValue = computed({
  get() {
    if (rangeUserInput.value[1] !== null) {
      return rangeUserInput.value[1]
    }

    const [, end] = getModelRangeValue()
    const parsed = parseDateValueWithDefaultTime(end, 'end')
    return parsed ? getDisplayText(parsed) : ''
  },
  set(value: string) {
    rangeUserInput.value = [rangeUserInput.value[0], value]
  }
})

const hasValue = computed(() => {
  if (props.mode === 'range') {
    return !!rangeStartInputValue.value || !!rangeEndInputValue.value
  }

  if (userInput.value !== null && userInput.value.trim() !== '') {
    return true
  }

  if (props.mode === 'single') {
    return !!model.value
  }
  if (props.mode === 'multiple') {
    return Array.isArray(model.value) && model.value.length > 0
  }

  const [start, end] = getModelRangeValue()
  return !!start || !!end
})

const disabledDateSet = computed(() => {
  const dates = new Set<string>()
  props.disabledDates.forEach(item => {
    const parsed = parseDateValue(item)
    if (parsed) {
      dates.add(getDateKey(parsed))
    }
  })
  return dates
})

const leftCalendarCells = computed(() => buildCalendarCells(leftPanelDate.value))
const rightCalendarCells = computed(() => buildCalendarCells(rightPanelDate.value))
const leftYearPanelYears = computed(() => Array.from({ length: 16 }, (_, index) => leftYearPanelStart.value + index))
const rightYearPanelYears = computed(() => Array.from({ length: 16 }, (_, index) => rightYearPanelStart.value + index))

const confirmDisabled = computed(() => showHourPanel.value && props.mode === 'single' && pendingSingle.value === null)

function isSameModelValue(valueA: DateModelValue, valueB: DateModelValue) {
  return JSON.stringify(valueA) === JSON.stringify(valueB)
}

function sanitizeDateModelValue(): DateModelValue {
  if (props.mode === 'single') {
    const parsed = parseDateValueWithDefaultTime(typeof model.value === 'string' ? model.value : null, 'single')
    if (!parsed || isDateDisabled(parsed, 'single')) {
      return null
    }
    return formatModelValue(parsed)
  }

  if (props.mode === 'multiple') {
    if (!Array.isArray(model.value)) {
      return []
    }

    return [
      ...new Set(
        model.value
          .map(item => parseDateValueWithDefaultTime(typeof item === 'string' ? item : null, 'single'))
          .filter((item): item is Dayjs => item !== null)
          .filter(item => !isDateDisabled(item, 'single'))
          .map(item => formatModelValue(item))
      )
    ].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
  }

  const [start, end] = getModelRangeValue()
  const startParsed = parseDateValueWithDefaultTime(start, 'start')
  const endParsed = parseDateValueWithDefaultTime(end, 'end')

  return [
    startParsed && !isDateDisabled(startParsed, 'start') ? formatModelValue(startParsed) : null,
    endParsed && !isDateDisabled(endParsed, 'end') ? formatModelValue(endParsed) : null
  ]
}

function syncPanels() {
  const currentMonth = dayjs().startOf('month')
  leftPanelView.value = 'date'
  rightPanelView.value = 'date'

  if (props.mode === 'range') {
    const [start, end] = getModelRangeValue()
    const startParsed = parseDateValueWithDefaultTime(start, 'start')
    const endParsed = parseDateValueWithDefaultTime(end, 'end')

    if (startParsed && endParsed) {
      leftPanelDate.value = startParsed.startOf('month')
      rightPanelDate.value = endParsed.startOf('month')
    } else if (startParsed) {
      leftPanelDate.value = startParsed.startOf('month')
      rightPanelDate.value = leftPanelDate.value.add(1, 'month')
    } else if (endParsed) {
      rightPanelDate.value = endParsed.startOf('month')
      leftPanelDate.value = rightPanelDate.value.subtract(1, 'month')
    } else {
      leftPanelDate.value = currentMonth
      rightPanelDate.value = currentMonth.add(1, 'month')
    }

    leftYearPanelStart.value = getInitialYearPanelStart(leftPanelDate.value.year())
    rightYearPanelStart.value = getInitialYearPanelStart(rightPanelDate.value.year())
    pendingRange.value = [parseDateValueWithDefaultTime(start, 'start'), parseDateValueWithDefaultTime(end, 'end')]
    activeRangePanel.value = null
    return
  }

  let anchor
  if (props.mode === 'single') {
    anchor = parseDateValue(model.value as string | null)?.startOf('month') ?? currentMonth
    pendingSingle.value = parseDateValueWithDefaultTime(model.value as string | null, 'single')
  } else {
    const values = ((model.value as string[]) || [])
      .map(item => parseDateValue(item))
      .filter((item): item is Dayjs => item !== null)
    anchor = multipleAnchorMonth.value ?? values.at(-1)?.startOf('month') ?? currentMonth
    pendingSingle.value = null
  }

  leftPanelDate.value = anchor
  leftYearPanelStart.value = getInitialYearPanelStart(leftPanelDate.value.year())
}

function buildCalendarCells(panelDate: Dayjs) {
  if (props.mode === 'multiple') {
    const firstDayOfMonth = panelDate.startOf('month')
    const daysInMonth = panelDate.daysInMonth()
    const leadingEmptyCount = firstDayOfMonth.day()
    const totalCellCount = Math.ceil((leadingEmptyCount + daysInMonth) / 7) * 7
    const trailingEmptyCount = totalCellCount - leadingEmptyCount - daysInMonth
    const cells: DateCell[] = []

    for (let index = 0; index < leadingEmptyCount; index += 1) {
      cells.push({
        key: `empty-start-${index}`,
        date: null,
        currentMonth: false
      })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        key: panelDate.date(day).format('YYYY-MM-DD'),
        date: panelDate.date(day),
        currentMonth: true
      })
    }

    for (let index = 0; index < trailingEmptyCount; index += 1) {
      cells.push({
        key: `empty-end-${index}`,
        date: null,
        currentMonth: false
      })
    }

    return cells
  }

  const startDate = panelDate.startOf('month').subtract(panelDate.startOf('month').day(), 'day')
  return Array.from({ length: 42 }, (_, index): DateCell => {
    const cellDate = startDate.add(index, 'day')
    return {
      key: cellDate.format('YYYY-MM-DD'),
      date: cellDate,
      currentMonth: cellDate.month() === panelDate.month()
    }
  })
}

function isDateDisabled(date: Dayjs, panel: PanelType) {
  const normalizedDate = normalizeDate(date)
  if (disabledDateSet.value.has(getDateKey(normalizedDate))) {
    return true
  }

  if (props.disabledDate?.(normalizedDate.startOf('day'), panel, getRangeSelectionForDisabledContext()) ?? false) {
    return true
  }

  return props.showHour ? getAvailableHours(panel).length === 0 : false
}

function getInitialYearPanelStart(year: number) {
  return Math.floor(year / 10) * 10
}

function getPanelDate(panel: DatePanelKey) {
  return panel === 'left' ? leftPanelDate.value : rightPanelDate.value
}

function setPanelDate(panel: DatePanelKey, value: Dayjs) {
  if (panel === 'left') {
    leftPanelDate.value = value
  } else {
    rightPanelDate.value = value
  }
}

function getPanelView(panel: DatePanelKey) {
  return panel === 'left' ? leftPanelView.value : rightPanelView.value
}

function setPanelView(panel: DatePanelKey, value: DatePanelView) {
  if (panel === 'left') {
    leftPanelView.value = value
  } else {
    rightPanelView.value = value
  }
}

function setYearPanelStart(panel: DatePanelKey, value: number) {
  if (panel === 'left') {
    leftYearPanelStart.value = value
  } else {
    rightYearPanelStart.value = value
  }
}

function getSelectedSingleDate() {
  if (showHourPanel.value && visible.value) {
    return pendingSingle.value
  }
  return parseDateValueWithDefaultTime(model.value as string | null, 'single')
}

function getCurrentRangeSelection(): [Dayjs | null, Dayjs | null] | undefined {
  if (props.mode !== 'range') {
    return undefined
  }

  return [getSelectedRangeDate('start'), getSelectedRangeDate('end')]
}

function getRangeSelectionForDisabledContext(): [Dayjs | null, Dayjs | null] | undefined {
  if (props.mode !== 'range') {
    return undefined
  }

  const start = getSelectedRangeDateForDisabledContext('start')
  const end = getSelectedRangeDateForDisabledContext('end')

  return [start, end]
}

function getHourRangeSelectionForDisabledContext(panel?: PanelType): [Dayjs | null, Dayjs | null] | undefined {
  const rangeSelection = getRangeSelectionForDisabledContext()
  if (!rangeSelection) {
    return undefined
  }

  const [start, end] = rangeSelection

  if (!showHourPanel.value || !visible.value || panel === 'single' || activeRangePanel.value === null) {
    return [start, end]
  }

  if (activeRangePanel.value === 'start') {
    return panel === 'start' ? [start, end] : [null, end]
  }

  return panel === 'end' ? [start, end] : [start, null]
}

function getSelectedDateForPanel(panel: PanelType) {
  if (panel === 'single') {
    return getSelectedSingleDate()
  }

  return getSelectedRangeDate(panel)
}

function getSelectedDateForDisabledContext(panel: PanelType) {
  if (panel === 'single') {
    return getSelectedSingleDateForDisabledContext()
  }

  return getSelectedRangeDateForDisabledContext(panel)
}

function getSelectedRangeDate(panel: 'start' | 'end') {
  if (showHourPanel.value && visible.value) {
    return panel === 'start' ? pendingRange.value[0] : pendingRange.value[1]
  }

  const [start, end] = getModelRangeValue()
  return parseDateValueWithDefaultTime(panel === 'start' ? start : end, panel)
}

function getSelectedSingleDateForDisabledContext() {
  if (showHourPanel.value && visible.value) {
    return pendingSingle.value
  }

  return parseDateValue(model.value as string | null)
}

function getSelectedRangeDateForDisabledContext(panel: 'start' | 'end') {
  if (showHourPanel.value && visible.value) {
    return panel === 'start' ? pendingRange.value[0] : pendingRange.value[1]
  }

  const [start, end] = getModelRangeValue()
  return parseDateValue(panel === 'start' ? start : end)
}

function getDateCellClass(date: Dayjs, currentMonth: boolean, panel: PanelType) {
  const dateKey = getDateKey(date)
  const normalizedDate = date.startOf('day')
  let isSelected = false

  if (props.mode === 'single') {
    isSelected = getDateKey(getSelectedSingleDate() ?? dayjs('1900-01-01')) === dateKey
  } else if (props.mode === 'multiple') {
    isSelected =
      Array.isArray(model.value) &&
      model.value
        .map(item => parseDateValue(item))
        .filter((item): item is Dayjs => item !== null)
        .some(item => getDateKey(item) === dateKey)
  } else {
    const start = getSelectedRangeDate('start')
    const end = getSelectedRangeDate('end')
    if (panel === 'start') {
      isSelected = start ? getDateKey(start) === dateKey : false
    } else if (panel === 'end') {
      isSelected = end ? getDateKey(end) === dateKey : false
    }
  }

  return {
    'is-selected': isSelected,
    'is-outside': !currentMonth,
    'is-today': normalizedDate.isSame(dayjs(), 'day'),
    'is-disabled': isDateDisabled(date, panel)
  }
}

function isHourDisabled(panel: PanelType) {
  if (props.mode === 'single') {
    return getSelectedSingleDate() === null || getAvailableHours(panel).length === 0
  }

  if (props.mode === 'range') {
    return getSelectedRangeDate(panel === 'end' ? 'end' : 'start') === null || getAvailableHours(panel).length === 0
  }

  return true
}

function getSelectedTimePart(panel: PanelType, unit: TimeUnit) {
  const selected = panel === 'single' ? getSelectedSingleDate() : getSelectedRangeDate(panel)
  if (!selected) {
    return null
  }

  return unit === 'hour' ? selected.hour() : selected.minute()
}

function scrollTimeColumnToSelection(panel: PanelType, unit: TimeUnit, behavior: ScrollBehavior = 'auto') {
  const container = timeColumnRefs[panel][unit].value
  if (!container) {
    return
  }

  const selectedOption = container.querySelector<HTMLElement>('[data-selected="true"]')
  if (!selectedOption) {
    return
  }

  const containerRect = container.getBoundingClientRect()
  const optionRect = selectedOption.getBoundingClientRect()
  const offset = optionRect.top - containerRect.top - (containerRect.height - optionRect.height) / 2
  container.scrollTo({
    top: Math.max(0, container.scrollTop + offset),
    behavior
  })
}

function queueScrollTimeColumns(panel: PanelType, behavior: ScrollBehavior = 'auto') {
  nextTick(() => {
    scrollTimeColumnToSelection(panel, 'hour', behavior)
    if (showMinute.value) {
      scrollTimeColumnToSelection(panel, 'minute', behavior)
    }

    window.setTimeout(() => {
      scrollTimeColumnToSelection(panel, 'hour', 'auto')
      if (showMinute.value) {
        scrollTimeColumnToSelection(panel, 'minute', 'auto')
      }
    }, 16)
  })
}

function handleTimeUnitSelect(panel: PanelType, unit: TimeUnit, value: number) {
  if (isHourDisabled(panel)) {
    return
  }

  const current =
    panel === 'single' ? pendingSingle.value : panel === 'start' ? pendingRange.value[0] : pendingRange.value[1]
  if (!current) {
    return
  }

  const nextHour = unit === 'hour' ? value : current.hour()
  const availableMinutes = getAvailableMinutesForHour(nextHour, panel)
  const nextMinute =
    unit === 'minute' ? value : pickNearestValue(availableMinutes, showMinute.value ? current.minute() : 0)

  if (nextMinute === null) {
    return
  }

  const nextValue = normalizeDate(current.hour(nextHour).minute(nextMinute))
  if (props.mode === 'range' && current && nextValue.isSame(current, showMinute.value ? 'minute' : 'hour')) {
    pendingRange.value = panel === 'start' ? [null, pendingRange.value[1]] : [pendingRange.value[0], null]
    return
  }

  if (isTimeDisabled(nextValue, panel)) {
    return
  }

  if (panel === 'single') {
    pendingSingle.value = nextValue
  } else if (panel === 'start') {
    pendingRange.value = [nextValue, pendingRange.value[1]]
  } else {
    pendingRange.value = [pendingRange.value[0], nextValue]
  }

  queueScrollTimeColumns(panel, 'smooth')
}

function changePanel(panel: DatePanelKey, step: number, unit: 'year' | 'month') {
  if (!showYear.value && unit === 'year') {
    return
  }
  keepVisibleOnInternalAction.value = true
  visible.value = true

  if (getPanelView(panel) === 'year' && unit === 'year') {
    setYearPanelStart(panel, (panel === 'left' ? leftYearPanelStart.value : rightYearPanelStart.value) + step * 16)
    return
  }

  if (!showYear.value && unit === 'month') {
    const nextMonth = getPanelDate(panel).month() + step
    if (nextMonth < 0 || nextMonth > 11) {
      return
    }
  }

  const nextPanelDate = getPanelDate(panel).add(step, unit).startOf('month')
  setPanelDate(panel, nextPanelDate)
  setYearPanelStart(panel, getInitialYearPanelStart(nextPanelDate.year()))
}

function togglePanelView(panel: DatePanelKey, view: Exclude<DatePanelView, 'date'>) {
  if (!showYear.value && view === 'year') {
    return
  }
  keepVisibleOnInternalAction.value = true
  visible.value = true

  const nextView = getPanelView(panel) === view ? 'date' : view
  setPanelView(panel, nextView)

  if (view === 'year') {
    setYearPanelStart(panel, getInitialYearPanelStart(getPanelDate(panel).year()))
  }
}

function handleQuickYearSelect(year: number, panel: DatePanelKey) {
  keepVisibleOnInternalAction.value = true
  visible.value = true
  setPanelDate(panel, getPanelDate(panel).year(year).startOf('month'))
  setYearPanelStart(panel, getInitialYearPanelStart(year))
  setPanelView(panel, 'date')
}

function handleQuickMonthSelect(month: number, panel: DatePanelKey) {
  keepVisibleOnInternalAction.value = true
  visible.value = true
  setPanelDate(
    panel,
    getPanelDate(panel)
      .month(month - 1)
      .startOf('month')
  )
  setPanelView(panel, 'date')
}

function validateRangeOrder(start: Dayjs | null, end: Dayjs | null) {
  if (!showYear.value) {
    return true
  }
  if (!start || !end) {
    return true
  }

  if (start.isAfter(end)) {
    model.value = [null, null]
    Message.warning(props.showHour ? '开始时间不能大于结束时间' : '开始日期不能大于结束日期')
    return false
  }

  return true
}

function parseMultipleInputValue(value: string) {
  return value
    .split(/[,，]/)
    .map(part => part.trim())
    .filter(Boolean)
}

function handleInputChange(value: string) {
  const normalizedValue = value.trim()
  if (!normalizedValue) {
    userInput.value = null
    handleClear()
    syncPanels()
    return
  }

  if (props.mode === 'single') {
    const parsed = parseDateValueWithDefaultTime(normalizedValue, 'single')
    if (parsed && !isDateDisabled(parsed, 'single')) {
      const nextValue = parsed
      userInput.value = getDisplayText(nextValue)
      model.value = formatModelValue(nextValue)
      pendingSingle.value = nextValue
    } else {
      userInput.value = normalizedValue
    }
  } else if (props.mode === 'multiple') {
    const parsedValues = parseMultipleInputValue(normalizedValue)
      .map(item => parseDateValue(item))
      .filter((item): item is Dayjs => item !== null)
      .filter(item => !isDateDisabled(item, 'single'))

    multipleAnchorMonth.value = parsedValues.at(-1)?.startOf('month') ?? null
    userInput.value = parsedValues.map(item => getDisplayText(item)).join(', ')
    model.value = [...new Set(parsedValues.map(item => formatModelValue(item)))].sort(
      (a, b) => dayjs(a).valueOf() - dayjs(b).valueOf()
    )
  }

  syncPanels()
}

function updateRangeModelFromInput() {
  const startResolved = parseDateValueWithDefaultTime(rangeStartInputValue.value, 'start')
  const endResolved = parseDateValueWithDefaultTime(rangeEndInputValue.value, 'end')

  const startValue = startResolved && !isDateDisabled(startResolved, 'start') ? formatModelValue(startResolved) : null
  const endValue = endResolved && !isDateDisabled(endResolved, 'end') ? formatModelValue(endResolved) : null

  if (!validateRangeOrder(startResolved, endResolved)) {
    return
  }

  model.value = [startValue, endValue]
  pendingRange.value = [startResolved, endResolved]
}

function handleRangeInputChange(panel: 'start' | 'end', value: string) {
  activeRangePanel.value = panel
  const normalizedValue = value.trim()
  if (panel === 'start') {
    rangeUserInput.value = [normalizedValue || null, rangeUserInput.value[1]]
  } else {
    rangeUserInput.value = [rangeUserInput.value[0], normalizedValue || null]
  }

  if (!rangeUserInput.value[0] && !rangeUserInput.value[1]) {
    handleClear()
    syncPanels()
    return
  }

  updateRangeModelFromInput()
  syncPanels()
}

function handleDateSelect(date: Dayjs, panel: PanelType) {
  if (isDateDisabled(date, panel)) {
    return
  }

  const normalizedDate = normalizeDate(date)
  const isSinglePanel = props.mode === 'single'
  if (isSinglePanel && !date.isSame(leftPanelDate.value, 'month')) {
    leftPanelDate.value = date.startOf('month')
  }
  if (panel === 'start' && !date.isSame(leftPanelDate.value, 'month')) {
    leftPanelDate.value = date.startOf('month')
  }
  if (panel === 'end' && !date.isSame(rightPanelDate.value, 'month')) {
    rightPanelDate.value = date.startOf('month')
  }

  userInput.value = null
  rangeUserInput.value = [null, null]

  if (showHourPanel.value) {
    if (props.mode === 'single') {
      const current = pendingSingle.value ?? parseDateValueWithDefaultTime(model.value as string | null, 'single')
      pendingSingle.value = applyPreferredTime(normalizedDate, 'single', current ?? dayjs())
      queueScrollTimeColumns('single')
      return
    }

    if (props.mode === 'range') {
      const rangePanel = panel === 'end' ? 'end' : 'start'
      activeRangePanel.value = rangePanel
      const current = rangePanel === 'start' ? pendingRange.value[0] : pendingRange.value[1]
      if (current && current.isSame(normalizedDate, 'day')) {
        pendingRange.value = rangePanel === 'start' ? [null, pendingRange.value[1]] : [pendingRange.value[0], null]
        return
      }

      const source = rangePanel === 'start' ? pendingRange.value[0] : pendingRange.value[1]
      const nextValue = applyPreferredTime(normalizedDate, rangePanel, source ?? dayjs())
      if (nextValue) {
        pendingRange.value =
          rangePanel === 'start' ? [nextValue, pendingRange.value[1]] : [pendingRange.value[0], nextValue]
        queueScrollTimeColumns(rangePanel)
      }
    }
    return
  }

  if (props.mode === 'single') {
    model.value = formatModelValue(normalizedDate)
    visible.value = false
    return
  }

  if (props.mode === 'multiple') {
    multipleAnchorMonth.value = normalizedDate.startOf('month')
    leftPanelDate.value = normalizedDate.startOf('month')
    const valueKey = getDateKey(normalizedDate)
    const current = [...((model.value as string[] | null) ?? [])]
    const index = current.findIndex(item => {
      const parsed = parseDateValue(item)
      return parsed ? getDateKey(parsed) === valueKey : false
    })

    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(formatModelValue(normalizedDate))
    }

    current.sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
    model.value = current
    return
  }

  const [start, end] = getModelRangeValue()
  const current = panel === 'start' ? parseDateValue(start) : parseDateValue(end)
  if (current && current.isSame(normalizedDate, 'day')) {
    model.value = panel === 'start' ? [null, end] : [start, null]
    return
  }

  const nextStart = panel === 'start' ? normalizedDate : parseDateValue(start)
  const nextEnd = panel === 'end' ? normalizedDate : parseDateValue(end)

  if (!validateRangeOrder(nextStart, nextEnd)) {
    return
  }

  model.value = [
    panel === 'start' ? formatModelValue(normalizedDate) : start,
    panel === 'end' ? formatModelValue(normalizedDate) : end
  ]
}

function handleConfirm() {
  if (!showHourPanel.value) {
    return
  }

  if (props.mode === 'single') {
    model.value = pendingSingle.value ? formatModelValue(pendingSingle.value) : null
    visible.value = false
    return
  }

  const [start, end] = pendingRange.value
  if (!validateRangeOrder(start, end)) {
    pendingRange.value = [null, null]
    return
  }

  model.value = [start ? formatModelValue(start) : null, end ? formatModelValue(end) : null]
  activeRangePanel.value = null
  visible.value = false
}

function handleCancel() {
  activeRangePanel.value = null
  syncPanels()
  visible.value = false
}

function handleClear() {
  userInput.value = null
  rangeUserInput.value = [null, null]
  pendingSingle.value = null
  pendingRange.value = [null, null]
  activeRangePanel.value = null
  multipleAnchorMonth.value = null

  if (props.mode === 'single') {
    model.value = null
  } else if (props.mode === 'multiple') {
    model.value = []
  } else {
    model.value = [null, null]
  }
}

function createDateTimeItem(date: Dayjs): TimeListItem {
  return {
    label: getDisplayText(date),
    value: formatModelValue(date)
  }
}

function getSelectedTimeList(step = 1) {
  const normalizedStep = normalizeTimeListStep(step)

  if (props.mode === 'single') {
    const selected = getSelectedSingleDate()
    return selected ? [createDateTimeItem(selected)] : []
  }

  if (props.mode === 'multiple') {
    const selectedValues = (((model.value as string[] | null) ?? []) as string[])
      .map(item => parseDateValue(item))
      .filter((item): item is Dayjs => item !== null)

    return buildSortedSelectedTimeList(selectedValues, item => item.valueOf(), createDateTimeItem)
  }

  const start = getSelectedRangeDate('start')
  let end = getSelectedRangeDate('end')

  if (!start && !end) {
    return []
  }
  if (!start) {
    return end ? [createDateTimeItem(end)] : []
  }
  if (!end) {
    return [createDateTimeItem(start)]
  }

  if (!showYear.value && end.isBefore(start)) {
    end = end.add(1, 'year')
  }

  const unit: 'hour' | 'day' = props.showHour ? 'hour' : 'day'
  const items: TimeListItem[] = []
  let cursor = start

  while (cursor.valueOf() <= end.valueOf()) {
    items.push(createDateTimeItem(cursor))
    cursor = cursor.add(normalizedStep, unit)
  }

  const lastItem = items.at(-1)
  const endItem = createDateTimeItem(end)
  if (!lastItem || lastItem.value !== endItem.value) {
    items.push(endItem)
  }

  return items
}

watch(
  () => visible.value,
  isVisible => {
    if (!isVisible && keepVisibleOnInternalAction.value) {
      keepVisibleOnInternalAction.value = false
      visible.value = true
      return
    }

    if (isVisible) {
      userInput.value = null
      rangeUserInput.value = [null, null]
      activeRangePanel.value = null
      syncPanels()
      queueScrollTimeColumns('single')
      queueScrollTimeColumns('start')
      queueScrollTimeColumns('end')
    }
  }
)

defineExpose<TimeListExpose>({
  getSelectedTimeList
})

watch(
  [() => model.value, () => props.mode, () => props.showHour, disabledDateSet, () => props.disabledDate],
  () => {
    const sanitizedValue = sanitizeDateModelValue()
    if (!isSameModelValue(sanitizedValue, model.value)) {
      model.value = sanitizedValue
      return
    }

    if (!visible.value) {
      syncPanels()
    }
  },
  { deep: true, immediate: true }
)
</script>

<style scoped lang="scss">
@use './index';
</style>
