import { nextTick, ref } from 'vue'

export interface UseFullscreenOptions {
  appendTo?: string
  target: string
  padding?: string
  zIndex?: number
  afterChange?: (isFullScreen: boolean) => void
}

export function useFullscreen(options: UseFullscreenOptions) {
  const isFullscreen = ref(false)

  let appendToStyle: Partial<CSSStyleDeclaration> | undefined
  let targetStyle: Partial<CSSStyleDeclaration> | undefined
  // 目标元素的父元素
  let targetParent: HTMLElement | undefined
  // 目标元素的下一个兄弟元素
  let nextSibling: HTMLElement | undefined

  async function toggle() {
    isFullscreen.value = !isFullscreen.value
    await nextTick()
    const appendToEl = document.querySelector(options.appendTo ?? 'body') as HTMLElement
    if (!appendToStyle) {
      appendToStyle = {
        position: appendToEl.style.position,
        overflow: appendToEl.style.overflow
      }
    }
    const targetEl = document.querySelector(options.target) as HTMLElement
    if (!targetStyle) {
      targetStyle = {
        position: targetEl.style.position,
        top: targetEl.style.top,
        padding: targetEl.style.padding,
        zIndex: targetEl.style.zIndex,
        height: targetEl.style.height
      }
    }
    if (appendToEl) {
      Object.assign(
        appendToEl.style,
        isFullscreen.value
          ? {
              position: 'relative',
              overflow: 'hidden'
            }
          : appendToStyle
      )

      if (isFullscreen.value) {
        const parent = (appendToEl.offsetParent || appendToEl.parentNode) as HTMLElement
        let offsetTop = 0
        // 如果父元素有滚动条, 计算目标元素的偏移量
        if (parent.scrollHeight > parent.clientHeight) {
          const elementOffsetTop = appendToEl.offsetTop
          const parentScrollTop = parent.scrollTop
          offsetTop = parentScrollTop - elementOffsetTop
        }
        // 设置目标元素的样式
        Object.assign(targetEl.style, {
          position: 'absolute',
          top: `${offsetTop}px`,
          padding: options.padding,
          zIndex: options.zIndex,
          height: parent.clientHeight > appendToEl.clientHeight ? `${appendToEl.clientHeight}px` : `${parent.clientHeight}px`
        })

        // 获取目标元素的父元素和下一个兄弟元素
        if (!targetParent) {
          targetParent = targetEl.parentElement as HTMLElement
          nextSibling = targetEl.nextElementSibling as HTMLElement
        }
        // 移动目标元素到全屏容器
        targetParent.removeChild(targetEl)
        appendToEl.appendChild(targetEl)
      } else {
        Object.assign(targetEl.style, targetStyle)

        // 移动目标元素到原来的位置
        appendToEl.removeChild(targetEl)
        if (nextSibling) {
          targetParent?.insertBefore(targetEl, nextSibling)
        } else {
          targetParent?.appendChild(targetEl)
        }
      }
    }
    options.afterChange?.(isFullscreen.value)
  }

  return {
    isFullscreen,
    toggle
  }
}
