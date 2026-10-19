import type {
  CheckboxGroupProps,
  DatePickerProps,
  InputProps,
  RadioGroupProps,
  ISelectProps,
  SwitchProps
} from 'element-plus'

export type DataFormFieldType = 'input' | 'textarea' | 'select' | 'date' | 'switch' | 'radio' | 'checkbox' | 'slot'

export interface DataFormOptionItem {
  label: string
  value: any
  disabled?: boolean
  [key: string]: any
}

export interface DataFormValidateContext {
  item: DataFormData
  data: DataFormData[]
  value: any
}

export type DataFormRuleResult = boolean | string | Promise<boolean | string>
export type DataFormRule = string | ((value: any, context: DataFormValidateContext) => DataFormRuleResult)

export type DataFormInputProps = Partial<
  Pick<
    InputProps,
    | 'placeholder'
    | 'clearable'
    | 'maxlength'
    | 'showWordLimit'
    | 'type'
    | 'rows'
    | 'readonly'
    | 'disabled'
    | 'autosize'
    | 'formatter'
    | 'parser'
    | 'prefixIcon'
    | 'suffixIcon'
    | 'showPassword'
    | 'resize'
  >
>

export type DataFormSelectProps = Partial<
  Pick<
    ISelectProps,
    | 'placeholder'
    | 'clearable'
    | 'multiple'
    | 'multipleLimit'
    | 'collapseTags'
    | 'filterable'
    | 'remote'
    | 'remoteMethod'
    | 'loading'
    | 'disabled'
    | 'teleported'
    | 'reserveKeyword'
    | 'defaultFirstOption'
    | 'fitInputWidth'
  >
>

export type DataFormDateProps = Partial<
  Pick<
    DatePickerProps,
    | 'type'
    | 'placeholder'
    | 'startPlaceholder'
    | 'endPlaceholder'
    | 'clearable'
    | 'editable'
    | 'format'
    | 'valueFormat'
    | 'unlinkPanels'
    | 'disabled'
    | 'shortcuts'
  >
>

export type DataFormSwitchProps = Partial<
  Pick<
    SwitchProps,
    | 'inlinePrompt'
    | 'activeText'
    | 'inactiveText'
    | 'activeValue'
    | 'inactiveValue'
    | 'loading'
    | 'disabled'
    | 'beforeChange'
    | 'size'
  >
>

export type DataFormRadioProps = Partial<Pick<RadioGroupProps, 'disabled' | 'textColor' | 'fill' | 'size'>>

export type DataFormCheckboxProps = Partial<
  Pick<CheckboxGroupProps, 'disabled' | 'min' | 'max' | 'size' | 'textColor' | 'fill'>
>

export interface DataFormBaseItem {
  // 字段显示名称
  name: string
  // 字段值
  value: any
  // 字段唯一标识，未传时默认使用 name
  field?: string
  // 表单项类型，默认 input
  type?: DataFormFieldType
  // 是否必填
  required?: boolean
  // 必填提示文案
  requiredMessage?: string
  // 自定义校验规则，返回 false 时使用 message，返回 string 时直接作为错误文案
  rule?: DataFormRule
  // rule 返回 false 时兜底提示文案
  message?: string
  // 是否隐藏
  hidden?: boolean
  // 单项标签水平对齐方式
  horizontalAlign?: 'left' | 'center' | 'right'
  // 单项标签与内容区域垂直对齐方式
  verticalAlign?: 'top' | 'center'
  // 选项数据，仅 select 使用
  options?: DataFormOptionItem[]
  // 自定义标签插槽名
  labelSlot?: string
  // 自定义内容插槽名，传了以后可覆盖默认组件渲染
  slot?: string
}

export interface DataFormInputItem extends DataFormBaseItem {
  type?: 'input' | 'textarea'
  props?: DataFormInputProps
}

export interface DataFormSelectItem extends DataFormBaseItem {
  type: 'select'
  props?: DataFormSelectProps
}

export interface DataFormDateItem extends DataFormBaseItem {
  type: 'date'
  props?: DataFormDateProps
}

export interface DataFormSwitchItem extends DataFormBaseItem {
  type: 'switch'
  props?: DataFormSwitchProps
}

export interface DataFormRadioItem extends DataFormBaseItem {
  type: 'radio'
  props?: DataFormRadioProps
}

export interface DataFormCheckboxItem extends DataFormBaseItem {
  type: 'checkbox'
  props?: DataFormCheckboxProps
}

export interface DataFormSlotItem extends DataFormBaseItem {
  type: 'slot'
  props?: Record<string, any>
}

// 错误信息的统一触发方式是暴露 validate 方法，而不是依赖 el-form
export type DataFormData =
  | DataFormInputItem
  | DataFormSelectItem
  | DataFormDateItem
  | DataFormSwitchItem
  | DataFormRadioItem
  | DataFormCheckboxItem
  | DataFormSlotItem

export interface DataFormOptions {
  // 表单容器宽度 默认100%
  width?: string | number
  // 表单容器高度 默认 auto
  height?: string | number
  // 表单数据名称宽度 默认 auto
  labelWidth?: string | number
  // 表单内容区域宽度 默认 auto
  contentWidth?: string | number
  // 横向间距 默认20
  gapX?: number
  // 纵向间距 默认20
  gapY?: number
  // 行数，不传则自适应
  rows?: number
  // 列数 默认1
  columns?: number
  // 单列最小宽度，适合响应式场景
  itemMinWidth?: string | number
  // 标签后缀 默认 ：
  labelSuffix?: string
  // 错误信息是否占位展示
  inlineMessage?: boolean
  // 错误信息固定高度
  errorMinHeight?: string | number
}

export interface DataFormExpose {
  validate: () => Promise<boolean>
  validateField: (field: string) => Promise<boolean>
  clearValidate: (field?: string) => void
  reset: () => void
  getFormData: () => Record<string, any>
  setFieldValue: (field: string, value: any) => void
}
