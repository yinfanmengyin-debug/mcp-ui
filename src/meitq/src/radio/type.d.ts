import type { SelectionItem } from '@/types/common'

export type RadioValueType = string | number | boolean | undefined

export interface RadioProps {
  // 下拉选数据
  list?: Array<SelectionItem | string | number>
  // 当前选中项绑定值
  modelValue: RadioValueType
  // 显示内容的字段名称 默认: label
  labelField?: string
  // 选中值的字段名称 默认: value
  valueField?: string
  // 组件大小 默认: default
  size?: 'large' | 'default' | 'small'
  // 是否禁用 默认: false
  disabled?: boolean
  // 是否为按钮样式 默认: false
  button?: boolean
  // 非按钮时是否显示边框 默认: false
  border?: boolean
  // 是否可取消选择 默认为false
  cancellable?: boolean
}