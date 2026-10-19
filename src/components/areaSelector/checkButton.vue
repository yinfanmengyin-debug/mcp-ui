<template>
  <div
    class="el-check-button"
    :style="gridStyle"
  >
    <el-button
      v-for="item in list"
      :key="String(item[valueField])"
      :type="isChecked(item[valueField]) ? 'primary' : 'default'"
      :disabled="item.disabled"
      :size="size"
      @click="handleClick(item)"
    >
      {{ item[labelField] }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'

defineOptions({ name: 'CheckButton' })

type CheckValue = string | number
type ModelValue = CheckValue | CheckValue[]

const props = withDefaults(
  defineProps<{
    modelValue?: ModelValue
    list?: Record<string, any>[]
    labelField?: string
    valueField?: string
    size?: '' | 'default' | 'small' | 'large'
    column?: number
    multiple?: boolean
  }>(),
  {
    list: () => [],
    labelField: 'label',
    valueField: 'value',
    size: 'default',
    column: 3,
    multiple: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: ModelValue]
  click: [value: CheckValue]
}>()

const currentValues = computed<CheckValue[]>(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue
  return props.modelValue === undefined || props.modelValue === null || props.modelValue === ''
    ? []
    : [props.modelValue]
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.column}, minmax(0, 1fr))`
}))

function isChecked(value: CheckValue) {
  return currentValues.value.includes(value)
}

function handleClick(item: Record<string, any>) {
  const value = item[props.valueField] as CheckValue
  let nextValue: ModelValue = value

  if (props.multiple) {
    nextValue = isChecked(value)
      ? currentValues.value.filter(itemValue => itemValue !== value)
      : [...currentValues.value, value]
  }

  emit('update:modelValue', nextValue)
  emit('click', value)
}
</script>

<style scoped lang="scss">
.el-check-button {
  display: grid;
  gap: 4px;
  .el-button + .el-button {
    margin-left: 0;
  }
  .el-button {
    :deep(> span) {
      width: 100%;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
