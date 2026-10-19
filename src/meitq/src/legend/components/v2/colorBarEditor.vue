<script setup lang="ts">
import '../../style/v2/colorBarEditor.scss'
import type { ColorCode } from '@/src/legend/type'
import { computed, shallowRef } from 'vue'
import { type ColorBarEditorProps, emptyColorCode } from './colorBarEditor'
import MtColorBarEditorAttrForm from './colorBarEditorAttrForm.vue'
import MtColorBarEditorLegendForm from './colorBarEditorLegendForm.vue'

defineOptions({ name: 'MtColorBarEditor' })

defineExpose({ getCondition })

const props = withDefaults(defineProps<ColorBarEditorProps>(), {
  showAttrForm: true
})

const colorCode = computed(() => props.colorCode ?? emptyColorCode)

const attrFormRef = shallowRef<InstanceType<typeof MtColorBarEditorAttrForm>>()
const legendFormRef = shallowRef<InstanceType<typeof MtColorBarEditorLegendForm>>()

async function getCondition(): Promise<ColorCode> {
  const attrForm = await attrFormRef.value?.getForm()
  const legendForm = await legendFormRef.value?.getForm()
  return {
    ...colorCode.value,
    ...attrForm,
    ...legendForm
  }
}
</script>

<template>
  <div class="mt-color-bar-editor">
    <MtColorBarEditorAttrForm ref="attrFormRef" v-if="showAttrForm" :color-code="colorCode" />
    <MtColorBarEditorLegendForm ref="legendFormRef" :color-code="colorCode" />
  </div>
</template>
