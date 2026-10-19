export type MtListViewValueType = number | string | boolean

export interface MtListViewProps {
  modelValue: MtListViewValueType
  // 列表数据
  list?: Record<string, MtListViewValueType>[]
  // 标签的字段名称 默认"label"
  labelField?: string
  // 值的字段名称 默认"value"
  valueField?: string
  // 组件大小 默认: default
  size?: 'large' | 'default' | 'small'
  // 列表高度 默认"100%"
  height?: number | string
  // 是否可搜索 默认true
  searchable?: boolean
  // 输入框占位符 默认"请输入关键字搜索"
  placeholder?: string
  // 无数据时显示的文字 默认"暂无数据"
  emptyText?: string
  // 无匹配数据时显示的文字 默认"无匹配数据"
  noMatchText?: string
}