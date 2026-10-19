import { dayjs } from '../index'
import type { ManipulateType } from 'dayjs'
import type { TimeAxisConfig, TimeAxisData, TimeAxisDate } from './types'
import { deepObjectMerge, getClientX, getLabelWidth, getOffset, getPixel, setStyle } from '@/src/timeAxis/utils'
import { ElTooltip } from 'element-plus'
import { debounce } from 'lodash-es'

/**
 * 这里采用所有数据都是线性列表处理成不同层级格式化的tab
 * 播放采用模拟视频进度条的原理 当接口响应速度特别慢的时候 最后的播放间隔就变成了接口实际响应时间 不在增加接口请求间隔
 */
export default class TimeAxis {
  options: TimeAxisConfig = {
    type: 'block',
    ratio: 1,
    unit: 'day',
    formatList: [],
    freeze: false,
    // current: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    // startDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    // endDate: dayjs().add(10, 'days').format('YYYY-MM-DD HH:mm:ss'),
    extent: 0,
    closeType: 4,
    data: [],
    complement: false,
    position: 'start',
    loop: false,
    playInterval: 1000,
    requestLength: 5,
    dark: false,
    control: true,
    alwaysTooltip: false,
    blockStyle: {},
    controlStyle: {},
    sliderStyle: {
      labelCoefficient: 1.8,
      minGap: 10,
      progressHeight: 8,
      progressBorderRadius: 4,
      fontFamily: 'sans-serif',
      fontSize: 14,
      bold: false,
      bothEnds: 50,
      longTickWidth: 2,
      longTickHeight: 16,
      shortTickWidth: 2,
      shortTickHeight: 12,
      sliderButtonSize: 16,
      sliderButtonBorderWidth: 2
    }
  }

  sliderConfig = {
    // 两端留白距离
    bothEnds: 0,
    // 实际总宽度
    clientWidth: 0,
    // 上一次拖动位置
    clientX: 0,
    // 时间轴的偏移量
    offset: 0,
    // 刻度与刻度直接的间隔
    spacing: 0,
    // 刻度开始位置
    tickStartPosition: 0,
    // 按钮所在位置
    duty: 0,
    // 控制时间轴是否可以拖动
    canMove: false,
    // 拖动圆圈的位置
    buttonPosition: '0px',
    // 日期值
    value: '',
    // 选中日期值也是结束日期值
    label: '',
    // 控制tooltip是否显示
    tooltipVisible: false,
    // 控制圆圈是否在拖动中
    dragging: false
  }

  formatData: readonly TimeAxisData[][] = []

  originData: readonly TimeAxisDate[] = []

  sliderData: readonly TimeAxisData[] = []

  formatIds: number[] = []

  current: string | undefined

  currentIndex = 0

  requestCurrent: string | undefined

  requestIndex = 0

  requestLength = 1

  requestQuene: any[] = []

  style = ''

  firstEnableIndex = 0

  lastEnableIndex = 0

  playIntervalId: any = -1

  // 播放计数
  playCount = 0

  // 请求计数
  requestCount = 0

  playing = false

  playStatus = false

  playData = new Map<string, any>()

  key = JSON.stringify('timeAxis')

  axisWrapper: HTMLElement | null = null

  axisWrapperWidth = 0

  controlWrapper: HTMLElement | null = null

  controlWrapperWidth = 0

  contentWidth = 0

  progress: HTMLElement | null = null

  sliderTick: HTMLElement | null = null

  sliderMarks: HTMLElement | null = null

  slider: HTMLElement | null = null

  sliderBar: HTMLElement | null = null

  tooltip: typeof ElTooltip | null = null

  sliderMove: Function | undefined

  sliderUp: Function | undefined

  buttonMove: Function | undefined

  buttonUp: Function | undefined

  tooltipVisible = true
  startPlay?: () => void
  constructor(options: TimeAxisConfig) {
    this.options = deepObjectMerge(this.options, options)
    this.key = JSON.stringify(this.options) + new Date().getTime()
    setStyle(this.options)
    this.requestLength = this.options.requestLength!
    this.update()
    this.startPlay = options.startPlay
  }

