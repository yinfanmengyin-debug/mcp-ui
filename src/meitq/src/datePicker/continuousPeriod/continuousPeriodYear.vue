<template>
  <div class="mt-continuous-period-year-picker">
    <template v-if="!props.showSlots">
      <el-form-item :label="`${setting?.continue?.label1 || '开始时间'}：`">
        <el-date-picker v-model="startTime" :clearable="false" type="year" v-bind="$attrs" @change="startChange" />
      </el-form-item>
      <el-form-item :label="`${setting?.continue?.label2 || '结束时间'}：`">
        <el-date-picker v-model="endTime" :clearable="false" type="year" v-bind="$attrs" @change="endChange" />
      </el-form-item>
    </template>
    <slot name="default"></slot>
  </div>
</template>

<script setup lang="ts">
import { nextTick, shallowRef, useSlots, watch } from 'vue'
import dayjs from 'dayjs'
import { TimeSetting } from '../type'

defineOptions({ name: 'ContinuousPeriodYearPicker' })
const props = withDefaults(
  defineProps<{ modelValue: Array<Date | string>; setting?: TimeSetting; showSlots?: boolean }>(),
  {
    showSlots: false
  }
)
const emit = defineEmits<{
  'update:modelValue': [value: [Date, Date]]
}>()
const slots = useSlots()
const startTime = shallowRef(new Date('0000/01/01 00:00:00'))
const endTime = shallowRef(new Date('0000/01/01 00:00:00'))
watch(
  () => props.modelValue,
  async val => {
    let needUpdate = false
    const start = dayjs(val[0])
    if (dayjs(startTime.value).toString() !== start.toString()) {
      startTime.value = new Date(`${start.year()}/01/01 00:00:00`)
      needUpdate = true
    }
    let end = dayjs(val[1])
    if (dayjs(endTime.value).toString() !== end.toString()) {
      endTime.value = new Date(`${end.year()}/12/31 00:00:00`)
      needUpdate = true
    }
    if (needUpdate) {
      // 不加$nextTick会导致循环更新
      await nextTick()
      emit('update:modelValue', [dayjs(startTime.value).toDate(), dayjs(endTime.value).toDate()])
    }
  },
  { immediate: true }
)

function startChange(val: Date) {
  const start = dayjs(val)
  startTime.value = new Date(`${start.year()}/01/01 00:00:00`)
  // 开始时间大于结束时间时使结束时间与开始时间一致
  if (startTime.value.getTime() > endTime.value.getTime()) {
    endChange(start.toDate())
    return
  }
  emit('update:modelValue', [dayjs(startTime.value).toDate(), dayjs(endTime.value).toDate()])
}
function endChange(val: Date) {
  const end = dayjs(val)
  endTime.value = new Date(`${end.year()}/12/31 00:00:00`)
  // 结束时间小于开始时间时使开始时间与结束时间一致
  if (endTime.value.getTime() < startTime.value.getTime()) {
    startChange(end.toDate())
    return
  }
  emit('update:modelValue', [dayjs(startTime.value).toDate(), dayjs(endTime.value).toDate()])
}
</script>

<style scoped lang="scss"></style>