<template>
  <div class="mt-continuous-period-hour-picker">
    <el-form-item :label="`${ setting?.continue?.label1 || '开始时间' }：`">
      <el-date-picker
        v-model="startTime"
        type="datetime"
        format="YYYY-MM-DD HH"
        popper-class="show-hours-only"
        :clearable="false"
        v-bind="$attrs"
        @change="startChange"
      />
    </el-form-item>
    <el-form-item :label="`${ setting?.continue?.label2 || '结束时间' }：`">
      <el-date-picker
        v-model="endTime"
        type="datetime"
        format="YYYY-MM-DD HH"
        popper-class="show-hours-only"
        :clearable="false"
        v-bind="$attrs"
        @change="endChange"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { nextTick, shallowRef, watch } from 'vue';
import dayjs from 'dayjs';
import { TimeSetting } from '../type'

defineOptions({ name: 'ContinuousPeriodHourPicker' });

const props = defineProps<{ modelValue: Array<Date | string>, setting?: TimeSetting }>();
const emit = defineEmits<{
  'update:modelValue': [value: [Date, Date]];
}>();

const startTime = shallowRef(new Date('0000/01/01 00:00:00'));
const endTime = shallowRef(new Date('0000/01/01 00:00:00'));

watch(
  () => props.modelValue,
  async val => {
    let needUpdate = false;
    const now = new Date();
    const start = dayjs(val[0]);
    if (start.toString() !== dayjs(startTime.value).toString()) {
      startTime.value = start.minute(0).second(0).millisecond(0).toDate();
      needUpdate = true;
    }
    const end = dayjs(val[1]);
    if (end.toString() !== dayjs(endTime.value).toString()) {
      endTime.value = end.minute(0).second(0).millisecond(0).toDate();
      needUpdate = true;
    }
    if (needUpdate) {
      // 不加$nextTick会导致循环更新
      await nextTick();
      emit('update:modelValue', [dayjs(startTime.value).toDate(), dayjs(endTime.value).toDate()]);
    }
  },
  { immediate: true }
);

function startChange(val: Date) {
  const start = dayjs(val);
  startTime.value = start.toDate();
  // 开始时间大于结束时间时使结束时间与开始时间一致
  if (startTime.value.getTime() > endTime.value.getTime()) {
    endChange(start.toDate());
    return;
  }
  emit('update:modelValue', [start.toDate(), dayjs(endTime.value).toDate()]);
}

function endChange(val: Date) {
  const end = dayjs(val);
  endTime.value = end.toDate();
  // 结束时间小于开始时间时使开始时间与结束时间一致
  if (endTime.value.getTime() < startTime.value.getTime()) {
    startChange(end.toDate());
    return;
  }
  emit('update:modelValue', [dayjs(startTime.value).toDate(), end.toDate()]);
}
</script>

<style scoped lang="scss"></style>
