import type { ColorCode } from '@/src/legend/type'

/**
 * 色标列表组件的props
 */
export interface ColorBarListProps {
  /**
   * 当前展示的色标列表
   */
  list: ColorCode[]
  /**
   * 点击选中色标时是否可以取消选中
   */
  clickCanCancel?: boolean
  /**
   * 是否显示删除图标
   */
  showRemoveIcon?: boolean
}