  private createOriginData() {
    if (!this.options) return
    const unit = this.options.unit
    if (this.options.data && this.options.data.length) {
      this.originData = this.options.data ?? []
      // 只要一个用户数据不是日期就清掉格式化
      if (this.originData.some(it => !dayjs(it.date).isValid())) {
        this.options.formatList = []
      }
      return
    }
    if (this.options.startDate && this.options.endDate) {
      this.createOriginDataBySE() // 有开始日期和结束日期推断
    } else if (this.options.startDate && !this.options.endDate && this.options.extent) {
      const startDate = this.options.startDate
      this.options.endDate = dayjs(startDate)
        .add(this.options.extent, unit as ManipulateType)
        .format('YYYY-MM-DD HH:mm:ss')
      this.createOriginDataBySE()
    } else if (!this.options.startDate && this.options.endDate && this.options.extent) {
      const startDate = this.options.startDate
      const unit = this.options.unit
      this.options.startDate = dayjs(startDate)
        .subtract(this.options.extent, unit as ManipulateType)
        .format('YYYY-MM-DD HH:mm:ss')
      this.createOriginDataBySE()
    }
  }

  // private includes(date: string) {
  //   return this.originData.map(u => u.date).includes(date)
  // }

  // 去重的同时判断出当前时间的 下一层级是否全部是禁用状态 则上一层为禁用
  private unique(data: TimeAxisData[], i: number) {
    const obj: any = {}
    data.forEach(d => {
      if (!obj[d.label]) {
        const data = { ...d }
        if (i < this.options!.formatList!.length - 1) {
          data.disabled = this.isDisabled(d.label, i)
        }
        obj[d.label] = data
      }
    })
    return Object.values(obj) as TimeAxisData[]
  }

  private isDisabled(current: string, i: number) {
    const formatList = this.options?.formatList || []
    const disabledArr: boolean[] = []
    const formatStr = formatList[i]
    this.originData.forEach(it => {
      const value = dayjs(it.date).format(formatStr)
      if (current === value) {
        disabledArr.push(it.disabled)
      }
    })
    return disabledArr.every(b => b)
  }

  // 根据参数创建出线性的时间列表
  private createOriginDataBySE() {
    if (!this.options) return
    const startDate = this.options.startDate!
    const endDate = this.options.endDate!
    const closeType = this.options.closeType || 4
    const unit = this.options.unit || 'day'
    const ratio = this.options.ratio || 1
    let currentValue = dayjs(startDate).valueOf()
    const data: TimeAxisDate[] = []
    // 左闭
    if (closeType === 2 || closeType === 4) {
      data.push({
        date: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss'),
        disabled: false
      })
    }
    const max = dayjs(endDate).valueOf()
    while (currentValue <= max) {
      const date = dayjs(currentValue).add(ratio, unit as ManipulateType)
      currentValue = date.valueOf()
      if (currentValue <= max) {
        data.push({
          date: dayjs(currentValue).format('YYYY-MM-DD HH:mm:ss'),
          disabled: false
        })
      }
    }
    // 右闭
    // if ((closeType === 1 || closeType === 4) && !this.includes(endDate)) {
    //   this.originData.push({
    //     date: dayjs(endDate).format('YYYY-MM-DD HH:mm:ss'),
    //     disabled: false
    //   })
    // }
    this.originData = Object.freeze(data)
  }

