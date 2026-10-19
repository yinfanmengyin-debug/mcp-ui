<template>
  <div class="mt-same-period-xun-picker">
    <el-form-item
      v-if="showYear"
      :label="`${ setting?.same?.label1 || '年份' }：`"
    >
      <el-date-picker
        v-model="years[0]"
        type="year"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => startChange(val, true, xun[0])"
      />
      至
      <el-date-picker
        v-model="years[1]"
        type="year"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => endChange(val, true, xun[1])"
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
        @change="(val: Date) => startChange(val, false, xun[0])"
      />
      至
      <el-date-picker
        v-model="months[1]"
        type="month"
        format="MM"
        :clearable="false"
        v-bind="$attrs"
        popper-class="show-months-only"
        @change="(val: Date) => endChange(val, false, xun[1])"
      />
    </el-form-item>
    <el-form-item :label="'&emsp;'.repeat(`${ setting?.same?.label2 || '时段' }：`.length)">
      <MtSelection
        v-model="xun[0]"
        :list="xunList"
        class="xun-hou-select"
        @change="(val: any) => startChange(startTime, false, val)"
      />
      至
      <MtSelection
        v-model="xun[1]"
        :list="xunList"
        @change="(val: any) => endChange(endTime, false, val)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { nextTick, shallowReactive, shallowRef, watch, ref } from 'vue';
import dayjs from 'dayjs';
import MtSelection from '../../selection/index.vue';
import { TimeSetting } from '../type'

defineOptions({ name: 'SamePeriodXunPicker' });

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
const months = shallowReactive([new Date('0000/01/01 00:00:00'), new Date('0000/01/01 00:00:00')]);
// 开始/结束旬的选中项
const xun = ref([1, 1]);
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
    let start = dayjs(val[0]);
    if (dayjs(startTime.value).toString() !== start.toString()) {
      const whichXun = Math.ceil(start.date() / 10);
      xun.value[0] = whichXun > 3 ? 3 : whichXun;
      start = start
        .date((xun.value[0] - 1) * 10 + 1)
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
      const whichXun = Math.ceil(end.date() / 10);
      xun.value[1] = whichXun > 3 ? 3 : whichXun;
      end = end
        .date(xun.value[1] === 3 ? end.daysInMonth() : whichXun * 10)
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
 * @param {number} xun 当前选中的旬
 */
function startChange(val: Date, isYear: boolean, xun: number) {
  const start = dayjs(val).date((xun - 1) * 10 + 1);
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
 * @param {number} xun 当前选中的旬
 */
function endChange(val: Date, isYear: boolean, xun: number) {
  let end = dayjs(val);
  end = end.date(xun === 3 ? (end.daysInMonth() === 29 ? 28 : end.daysInMonth()) : xun * 10);
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
