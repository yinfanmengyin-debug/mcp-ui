<template>
  <div class="mt-same-period-hou-picker">
    <el-form-item
      v-if="showYear"
      :label="`${ setting?.same?.label1 || '年份' }：`"
    >
      <el-date-picker
        v-model="years[0]"
        type="year"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => startChange(val, true, hou[0])"
      />
      至
      <el-date-picker
        v-model="years[1]"
        type="year"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => endChange(val, true, hou[1])"
      />
    </el-form-item>
    <el-form-item :label="`${ setting?.same?.label2 || '时段' }：`">
      <el-date-picker
        v-model="months[0]"
        type="month"
        format="MM"
        :clearable="false"
        v-bind="$attrs"
        popper-class="show-months-only"
        @change="(val: Date) => startChange(val, false, hou[0])"
      />
      至
      <el-date-picker
        v-model="months[1]"
        type="month"
        format="MM"
        :clearable="false"
        v-bind="$attrs"
        popper-class="show-months-only"
        @change="(val: Date) => endChange(val, false, hou[1])"
      />
    </el-form-item>
    <el-form-item :label="'&emsp;'.repeat(`${ setting?.same?.label2 || '时段' }：`.length)">
      <MtSelection
        class="xun-hou-select"
        v-model="hou[0]"
        :list="houList"
        @change="(val: any) => startChange(startTime, false, val)"
      />
      至
      <MtSelection
        v-model="hou[1]"
        :list="houList"
        @change="(val: any) => endChange(endTime, false, val)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, shallowReactive, shallowRef, watch } from 'vue';
import dayjs from 'dayjs';
import MtSelection from '../../selection/index.vue';
import { TimeSetting } from '../type'

defineOptions({ name: 'SamePeriodHouPicker' });

const props = withDefaults(
  defineProps<{
    modelValue: Array<Date | string>;
    // 是否显示年份选择
    showYear?: boolean;
    setting?: TimeSetting
  }>(),
  {
    showYear: true
  }
);
const emit = defineEmits<{
  'update:modelValue': [value: [Date, Date]];
}>();

const startTime = shallowRef(new Date('0000/01/01 00:00:00'));
const endTime = shallowRef(new Date('0000/01/01 00:00:00'));
const years = shallowReactive([new Date('0000/01/01 00:00:00'), new Date('0000/01/01 00:00:00')]);
const months = shallowReactive([new Date('2023/01/01 00:00:00'), new Date('2023/01/01 00:00:00')]);
// 开始/结束候的选中项
const hou = reactive<[number, number]>([1, 1]);
// 候选项列表
const houList = Array.from({ length: 6 }).map((_, index) => {
  const whichHou = index + 1;
  return { label: `${whichHou}候`, value: whichHou };
});

watch(
  () => props.modelValue,
  async val => {
    let needUpdate = false;
    let start = dayjs(val[0]);
    if (dayjs(startTime.value).toString() !== start.toString()) {
      const whichHou = Math.ceil(start.date() / 5);
      hou[0] = whichHou > 6 ? 6 : whichHou;
      start = start
        .date((hou[0] - 1) * 5 + 1)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0);
      startTime.value = start.toDate();
      years[0] = start.toDate();
      months[0] = start.toDate();
      needUpdate = true;
    }
    let end = dayjs(val[1]);
    if (dayjs(endTime.value).toString() !== end.toString()) {
      const whichHou = Math.ceil(end.date() / 5);
      hou[1] = whichHou > 6 ? 6 : whichHou;
      end = end
        .date(hou[1] === 6 ? end.daysInMonth() : whichHou * 5)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0);
      endTime.value = end.toDate();
      years[1] = end.toDate();
      months[1] = end.toDate();
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

/**
 * 开始时间发生改变
 * @param {Date} val 改变后的时间
 * @param {boolean} isYear 是否为年份发生改变 否则为日期发生改变
 * @param {number} hou 当前选中的候
 */
function startChange(val: Date, isYear: boolean, hou: number) {
  const start = dayjs(val).date((hou - 1) * 5 + 1);
  if (isYear) {
    startTime.value = dayjs(startTime.value).year(start.year()).toDate();
  } else {
    startTime.value = start.year(years[0].getFullYear()).toDate();
  }
  emit('update:modelValue', [dayjs(startTime.value).toDate(), dayjs(endTime.value).toDate()]);
}
/**
 * 结束时间发生改变
 * @param {Date} val 改变后的时间
 * @param {boolean} isYear 是否为年份发生改变 否则为日期发生改变
 * @param {number} hou 当前选中的候
 */
function endChange(val: Date, isYear: boolean, hou: number) {
  let end = dayjs(val);
  end = end.date(hou === 6 ? (end.daysInMonth() === 29 ? 28 : end.daysInMonth()) : hou * 5);
  if (isYear) {
    endTime.value = dayjs(endTime.value).year(end.year()).toDate();
  } else {
    endTime.value = end.year(years[1].getFullYear()).toDate();
  }
  emit('update:modelValue', [dayjs(startTime.value).toDate(), dayjs(endTime.value).toDate()]);
}
</script>

<style scoped lang="scss">
</style>
