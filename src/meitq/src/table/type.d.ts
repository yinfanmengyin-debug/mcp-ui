import type { EmptyOptions } from '@/src/empty/type'
import type { CellMeta, CellProperties, ColumnSettings, GridSettings } from 'handsontable/settings'
import type { Settings as NestedHeadersSettings } from 'handsontable/plugins/nestedHeaders/nestedHeaders'
import type { Settings as ContextMenuSettings } from 'handsontable/plugins/contextMenu/contextMenu'
import type { Settings as ColumnSortingSettings } from 'handsontable/plugins/columnSorting/columnSorting'
import type { Settings as MergeCellsSettings } from 'handsontable/plugins/mergeCells/mergeCells'
import { Settings as AutoColumnSizeSettings } from 'handsontable/plugins/autoColumnSize/autoColumnSize'
import { VNode } from 'vue'

export interface MtTableColumn extends Omit<ColumnSettings, 'label'> {
  // 列标题
  label: string
  // 列字段名
  prop?: string
  // 当前列宽度，优先使用列上的 width 控制宽度
  width?: number | string
  // 是否允许当前列参与排序，等价于 columnSorting 的简写配置
  sortable?: boolean
  /**
   * 字段格式化<br>
   * 不同的字段类型有不同的格式化方式
   * @link [数字格式](https://handsontable.com/docs/javascript-data-grid/numeric-cell-type/#format-numbers)<br>
   * @link [日期格式](https://handsontable.com/docs/javascript-data-grid/date-cell-type/#date-format)<br>
   * @link [时间格式](https://handsontable.com/docs/javascript-data-grid/time-cell-type/#usage)<br>
   */
  format?: string
  // 表格校验回调
  validator?: (value: any, callback: (valid: boolean) => void) => void
  // 自定义渲染函数（与handsontable的renderer互斥）
  render?: (row: Record<string, any>, rowIndex: number) => VNode
  // 表头单元格 className
  headerClassName?: string
  // 单元格 className，支持按行数据动态返回
  cellClassName?:
    | string
    | ((row: Record<string, any>, rowIndex: number, value: any, column: MtTableColumn, columnIndex: number) => string)
}

export type MtTableToolbarType = 'fullScreen' | 'downloadData'
export type MtTableDownloadMode = 'all' | 'selection'

export interface MtTableDownloadOptions {
  // 要导出的数据，不传时按 mode 决定导出范围
  data?: Record<string, any>[]
  // 导出文件名
  filename?: string
  // 导出模式：全部/选中
  mode?: MtTableDownloadMode
}

export interface MtTableDownloadPayload extends Required<Omit<MtTableDownloadOptions, 'data'>> {
  data: Record<string, any>[]
  columns: MtTableColumn[]
  // 调用内置导出逻辑，可基于当前事件载荷做二次覆盖
  download: (options?: MtTableDownloadOptions) => void
}

export interface MtTablePaginationOptions {
  // 总条数
  total?: number
  // 当前页码
  currentPage?: number
  // 每页条数
  pageSize?: number
  // 每页条数选项
  pageSizes?: number[]
  // 分页器数量
  pagerCount?: number
  // 分页器大小
  size?: 'large' | 'default' | 'small'
  // 是否禁用分页器
  disabled?: boolean
  // 是否隐藏单页分页器
  hideOnSinglePage?: boolean
  // 分页布局，透传 el-pagination 的 layout
  layout?: string
  // 是否显示每页条数切换
  showSizes?: boolean
  // 是否显示跳转到指定页
  showJumper?: boolean
  // 是否开启后端分页
  remote?: boolean
}

export type MtTablePagination = boolean | MtTablePaginationOptions

