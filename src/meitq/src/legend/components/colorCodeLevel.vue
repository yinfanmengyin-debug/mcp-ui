<template>
  <el-input
    v-if="disabled"
    model-value="-"
    class="disabled-level"
    disabled
  />
  <el-input-number
    v-else
    :model-value="modelValue"
    :controls="false"
    @update:model-value="(value: number | undefined) => value !== undefined && emit('update:modelValue', value)"
  />
</template>

<script setup lang="ts">
import '../style/colorCodeLevel.scss'

defineOptions({ name: 'MtColorLevelInput' })

withDefaults(
  defineProps<{
    modelValue: number
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>
