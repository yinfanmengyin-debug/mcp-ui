<script setup lang="ts">
import { datePickerConfig, datetimeRenderer, getDropdownMenu } from '@/src/table/option'
import { HotTable } from '@handsontable/vue3'
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, render, shallowRef, watch } from 'vue'
import { registerLanguageDictionary, zhCN } from 'handsontable/i18n'
import {
  registerAllCellTypes,
  registerAllEditors,
  registerAllModules,
  registerAllPlugins,
  registerAllRenderers,
  registerAllValidators
} from 'handsontable/registry'
import { cloneDeep, uniqueId } from 'lodash-es'
import { read, utils, writeFileXLSX } from 'xlsx'
import { useFullscreen } from '@/hooks/useFullscreen'

import DownloadDataIcon from '@/src/chart/icons/downloadDataIcon.vue'
import FullScreenIcon from '@/src/chart/icons/fullScreenIcon.vue'
import MtEmpty from '@/src/empty/index.vue'
import Handsontable from 'handsontable'

import type HandsontableType from 'handsontable'
import type { EmptyOptions } from '@/src/empty/type'
import type {
  MtTableColumn,
  MtTableDownloadMode,
  MtTableDownloadOptions,
  MtTableDownloadPayload,
  MtTablePagination,
  MtTableToolbarType
} from './type'
import type { Sheet } from 'xlsx'

import './style/index.scss'
import 'element-plus/es/components/tabs/style/css'
import 'element-plus/es/components/tab-pane/style/css'
import 'element-plus/es/components/pagination/style/css'
import 'handsontable/dist/handsontable.full.css'

type Core = HandsontableType.Core
type CellMeta = HandsontableType.CellMeta
type CellProperties = HandsontableType.CellProperties
type ColumnSettings = HandsontableType.ColumnSettings
type GridSettings = HandsontableType.GridSettings
type NestedHeadersSettings = HandsontableType.plugins.NestedHeaders.Settings
type ColumnSortingSettings = HandsontableType.plugins.ColumnSorting.Settings
type MergeCellsSettings = HandsontableType.plugins.MergeCells.Settings
type AutoColumnSizeSettings = HandsontableType.plugins.AutoColumnSize.Settings
type ContextMenuSettings = HandsontableType.plugins.ContextMenu.Settings
type PredefinedMenuItemKey = HandsontableType.plugins.ContextMenu.PredefinedMenuItemKey
type BaseRenderer = typeof HandsontableType.renderers.BaseRenderer

// 注册handsontable所有单元格类型
registerAllCellTypes()
// 注册handsontable所有编辑器
registerAllEditors()
// 注册handsontable所有模块
registerAllModules()
// 注册handsontable所有插件
registerAllPlugins()
// 注册handsontable所有渲染器
registerAllRenderers()
// 注册handsontable所有检验器
registerAllValidators()
// 注册中文语言
registerLanguageDictionary(zhCN)

defineOptions({ name: 'MtTable' })

const props = withDefaults(
  defineProps<{
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
    pagination?: MtTablePagination
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
    // 是否显示编辑框
    editOutline?: boolean
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
  }>(),
  {
    maxHeight: undefined,
    title: '',
    titleSeparator: '_',
    toolbar: true,
    downloadMode: 'all',
    customDownload: false,
    pagination: false,
    cells: undefined,
    fixedColumnsStart: 0,
    fixedRowsTop: 0,
    fixedRowsBottom: 0,
    columnHeaderHeight: 40,
    rowHeights: 30,
    rowHeaders: true,
    rowHeaderWidth: undefined,
    rowHeaderTitle: '序号',
    readOnly: true,
    contextMenu: true,
    columnSorting: true,
    copyable: true,
    filters: true,
    dropdownMenu: true,
    mergeCells: false,
    options: undefined,
    fullscreenTarget: 'body',
    fullscreenPadding: '20px',
    highlightCurrentRow: false,
    multipleSelection: false,
    emptyOptions: () => ({
      borderWidth: 0
    })
  }
)

const emit = defineEmits<{
  currentChange: [currentRow: any, oldRow: any]
  select: [selection: any[], row: any]
  selectAll: [selection: any[]]
  selectionChange: [newSelection: any[]]
  sizeChange: [pageSize: number]
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
  'page-change': [page: number, size: number]
  download: [payload: MtTableDownloadPayload]
}>()

defineSlots<{
  'before-toolbar': () => void
  'after-toolbar': () => void
  'before-pagination': () => void
  'after-pagination': () => void
}>()

defineExpose({
  getSheet,
  getInstance,
  save,
  mergeSave,
  getCSVString,
  downloadData,
  setCurrentRow,
  clearSelection,
  getSelectionRows,
  getVisibleData,
  toggleRowSelection,
  toggleAllSelection
})

// 表格容器id
const mtTableContainerId = uniqueId('MtTableContainer')

// ResizeObserver 实例
let resizeObserver: ResizeObserver | null = null

const { isFullscreen, toggle } = useFullscreen({
  appendTo: props.fullscreenTarget,
  target: `#${mtTableContainerId}`,
  padding: props.fullscreenPadding,
  zIndex: 2000
})

const hasMergeCells = computed(() => {
  return (
    (typeof props.mergeCells === 'boolean' && props.mergeCells) ||
    (Array.isArray(props.mergeCells) && !!props.mergeCells.length)
  )
})

const titles = computed(() => {
  if (Array.isArray(props.title)) {
    return props.title
  }
  return props.title ? [props.title] : []
})

// 工具栏
const toolbarList = computed<MtTableToolbarType[]>(() => {
  if (typeof props.toolbar === 'boolean') return props.toolbar ? ['fullScreen', 'downloadData'] : []
  if (Array.isArray(props.toolbar)) return props.toolbar
  return []
})

// 表格实例
const table = shallowRef<InstanceType<typeof HotTable>>()

const paginationEnabled = computed(() => {
  return props.pagination === true || (typeof props.pagination === 'object' && props.pagination !== null)
})

const isRemotePagination = computed(() => {
  return typeof props.pagination === 'object' && props.pagination?.remote === true
})

const isLocalPagination = computed(() => {
  return paginationEnabled.value && !isRemotePagination.value
})

// 需要隐藏下拉菜单的列的索引
let hideDropdownMenuColumnIndexes: number[] = []

type LocalSortConfig = {
  column: number
  sortOrder: 'asc' | 'desc'
}

type LocalFilterCondition = {
  args: any[]
  name?: string
  command?: {
    key: string
  }
}

type LocalFilterColumnConditions = {
  column: number
  conditions: LocalFilterCondition[]
  operation?: 'conjunction' | 'disjunction'
}

type TableRowState = {
  row: Record<string, any>
  sourceIndex: number
}