  // 小时和分钟分辨率补全数据
  private complementData() {
    const unit = this.options?.unit
    const ratio = this.options?.ratio
    if (unit !== 'hour' && unit !== 'minutes') return
    if (!ratio) return
    const dateArr = this.originData.map(it => it.date)
    let data = [...this.originData]
    const max = unit === 'hour' ? 24 : 60
    if (unit === 'hour') {
      const dayStrArr = [...new Set(this.originData.map(it => dayjs(it.date).format('YYYY-MM-DD 00:mm:ss')))]
      for (let i = 0; i < max; i += ratio) {
        for (let j = 0; j < dayStrArr.length; j++) {
          const date = dayjs(dayStrArr[j]).set('hour', i).format('YYYY-MM-DD HH:mm:ss')
          if (!dateArr.includes(date)) {
            data.push({
              date,
              disabled: true
            })
          }
        }
      }
    } else {
      const dayStrArr = [...new Set(this.originData.map(it => dayjs(it.date).format('YYYY-MM-DD HH:00:ss')))]
      for (let i = 0; i < max; i += ratio) {
        for (let j = 0; j < dayStrArr.length; j++) {
          const date = dayjs(dayStrArr[j]).set('minute', i).format('YYYY-MM-DD HH:mm:ss')
          if (!dateArr.includes(date)) {
            data.push({
              date,
              disabled: true
            })
          }
        }
      }
    }
    data = data.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    this.originData = Object.freeze(data)
  }

  // 时间轴第一行始终维持不变
  private createFirstLevelData() {
    if (!this.options?.formatList) return
    const data: TimeAxisData[][] = []
    const formatStr = this.options?.formatList[0]
    data[0] = []
    this.originData.forEach(it => {
      const value = dayjs(it.date).format(formatStr)
      data[0].push({
        value: it.date,
        label: value,
        // 一般来说 第一个层级不会存在禁用状态的 除非是所有时间都是平铺
        disabled: this.options?.formatList!.length === 1 ? it.disabled : false
      })
    })
    data[0] = this.unique(data[0], 0)
    this.formatData = Object.freeze(data)
  }

  createSlider(
    progress: HTMLElement | null,
    slider: HTMLElement | null,
    sliderBar: HTMLElement | null,
    sliderTick: HTMLElement | null,
    sliderMarks: HTMLElement | null,
    tooltip: typeof ElTooltip | null
  ) {
    if (!progress || !slider || !sliderTick || !sliderMarks || !tooltip) return
    this.progress = progress
    this.slider = slider
    this.sliderTick = sliderTick
    this.sliderMarks = sliderMarks
    this.tooltip = tooltip
    this.sliderBar = sliderBar
    this.axisWrapper = document.getElementById(`mt-${this.options.uuid}`)
    this.controlWrapper = document.getElementById('mt-axis-play-control')
    this.axisWrapperWidth = this.axisWrapper?.offsetWidth || 0
    this.controlWrapperWidth = this.controlWrapper?.offsetWidth || 0
    this.contentWidth = this.progress!.offsetWidth || 0
    if (!this.formatData[0] || !this.formatData[0].length) return
    const labelWidth = getLabelWidth(this.formatData[0][0].label, this.options)
    const bothEnds = Math.ceil(labelWidth / 2)
    this.sliderConfig.bothEnds = bothEnds
    const width = this.contentWidth
    let length = this.formatData[0].length!
    if (length === 1) {
      length = 2
    }
    const viewSpacing = (width - bothEnds * 2) / (length - 1)
    const spacing = viewSpacing > this.options.sliderStyle?.minGap! ? viewSpacing : this.options.sliderStyle?.minGap!
    let tickStartPosition = bothEnds
    this.sliderConfig.clientWidth = spacing * (length - 1) + bothEnds * 2
    if (this.sliderConfig.clientWidth > width) {
      this.options.sliderStyle!.progressTrBorderRadius = 0
      this.options.sliderStyle!.progressBrBorderRadius = 0
      setStyle(this.options)
    }
    this.sliderConfig.spacing = spacing
    this.sliderConfig.tickStartPosition = tickStartPosition
    let gapNumber = 0
    const { shortTickWidth, shortTickHeight, longTickWidth, longTickHeight, labelCoefficient } =
      this.options.sliderStyle!
    this.formatData[0].forEach((it, i) => {
      const position = tickStartPosition + i * spacing
      it.shortTickWidth = getPixel(shortTickWidth!)
      it.shortTickHeight = getPixel(shortTickHeight!)
      it.longTickWidth = getPixel(longTickWidth!)
      it.longTickHeight = getPixel(longTickHeight!)
      it.showLabel = i === 0
      if (!gapNumber && position >= labelWidth * labelCoefficient!) {
        gapNumber = i
        it.showLabel = true
      }
      if (gapNumber && i % gapNumber === 0) {
        it.showLabel = true
      }
      if (it.showLabel) {
        it.width = it.longTickWidth
        it.height = it.longTickHeight
      } else {
        it.width = it.shortTickWidth
        it.height = it.shortTickHeight
      }
      it.left = getPixel(position)
      it.leftValue = position
      if (i === 0) {
        this.sliderConfig.buttonPosition = it.left
        this.sliderConfig.label = it.label
      }
    })
    this.setSliderData()
  }

