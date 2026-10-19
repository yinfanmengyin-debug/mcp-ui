<script setup lang="ts">
import type { SelectionProps } from '@/src/selection/type'
import type { MaybeArray, SelectionValueType } from '@/types/common'
import { computed } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/option/style/css'

defineOptions({ name: 'MtSelection' })

const props = withDefaults(defineProps<SelectionProps>(), {
  list: () => [],
  labelField: 'label',
  valueField: 'value',
  size: 'default',
  disabled: false,
  multiple: false,
  multipleLimit: 0,
  valueKey: undefined,
  clearable: false,
  filterable: false,
  placeholder: '请选择',
  collapseTags: true,
  popperClass: ''
})
const emit = defineEmits<{
  'update:modelValue': [value: MaybeArray<SelectionValueType>]
  change: [value: MaybeArray<SelectionValueType>]
}>()

const normalizedList = computed(() => {
  return props.list.map(item =>
    typeof item === 'object'
      ? item
      : {
          [props.labelField]: `${item}`,
          [props.valueField]: item
        }
  )
})
</script>

<template>
  <el-select
    :model-value="modelValue"
    :disabled
    :multiple
    :multiple-limit="multipleLimit"
    :value-key="valueKey"
    :clearable
    :filterable
    :placeholder
    :collapse-tags="collapseTags"
    :popper-class="popperClass"
    :size="size"
    @update:modelValue="(value: MaybeArray<SelectionValueType>) => emit('update:modelValue', value)"
    @change="(value: MaybeArray<SelectionValueType>) => emit('change', value)"
  >
    <el-option
      v-for="(item, index) in normalizedList"
      :key="index"
      :label="item[labelField]"
      :value="item[valueField]"
      :disabled="!!item.disabled"
    />
  </el-select>
</template>
