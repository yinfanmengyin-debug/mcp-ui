<script setup lang="ts">
import type { ColorCode } from '@/src/legend/type'
import { StkTable, type StkTableColumn } from 'stk-table-vue'
import { computed, h, ref, shallowRef } from 'vue'
import type { ColorBarListProps } from './colorBarList'
import ColorBarListItem from './colorBarListItem.vue'
import 'stk-table-vue/lib/style.css'
import '../../style/v2/colorBarList.scss'

// 色标列表项的高度
const ROW_HEIGHT = 71

defineOptions({ name: 'MtColorBarList' })
defineExpose({
  setSelect
})

const props = withDefaults(defineProps<ColorBarListProps>(), {
  list: () => [],
  clickCanCancel: true,
  showRemoveIcon: false
})
const emit = defineEmits<{
  (e: 'selectChange', colorCode?: ColorCode): void
  (e: 'remove', colorCode: ColorCode): void
}>()

const keyword = ref('')

const tableRef = shallowRef<InstanceType<typeof StkTable>>()

const dataSource = computed(() => {
  if (!keyword.value || !props.list?.length) return props.list
  return props.list.filter(item => item.name.includes(keyword.value))
})

const columns: StkTableColumn<ColorCode>[] = [
  {
    title: '',
    dataIndex: 'id',
    customCell: ({ row }) =>
      h(ColorBarListItem, {
        item: row,
        showRemoveIcon: props.showRemoveIcon,
        onRemove: (item: ColorCode) => emit('remove', item)
      })
  }
]

function setSelect(colorCode?: ColorCode, scrollTo = true) {
  tableRef.value?.setCurrentRow(colorCode)
  if (!scrollTo) return
  let top = 0
  if (colorCode) {
    const index = dataSource.value.findIndex(item => item.id === colorCode?.id)
    top = index === -1 ? 0 : index * ROW_HEIGHT
  }
  tableRef.value?.scrollTo(top)
}

function currentChange(_ev: MouseEvent | null, row: ColorCode | undefined, data: { select: boolean }) {
  emit('selectChange', data.select ? row : undefined)
}
</script>

<template>
  <div class="mt-color-bar-list">
    <input v-model="keyword" placeholder="请输入色标名称进行模糊匹配" />
    <stk-table
      ref="tableRef"
      row-key="id"
      virtual
      headless
      :row-height="ROW_HEIGHT"
      :bordered="false"
      :auto-row-height="true"
      :columns="columns"
      :data-source="dataSource"
      row-active
      :row-current-revokable="clickCanCancel"
      no-data-full
      @current-change="currentChange"
    />
  </div>
</template>