const localSortConfig = ref<LocalSortConfig[]>([])
const localFilterConditions = ref<LocalFilterColumnConditions[]>([])

// 克隆本地排序配置，避免直接复用 Handsontable 插件内部对象引用。
// 用于本地分页 + 本地排序分支，在翻页和 loadData 后回灌排序状态。
function cloneSortConfig(sortConfigs: LocalSortConfig[] = []) {
  return sortConfigs.map(item => ({
    column: item.column,
    sortOrder: item.sortOrder
  }))
}

// 统一计算列排序配置。
// 非本地分页时继续沿用组件原始排序配置，本地分页时追加 initialConfig 以恢复排序指示器和状态。
function getColumnSortingSetting() {
  if (hasMergeCells.value) return false
  if (!isLocalPagination.value) return props.columnSorting
  if (!props.columnSorting) return props.columnSorting

  const baseSetting = typeof props.columnSorting === 'object' && props.columnSorting !== null ? props.columnSorting : {}

  return {
    ...baseSetting,
    indicator: baseSetting.indicator ?? true,
    headerAction: baseSetting.headerAction ?? true,
    initialConfig: localSortConfig.value
  }
}

// 将源数据包装成带 sourceIndex 的结构，供本地过滤、排序、分页切片共用。
// 仅用于本地分页分支，保证切片后还能追溯到原始数据行。
function getAllRowStates() {
  return (props.data ?? []).map((row, sourceIndex) => ({
    row,
    sourceIndex
  }))
}

// 通过列配置里的 prop 读取当前列对应的字段值。
// 用于本地排序、过滤候选项生成和过滤条件匹配。
function getColumnValue(row: Record<string, any>, columnIndex: number) {
  const column = props.columns[columnIndex]
  if (!column?.prop) return undefined
  return row[column.prop]
}

// 统一处理列级排序配置。
// 当 sortable 为 false 或 columnSorting 为 false 时，同时关闭表头点击排序和排序箭头显示。
function getColumnSortingByColumn(column: MtTableColumn) {
  const columnSorting = column.sortable === undefined ? column.columnSorting : column.sortable
  if (columnSorting === false) {
    return {
      indicator: false,
      headerAction: false
    }
  }
  return columnSorting
}

// 统一过滤候选值中的空值表示，避免 null/undefined 在过滤面板里出现多种空值形态。
// 用于本地分页过滤分支的“按值筛选”候选项生成。
function normalizeFilterOptionValue(value: any) {
  return value == null ? '' : value
}

// 读取当前列已选中的 by_value 条件值。
// 用于本地分页过滤分支，在重新生成过滤菜单候选项时保留当前勾选状态。
function getSelectedByValueArgs(columnIndex: number) {
  const currentColumnFilter = localFilterConditions.value.find(item => item.column === columnIndex)
  const byValueCondition = currentColumnFilter?.conditions.find(condition => {
    const conditionName = condition.name || condition.command?.key
    return conditionName === 'by_value'
  })
  const selectedValues = byValueCondition?.args?.[0]
  return Array.isArray(selectedValues) ? selectedValues : null
}

// 按传入的过滤条件集合筛选行数据。
// 用于本地分页过滤分支：
// 1. 计算真正参与分页的数据结果集；
// 2. 生成过滤菜单候选项时，根据“其他列过滤条件”缩小当前列可选值范围。
function getFilteredRowStatesByConditions(rows: TableRowState[], conditions: LocalFilterColumnConditions[]) {
  const hot = table.value?.hotInstance
  if (!hot) return rows
  if (!conditions.length) return rows

  const filtersPlugin = hot.getPlugin('filters') as any
  const ConditionCollectionCtor = filtersPlugin?.conditionCollection?.constructor
  if (!ConditionCollectionCtor) return rows

  const conditionCollection = new ConditionCollectionCtor(hot, false)
  conditionCollection.importAllConditions(cloneDeep(conditions))
  if (!conditionCollection || conditionCollection.isEmpty?.()) {
    return rows
  }
  const filteredColumns = conditionCollection.getFilteredColumns?.() ?? []
  if (!filteredColumns.length) {
    return rows
  }
  return rows.filter(rowState =>
    filteredColumns.every((column: number) => conditionCollection.isMatch(getFilterCellData(rowState, column), column))
  )
}

// 同步过滤菜单中的“按值筛选”候选项。
// 用于本地分页过滤分支，解决下拉面板候选项只来自当前页的问题；
// 当前列的候选项来源于“其他列过滤后的结果集”，而不是裸全量数据或当前页数据。
function syncGlobalFilterOptions() {
  if (!isLocalPagination.value) return
  const hot = table.value?.hotInstance
  if (!hot) return
  const filtersPlugin = hot.getPlugin('filters') as any
  const selectedColumn = filtersPlugin?.getSelectedColumn?.()
  const valueComponent = filtersPlugin?.components?.get?.('filter_by_value')
  const multipleSelect = valueComponent?.getMultipleSelectElement?.()
  if (!selectedColumn || !multipleSelect) return

  const locale = hot.getCellMeta(0, selectedColumn.visualIndex).locale
  const blankLabel = hot.getTranslatedPhrase('FILTERS_VALUES_BLANK_CELLS')
  const selectedValues = getSelectedByValueArgs(selectedColumn.visualIndex)
  const checkedValueSet = selectedValues ? new Set(selectedValues.map(normalizeFilterOptionValue)) : null
  const optionMap = new Map<any, { checked: boolean; value: any; visualValue: string }>()
  const relatedConditions = localFilterConditions.value.filter(item => item.column !== selectedColumn.visualIndex)
  const candidateRows = getFilteredRowStatesByConditions(getAllRowStates(), relatedConditions)

  candidateRows.forEach(({ row }) => {
    const rawValue = normalizeFilterOptionValue(getColumnValue(row, selectedColumn.visualIndex))
    if (optionMap.has(rawValue)) return
    optionMap.set(rawValue, {
      checked: checkedValueSet ? checkedValueSet.has(rawValue) : true,
      value: rawValue,
      visualValue: rawValue === '' ? blankLabel : String(rawValue)
    })
  })

  const items = Array.from(optionMap.values()).sort((prev, next) =>
    String(prev.visualValue).localeCompare(String(next.visualValue), locale || 'zh-CN', {
      numeric: true,
      sensitivity: 'base'
    })
  )

  multipleSelect.setItems(items)
  multipleSelect.setValue(items.filter(item => item.checked).map(item => item.value))
  multipleSelect.setLocale(locale)
}

