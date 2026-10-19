<template>
  <div class="mt-same-period-season-picker">
    <el-form-item
      v-if="showYear"
      :label="`${ setting?.same?.label1 || '年份' }：`"
    >
      <el-date-picker
        v-model="years[0]"
        type="year"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => startChange(val, season[0])"
      />
      至
      <el-date-picker
        v-model="years[1]"
        type="year"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => endChange(val, season[1])"
      />
    </el-form-item>
    <el-form-item :label="`${ setting?.same?.label2 || '时段' }：`">
      <MtSelection
        v-model="season[0]"
        :list="seasonList"
        @change="(val: any) => startChange(years[0], val)"
      />
      至
      <MtSelection
        v-model="season[1]"
        :list="seasonList"
        @change="(val: any) => endChange(years[1], val)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, shallowReactive, shallowRef, watch } from 'vue';
import dayjs from 'dayjs';
import { getSeason, getSeasonEndMonth, getSeasonStartMonth } from '../type';
import  MtSelection from '../../selection/index.vue'
import { TimeSetting } from '../type'

defineOptions({ name: 'SamePeriodSeasonPicker' });

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
const season = reactive<[number, number]>([1, 1]);
// 季选项列表
const seasonList = ['春', '夏', '秋', '冬'].map((season, index) => {
  return { label: `${season}季`, value: index + 1 };
});

watch(
  () => props.modelValue,
  async val => {
    let needUpdate = false;
    let start = dayjs(val[0]);
    if (dayjs(startTime.value).toString() !== start.toString()) {
      season[0] = getSeason(start.toDate());
      start = start
        // 月份为 0-11
        .month(getSeasonStartMonth(season[0]) - 1)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .date(1);
      startTime.value = start.toDate();
      years[0] = new Date(`${start.year()}/01/01 00:00:00`);
      needUpdate = true;
    }
    let end = dayjs(val[1]);
    if (dayjs(endTime.value).toString() !== end.toString()) {
      season[1] = getSeason(end.toDate());
      // 月份为 0-11
      end = end.month(getSeasonEndMonth(season[1]) - 1);
      endTime.value = end.endOf('month').hour(0).minute(0).second(0).millisecond(0).toDate();
      years[1] = new Date(`${end.year()}/01/01 00:00:00`);
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
 * @param {number} season 当前所选季节
 */
function startChange(val: Date, season: number) {
  startTime.value = dayjs(val)
    // 月份为 0-11
    .month(getSeasonStartMonth(season) - 1)
    .date(1)
    .toDate();
  emit('update:modelValue', [dayjs(startTime.value).toDate(), dayjs(endTime.value).toDate()]);
}

/**
 * 结束时间发生改变
 * @param {Date} val 改变后的时间
 * @param {number} season 当前所选季节
 */
function endChange(val: Date, season: number) {
  // 月份为 0-11
  let end = dayjs(val).month(getSeasonEndMonth(season) - 1);
  end = end.date(end.daysInMonth() === 29 ? 28 : end.daysInMonth());
  endTime.value = end.toDate();
  emit('update:modelValue', [dayjs(startTime.value).toDate(), dayjs(endTime.value).toDate()]);
}
</script>

<style scoped lang="scss">
</style>
