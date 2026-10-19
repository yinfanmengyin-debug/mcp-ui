import type { NestingOptionProps } from '../../types/common'

export interface GridLayout {
  // 列数
  column: number
  // 行数 0表示根据数据自动适应
  row: number
}

// 区域选择组件的选项
export interface AreaSelectorOptions extends NestingOptionProps {
  areaList: Record<string, any>[]
  // 区域类型列表显示布局 以每个区域类型的code为key 默认为{column: 3, row: 0}
  layouts?: Record<string, GridLayout>
  // 区域编码改变时的回调
  areaCodeChange?: (code: string) => void
  // 区域类型改变时的回调
  areaTypeChange?: (type: string) => void
  // "行政区划"勾选的区县code列表改变时的回调
  districtListChange?: (list: string[]) => void
}

export interface AreaFilterOptions {
  areaType: string
  areaTypeName: string
  labelField: string
  valueField: string
}

export interface AreaSelectorProps {
  // 区域code
  modelValue?: string
  // 区域名称
  areaName?: string
  // 区域类型
  areaType?: string
  // 区域类型名称
  areaTypeName?: string
  // 可选择的区域类型名称列表
  areaTypeNames?: string[]
  // 当"行政区划"有下级区域时是否显示"展开/折叠所辖地区"按钮 默认显示
  showDistrict?: boolean
  // 多选配置 默认不启用
  multiple?: boolean | AreaSelectorMultipleConf
  /**
   * 区域过滤器
   * @since 1.0.57
   */
  areaFilter?: (area: Record<string, any>, options: AreaFilterOptions) => boolean
}

export interface MultipleConfRuleParam {
  areaType: string
  areaTypeName: string
  areaCodes: string[]
}

export interface AreaSelectorMultipleConf {
  // 是否启用多选 默认不启用
  enabled?: boolean
  // 多个区域code的分隔符 默认为','
  separator?: string
  /**
   * 多选时的判断规则 当enabled为true时有效 <br>
   * 默认仅**行政区划**返回所有code组成的数组，其他区域类型返回最后一个code组成的数组 <br>
   * @param oldVal 上一次选择
   * @param newVal 当前选择
   * @returns 区域code列表
   */
  rule?: (oldVal: MultipleConfRuleParam, newVal: MultipleConfRuleParam) => string[]
}