// 组装 Handsontable 过滤条件匹配所需的 value/meta 结构。
// 用于本地分页过滤分支，让本地过滤行为尽量与 Handsontable 原生过滤规则保持一致。
function getFilterCellData(rowState: TableRowState, columnIndex: number) {
  const column = props.columns[columnIndex]
  return {
    value: getColumnValue(rowState.row, columnIndex),
    meta: {
      row: rowState.sourceIndex,
      col: columnIndex,
      visualCol: columnIndex,
      visualRow: rowState.sourceIndex,
      type: column?.type ?? '',
      instance: table.value!.hotInstance,
      dateFormat: column?.type === 'date' ? column.format || 'YYYY-MM-DD' : undefined
    }
  }
}

// 使用当前本地过滤条件筛选行数据。
// 用于本地分页过滤主链路，供 processedRowStates 计算“全量过滤后再分页”的结果。
function getFilteredRowStates(rows: TableRowState[]) {
  return getFilteredRowStatesByConditions(rows, localFilterConditions.value)
}

// 统一比较不同类型单元格值。
// 用于本地分页排序分支，兼容数字、日期、字符串排序。
function compareTableValue(a: any, b: any) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b

  const normalizedA = typeof a === 'string' ? a.trim() : a
  const normalizedB = typeof b === 'string' ? b.trim() : b
  const numberA = Number(normalizedA)
  const numberB = Number(normalizedB)

  if (normalizedA !== '' && normalizedB !== '' && Number.isFinite(numberA) && Number.isFinite(numberB)) {
    return numberA - numberB
  }

  const timeA = new Date(a).getTime()
  const timeB = new Date(b).getTime()

  if (Number.isFinite(timeA) && Number.isFinite(timeB)) {
    return timeA - timeB
  }

  return String(a).localeCompare(String(b), 'zh-CN', {
    numeric: true,
    sensitivity: 'base'
  })
}

// 根据当前本地排序配置对结果集排序。
// 用于本地分页排序分支，在过滤结果上继续做全量排序。
function getSortedRowStates(rows: TableRowState[]) {
  if (!localSortConfig.value.length) return rows
  const sortConfigs = localSortConfig.value.filter(item => item.sortOrder === 'asc' || item.sortOrder === 'desc')
  if (!sortConfigs.length) return rows

  return [...rows].sort((prev, next) => {
    for (const config of sortConfigs) {
      const result = compareTableValue(getColumnValue(prev.row, config.column), getColumnValue(next.row, config.column))
      if (result !== 0) {
        return config.sortOrder === 'desc' ? -result : result
      }
    }
    return prev.sourceIndex - next.sourceIndex
  })
}

const allRowStates = computed(() => {
  return getAllRowStates()
})

const processedRowStates = computed(() => {
  if (!isLocalPagination.value) {
    return allRowStates.value
  }
  return getSortedRowStates(getFilteredRowStates(allRowStates.value))
})

// 将视觉行索引映射为当前 HotTable 实例里的物理行索引。
// 用于本地分页渲染分支，保证当前页切片后 renderer/多选仍能取到正确行。
function getPhysicalRowByVisualRow(visualRow: number) {
  const hot = table.value?.hotInstance
  if (!hot) return visualRow
  const physicalRow = hot.toPhysicalRow(visualRow)
  return typeof physicalRow === 'number' ? physicalRow : visualRow
}

// 兜底修正当前页页码，避免过滤或删除数据后页码越界。
// 用于本地分页分支，在切片前先得到合法页码。
const safeCurrentPage = computed(() => {
  if (!isLocalPagination.value) return currentPage.value
  const total = processedRowStates.value.length
  const maxPage = Math.max(1, Math.ceil(total / Math.max(1, pageSize.value)))
  return Math.min(Math.max(1, currentPage.value), maxPage)
})

// 基于“全量过滤 + 全量排序”结果做当前页切片。
// 用于本地分页主链路，最终决定表格当前页实际显示哪些行。
const displayRowStates = computed(() => {
  if (!isLocalPagination.value) return processedRowStates.value
  const start = (safeCurrentPage.value - 1) * pageSize.value
  return processedRowStates.value.slice(start, start + pageSize.value)
})

// 读取当前页视觉行对应的切片数据。
// 用于本地分页渲染、多选、行样式、自定义 render 等依赖当前页数据的分支。
function getDisplayRowStateByVisualRow(visualRow: number) {
  const physicalRow = getPhysicalRowByVisualRow(visualRow)
  return displayRowStates.value[physicalRow]
}

// 根据当前页视觉行拿到源数据索引。
// 用于本地分页分支，向外部回调透出正确的原始数据行索引。
function getSourceRowIndexByVisualRow(visualRow: number) {
  return getDisplayRowStateByVisualRow(visualRow)?.sourceIndex ?? -1
}

// 根据当前页视觉行拿到真实行数据。
// 用于本地分页分支的行头选择、自定义渲染、当前行高亮等场景。
function getRowDataByVisualRow(visualRow: number) {
  return getDisplayRowStateByVisualRow(visualRow)?.row
}

// 统一计算分页场景下的行头序号。
// 只要开启分页，就按 currentPage 和 pageSize 计算真实序号；
// 未开启分页时退回到当前表格可见索引。
function getPagedRowHeaderIndex(index: number) {
  if (!paginationEnabled.value) {
    return index
  }
  return (safeCurrentPage.value - 1) * pageSize.value + index
}

// 统一计算行头显示内容。
// 分页场景下需要把 Handsontable 传入的当前页索引修正为“分页后的真实序号”：
// 1. rowHeaders 为 true 时，显示按 currentPage/pageSize 计算后的序号；
// 2. rowHeaders 为函数时，向用户函数传入修正后的真实序号索引。
function getRowHeadersSetting() {
  if (!props.rowHeaders) {
    return props.rowHeaders
  }

  if (props.rowHeaders === true) {
    return (index: number) => getPagedRowHeaderIndex(index) + 1
  }

  if (typeof props.rowHeaders === 'function') {
    return (index: number) => (props.rowHeaders as any)(getPagedRowHeaderIndex(index))
  }

  if (Array.isArray(props.rowHeaders)) {
    return props.rowHeaders
  }

  return props.rowHeaders
}

// 生成当前页真正喂给 HotTable 的数据。
// 本地分页时取当前页切片；存在合并单元格时做一次深拷贝，避免 Handsontable 修改源数据。
const displayData = computed(() => {
  const list = displayRowStates.value.map(item => item.row)
  if (hasMergeCells.value) {
    return cloneDeep(list)
  }
  return list
})

// 统一设置传给 HotTable settings.data 的数据源。
// 非本地分页分支直接走原始数据；本地分页分支只通过 loadData 推送数据，因此这里返回空数组避免响应式环。
const hotData = computed(() => {
  if (isLocalPagination.value) {
    return []
  }
  if (hasMergeCells.value) {
    return cloneDeep(props.data ?? [])
  }
  return props.data ?? []
})

let isSyncingTableData = false

