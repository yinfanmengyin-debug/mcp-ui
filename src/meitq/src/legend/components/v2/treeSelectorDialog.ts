import type { NestingOptionProps } from '@/types/common'

/**
 * 树形选择弹窗组件的props
 */
export interface TreeSelectorDialogProps {
  /**
   * 弹窗是否显示
   */
  modelValue: boolean
  /**
   * 弹窗标题
   */
  title: string
  /**
   * 树形数据
   */
  data: Record<string, any>[]
  /**
   * 默认选中项的值列表
   */
  defaultCheckedValues: Array<string | number>
  /**
   * 树组件的选项配置
   */
  options: Required<NestingOptionProps>
}
