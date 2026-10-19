<script setup lang="ts">
import { computed } from 'vue'
import { RadioProps, RadioValueType } from './type'
import { ElRadio, ElRadioButton, ElRadioGroup } from 'element-plus'
import 'element-plus/es/components/radio/style/css'
import 'element-plus/es/components/radio-button/style/css'
import 'element-plus/es/components/radio-group/style/css'

defineOptions({ name: 'MtRadio' })
const emit = defineEmits<{
  'update:modelValue': [value: RadioValueType]
  change: [value: RadioValueType]
}>()

const props = withDefaults(
  defineProps<RadioProps>(),
  {
    list: () => [],
    labelField: 'label',
    valueField: 'value',
    size: 'default',
    disabled: false,
    button: false,
    border: false,
    cancellable: false
  }
)

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

function radioOnClick(value: RadioValueType) {
  if (props.disabled) return
  if (props.cancellable && props.modelValue === value) {
    value = undefined
  }
  emit('update:modelValue', value)
  emit('change', value)
}

</script>

<template>
  <el-radio-group :model-value="modelValue" :size :disabled>
    <template v-if="button">
      <el-radio-button
        v-for="(item, index) in normalizedList"
        :key="index"
        :value="item[props.valueField]"
        :disabled="!!item.disabled"
        @click.prevent="radioOnClick(item[props.valueField])"
      >
        {{ item[props.labelField] }}
      </el-radio-button>
    </template>
    <template v-else>
      <el-radio
        v-for="(item, index) in normalizedList"
        :key="index"
        :value="item[props.valueField]"
        :disabled="!!item.disabled"
        :border
        @click.prevent="radioOnClick(item[props.valueField])"
      >
        {{ item[props.labelField] }}
      </el-radio>
    </template>
  </el-radio-group>
</template>

<style scoped lang="scss">

</style>