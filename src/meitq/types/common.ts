export type MaybeArray<T> = T | T[]

// 下拉选数据中列表项的值类型
export type SelectionValueType = string | number | boolean | object

// 下拉选数据中的列表项
export interface SelectionItem extends Record<string, any> {
  // 是否禁用该选项
  disabled?: boolean
}

// 选项的配置
export interface OptionProps {
  // 选项中名称对应的键名 默认"label"
  labelField?: string
  // 选项中值对应的键名 默认"value"
  valueField?: string
  // 选项是否可搜索 默认false
  searchable?: boolean
}

// 嵌套选项的配置
export interface NestingOptionProps extends OptionProps {
  // 选项的子列表项的键名 默认"children"
  childrenField?: string
}