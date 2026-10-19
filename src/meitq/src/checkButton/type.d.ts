import type { MaybeArray, SelectionItem, SelectionValueType } from '@/types/common'

export interface CheckButtonProps {
  // 下拉选数据
  list?: Array<SelectionItem | string | number>
  // 当前选中项绑定值
  modelValue: MaybeArray<SelectionValueType>
  // 显示内容的字段名称 默认: label
  labelField?: string
  // 选中值的字段名称 默认: value
  valueField?: string
  // 组件大小 默认: default
  size?: 'large' | 'default' | 'small'
  // 是否禁用 默认: false
  disabled?: boolean
  // 是否多选 默认为false
  multiple?: boolean
  // 一行显示多少个按钮 可设置为"auto" 默认为3
  column?: number | 'auto'
  // 最多显示多少行 默认0表示不限制 否则超出行数后会显示"展开"/"收起"按钮
  rowLimit?: number
  // 行列间隔 单位为像素 默认为10
  gap?: number
  // 单选是否可取消选择 默认为false
  singleCancel?: boolean
}