// 将本地过滤状态回灌给 Handsontable filters 插件。
// 用于本地分页过滤分支，保证翻页或重新 loadData 后过滤面板状态仍然正确。
function syncLocalFilterPluginState(hot: Handsontable) {
  const filtersPlugin = hot.getPlugin('filters') as any
  const conditionCollection = filtersPlugin?.conditionCollection
  if (!conditionCollection) return

  conditionCollection.clean()

  if (localFilterConditions.value.length) {
    conditionCollection.importAllConditions(cloneDeep(localFilterConditions.value))
  }
}

// 同步当前需要显示的数据到 HotTable。
// 本地分页分支走“切片数据 + 恢复本地排序/过滤状态”；
// 非本地分页分支直接重载外部传入的最新数据，保证父组件重新传值后表格立即刷新。
function syncTableData() {
  if (isSyncingTableData) return
  const hot = table.value?.hotInstance
  if (!hot) return
  isSyncingTableData = true
  try {
    hot.loadData(isLocalPagination.value ? displayData.value : hotData.value)
    // 本地分页通过 loadData 切换当前页数据时，Handsontable 会重新计算 autoColumnSize/stretchH，
    // 导致列宽随着当前页内容变化。这里先缓存现有列宽，再在 loadData 后恢复。
    const preservedColWidths =
      isLocalPagination.value && !props.colWidths
        ? Array.from({ length: hot.countCols() }, (_, index) => hot.getColWidth(index))
        : []

    if (isLocalPagination.value) {
      syncLocalFilterPluginState(hot)
      const columnSortPlugin = hot.getPlugin('columnSorting') as any
      const sortConfig = cloneSortConfig(localSortConfig.value)
      if (sortConfig.length) {
        columnSortPlugin?.setSortConfig(sortConfig)
      } else {
        columnSortPlugin?.clearSort?.()
      }
    }
    if (preservedColWidths.length) {
      hot.updateSettings(
        {
          colWidths: preservedColWidths
        },
        false
      )
    }
    hot.render()
  } finally {
    isSyncingTableData = false
  }
}

// 同步本地分页状态，包括总条数、当前页和页大小的兜底修正。
// 用于本地分页分支，在排序/过滤/数据切换后确保页码和总数始终合法。
function syncLocalPaginationState(forceFirstPage = false) {
  const total = isLocalPagination.value ? processedRowStates.value.length : props.data.length
  paginationTotal.value = total

  if (!isLocalPagination.value) return

  if (forceFirstPage && currentPage.value !== 1) {
    currentPage.value = 1
    emit('update:currentPage', 1)
  }

  if (pageSize.value < 1) {
    pageSize.value = 1
    emit('update:pageSize', 1)
  }

  const maxPage = Math.max(1, Math.ceil(total / pageSize.value))
  if (currentPage.value < 1) {
    currentPage.value = 1
    emit('update:currentPage', 1)
  } else if (currentPage.value > maxPage) {
    currentPage.value = maxPage
    emit('update:currentPage', maxPage)
  }
}

