<template>
  <div class="mt-continuous-period-season-picker">
    <el-form-item :label="`${ setting?.continue?.label1 || '开始时间' }：`">
      <el-date-picker
        v-model="startYear"
        type="year"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => startChange(val, startSeason)"
      />
      <MtSelection
        v-model="startSeason"
        :list="seasonList"
        @change="(val: any) => startChange(startYear, val)"
      />
    </el-form-item>
    <el-form-item :label="`${ setting?.continue?.label2 || '结束时间' }：`">
      <el-date-picker
        v-model="endYear"
        type="year"
        :clearable="false"
        v-bind="$attrs"
        @change="(val: Date) => endChange(val, endSeason)"
      />
      <MtSelection
        v-model="endSeason"
        :list="seasonList"
        @change="(val: any) => endChange(endYear, val)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, shallowRef, watch } from 'vue';
import dayjs from 'dayjs';
import { getSeason, getSeasonStartMonth, TimeSetting } from '../type'
import MtSelection from '../../selection/index.vue'

defineOptions({ name: 'ContinuousPeriodSeasonPicker' });

const props = defineProps<{ modelValue: Array<Date | string>, setting?: TimeSetting }>();
const emit = defineEmits<{
  'update:modelValue': [value: [Date, Date]];
}>();

const startYear = shallowRef(new Date('0000/01/01 00:00:00'));
const endYear = shallowRef(new Date('0000/01/01 00:00:00'));
const startTime = shallowRef(new Date('0000/01/01 00:00:00'));
const endTime = shallowRef(new Date('0000/01/01 00:00:00'));
// 开始季
const startSeason = ref(1);
// 结束季
const endSeason = ref(1);
// 季选项列表
const seasonList = ['春', '夏', '秋', '冬'].map((season, index) => {
  return { label: `${season}季`, value: index + 1 };
});

watch(
  () => props.modelValue,
  async val => {
    let needUpdate = false;
    let start = dayjs(val[0]);
    let end = dayjs(val[1]);
    startSeason.value = getSeason(start.toDate());
    endSeason.value = getSeason(end.toDate());
    if (dayjs(startTime.value).toString() !== start.toString()) {
      // 当开始时间的月份小于3月时, 表示去年的冬季, 年份需减1
      start = start.subtract(start.month() < 2 ? 1 : 0, 'year');
      startYear.value = new Date(`${start.year()}/01/01 00:00:00`);
      startTime.value = start
        // 月份为 0-11
        .month(getSeasonStartMonth(startSeason.value) - 1)
        .date(1)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      needUpdate = true;
    }
    if (dayjs(endTime.value).toString() !== end.toString()) {
      // 当结束时间的月份小于3月时, 表示去年的冬季, 年份需减1
      end = end.subtract(end.month() < 2 ? 1 : 0, 'year');
      endYear.value = new Date(`${end.year()}/01/01 00:00:00`);
      const tempEnd = end
        // 月份为 0-11
        .month(getSeasonStartMonth(endSeason.value) - 1)
        .add(2, 'months');
      endTime.value = tempEnd.endOf('month').hour(0).minute(0).second(0).millisecond(0).toDate();
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

function startChange(date: Date, season: number) {
  // 月份为 0-11
  const start = dayjs(date)
    .month(getSeasonStartMonth(season) - 1)
    .date(1);
  startYear.value = new Date(`${start.year()}/01/01 00:00:00`);
  startTime.value = start.toDate();
  if (startTime.value.getTime() > endTime.value.getTime()) {
    endSeason.value = season;
    endChange(date, season);
    return;
  }
  emit('update:modelValue', [start.toDate(), dayjs(endTime.value).toDate()]);
}
function endChange(date: Date, season: number) {
  // 月份为 0-11
  let end = dayjs(date).month(getSeasonStartMonth(season) - 1);
  // 使用未加2月前的年份
  endYear.value = new Date(`${end.year()}/01/01 00:00:00`);
  end = end.add(2, 'months');
  end = end.date(end.daysInMonth());
  endTime.value = end.toDate();
  if (endTime.value.getTime() < startTime.value.getTime()) {
    startSeason.value = season;
    startChange(date, season);
    return;
  }
  emit('update:modelValue', [dayjs(startTime.value).toDate(), end.toDate()]);
}
</script>

<style scoped lang="scss">
</style>
