import { VNode } from 'vue'

export interface EmptyOptions {
  // 边框宽度
  borderWidth?: nmber
  // 字体大小
  fontSize?: number
  // 字体粗细
  fontWeight?: string | number
  // 内容文字
  text?: string
  // 内容区域的渲染函数 设置此项后text属性无效
  renderer?: () => VNode
}