  setSliderData() {
    if (!this.formatData[0] || !this.formatData[0].length) return
    let length = this.formatData[0].length!
    if (length === 1) {
      length = 2
    }
    const { spacing, bothEnds } = this.sliderConfig
    if (spacing * (length - 1) >= this.contentWidth) {
      this.progress!.style.width = spacing * (length - 1) + bothEnds * 2 + 'px'
      this.sliderTick!.style.width = spacing * (length - 1) + bothEnds * 2 + 'px'
      this.sliderMarks!.style.width = spacing * (length - 1) + bothEnds * 2 + 'px'
    }
    this.setButtonPosition(this.currentIndex)
    this.setToolTip()
  }

  updateSliderData() {
    const dutyArr = this.getCurrentDuty()
    const formatData = this.formatData[0]
    this.sliderData = formatData.filter((_, index) => index >= dutyArr[2] && index <= dutyArr[3])
  }

  onSliderMouseDown(event: MouseEvent | TouchEvent) {
    const matrix = new WebKitCSSMatrix(this.progress!.style.transform)
    this.sliderConfig.offset = matrix.m41
    this.sliderConfig.clientX = getClientX(event)
    this.sliderConfig.canMove = true
    this.sliderMove = this.onSliderMouseMove.bind(this)
    this.sliderUp = this.onSliderMouseUp.bind(this)
    this.axisWrapper!.style.cursor = 'grabbing'
    window.addEventListener('mousemove', this.sliderMove as any)
    window.addEventListener('touchmove', this.sliderMove as any)
    window.addEventListener('mouseup', this.sliderUp as any)
    window.addEventListener('touchend', this.sliderUp as any)
    window.addEventListener('contextmenu', this.sliderUp as any)
  }

  onSliderMouseMove(event: MouseEvent | TouchEvent) {
    if (!this.sliderConfig.canMove) return
    const clientX = getClientX(event)
    let offset = clientX - this.sliderConfig.clientX
    const width = this.slider!.clientWidth
    offset += this.sliderConfig.offset
    if (offset <= width - this.progress!.clientWidth) {
      offset = width - this.progress!.clientWidth
    }
    if (offset >= 0) {
      offset = 0
    }
    if (Math.round(this.contentWidth + Math.abs(offset)) >= this.sliderConfig.clientWidth) {
      this.options.sliderStyle!.progressTrBorderRadius = undefined
      this.options.sliderStyle!.progressBrBorderRadius = undefined
      setStyle(this.options)
    }
    this.progress!.style.transform = `translateX(${offset}px)`
    this.sliderTick!.style.transform = `translateX(${offset}px)`
    this.sliderMarks!.style.transform = `translateX(${offset}px)`
    this.setToolTip()
  }

  onWheel(e: WheelEvent) {
    const matrix = new WebKitCSSMatrix(this.progress!.style.transform)
    let offset = -e.deltaY + matrix.m41
    const width = this.slider!.clientWidth
    if (offset <= width - this.progress!.clientWidth) {
      offset = width - this.progress!.clientWidth
    }
    if (offset >= 0) {
      offset = 0
    }
    if (Math.round(this.contentWidth + Math.abs(offset)) >= this.sliderConfig.clientWidth) {
      this.options.sliderStyle!.progressTrBorderRadius = undefined
      this.options.sliderStyle!.progressBrBorderRadius = undefined
      setStyle(this.options)
    }
    this.sliderConfig.offset = offset
    this.progress!.style.transform = `translateX(${offset}px)`
    this.sliderTick!.style.transform = `translateX(${offset}px)`
    this.sliderMarks!.style.transform = `translateX(${offset}px)`
    this.setToolTip()
    this.updateSliderData()
  }

