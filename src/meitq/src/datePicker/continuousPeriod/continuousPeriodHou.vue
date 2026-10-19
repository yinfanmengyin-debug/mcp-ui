<template>
  <div class="mt-continuous-period-hou-picker">
    <el-form-item :label="`${ setting?.continue?.label1 || '开始时间' }：`">
      <el-date-picker
        v-model="startTime"
        type="month"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => startChange(val, startHou)"
      />
      <MtSelection
        v-model="startHou"
        :list="houList"
        @change="(val: any) => startChange(startTime, val)"
      />
    </el-form-item>
    <el-form-item :label="`${ setting?.continue?.label2 || '结束时间' }：`" class="form-inline">
      <el-date-picker
        v-model="endTime"
        type="month"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => endChange(val, endHou)"
      />
      <MtSelection
        v-model="endHou"
        :list="houList"
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

defineOptions({ name: 'ContinuousPeriodHouPicker' });

const props = defineProps<{ modelValue: Array<Date | string>, setting?: TimeSetting }>();
const emit = defineEmits<{
  'update:modelValue': [value: [Date, Date]];
}>();

const startTime = shallowRef(new Date('0000/01/01 00:00:00'));
const endTime = shallowRef(new Date('0000/01/01 00:00:00'));
// 开始候
const startHou = ref(1);
// 结束候
const endHou = ref(1);
// 候选项列表
const houList = Array.from({ length: 6 }).map((_, index) => {
  const whichHou = index + 1;
  return { label: `${whichHou}候`, value: whichHou };
});

watch(
  () => props.modelValue,
  async val => {
    let needUpdate = false;
    const start = dayjs(val[0]);
    if (dayjs(startTime.value).toString() !== start.toString()) {
      const hou = Math.ceil(start.date() / 5);
      startHou.value = hou > 6 ? 6 : hou;
      startTime.value = start
        .date((startHou.value - 1) * 5 + 1)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      needUpdate = true;
    }
    const end = dayjs(val[1]);
    if (dayjs(endTime.value).toString() !== end.toString()) {
      const hou = Math.ceil(end.date() / 5);
      endHou.value = hou > 6 ? 6 : hou;
      endTime.value = end
        .date(endHou.value === 6 ? end.daysInMonth() : hou * 5)
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

function startChange(date: Date, hou: number) {
  const start = dayjs(date).date((hou - 1) * 5 + 1);
  startTime.value = start.toDate();
  if (startTime.value.getTime() > endTime.value.getTime()) {
    endHou.value = hou;
    endChange(start.toDate(), hou);
    return;
  }
  emit('update:modelValue', [start.toDate(), dayjs(endTime.value).toDate()]);
}
function endChange(date: Date, hou: number) {
  let end = dayjs(date);
  end = end.date(hou === 6 ? end.daysInMonth() : hou * 5);
  endTime.value = end.toDate();
  if (endTime.value.getTime() < startTime.value.getTime()) {
    startHou.value = hou;
    startChange(end.toDate(), hou);
    return;
  }
  emit('update:modelValue', [dayjs(startTime.value).toDate(), end.toDate()]);
}
</script>

<style scoped lang="scss">
</style>
