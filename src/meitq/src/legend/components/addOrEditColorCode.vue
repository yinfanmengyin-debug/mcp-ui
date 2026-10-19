<template>
  <div class="mt-add-or-edit-color-code">
    <div class="content-box">
      <ColorCodeEditorForm ref="formConditionRef" class="left" v-bind="props" />
      <ColorCodeEditor ref="colorCodeEditorRef" class="right" :edit-info="editInfo" />
    </div>
    <div class="footer">
      <el-button type="primary" @click="emit('cancel')"> 取消 </el-button>
      <el-button type="primary" @click="save"> 保存 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import type { ColorCode } from '../type'
import '../style/addOrEditColorCode.scss'
import ColorCodeEditor from './colorCodeEditor.vue'
import ColorCodeEditorForm from './colorCodeEditorForm.vue'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'MtAddOrEditColorCode' })

const props = defineProps<{
  // 若是编辑模式则传入需要编辑的色标信息
  editInfo?: ColorCode
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save', colorCode: ColorCode): void
}>()

const formConditionRef = shallowRef()
const colorCodeEditorRef = shallowRef()

// 触发保存色标事件
async function save() {
  try {
    const condition = await formConditionRef.value.getCondition()
    const colorInfo = colorCodeEditorRef.value.getColorInfo()
    emit('save', {
      id: props.editInfo?.id,
      enable: props.editInfo?.enable ?? true,
      ...colorInfo,
      ...condition
    })
  } catch (error: any) {
    ElMessage.error({
      message: error?.message ?? '表单校验失败',
      grouping: true,
      duration: 2000,
      showClose: true
    })
    throw error
  }
}
</script>