export interface MtTableProps {
  // 表格标题
  title?: string | string[]
  // 标题分隔符
  titleSeparator?: string
  // 列配置
  columns: MtTableColumn[]
  // 数据列表
  data: Record<string, any>[]
  // 是否显示 全屏/下载 工具栏
  toolbar?: boolean | MtTableToolbarType[]
  // 下载图标默认导出行为：全部/选中
  downloadMode?: MtTableDownloadMode
  // 是否由外部完全接管导出
  customDownload?: boolean
  // 分页配置
  pagination?: MtTablePagination
  // 是否显示编辑框
  editOutline?: boolean
  /**
   * 自定义单元格配置<br>
   * **慎用！！！** 该方法会在渲染每一个单元格前进行调用,若存在复杂逻辑则可能会降低表格的性能<br>
   * 详见 {@link [设置行选项](https://handsontable.com/docs/javascript-data-grid/configuration-options/#set-row-options)}
   */
  cells?: (this: CellProperties, row: number, column: number, prop: string | number) => CellMeta
  // 最大高度 (仅当 rowHeights 为 number 时有效)
  maxHeight?: number | string
  // 冻结到哪一列 (注意:不可设置为undefined,否则手动冻结列的操作会无效)
  fixedColumnsStart?: number
  // 设置顶部冻结的行数
  fixedRowsTop?: number
  // 设置底部冻结的行数
  fixedRowsBottom?: number
  // 列标题高度 number | number[]
  columnHeaderHeight?: number | Array<number>
  // 设置列的宽度（以像素为单位）
  colWidths?:
    | number
    | string
    | number[]
    | string[]
    | undefined[]
    | Array<number | string | undefined>
    | ((index: number) => string | number | undefined)
  // 行的 className 的回调方法, 也可以使用字符串为所有行设置一个固定的 className
  rowClassName?: ((row: Record<string, any>, rowIndex: number) => string) | string
  // 行高度
  rowHeights?:
    | number
    | string
    | number[]
    | string[]
    | undefined[]
    | Array<number | string | undefined>
    | ((index: number) => string | number | undefined)
  // 最左侧行标题,一般用于展示行号
  rowHeaders?: boolean | string[] | ((index: number) => string)
  // 行号列的标题
  rowHeaderTitle?: string
  // 行标题宽度 number | number[]
  rowHeaderWidth?: number | Array<number>
  /**
   * 启用此插件可能会降低整体表格性能，因为它需要计算所有单元格的宽度以相应地调整列宽
   * 详见 {@link [自动列宽](https://handsontable.com/docs/javascript-data-grid/api/auto-column-size)}
   */
  // 是否开启自动列宽 默认为false
  autoColumnSize?: AutoColumnSizeSettings
  // 是否只读
  readOnly?: boolean
  // 右键菜单
  contextMenu?: ContextMenuSettings
  // 列排序
  columnSorting?: ColumnSortingSettings
  // 单元格是否可复制
  copyable?: boolean
  // 是否开启筛选
  filters?: boolean
  // 是否显示表头的下拉式菜单
  dropdownMenu?: boolean
  /**
   * 合并单元格配置<br>
   * 详见 {@link [合并单元格](https://handsontable.com/docs/javascript-data-grid/merge-cells)}
   */
  mergeCells?: MergeCellsSettings
  /**
   * 合并表头配置<br>
   * 详见 {@link [合并表头](https://handsontable.com/docs/javascript-data-grid/api/nested-headers)}
   */
  nestedHeaders?: NestedHeadersSettings
  /**
   * 用于覆盖默认配置或设置上面未列出的其他配置选项<br>
   * 详见 {@link [配置选项](https://handsontable.com/docs/javascript-data-grid/api/options)}
   */
  options?: GridSettings
  // 全屏时的目标元素的选择器 默认 'body'
  fullscreenTarget?: string
  // 全屏时的padding 必须带单位 如 '10px' '10px 20px' 默认 '20px'
  fullscreenPadding?: string
  // 是否要高亮当前行 (开启单选支持) 默认 false
  highlightCurrentRow?: boolean
  // 是否开启多选 默认 false. 当为函数时,返回false表示禁用, null或undefined表示不显示多选框
  multipleSelection?: boolean | ((row: any, rowIndex: number) => boolean | null | undefined)
  // 空状态组件的配置属性
  emptyOptions?: EmptyOptions
}