const settings = computed<GridSettings>(() => {
  const { columns, colHeaders } = handleColumns()
  const hasIndexRowHeader = !!props.rowHeaders
  const checkboxHeaderColumn = props.multipleSelection ? (hasIndexRowHeader ? -2 : -1) : null
  const indexHeaderColumn = hasIndexRowHeader ? -1 : null

  // 需要隐藏下拉菜单的列的索引
  hideDropdownMenuColumnIndexes = columns.reduce((prev, cur, index) => {
    if (cur.dropdownMenu === false) {
      prev.push(index)
    }
    return prev
  }, [] as number[])

  // 开启多选时的行头
  const checkboxCell = (index: number) => {
    const row = getSourceRowIndexByVisualRow(index)
    const rowData = getRowDataByVisualRow(index)
    if (!rowData) return ''
    const disabled = typeof props.multipleSelection === 'function' ? props.multipleSelection(rowData, row) : false
    if (typeof disabled === 'boolean') {
      return `<input type="checkbox" ${selectionRows.includes(rowData) ? 'checked' : ''} ${disabled ? 'disabled' : ''} />`
    }
    return ''
  }

  const bindRowHeaderCheckbox = (visualRow: number, TH: HTMLTableHeaderCellElement) => {
    const row = getSourceRowIndexByVisualRow(visualRow)
    const rowData = getRowDataByVisualRow(visualRow)
    if (!rowData) return
    const disabled = typeof props.multipleSelection === 'function' ? props.multipleSelection(rowData, row) : false
    const checkbox = TH.querySelector('input')
    if (!checkbox) return
    if (disabled) {
      checkbox.disabled = true
      return
    }

    checkbox.onmousedown = e => e.stopPropagation()
    checkbox.onclick = e => {
      e.stopPropagation()
      const selectionIndex = selectionRows.findIndex(item => item === rowData)
      if (selectionIndex > -1) {
        selectionRows.splice(selectionIndex, 1)
      } else {
        selectionRows.push(rowData)
      }
      emit('select', [...selectionRows], rowData)
      updateRowSelectionStatus()
    }
  }

  // 行头标题
  const rowHeaderTitleCell = (column: number, TH: HTMLElement, headerLevel: number) => {
    const nestedHeadersLength = props.nestedHeaders?.length
    // 行头列标题
    if (headerLevel === (nestedHeadersLength ? nestedHeadersLength - 1 : 0)) {
      if (props.multipleSelection && column === checkboxHeaderColumn) {
        // 获取当前页（可见的）数据
        const visibleData = getVisibleData()
        // 可选行
        const selectableRows = visibleData.filter(row => {
          const rowIndex = props.data.findIndex(item => item === row)
          return rowIsSelectable(row, rowIndex)
        })
        let [checked, indeterminate] = [false, false]
        const checkedCount = selectionRows.filter(item => selectableRows.includes(item)).length
        if (checkedCount === 0) {
          checked = false
          indeterminate = false
        } else if (checkedCount >= selectableRows.length && selectableRows.length > 0) {
          checked = true
          indeterminate = false
        } else {
          checked = false
          indeterminate = true
        }
        TH.innerHTML = `<input type="checkbox" ${checked ? 'checked' : ''} />`
        const checkbox = TH.querySelector('input')!
        checkbox.onclick = () => {
          toggleCurrentPageSelection()
          emit('selectAll', selectionRows)
        }
        if (indeterminate) {
          checkbox.indeterminate = true
        }
        return
      }
      // 行头标题 '序号'
      else if (props.rowHeaders && props.rowHeaderTitle && column === indexHeaderColumn) {
        TH.innerHTML = props.rowHeaderTitle as string
        TH.style.fontWeight = 'bold'
      }
    }
  }

  return {
    width: '100%',
    height: '100%',
    // Local pagination uses hot.loadData() to avoid reactive feedback loops.
    data: hotData.value,
    columns,
    colHeaders,
    cells: props.cells,
    className: 'htCenter htMiddle',
    columnHeaderHeight: props.columnHeaderHeight,
    colWidths: props.colWidths,
    rowHeights: props.rowHeights,
    rowHeaders: getRowHeadersSetting(),
    rowHeaderWidth: props.rowHeaderWidth,
    // 有合并单元格时禁用列排序
    columnSorting: getColumnSortingSetting(),
    contextMenu: props.contextMenu,
    language: zhCN.languageCode,
    copyable: props.copyable,
    copyPaste: {
      copyColumnHeaders: true
    },
    filters: props.filters,
    dropdownMenu: props.dropdownMenu ? (getDropdownMenu(props.filters) as PredefinedMenuItemKey[]) : false,
    datePickerConfig,
    fixedColumnsStart: props.fixedColumnsStart,
    fixedRowsTop: props.fixedRowsTop,
    fixedRowsBottom: props.fixedRowsBottom,
    hiddenColumns: {
      copyPasteEnabled: false,
      indicators: true
    },
    manualColumnFreeze: true,
    manualColumnMove: false,
    manualColumnResize: false,
    mergeCells: props.mergeCells,
    nestedHeaders: props.nestedHeaders,
    autoWrapCol: false,
    autoWrapRow: true,
    autoColumnSize: props.autoColumnSize,
    allowInsertColumn: !props.readOnly,
    allowInsertRow: !props.readOnly,
    allowRemoveColumn: !props.readOnly,
    allowRemoveRow: !props.readOnly,
    undo: !props.readOnly,
    comments: !props.readOnly,
    clear: !props.readOnly,
    fillHandle: !props.readOnly,
    stretchH: 'all',
    wordWrap: false,
    ...props.options,
    afterGetColHeader: (column: number, TH: HTMLElement, headerLevel: number) => {
      rowHeaderTitleCell(column, TH, headerLevel)
      applyHeaderClassName(column, TH)
      props.dropdownMenu && hideDropdownMenu(hideDropdownMenuColumnIndexes, column, TH)
    },
    afterGetRowHeaderRenderers: props.multipleSelection
      ? (renderers: Array<(row: number, TH: HTMLTableHeaderCellElement) => void>) => {
          renderers.unshift((visualRow: number, TH: HTMLTableHeaderCellElement) => {
            TH.innerHTML = checkboxCell(visualRow)
            bindRowHeaderCheckbox(visualRow, TH)
          })
        }
      : undefined,
    afterDropdownMenuShow: () => {
      syncGlobalFilterOptions()
    },
    // 点击行头以选中行 (开启多选)
    afterGetRowHeader: undefined,
    beforeColumnSort: (_currentSortConfig: unknown, destinationSortConfigs: LocalSortConfig[]) => {
      if (!isLocalPagination.value) return
      if (isSyncingTableData) return false
      const columnSortPlugin = table.value?.hotInstance.getPlugin('columnSorting') as any
      const nextSortConfig = cloneSortConfig(
        (destinationSortConfigs ?? []).filter(item => item.sortOrder === 'asc' || item.sortOrder === 'desc')
      )
      columnSortPlugin?.setSortConfig(nextSortConfig)
      localSortConfig.value = nextSortConfig
      syncLocalPaginationState(true)
      syncTableData()
      return false
    },
    beforeFilter: (conditionsStack: LocalFilterColumnConditions[]) => {
      if (!isLocalPagination.value) return
      if (isSyncingTableData) return false
      localFilterConditions.value = cloneDeep(conditionsStack ?? [])
      syncLocalPaginationState(true)
      updateRowSelectionStatus()
      syncTableData()
      return false
    },
    beforeRenderer,
    licenseKey: 'non-commercial-and-evaluation'
  }
})

const currentPage = ref(1)
const pageSize = ref(10)
const paginationTotal = ref(0)

watch(
  () => props.pagination,
  value => {
    if (!paginationEnabled.value) return
    if (typeof value === 'object' && value) {
      if (typeof value.currentPage === 'number' && Number.isFinite(value.currentPage)) {
        currentPage.value = Math.max(1, Math.floor(value.currentPage))
      }
      if (typeof value.pageSize === 'number' && Number.isFinite(value.pageSize)) {
        pageSize.value = Math.max(1, Math.floor(value.pageSize))
      }
    }
  },
  { deep: true, immediate: true }
)

const paginationTotalNum = computed(() => {
  if (typeof props.pagination === 'object' && props.pagination !== null) {
    if (typeof props.pagination.total === 'number') {
      return props.pagination.total
    }
  }
  return isRemotePagination.value ? 0 : paginationTotal.value
})

function getPaginationLayout(pagination: Record<string, any>) {
  if (typeof pagination.layout === 'string' && pagination.layout.trim()) {
    return pagination.layout
  }

  const layoutItems = ['prev', 'pager', 'next']
  if (pagination.showSizes) {
    layoutItems.unshift('sizes')
  }
  if (pagination.showJumper) {
    layoutItems.push('jumper')
  }
  return layoutItems.join(', ')
}

const paginationBind = computed<Record<string, any>>(() => {
  if (!paginationEnabled.value) return {}
  const p = typeof props.pagination === 'object' && props.pagination ? props.pagination : {}
  return {
    background: true,
    layout: getPaginationLayout(p),
    pageSizes: p.pageSizes ?? [10, 20, 30, 40, 50, 100],
    ...p,
    total: paginationTotalNum.value,
    currentPage: p.currentPage ?? safeCurrentPage.value,
    pageSize: p.pageSize ?? pageSize.value
  }
})

const headerHeight = computed(() => {
  return Array.isArray(props.columnHeaderHeight) ? Math.max(...props.columnHeaderHeight) : props.columnHeaderHeight
})

// 表格实际高度
const actualHeight = computed(() => {
  const contentHeight =
    (isRemotePagination.value ? props.data.length : paginationTotalNum.value) * ((props.rowHeights as number) + 1)
  const _headerHeight = headerHeight.value + 2
  const titleHeight = titles.value.length ? titles.value.length * 20 + 10 : 0
  return `${contentHeight + _headerHeight + titleHeight}px`
})

const maxHeight = computed(() => {
  if (props.maxHeight === undefined || props.maxHeight === null) return
  if (!Number.isNaN(Number(props.maxHeight))) return `${props.maxHeight}px`
  return props.maxHeight
})