  setToolTip() {
    const tooltip = this.tooltip!
    tooltip.updatePopper()
    const dutyArr = this.getCurrentDuty()
    this.tooltipVisible = !(this.sliderConfig.duty > dutyArr[3] || this.sliderConfig.duty < dutyArr[2])
  }

  onSliderMouseUp() {
    this.sliderConfig.canMove = false
    this.updateSliderData()
    this.axisWrapper!.style.cursor = 'default'
    window.removeEventListener('mousemove', this.sliderMove as any)
    window.removeEventListener('touchmove', this.sliderMove as any)
    window.removeEventListener('mouseup', this.sliderUp as any)
    window.removeEventListener('touchend', this.sliderUp as any)
    window.removeEventListener('contextmenu', this.sliderUp as any)
  }

  onButtonDown() {
    this.buttonMove = this.onButtonMove.bind(this)
    this.buttonUp = this.onButtonUp.bind(this)
    window.addEventListener('mousemove', this.buttonMove as any)
    window.addEventListener('touchmove', this.buttonMove as any)
    window.addEventListener('mouseup', this.buttonUp as any)
    window.addEventListener('touchend', this.buttonUp as any)
    window.addEventListener('contextmenu', this.buttonUp as any)
    this.sliderConfig.dragging = true
  }

  getCurrentDuty() {
    const { spacing, tickStartPosition } = this.sliderConfig
    const matrix = new WebKitCSSMatrix(this.progress!.style.transform)
    const left = Math.abs(matrix.m41)
    const right = left + this.contentWidth
    let minDuty = (left - tickStartPosition) / spacing
    minDuty = Math.round(Math.abs(minDuty < 0 ? 0 : minDuty))
    let maxDuty = (right - tickStartPosition) / spacing
    maxDuty = Math.round(Math.abs(maxDuty < 0 ? 0 : maxDuty))
    return [minDuty !== 0 ? minDuty + 1 : minDuty, maxDuty - 1, minDuty, maxDuty]
  }

  onButtonMove(event: MouseEvent | TouchEvent) {
    const clientX = getClientX(event)
    const left = getOffset(this.slider!).left
    const slider = this.slider!
    const progress = this.progress!
    const formatData = this.formatData[0]
    const matrix = new WebKitCSSMatrix(progress.style.transform)
    const { spacing, tickStartPosition } = this.sliderConfig
    let duty = (clientX - matrix.m41 - left - tickStartPosition) / spacing
    duty = Math.round(Math.abs(duty < 0 ? 0 : duty))
    if (duty >= formatData.length - 1) {
      duty = formatData.length - 1
    }
    if (slider.clientWidth <= clientX - left || left > clientX) {
      return
    }
    this.tooltipVisible = true
    this.setButtonPosition(duty)
    this.setToolTip()
  }

  onButtonUp() {
    window.removeEventListener('mousemove', this.buttonMove as any)
    window.removeEventListener('touchmove', this.buttonMove as any)
    window.removeEventListener('mouseup', this.buttonUp as any)
    window.removeEventListener('touchend', this.buttonUp as any)
    window.removeEventListener('contextmenu', this.buttonUp as any)
    this.sliderConfig.dragging = false
    this.sliderConfig.tooltipVisible = false
    this.tooltipVisible = true
    this.current = this.sliderConfig.value
    this.currentIndex = this.sliderConfig.duty
  }

