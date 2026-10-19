// @ts-ignore
import type Core from 'handsontable/core'
// @ts-ignore
import type { CellProperties } from 'handsontable/settings'
import dayjs from 'dayjs'
import Handsontable from 'handsontable'

export function getDropdownMenu(hasFilter: boolean) {
  let menu: string[] = [
    'row_above',
    'row_below',
    'col_left',
    'col_right',
    '---------',
    'remove_row',
    'remove_col',
    'undo',
    'redo',
    // '---------',
    // 'make_read_only',
    // '---------',
    // 'alignment'
  ]
  if (hasFilter) {
    menu = [
      ...menu,
      '---------',
      'filter_by_condition',
      // 'filter_operators',
      // 'filter_by_condition2',
      'filter_by_value',
      'filter_action_bar'
    ]
  }

  return menu
}

// 日期选择器配置
export const datePickerConfig = {
  i18n: {
    previousMonth: '上个月',
    nextMonth: '下个月',
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    weekdaysShort: ['日', '一', '二', '三', '四', '五', '六']
  }
}

/**
 * 日期时间渲染器
 * @param {string} format 格式化字符串 如: YYYY-MM-DD
 * @param {Core} instance 表格实例
 * @param {HTMLTableCellElement} TD 单元格DOM元素
 * @param {number} row 行索引
 * @param {number} col 列索引
 * @param {string | number} prop 单元格对应的属性名或索引
 * @param value 单元格的值
 * @param {CellProperties} cellProperties 单元格属性
 */
export function datetimeRenderer(
  format: string,
  instance: Core,
  TD: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: any,
  cellProperties: CellProperties
): void {
  // @ts-ignore
  Handsontable.renderers.BaseRenderer.apply(this, [instance, TD, row, col, prop, value, cellProperties])
  if (!value) {
    TD.innerText = ''
  } else if (!dayjs(value).isValid()) {
    // 处理数组 时间 无效日期时原样返回
    const strList: string[] = []
    if (Array.isArray(value)) {
      value.forEach((item) => {
        const t = dayjs(item)
        strList.push(t.isValid() ? t.format(format) : item)
      })
    } else {
      strList.push(value)
    }

    TD.innerText = strList.join(',')
  } else {
    TD.innerText = dayjs(value).format(format)
  }
}
