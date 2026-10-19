<script setup lang="ts">
import { ElButton, ElDialog, ElTag, ElTree } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/dialog/style/css'
import 'element-plus/es/components/tag/style/css'
import 'element-plus/es/components/tree/style/css'
import { computed, ref, shallowRef, watch } from 'vue'
import type { TreeSelectorDialogProps } from './treeSelectorDialog'
import '../../style/v2/treeSelectorDialog.scss'

defineOptions({ name: 'MtTreeSelector' })

defineExpose({ getCheckedNodes })

const props = defineProps<TreeSelectorDialogProps>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', checkedNodes: Record<string, any>[]): void
}>()

const treeRef = shallowRef()

const treeProps = computed(() => {
  const { options } = props
  return {
    label: options.labelField,
    children: options.childrenField
  }
})
// 当前选中项列表
const checkedList = ref<Record<string, any>[]>([])

watch(() => props.defaultCheckedValues, resetChecked, { immediate: true })

function treeCheck() {
  checkedList.value = treeRef.value.getCheckedNodes(true)
}

function uncheck(key: string, index: number) {
  checkedList.value.splice(index, 1)
  treeRef.value.setChecked(key, false)
}

function findNodeByValue(value: string | number, list?: Record<string, any>[]): Record<string, any> | undefined {
  list = list ?? props.data ?? []
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (item[props.options.valueField] === value) {
      return item
    }
    if (item[props.options.childrenField]) {
      const node = findNodeByValue(value, item[props.options.childrenField])
      if (node) {
        return node
      }
    }
  }
}

function getCheckedNodes() {
  return treeRef.value.getCheckedNodes(true)
}

function resetChecked() {
  const values = props.defaultCheckedValues || []
  if (treeRef.value) {
    treeRef.value?.setCheckedKeys(values)
    checkedList.value = treeRef.value?.getCheckedNodes(true)
  } else {
    checkedList.value = values.map(value => findNodeByValue(value)).filter(Boolean) as Record<string, any>[]
  }
}

function confirm() {
  emit('confirm', checkedList.value)
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
    class="mt-tree-selector-dialog"
    width="660px"
    :model-value="modelValue"
    :title="title"
    :close-on-click-modal="false"
    :show-close="false"
    draggable
    align-center
    @update:modelValue="(visible: boolean) => emit('update:modelValue', visible)"
    @closed="resetChecked"
  >
    <div class="mt-tree-selector-wrapper">
      <el-tree
        ref="treeRef"
        :data="data"
        empty-text="暂无数据"
        :node-key="options.valueField"
        :props="treeProps"
        :default-checked-keys="defaultCheckedValues"
        show-checkbox
        @check="treeCheck"
      />
      <div class="divider"></div>
      <div class="selected-list">
        <el-tag
          v-for="(item, index) in checkedList"
          :key="item[options.valueField]"
          type="primary"
          closable
          @close="uncheck(item[options.valueField], index)"
        >
          {{ item[options.labelField] }}
        </el-tag>
      </div>
    </div>
    <template #footer>
      <div class="mt-tree-selector-footer">
        <el-button @click="emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="confirm()">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