  setButtonPosition(duty: number) {
    const formatData = this.formatData[0]
    const { spacing, tickStartPosition } = this.sliderConfig
    const [minDuty, maxDuty] = this.getCurrentDuty()
    const offsetLeft = duty * spacing + tickStartPosition
    if (formatData[duty].disabled) return
    this.sliderConfig.buttonPosition = `${offsetLeft}px`
    this.sliderConfig.label = formatData[duty].label
    this.sliderConfig.value = formatData[duty].value
    this.sliderConfig.duty = duty
    let offset = 0
    if (duty > maxDuty) {
      offset = this.contentWidth - this.options.sliderStyle?.sliderButtonSize! / 2 - offsetLeft
      this.sliderConfig.offset = offset
      this.progress!.style.transform = `translateX(${offset}px)`
      this.sliderTick!.style.transform = `translateX(${offset}px)`
      this.sliderMarks!.style.transform = `translateX(${offset}px)`
    }
    if (duty < minDuty) {
      offset = this.contentWidth - this.options.sliderStyle?.sliderButtonSize! / 2 - offsetLeft
      if (offset > 0) {
        offset = 0
      }
      this.sliderConfig.offset = offset
      this.progress!.style.transform = `translateX(${offset}px)`
      this.sliderTick!.style.transform = `translateX(${offset}px)`
      this.sliderMarks!.style.transform = `translateX(${offset}px)`
    }
    if (duty === formatData.length - 1) {
      offset = this.contentWidth - this.sliderConfig.clientWidth
      this.sliderConfig.offset = offset
      this.progress!.style.transform = `translateX(${offset}px)`
      this.sliderTick!.style.transform = `translateX(${offset}px)`
      this.sliderMarks!.style.transform = `translateX(${offset}px)`
    }
    if (!this.sliderConfig.dragging) {
      this.current = formatData[duty].value
      this.currentIndex = duty
    }
    if (Math.round(this.contentWidth + Math.abs(offset)) >= this.sliderConfig.clientWidth) {
      this.options.sliderStyle!.progressTrBorderRadius = undefined
      this.options.sliderStyle!.progressBrBorderRadius = undefined
      setStyle(this.options)
    }
    this.setSlideBarWidth(duty)
    this.updateSliderData()
  }

  setSlideBarWidth(duty: number) {
    const formatData = this.formatData[0]
    const { spacing, tickStartPosition } = this.sliderConfig
    let slideBarWidth = duty * spacing + tickStartPosition
    let offset = 0
    this.sliderBar!.style.width = `${slideBarWidth}px`
    if (duty === formatData.length - 1) {
      this.sliderBar!.style.width = `${this.sliderConfig.clientWidth}px`
    }
    this.sliderBar!.style.transform = `translateX(${offset}px)`
  }

  handleMouseEnter() {
    const displayTooltip = debounce(() => {
      this.sliderConfig.tooltipVisible = true
    }, 50)
    displayTooltip()
  }

  handleMouseLeave() {
    if (this.sliderConfig.dragging) return
    const hideTooltip = debounce(() => {
      this.sliderConfig.tooltipVisible = false
    }, 50)
    hideTooltip()
  }

  updateFormatData(current: string) {
    const formatList = this.options?.formatList || []
    const data = [...this.formatData]
    for (let i = 1; i < formatList.length; i++) {
      const formatPreStr = formatList[i - 1]
      const formatStr = formatList[i]
      data[i] = []
      const cur = dayjs(current).format(formatPreStr)
      data[i] = []
      this.originData.forEach(it => {
        const value = dayjs(it.date).format(formatStr)
        const pre = dayjs(it.date).format(formatPreStr)
        if (cur.includes(pre)) {
          data[i].push({
            value: it.date,
            label: value,
            disabled: it.disabled
          })
        }
      })
      data[i] = this.unique(data[i], i)
    }
    this.formatData = Object.freeze(data)
  }