onMounted(() => {
  nextTick(() => {
    syncLocalPaginationState()
    syncTableData()

    // 监听容器尺寸变化
    const container = document.getElementById(mtTableContainerId)
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        // 容器尺寸变化时，重新渲染表格
        if (table.value?.hotInstance) {
          // 使用 updateSettings 触发完整重新计算
          table.value.hotInstance.updateSettings({
            width: '100%',
            height: '100%'
          })
        }
      })
      resizeObserver.observe(container)
    }
  })
  window.addEventListener('keydown', onEsc)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEsc)
  // 清理 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

// 当前单选选中行
let selectedRow: Record<string, any> | undefined
// 当前多选选中行
let selectionRows: Record<string, any>[] = []

watch(
  () => props.data,
  () => {
    setCurrentRow(undefined, false)
    clearSelection()
    syncLocalPaginationState()
    nextTick(() => {
      syncTableData()
    })
  }
)

watch(
  () => [paginationEnabled.value, currentPage.value, pageSize.value, props.columns, hasMergeCells.value] as const,
  () => {
    syncLocalPaginationState()
    nextTick(() => {
      syncTableData()
    })
  },
  { deep: true }
)

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggle()
  }
}

function onPaginationUpdateCurrentPage(value: number) {
  currentPage.value = value
  emit('update:currentPage', value)
  if (isRemotePagination.value) {
    emit('page-change', value, pageSize.value)
  }
}

function onPaginationChange(currentPageValue: number, pageSizeValue: number) {
  if (!isRemotePagination.value) {
    emit('page-change', currentPageValue, pageSizeValue)
  }
}

function onPaginationUpdatePageSize(value: number) {
  pageSize.value = value
  currentPage.value = 1
  emit('update:pageSize', value)
  emit('update:currentPage', 1)
  if (isRemotePagination.value) {
    emit('page-change', 1, value)
  }
}

function beforeRenderer(
  TD: HTMLTableCellElement,
  _1: number,
  col: number,
  _2: string | number,
  value: any,
  cellProperties: CellProperties
) {
  const TR = TD.parentElement
  const sourceRowIndex = getSourceRowIndexByVisualRow(cellProperties.row)
  const rowData = getRowDataByVisualRow(cellProperties.row)
  if (!rowData) return
  const columnItem = props.columns[col]
  // 行样式
  if (props.rowClassName && col === 0 && TR) {
    const rowClassName = props.rowClassName
    const className = typeof rowClassName === 'string' ? rowClassName : rowClassName(rowData, sourceRowIndex)
    const addedClassName = TR.dataset.addedClassName
    addedClassName && (TR.className = TR.className.replace(addedClassName, ''))
    TR.dataset.addedClassName = className
    className && TR.classList.add(className)
  }
  // 高亮当前行 (开启单选)
  if (props.highlightCurrentRow && col === 0 && TR) {
    TR.onclick = () => {
      if (rowData !== selectedRow) {
        setCurrentRow(rowData)
      }
    }
    if (rowData === selectedRow) {
      TR.classList.add('current-row')
    } else {
      TR.classList.remove('current-row')
    }
  }

  // 单元格样式
  if (columnItem) {
    const addedCellClassName = TD.dataset.addedCellClassName
    if (addedCellClassName) {
      TD.classList.remove(...addedCellClassName.split(' ').filter(Boolean))
    }

    const cellClassName = columnItem.cellClassName
    const className =
      typeof cellClassName === 'function'
        ? cellClassName(rowData, sourceRowIndex, value, columnItem, col)
        : cellClassName ?? ''

    if (className) {
      TD.classList.add(...className.split(' ').filter(Boolean))
      TD.dataset.addedCellClassName = className
    } else {
      delete TD.dataset.addedCellClassName
    }
  }
}

// 列处理
function handleColumns() {
  const columns: ColumnSettings[] = []
  const colHeaders: string[] = []
  props.columns.forEach(item => {
    const readOnly = item?.readOnly != undefined ? item.readOnly : props.readOnly
    const columnSorting = getColumnSortingByColumn(item)
    let columnSettings: ColumnSettings = {
      data: item.prop,
      readOnly,
      /** @link [单元格类型](https://handsontable.com/docs/javascript-data-grid/qinghai/options/#type) */
      type: item.type,
      /** @link [数字格式](https://handsontable.com/docs/javascript-data-grid/numeric-cell-type/#format-numbers) */
      numericFormat:
        item.type === 'numeric' && item.format
          ? {
              pattern: item.format
            }
          : undefined,
      /** @link [日期格式](https://handsontable.com/docs/javascript-data-grid/qinghai/options/#dateformat) */
      dateFormat: item.type === 'date' ? item.format : 'YYYY-MM-DD',
      /** @link [时间格式](https://handsontable.com/docs/javascript-data-grid/time-cell-type/#time-cell-type) */
      timeFormat: item.type === 'time' ? item.format : undefined,
      // 支持通过 sortable 简写控制当前列是否允许排序
      columnSorting,
      // 未启用筛选时隐藏下拉菜单
      dropdownMenu: item.filters,
      fillHandle: item?.fillHandle ?? !readOnly,
      // 表格校验
      validator: item.validator,
      // 应用上面未列出的其他属性
      ...(() => {
        const temp: Record<string, any> = {}
        for (const key in item) {
          if (['label', 'prop', 'readOnly', 'type', 'format', 'renderer', 'sortable'].includes(key)) continue
          temp[key] = item[key]
        }
        return temp
      })()
    }
    columnSettings = handleColumnRenderer(columnSettings, item)
    columns.push(columnSettings)
    colHeaders.push(item.label)
  })
  return { columns, colHeaders }
}

// 隐藏column配置中dropdownMenu为false的列的下拉菜单
function hideDropdownMenu(hideDropdownMenuColumnIndexes: number[], column: number, TH: HTMLElement) {
  if (hideDropdownMenuColumnIndexes.includes(column)) {
    const button = TH.querySelector('.changeType')
    if (!button) return
    button.parentElement!.removeChild(button)
  }
}

// 应用列级表头 class，支持语义化换行和自定义扩展样式。
function applyHeaderClassName(column: number, TH: HTMLElement) {
  if (column < 0) return
  const columnItem = props.columns[column]
  if (!columnItem) return

  const addedClassName = TH.dataset.addedHeaderClassName
  if (addedClassName) {
    TH.classList.remove(...addedClassName.split(' ').filter(Boolean))
  }

  const className = [columnItem.headerClassName || ''].filter(Boolean).join(' ')
  if (!columnItem.headerClassName) {
    delete TH.dataset.addedHeaderClassName
    return
  }

  TH.classList.add(...className.split(' ').filter(Boolean))
  TH.dataset.addedHeaderClassName = className
}

