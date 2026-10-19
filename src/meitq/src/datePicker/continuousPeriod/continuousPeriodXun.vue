<template>
  <div class="mt-continuous-period-xun-picker">
    <el-form-item :label="`${ setting?.continue?.label1 || '开始时间' }：`">
      <el-date-picker
        v-model="startTime"
        type="month"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => startChange(val, startXun)"
      />
      <MtSelection
        v-model="startXun"
        :list="xunList"
        @change="(val: any) => startChange(startTime, val)"
      />
    </el-form-item>
    <el-form-item :label="`${ setting?.continue?.label2 || '结束时间' }：`">
      <el-date-picker
        v-model="endTime"
        type="month"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => endChange(val, endXun)"
      />
      <MtSelection
        v-model="endXun"
        :list="xunList"
        @change="(val: any) => endChange(endTime, val)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, shallowRef, watch } from 'vue';
import MtSelection from '../../selection/index.vue'
import dayjs from 'dayjs';
import { TimeSetting } from '../type'

defineOptions({ name: 'ContinuousPeriodXunPicker' });

const props = defineProps<{ modelValue: Array<Date | string>, setting?: TimeSetting }>();
const emit = defineEmits<{
  'update:modelValue': [value: [Date, Date]];
}>();

const startTime = shallowRef(new Date('0000/01/01 00:00:00'));
const endTime = shallowRef(new Date('0000/01/01 00:00:00'));
// 开始旬
const startXun = ref(1);
// 结束旬
const endXun = ref(1);
// 旬选项列表
const xunList = [
  { label: '上旬', value: 1 },
  { label: '中旬', value: 2 },
  { label: '下旬', value: 3 }
];

watch(
  () => props.modelValue,
  async val => {
    let needUpdate = false;
    const start = dayjs(val[0]);
    if (dayjs(startTime.value).toString() !== start.toString()) {
      const xun = Math.ceil(start.date() / 10);
      startXun.value = xun > 3 ? 3 : xun;
      startTime.value = start
        .date((startXun.value - 1) * 10 + 1)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      needUpdate = true;
    }
    const end = dayjs(val[1]);
    if (dayjs(endTime.value).toString() !== end.toString()) {
      const xun = Math.ceil(end.date() / 10);
      endXun.value = xun > 3 ? 3 : xun;
      endTime.value = end
        .date(endXun.value === 3 ? end.daysInMonth() : xun * 10)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
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

function startChange(date: Date, xun: number) {
  const start = dayjs(date).date((xun - 1) * 10 + 1);
  startTime.value = start.toDate();
  if (startTime.value.getTime() > endTime.value.getTime()) {
    endXun.value = xun;
    endChange(start.toDate(), xun);
    return;
  }
  emit('update:modelValue', [start.toDate(), dayjs(endTime.value).toDate()]);
}
function endChange(date: Date, xun: number) {
  let end = dayjs(date);
  end = end.date(xun === 3 ? end.daysInMonth() : xun * 10);
  endTime.value = end.toDate();
  if (endTime.value.getTime() < startTime.value.getTime()) {
    startXun.value = xun;
    startChange(end.toDate(), xun);
    return;
  }
  emit('update:modelValue', [dayjs(startTime.value).toDate(), end.toDate()]);
}
</script>

<style scoped lang="scss">
</style>