  updateFormatId(current: string) {
    const formatList = this.options?.formatList || []
    for (let i = 0; i < this.formatData.length; i++) {
      const data = this.formatData[i]
      const formatStr = formatList[i]
      const cur = formatStr ? dayjs(current).format(formatStr) : current
      let disabled = false
      for (let j = 0; j < data.length; j++) {
        if (cur === data[j].label) {
          disabled = data[j].disabled
          this.formatIds[i] = j
          this.current = data[j].value
          this.currentIndex = this.originData.findIndex(it => it.date === this.current)
          break
        }
      }
      // 如果切换的时候正好在禁用的位置则找出非禁用的位置
      if (disabled) {
        for (let j = 0; j < data.length; j++) {
          if (!data[j].disabled) {
            this.formatIds[i] = j
            if (i === this.formatData.length - 1) {
              this.current = data[j].value
              this.currentIndex = this.originData.findIndex(it => it.date === this.current)
            }
            break
          }
        }
      }
    }
  }

  // 获取前一个数据
  getLastDate(current?: string) {
    return dayjs(current || this.current)
      .subtract(this.options!.ratio!, this.options!.unit as ManipulateType)
      .format('YYYY-MM-DD HH:mm:ss')
  }

  // 获取前一个数据
  getNextDate(current?: string) {
    return dayjs(current || this.current)
      .add(this.options!.ratio!, this.options!.unit as ManipulateType)
      .format('YYYY-MM-DD HH:mm:ss')
  }

  getData(current?: string) {
    return this.playData.get(current || this.current!)
  }

  setData(data: any, current?: string) {
    this.playData.set(current || this.current!, this.options.freeze ? Object.freeze(data) : data)
  }

  update(current?: string) {
    if (current) {
      this.options!.current = current
    }
    if (!this.options) return
    this.originData = []
    this.createOriginData()
    const obj: any = {}
    this.originData.forEach(d => {
      if (!obj[d.date]) {
        obj[d.date] = { ...d }
      }
    })
    this.originData = Object.values(obj)
    if (this.options.complement) {
      this.complementData()
    }
    if (this.originData.length) {
      const position = this.options.position || 'start'
      for (let i = 0; i < this.originData.length; i++) {
        if (!this.originData[i].disabled && this.options.current === this.originData[i].date) {
          this.current = this.options.current
          this.currentIndex = i
        }
      }
      if (!this.current) {
        for (let i = 0; i < this.originData.length; i++) {
          if (!this.originData[i].disabled) {
            this.current = this.originData[i].date
            this.currentIndex = i
            if (position === 'start') break
          }
        }
      }
      for (let i = 0; i < this.originData.length; i++) {
        if (!this.originData[i].disabled) {
          this.firstEnableIndex = i
          break
        }
      }
      for (let i = 0; i < this.originData.length; i++) {
        if (!this.originData[i].disabled) {
          this.lastEnableIndex = i
        }
      }
    }
    if (this.options.formatList?.length) {
      this.createFirstLevelData()
      this.updateFormatData(this.current!)
      this.updateFormatId(this.current!)
    } else {
      const data = [...this.formatData]
      data[0] = this.originData.map(it => ({
        label: it.date,
        disabled: it.disabled,
        value: it.date
      }))
      data[0] = this.unique(data[0], 0)
      this.formatData = Object.freeze(data)
      this.updateFormatId(this.current!)
    }
    const isAllEmpty = this.formatData.every(arr => !arr.length)
    if (isAllEmpty) {
      this.formatData = []
    }
  }

  resetRequestLength() {
    this.requestIndex = this.currentIndex
    if (this.requestIndex > this.lastEnableIndex) {
      this.requestIndex = this.firstEnableIndex
    }
    this.requestLength = this.options!.requestLength ?? 1
    this.requestCount = 0
    this.playCount = 0
  }

  request() {
    if (!this.options) return
    for (let i = 0; i < this.originData.length; i++) {
      const date = this.originData[i].date
      const disabled = this.originData[i].disabled
      const params = {
        value: date,
        last: this.getLastDate(date),
        next: this.getNextDate(date),
        index: i
      }
      if (!disabled) {
        this.push(this.options.request, params)
      } else {
        this.push(() => {}, params)
      }
    }
    this.execute()
  }

