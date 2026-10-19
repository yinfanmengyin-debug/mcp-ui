import { TimeAxisConfig } from '@/src/timeAxis/types'

export const deepObjectMerge = (target: any, source: any) => {
  if (!target) target = {}
  for (const key in source) {
    if ((key as any).hasOwnProperty) {
      target[key] =
        target[key] &&
        source[key] &&
        Object.prototype.toString.call(target[key]) === '[object Object]' &&
        Object.prototype.toString.call(source[key]) === '[object Object]'
          ? deepObjectMerge(target[key], source[key])
          : (target[key] = source[key])
    }
  }
  return target
}

export function setStyle(options: TimeAxisConfig) {
  const dark = options.dark
  const share = !options.share
  const uuid = options.uuid
  const style = `
      ${share ? `.mt-${uuid}` : '.mt-share'} .el-tabs__nav {
        border: 1px solid ${options?.blockStyle?.borderColor || (dark ? '#357AEF' : '#666666')} !important;
        border-bottom: none !important;
        border-radius: 0 !important;
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .el-tabs__item:not(.is-disabled) {
        background-color: ${options?.blockStyle?.backgroundColor ?? (dark ? '#08285F' : '#F1F1F1')} !important;
        color: ${options?.blockStyle?.color || (dark ? '#fff' : '#666')} !important;
        border-color: ${options?.blockStyle?.borderColor || (dark ? '#357AEF' : '#666666')} !important;
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .el-tabs__item.is-active {
        background: ${
          options?.blockStyle?.activeBackgroundColor ?? (dark
            ? 'linear-gradient(91deg, #25A3D4 3%, #1C90EC 97.3%)'
            : '#168BE7')
        } !important;
        color: ${options?.blockStyle?.activeColor || '#fff'} !important;
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .el-tabs__item.is-disabled {
        background: ${options?.blockStyle?.disabledBackgroundColor ?? (dark ? 'rgba(86, 96, 114)' : '#cfcfcf')} !important;
        border-color: ${options?.blockStyle?.borderColor || (dark ? '#357AEF' : '#666666')} !important;
        color: ${options?.blockStyle?.disabledColor || (dark ? '#D2D2D2' : '#666666')} !important;
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .el-tabs__nav-next,
      ${share ? `.mt-${uuid}` : '.mt-share'} el-tabs__nav-prev {
        background: ${
          options?.blockStyle?.arrowColor ?? (dark ? 'linear-gradient(89deg, #0ae4dc 0%, #008bff 165.92%)' : '#168BE7')
        } !important;
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .el-tabs__nav-next.is-disabled,
      ${share ? `.mt-${uuid}` : '.mt-share'} .el-tabs__nav-prev.is-disabled {
        background: ${options?.blockStyle?.arrowDisabledColor ?? (dark ? '#D2D2D2' : '#ddd')} !important;
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .axis-play-control {
        color: ${options?.controlStyle?.playColor ?? (dark ? '#fff' : '#666')} !important;
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .center-no-date {
         color: ${options?.blockStyle?.noDataTextColor || (dark ? '#fff' : '#000')};;
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .axis-slider .axis-slider-wrapper .axis-slider-progress {
        height: ${options?.sliderStyle?.progressHeight}px;
        background: ${options?.sliderStyle?.progressColor || (dark ? '#fff' : '#666666')};
        border-radius: ${options?.sliderStyle?.progressBorderRadius}px;
        border-top-left-radius: ${options?.sliderStyle?.progressTlBorderRadius !== undefined ? options?.sliderStyle?.progressTlBorderRadius : options?.sliderStyle?.progressBorderRadius}px;
        border-top-right-radius: ${options?.sliderStyle?.progressTrBorderRadius !== undefined ? options?.sliderStyle?.progressTrBorderRadius : options?.sliderStyle?.progressBorderRadius}px;
        border-bottom-right-radius: ${options?.sliderStyle?.progressBrBorderRadius !== undefined ? options?.sliderStyle?.progressBrBorderRadius : options?.sliderStyle?.progressBorderRadius}px;
        border-bottom-left-radius: ${options?.sliderStyle?.progressBlBorderRadius !== undefined ? options?.sliderStyle?.progressBlBorderRadius : options?.sliderStyle?.progressBorderRadius}px;
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .axis-slider .axis-slider-wrapper .axis-slider-bar {
        height: ${options?.sliderStyle?.progressHeight}px;
        border-radius: ${options?.sliderStyle?.progressBorderRadius}px;
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .axis-slider .axis-slider-wrapper .axis-slider-drag .axis-slider-tick .tick {
         background: ${options?.sliderStyle?.shortTickColor || (dark ? '#fff' : '#666666')};
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .axis-slider .axis-slider-wrapper .axis-slider-drag .axis-slider-tick .long-tick {
         background: ${options?.sliderStyle?.longTickColor || (dark ? '#fff' : '#666666')};
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .axis-slider .axis-slider-wrapper .axis-slider-drag .axis-slider-tick .tick-disabled {
         background: ${options?.sliderStyle?.tickDisabledColor || (dark ? '#D2D2D2' : '#ddd')};
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .axis-slider .axis-slider-wrapper .axis-slider-drag .axis-slider-marks .mark {
        color: ${options?.sliderStyle?.color || (dark ? '#fff' : '#666666')};
        font-size: ${options?.sliderStyle?.fontSize || 14}px;
        font-family: ${options?.sliderStyle?.fontFamily};
        font-weight: ${options?.sliderStyle?.bold ? 700 : 500};
      }
      ${share ? `.mt-${uuid}` : '.mt-share'} .axis-slider .axis-slider-wrapper .axis-slider-progress .axis-slider-button {
        width: ${options?.sliderStyle?.sliderButtonSize!}px;
        height: ${options?.sliderStyle?.sliderButtonSize!}px;
        margin-top: ${-options?.sliderStyle?.progressHeight! / 2}px;
        background: ${options?.sliderStyle?.sliderButtonColor || (dark ? '#fff' : '#fff')};
        border: ${options?.sliderStyle?.sliderButtonBorderWidth!}px solid ${options?.sliderStyle?.sliderButtonBorderColor || dark ? '#00C3EA' : '#357AEF'};
      }
    `
  const id = share ? `${uuid}-style` : 'mt-share-style'
  let dom = document.getElementById(id)
  if (dom) {
    dom.remove()
    dom = null
  }
  if (!dom) {
    const el: HTMLStyleElement = document.createElement('style')
    el.id = id
    if ((el as any).stylesheet) {
      ;(el as any).stylesheet.cssText = style
    } else {
      el.appendChild(document.createTextNode(style))
    }
    document.getElementsByTagName('head')[0].appendChild(el)
  }
}