// 列渲染器处理
function handleColumnRenderer(columnSettings: ColumnSettings, column: MtTableColumn) {
  if (column.render) {
    // 支持vue的渲染函数
    columnSettings.renderer = function (
      instance: Core,
      TD: HTMLTableCellElement,
      row: number,
      col: number,
      prop: string | number,
      value: any,
      cellProperties: CellProperties
    ) {
      // @ts-ignore
      Handsontable.renderers.BaseRenderer.apply(this, [instance, TD, row, col, prop, value, cellProperties])
      const sourceRowIndex = getSourceRowIndexByVisualRow(cellProperties.row)
      const rowData = getRowDataByVisualRow(cellProperties.row) as Record<string, any>
      if (!rowData) {
        TD.innerText = ''
        return
      }
      const vNode = column.render!(rowData, sourceRowIndex)
      vNode.appContext = getCurrentInstance()?.appContext!
      const td = document.createElement('td')
      render(vNode, td)
      TD.innerText = ''
      td.firstChild && TD.appendChild(td.firstChild)
    }
    Object.assign(columnSettings, {
      // 自定义 render 列默认不参与排序，避免表头排序和自定义渲染语义冲突。
      columnSorting: {
        indicator: false,
        headerAction: false
      },
      // 此处设置为true会导致数据更新后报错, 详见issue[11187](https://github.com/handsontable/handsontable/issues/11187#issuecomment-2406670078)
      disableVisualSelection: columnSettings.disableVisualSelection ?? false,
      // 自定义 render 列默认不参与过滤，避免过滤菜单与自定义单元格内容不一致。
      dropdownMenu: false,
      filters: false
    })
  } else if (column.type === 'date' && column.format) {
    columnSettings.renderer = function (...args: Parameters<BaseRenderer>) {
      datetimeRenderer(column.format ?? 'YYYY-MM-DD HH:mm:ss', ...args)
    }
  } else if (column.renderer) {
    columnSettings.renderer = column.renderer
  }
  return columnSettings
}

/**
 * 保存excel文件
 * @param filename 文件名称 (默认使用props中的title作为名称)
 */
function save(filename?: string) {
  const wb = read(getCSVString(), { type: 'string', raw: true })
  writeFileXLSX(wb, `${filename || titles.value.join(props.titleSeparator) || Date.now()}.xlsx`)
}

/**
 *
 * @param {string} filename
 * @param {Sheet} sheets
 */
function mergeSave(filename: string, ...sheets: { sheet: Sheet; name?: string }[]) {
  const sheet = getSheet()
  const wb = utils.book_new()
  sheets.concat(sheet).forEach(item => {
    utils.book_append_sheet(wb, item.sheet, item.name)
  })
  writeFileXLSX(wb, `${filename || titles.value.join(props.titleSeparator) || Date.now()}.xlsx`)
}

/**
 * 获取表格数据的工作表
 * @param {string} sheetName 工作表名称
 */
function getSheet(sheetName?: string) {
  const wb = read(getCSVString(), { type: 'string', raw: true })
  const name = wb.SheetNames[0]
  return {
    sheet: wb.Sheets[name],
    name: sheetName || titles.value.join(props.titleSeparator) || undefined
  }
}

function getCSVString() {
  const exportPlugin = table.value!.hotInstance.getPlugin('exportFile')
  return exportPlugin.exportAsString('csv', {
    bom: false,
    columnDelimiter: ',',
    columnHeaders: true,
    exportHiddenColumns: true,
    exportHiddenRows: true,
    rowDelimiter: '\r\n'
  })
}

function getInstance(): Handsontable {
  return table.value!.hotInstance
}

function getDefaultDownloadFilename(filename?: string) {
  return filename || titles.value.join(props.titleSeparator) || `${Date.now()}`
}

