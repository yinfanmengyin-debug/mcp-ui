import type { MaybeArray, SelectionItem, SelectionValueType } from '@/types/common'

export interface SelectionProps {
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
  // 多选场景下用户最多可以选择的项目数， 为 0 则不限制 默认为0
  multipleLimit?: number
  // 作为 value 唯一标识的键名，绑定值为对象类型时必填
  valueKey?: string
  // 是否可以清空选项 默认为false
  clearable?: boolean
  // Select 组件是否可搜索 默认为false
  filterable?: boolean
  // 占位文字 默认: 请选择
  placeholder?: string
  // 多选时是否将选中值按文字的形式展示 默认为true
  collapseTags?: boolean
  // 选择器下拉菜单的自定义类名 默认为''
  popperClass?: string
}