let ctx: CanvasRenderingContext2D | undefined

export function getLabelWidth(label: string, options: TimeAxisConfig) {
  if (!ctx) {
    ctx = typeof document === 'undefined' ? undefined : document.createElement('canvas').getContext('2d') ?? undefined
  }
  if (!ctx) {
    throw new Error('Canvas 2D context is required to measure time axis labels')
  }
  ctx.font = `${options.sliderStyle?.bold ? 'bold' : ''} ${options.sliderStyle?.fontSize}px ${options.sliderStyle?.fontFamily}`
  const metrics = ctx.measureText(label)
  return metrics.width!
}

export function getClientX(event: MouseEvent | TouchEvent) {
  let clientX = 0
  if (event instanceof MouseEvent) {
    clientX = event.clientX
  }
  if (event instanceof TouchEvent) {
    clientX = event.touches?.item(0)?.clientX || 0
  }
  return clientX
}

export function getPixel(value: number) {
  return `${value}px`
}

// 禁用滚动的函数
export function disableScroll() {
  document.addEventListener('wheel', preventScroll, { passive: false })
}

// 监听的事件处理函数
function preventScroll(event: MouseEvent) {
  event.preventDefault()
}

// 启用滚动的函数
export function enableScroll() {
  document.body.style.overflow = '' // 空字符串会使浏览器使用默认的滚动行为
  document.removeEventListener('wheel', preventScroll) // 移除监听事件
}

export function getOffset(el: HTMLElement) {
  let left = 0
  let top = 0
  let elPar = el.offsetParent as any
  left += el.offsetLeft
  top += el.offsetTop
  while (elPar) {
    if (navigator.userAgent.indexOf('MSIE 8.0') == -1) {
      left += elPar.clientLeft
      top += elPar.clientTop
    }
    left += elPar.offsetLeft
    top += elPar.offsetTop
    elPar = elPar.offsetParent
  }
  return { left: left, top: top }
}

export function createGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