function normalizeExportHeaderLabel(label: string) {
  return String(label ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
}

function getDownloadRows(options: MtTableDownloadOptions = {}) {
  if (options.data) return options.data
  const mode = options.mode ?? props.downloadMode
  return mode === 'selection' ? [...getSelectionRows()] : props.data
}

function getDownloadColumns() {
  return props.columns.filter(({ prop }) => !!prop)
}

function buildDownloadPayload(options: MtTableDownloadOptions = {}): MtTableDownloadPayload {
  const mode = options.mode ?? props.downloadMode
  const filename = getDefaultDownloadFilename(options.filename)
  const data = getDownloadRows({ ...options, mode })
  const columns = getDownloadColumns()

  return {
    mode,
    filename,
    data,
    columns,
    download: nextOptions => {
      downloadData({
        ...options,
        ...nextOptions,
        data: nextOptions?.data ?? data
      })
    }
  }
}

function exportRows(options: MtTableDownloadOptions = {}) {
  let { nestedHeaders, mergeCells } = settings.value
  if (!nestedHeaders || !mergeCells || !Array.isArray(nestedHeaders) || !Array.isArray(mergeCells)) {
    nestedHeaders = []
    mergeCells = []
  }
  const nested = []
  const pre_row = []
  for (let i = 0; i < nestedHeaders?.length - 1; i++) {
    let k = 0
    const tem = []
    for (let j = 0; j < nestedHeaders[i].length; j++) {
      const cell = nestedHeaders[i][j]
      if (typeof cell !== 'string' && 'colspan' in cell && cell?.colspan) {
        nested.push({
          row: i,
          col: k,
          endCol: k + cell?.colspan - 1,
          endRow: i
        })
        k += cell?.colspan
        tem.push(...Array.from({ length: cell?.colspan }, _ => normalizeExportHeaderLabel(cell?.label || '')))
      } else {
        tem.push(normalizeExportHeaderLabel(String(cell ?? '')))
        k += 1
      }
    }
    pre_row.push(tem)
  }
  if (mergeCells?.length) {
    for (const item of mergeCells) {
      nested.push({
        row: item.row + 1,
        col: item.col,
        endCol: item.col + item.colspan - 1,
        endRow: item.row + item.rowspan
      })
    }
  }
  const columns = getDownloadColumns()
  const exportData = getDownloadRows(options)
  const rows = [...pre_row, columns.map(({ label }) => normalizeExportHeaderLabel(label))]
  exportData.forEach(item => {
    rows.push(columns.map(({ prop }) => item[prop!]))
  })
  const wb = utils.book_new()
  const ws = utils.aoa_to_sheet(rows as any)
  if (nested?.length)
    ws['!merges'] = nested.map(d => ({
      s: { c: d.col, r: d.row },
      e: { r: d.endRow, c: d.endCol }
    }))
  utils.book_append_sheet(wb, ws)
  writeFileXLSX(wb, `${getDefaultDownloadFilename(options.filename)}.xlsx`)
}

// 下载数据
function downloadData(options: MtTableDownloadOptions = {}) {
  exportRows(options)
}

function handleToolbarDownload() {
  const payload = buildDownloadPayload()
  emit('download', payload)
  if (props.customDownload) return
  exportRows({
    data: payload.data,
    filename: payload.filename,
    mode: payload.mode
  })
}

// 用于单选表格，设定某一行为选中行， 如果调用时不加参数，则会取消目前高亮行的选中状态
function setCurrentRow(row?: Record<string, any>, reRender = true) {
  const oldRow = selectedRow
  selectedRow = row
  reRender && table.value?.hotInstance?.render()
  emit('currentChange', row, oldRow)
}

// 用于多选表格，判断某一行是否可选
function rowIsSelectable(row: any, rowIndex: number) {
  const disabled = typeof props.multipleSelection === 'function' ? props.multipleSelection(row, rowIndex) : false
  return typeof disabled === 'boolean' ? !disabled : false
}

// 用于多选表格，当多选行发生变化时更新选中行状态
function updateRowSelectionStatus() {
  table.value?.hotInstance?.render()
  emit('selectionChange', [...selectionRows])
}

// 用于多选表格，清空用户的选择
function clearSelection() {
  if (!props.multipleSelection) return
  selectionRows = []
  updateRowSelectionStatus()
}

// 用于多选表格，获取当前选中的行
function getSelectionRows() {
  if (!props.multipleSelection) return []
  return selectionRows
}

// 用于多选表格，切换某一行的选中状态， 如果使用了第二个参数，则可直接设置这一行选中与否
function toggleRowSelection(row: any, selected?: boolean, ignoreSelectable = false) {
  if (!props.multipleSelection) return
  const index = props.data.findIndex(item => item === row)
  if (index === -1) return
  const isSelectable = rowIsSelectable(row, index)
  if (!ignoreSelectable && !isSelectable) return
  const selectionIndex = selectionRows.findIndex(item => item === row)
  if (selected === undefined) {
    if (selectionIndex > -1) {
      selectionRows.splice(selectionIndex, 1)
    } else {
      selectionRows.push(row)
    }
  } else {
    if (selected) {
      if (selectionIndex === -1) {
        selectionRows.push(row)
      }
    } else {
      if (selectionIndex > -1) {
        selectionRows.splice(selectionIndex, 1)
      }
    }
  }
  updateRowSelectionStatus()
}

// 获取当前页（可见的）数据
function getVisibleData() {
  return displayRowStates.value.map(item => item.row)
}

// 过滤出给定数据范围内真正可选的行。
// 用于区分“当前页全选”和“全量全选”两种分支，避免两者混用同一套数据范围。
function getSelectableRows(rows: Record<string, any>[]) {
  return rows.filter(row => {
    const rowIndex = props.data.findIndex(item => item === row)
    return rowIsSelectable(row, rowIndex)
  })
}

// 用于分页表头 checkbox，切换当前页的全选和全不选。
// 这个方法只作用当前页可见数据，不影响其他分页数据的选中状态。
function toggleCurrentPageSelection() {
  if (!props.multipleSelection) return

  const visibleData = getVisibleData()
  const selectableRows = getSelectableRows(visibleData)

  // 检查当前页面的可选行是否已经全部被选中
  const isAllSelected = selectableRows.length > 0 && selectableRows.every(row => selectionRows.includes(row))

  if (isAllSelected) {
    // 当前页已全选，执行反选（仅针对当前页）
    selectionRows = selectionRows.filter(row => !selectableRows.includes(row))
  } else {
    // 当前页未全选，执行全选（仅针对当前页）
    const newSelection = [...selectionRows]
    selectableRows.forEach(row => {
      if (!newSelection.includes(row)) {
        newSelection.push(row)
      }
    })
    selectionRows = newSelection
  }

  updateRowSelectionStatus()
}

// 用于多选表格实例方法，切换全量数据的全选和全不选。
// 即使开启了本地分页，这里也会基于 props.data 整体处理，供外部按钮调用。
function toggleAllSelection() {
  if (!props.multipleSelection) return

  const selectableRows = getSelectableRows(props.data)
  const isAllSelected = selectableRows.length > 0 && selectableRows.every(row => selectionRows.includes(row))

  if (isAllSelected) {
    selectionRows = selectionRows.filter(row => !selectableRows.includes(row))
  } else {
    const newSelection = [...selectionRows]
    selectableRows.forEach(row => {
      if (!newSelection.includes(row)) {
        newSelection.push(row)
      }
    })
    selectionRows = newSelection
  }

  updateRowSelectionStatus()
}
</script>

<template>
  <div
    :id="mtTableContainerId"
    class="mt-table"
    :class="{ fullScreen: isFullscreen, editOutline: props.editOutline }"
    :style="{
      height: maxHeight && typeof rowHeights === 'number' ? `min(${actualHeight}, ${maxHeight})` : undefined
    }"
  >
    <div v-if="titles.length || toolbarList.length" class="table-title">
      <template v-if="titles.length">
        <div class="table-title-item" v-for="(item, index) in titles" :key="index">
          {{ item }}
        </div>
      </template>
      <ul v-if="toolbarList.length || $slots['before-toolbar'] || $slots['after-toolbar']" class="toolbar">
        <slot name="before-toolbar" />
        <li
          v-if="toolbarList.includes('fullScreen')"
          class="full-screen"
          :class="{ active: isFullscreen }"
          @click="toggle()"
          :title="isFullscreen ? '取消全屏' : '全屏'"
        >
          <FullScreenIcon />
        </li>
        <li
          v-if="toolbarList.includes('downloadData')"
          class="download-data"
          @click="handleToolbarDownload"
          title="下载数据"
        >
          <DownloadDataIcon />
        </li>
        <slot name="after-toolbar" />
      </ul>
    </div>
    <div class="table-instance">
      <hot-table v-show="columns.length" ref="table" :settings="settings" />
      <div
        v-if="!columns.length || !data || !data.length"
        class="no-data-container"
        :style="{
          height: columns.length ? `calc(100% - ${headerHeight}px)` : '100%',
          top: columns.length ? `${headerHeight}px` : 0
        }"
      >
        <MtEmpty v-bind="emptyOptions" />
      </div>
    </div>
    <div class="pagination-box" v-if="paginationEnabled || $slots['before-pagination'] || $slots['after-pagination']">
      <slot name="before-pagination"></slot>
      <div class="table-pagination" v-if="paginationEnabled">
        <div class="page-des">
          <span>共{{ paginationTotalNum }}条记录</span>
          <span>第{{ safeCurrentPage }}/{{ Math.ceil(paginationTotalNum / pageSize) || 1 }}页</span>
        </div>
        <el-pagination
          class="mt-table-pagination"
          v-bind="paginationBind"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          @update:current-page="onPaginationUpdateCurrentPage"
          @update:page-size="onPaginationUpdatePageSize"
          @change="onPaginationChange"
        />
      </div>
      <slot name="after-pagination"></slot>
    </div>
  </div>
</template>