  push(method: any, params: any) {
    const args = [params]
    if (typeof method !== 'function') {
      this.requestQuene.push(undefined)
    } else {
      this.requestQuene.push({
        method,
        args: args
      })
    }
  }

  execute() {
    this.requestIndex++
    if (this.requestIndex > this.lastEnableIndex) {
      this.requestIndex = this.firstEnableIndex
    }
    this.requestCurrent = this.originData[this.requestIndex].date
    const req = this.requestQuene[this.requestIndex]
    if (!req || this.over()) {
      if (this.startPlay) this.startPlay()
      return
    }
    if (this.playData.get(this.requestCurrent!) || this.originData[this.requestIndex].disabled) {
      this.run()
    } else {
      // 在第一次请求之前执行 requestBefore
      if (this.requestCount === 0 && this.options!.requestBefore && typeof this.options!.requestBefore === 'function') {
        this.options!.requestBefore()
      }
      req.method.apply(null, req.args).then((data: any) => {
        this.playData.set(req.args[0].value, this.options.freeze ? Object.freeze(data) : data)
        this.run()
      })
    }
  }

  // 判断是否全部数据已经加载完成
  over() {
    return this.playData.size === this.originData.filter(it => !it.disabled).length
  }

  run() {
    this.requestCount++
    if (!this.playing && this.requestQuene.length && this.requestCount - this.playCount >= this.requestLength) {
      this.playing = true
      if (this.startPlay) this.startPlay()
      this.playIntervalId = setInterval(() => this.next(), this.options!.playInterval ?? 1000)
      if (this.options!.requestFinished && typeof this.options!.requestFinished === 'function') {
        this.options!.requestFinished()
      }
    }
    this.execute()
  }

  last(click?: boolean) {
    if (!this.options) return
    if (this.playing && !this.over() && this.requestCount - this.playCount <= this.requestLength && !click) return
    this.currentIndex--
    if (!this.options.loop && this.currentIndex < this.firstEnableIndex) {
      this.currentIndex = this.firstEnableIndex
      if (this.playing) this.pause()
    }
    if (this.currentIndex < this.firstEnableIndex) {
      this.currentIndex = this.lastEnableIndex
    }
    this.current = this.originData[this.currentIndex].date
    if (this.originData[this.currentIndex].disabled) {
      this.last()
      return
    }
    this.updateFormatData(this.current)
    this.updateFormatId(this.current)
    if (click) {
      this.resetRequestLength()
    }
    if (this.options.type === 'slider') {
      this.setButtonPosition(this.currentIndex)
      this.setToolTip()
    }
  }

  play() {
    this.pause()
    if (!this.options) return
    this.playStatus = true
    this.requestCurrent = this.current
    this.requestIndex = this.currentIndex
    this.resetRequestLength()
    if (this.over()) {
      this.playing = true
      this.playIntervalId = setInterval(() => this.next(), this.options!.playInterval ?? 1000)
    }
    this.request()
  }

  pause() {
    this.playing = false
    this.playStatus = false
    this.requestQuene = []
    clearInterval(this.playIntervalId)
  }

  next(click?: boolean) {
    if (!this.options) return
    if (this.playing && !this.over() && this.requestCount - this.playCount <= this.requestLength && !click) return
    this.currentIndex++
    if (!this.options.loop && this.currentIndex > this.lastEnableIndex) {
      this.currentIndex = this.lastEnableIndex
      if (this.playing) this.pause()
    }
    if (this.currentIndex > this.lastEnableIndex) {
      this.currentIndex = this.firstEnableIndex
    }
    this.current = this.originData[this.currentIndex].date
    if (this.originData[this.currentIndex].disabled) {
      this.next()
      return
    }
    this.updateFormatData(this.current)
    this.updateFormatId(this.current)
    if (this.playing && !this.over()) {
      this.playCount++
    }
    if (click) {
      this.resetRequestLength()
    }
    if (this.options.type === 'slider') {
      this.setButtonPosition(this.currentIndex)
      this.setToolTip()
    }
  }
}
