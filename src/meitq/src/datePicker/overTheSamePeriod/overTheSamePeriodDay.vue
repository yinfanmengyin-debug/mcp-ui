<template>
  <div class="mt-same-period-day-picker">
    <el-form-item
      v-if="showYear"
      :label="`${ setting?.same?.label1 || '年份' }：`"
    >
      <el-date-picker
        v-model="years[0]"
        type="year"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => startChange(val)"
      />
      至
      <el-date-picker
        v-model="years[1]"
        type="year"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => endChange(val)"
      />
    </el-form-item>
    <el-form-item :label="`${ setting?.same?.label2 || '时段' }：`">
      <el-date-picker
        v-model="dates[0]"
        type="date"
        format="MM-DD"
        :clearable="false"
        v-bind="$attrs"
        popper-class="show-month-select-only"
        @change="(val: Date) => startChange(val, false)"
      />
      至
      <el-date-picker
        v-model="dates[1]"
        type="date"
        format="MM-DD"
        :clearable="false"
        v-bind="$attrs"
        popper-class="show-month-select-only"
        @change="(val: Date) => endChange(val, false)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { nextTick, shallowReactive, shallowRef, watch } from 'vue';
import dayjs from 'dayjs';
import { TimeSetting } from '../type'

defineOptions({ name: 'SamePeriodDayPicker' });

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
// 不需要考虑闰年2月29号的情况
const dates = shallowReactive([new Date('2023/01/01 00:00:00'), new Date('2023/01/01 00:00:00')]);

watch(
  () => props.modelValue,
  async val => {
    let needUpdate = false;
    let start = dayjs(val[0]);
    if (dayjs(startTime.value).toString() !== start.toString()) {
      start = start.hour(0).minute(0).second(0).millisecond(0);
      startTime.value = start.toDate();
      years[0] = start.toDate();
      dates[0] = start.year(years[0].getFullYear()).toDate();
      needUpdate = true;
    }
    let end = dayjs(val[1]);
    if (dayjs(endTime.value).toString() !== end.toString()) {
      end = end.hour(0).minute(0).second(0).millisecond(0);
      endTime.value = end.toDate();
      years[1] = end.toDate();
      dates[1] = end.year(years[1].getFullYear()).toDate();
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
 * @param {?boolean} isYear 是否为年份发生改变 否则为日期发生改变
 */
function startChange(val: Date, isYear = true) {
  const start = dayjs(val);
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
 * @param {?boolean} isYear 是否为年份发生改变 否则为日期发生改变
 */
function endChange(val: Date, isYear = true) {
  const end = dayjs(val);
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
