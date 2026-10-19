<script setup lang="ts">
import { colorCodeInjectionKey } from '../../../configProvider/keys'
import MtColorBarEditor from './colorBarEditor.vue'
import MtColorBarList from './colorBarList.vue'
import type { ColorCode } from '@/src/legend/type'
import { ElButton, ElDialog, ElIcon, ElPopover } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/dialog/style/css'
import 'element-plus/es/components/icon/style/css'
import 'element-plus/es/components/popover/style/css'
import '../../style/v2/addOrEditColorBar.scss'
import { inject, nextTick, ref, shallowRef } from 'vue'

defineOptions({ name: 'MtAddOrEditColorBar' })

const props = defineProps<{
  modelValue?: boolean
  colorCode?: ColorCode
  // 是否为编辑模式 (不可新增)
  isEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const options = inject(colorCodeInjectionKey)

// 当前正在编辑的色标信息
const editColorCode = shallowRef<ColorCode>()
// 系统色标信息列表
const colorCodeList = shallowRef<ColorCode[]>([])

const listRef = shallowRef<InstanceType<typeof MtColorBarList>>()

const editorRef = shallowRef<InstanceType<typeof MtColorBarEditor>>()
const editorKey = ref(0)

async function getColorCodeList() {
  editColorCode.value = props.colorCode
  if (!options?.value?.getAllSystemColorCodeList) return
  const list = await options.value.getAllSystemColorCodeList()
  colorCodeList.value = list ?? []
  await nextTick()
  // 重置编辑器 与 色标列表的选中状态
  editorKey.value = (editorKey.value + 1) % 2
  listRef.value?.setSelect(editColorCode.value)
}

function selectColorCodeChange(colorCode?: ColorCode) {
  // 复制原始色标新增时移除原始色标的名称
  editColorCode.value = colorCode ? { ...colorCode, name: props.isEdit ? colorCode.name : '' } : undefined
}

function resetEditor() {
  if (editColorCode.value) {
    editColorCode.value = undefined
    listRef.value?.setSelect(undefined, false)
  } else {
    editorKey.value = (editorKey.value + 1) % 2
  }
}

async function save() {
  const info = await editorRef.value!.getCondition()
  const isSuccess = await options?.value?.save(
    { ...info, id: props.isEdit ? info.id : undefined },
    'MtAddOrEditColorBar'
  )
  if (isSuccess) {
    resetEditor()
    emit('update:modelValue', false)
    emit('saved')
  }
}
</script>

<template>
  <el-dialog
    class="mt-add-or-edit-color-bar"
    width="1250px"
    draggable
    :title="isEdit ? '编辑色标' : '新增色标'"
    :model-value="modelValue"
    :close-on-click-modal="false"
    :show-close="false"
    append-to-body
    @opened="getColorCodeList"
    @update:model-value="(visible: boolean) => emit('update:modelValue', visible)"
  >
    <div class="mt-add-or-edit-color-bar-wrapper">
      <div class="color-bar-list-container">
        <div class="list-title">
          <div class="name">
            色标样式选择：
            <el-popover
              v-if="!isEdit"
              placement="bottom-start"
              :width="285"
              trigger="hover"
              popper-class="mt-add-or-edit-color-bar-popover"
            >
              <template #reference>
                <el-icon :size="18"><Warning /></el-icon>
              </template>
              <div class="tips">
                交互提示：<br />
                1、点击新建色标样式按钮可基于色带新增系统默认色标。<br />
                2、选中已有色标后，可基于已有色标编辑保存为新的系统默认色标。<br />
              </div>
            </el-popover>
          </div>
          <span v-if="!isEdit" class="add-text" @click="resetEditor">新建色标样式</span>
        </div>
        <MtColorBarList
          ref="listRef"
          :list="colorCodeList"
          :click-can-cancel="!isEdit"
          @select-change="selectColorCodeChange"
        />
      </div>
      <div class="color-bar-editor-container">
        <MtColorBarEditor
          v-if="!isEdit || editColorCode"
          ref="editorRef"
          :key="editorKey"
          :color-code="editColorCode"
        />
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="save"> {{ isEdit ? '保存' : '新增' }} </el-button>
    </template>
  </el-dialog>
</template>
