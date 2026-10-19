import type { Ref } from 'vue';
import { ref, watch } from 'vue';
import dayjs, { ManipulateType } from 'dayjs'

export interface btnItem {
  label: string;
  callBack: () => void;
  show?: boolean
  // 用于显示快捷选项的tooltip内容
  info?:string
}

export interface Prop {
  modelValue: (string | Date)[],
  type: string
  colNum: number
  rowNum: number
  fold?: {
    fold: {
      label: string
      icon: string
    }
    unfold: {
      label: string
      icon: string
    }
  }
  exclude?: string[]
  preAppend?: btnItem[]
  sufAppend?: btnItem[]
  // 替换列表
  reList?:  btnItem[]
}

export function useShortcut(time: Ref<(string | Date)[]>, timeScale: Ref<string>) {
  const list = ref<btnItem[]>([]);

  const dayList: btnItem[] = [
    { label: '-天', callBack: () => subtract(time, 'day') },
    { label: '+天', callBack: () => add(time, 'day') },
    { label: '-月', callBack: () => subtract(time, 'month') },
    { label: '+月', callBack: () => add(time, 'month') },
    { label: '当月', callBack: () => currentMonth(time) },
    { label: '-年', callBack: () => subtract(time, 'year') },
    { label: '+年', callBack: () => add(time, 'year') },
    {
      label: '当年',
      callBack: () =>
        (time.value = [
          dayjs(time.value[0]).year(dayjs().year()).month(0).date(1).toDate(),
          dayjs(new Date()).year(dayjs().year()).toDate()
        ])
    }
  ];
  const houList: btnItem[] = [
    { label: '-候', callBack: () => subtractHou() },
    { label: '+候', callBack: () => addHou() },
    { label: '-月', callBack: () => subtract(time, 'month') },
    { label: '+月', callBack: () => add(time, 'month') },
    { label: '当月', callBack: () => currentMonth(time) },
    { label: '-年', callBack: () => subtract(time, 'year') },
    { label: '+年', callBack: () => add(time, 'year') },
    {
      label: '当年',
      callBack: () =>
        (time.value = [
          dayjs(time.value[0]).year(dayjs().year()).month(0).date(1).toDate(),
          dayjs(new Date()).year(dayjs().year()).toDate()
        ])
    }
  ];
  const xunList: btnItem[] = [
    { label: '-旬', callBack: () => subtractXun() },
    { label: '+旬', callBack: () => addXun() },
    { label: '-月', callBack: () => subtract(time, 'month') },
    { label: '+月', callBack: () => add(time, 'month') },
    { label: '当月', callBack: () => currentMonth(time) },
    { label: '-年', callBack: () => subtract(time, 'year') },
    { label: '+年', callBack: () => add(time, 'year') },
    {
      label: '当年',
      callBack: () =>
        (time.value = [
          dayjs(time.value[0]).year(dayjs().year()).month(0).date(1).toDate(),
          dayjs(new Date()).year(dayjs().year()).toDate()
        ])
    }
  ];
  const monthList: btnItem[] = [
    { label: '-月', callBack: () => subtract(time, 'month') },
    { label: '+月', callBack: () => add(time, 'month') },
    { label: '当月', callBack: () => currentMonth(time) },
    { label: '-年', callBack: () => subtract(time, 'year') },
    { label: '+年', callBack: () => add(time, 'year') },
    {
      label: '当年',
      callBack: () =>
        (time.value = [
          dayjs(time.value[0]).year(dayjs().year()).month(0).date(1).toDate(),
          dayjs(new Date()).year(dayjs().year()).toDate()
        ])
    }
  ];
  const yearList: btnItem[] = [
    { label: '-年', callBack: () => subtract(time, 'year') },
    { label: '+年', callBack: () => add(time, 'year') },
    {
      label: '当年',
      callBack: () =>
        (time.value = [
          dayjs(time.value[0]).year(dayjs().year()).month(0).date(1).toDate(),
          dayjs(new Date()).year(dayjs().year()).toDate()
        ])
    }
  ];
  const seasonList: btnItem[] = [
    { label: '-季', callBack: () => subtract(time, 'season') },
    { label: '+季', callBack: () => add(time, 'season') },
    { label: '当季', callBack: () => currentMonth(time) },
    { label: '-年', callBack: () => subtract(time, 'year') },
    { label: '+年', callBack: () => add(time, 'year') },
    {
      label: '当年',
      callBack: () =>
        (time.value = [
          dayjs(time.value[0]).year(dayjs().year()).month(0).date(1).toDate(),
          dayjs(new Date()).year(dayjs().year()).toDate()
        ])
    }
  ];
  const hourList: btnItem[] = [
    { label: '-小时', callBack: () => subtractTime2(time, 'hour', 1) },
    { label: '+小时', callBack: () => addTime(time, 'hour', 1) },
    { label: '-天', callBack: () => subtract(time, 'day') },
    { label: '+天', callBack: () => add(time, 'day') },
    { label: '-月', callBack: () => subtract(time, 'month') },
    { label: '+月', callBack: () => add(time, 'month') },
    { label: '当月', callBack: () => currentMonth(time) },
    { label: '-年', callBack: () => subtract(time, 'year') },
    { label: '+年', callBack: () => add(time, 'year') },
    {
      label: '当年',
      callBack: () =>
        (time.value = [
          dayjs(time.value[0]).year(dayjs().year()).month(0).date(1).toDate(),
          dayjs(new Date()).year(dayjs().year()).toDate()
        ])
    },
    { label: '08-08时', callBack: () => settingTime(8, 8) },
    { label: '20-20时', callBack: () => settingTime(20, 20) },
    { label: '14-14时', callBack: () => settingTime(14, 14) },
    { label: '08-20时', callBack: () => settingTime(8, 20) },
    { label: '20-08时', callBack: () => settingTime(20, 8) },
    { label: '前1小时', callBack: () => beforeTime('hour', 1) },
    { label: '前3小时', callBack: () => beforeTime('hour', 3) },
    { label: '前6小时', callBack: () => beforeTime('hour', 6) },
    { label: '前12小时', callBack: () => beforeTime('hour', 12) },
    { label: '前24小时', callBack: () => beforeTime('hour', 24) },
    { label: '前48小时', callBack: () => beforeTime('hour', 48) }
  ];

  // 加侯
  function addHou() {
    time.value = [dayjs(time.value[0]).add(1, 'hou' as ManipulateType).toDate(), dayjs(time.value[1]).add(1, 'hou' as ManipulateType).toDate()];
  }

  // 减侯
  function subtractHou() {
    time.value = [dayjs(time.value[0]).subtract(1, 'hou' as ManipulateType).toDate(), dayjs(time.value[1]).subtract(1, 'hou' as ManipulateType).toDate()];
  }

  // 加旬
  function addXun() {
    time.value = [dayjs(time.value[0]).add(1, 'xun' as ManipulateType).toDate(), dayjs(time.value[1]).add(1, 'xun' as ManipulateType).toDate()];
  }

  // 减旬
  function subtractXun() {
    time.value = [dayjs(time.value[0]).subtract(1, 'xun' as ManipulateType).toDate(), dayjs(time.value[1]).subtract(1, 'xun' as ManipulateType).toDate()];
  }

  function add(time: Ref<(string | Date)[]>, scale: any): void {
    time.value = [dayjs(time.value[0]).add(1, scale).toDate(), dayjs(time.value[1]).add(1, scale).toDate()];
  }

  function subtract(time: Ref<(string | Date)[]>, scale: any): void {
    time.value = [dayjs(time.value[0]).subtract(1, scale).toDate(), dayjs(time.value[1]).subtract(1, scale).toDate()];
  }

  // 设置时间
  function settingTime(start: number, end: number) {
    time.value = [dayjs(time.value[0]).hour(start).toDate(), dayjs(time.value[1]).hour(end).toDate()];
  }

  function subtractTime(time: Ref<(string | Date)[]>, scale: any, number: number): void {
    time.value = [
      dayjs(time.value[0]).hour(dayjs().hour()).subtract(number, scale).toDate(),
      dayjs(time.value[1]).hour(dayjs().hour()).subtract(number, scale).toDate()
    ];
  }

  function subtractTime2(time: Ref<(string | Date)[]>, scale: any, number: number): void {
    time.value = [
      dayjs(time.value[0]).subtract(number, scale).toDate(),
      dayjs(time.value[1]).subtract(number, scale).toDate()
    ];
  }

  function beforeTime(scale: any, number: number) {
    time.value = [dayjs().subtract(number, scale).toDate(), dayjs().toDate()];
  }

  function addTime(time: Ref<(string | Date)[]>, scale: any, number: number): void {
    time.value = [dayjs(time.value[0]).add(number, scale).toDate(), dayjs(time.value[1]).add(number, scale).toDate()];
  }

  // 当月
  function currentMonth(time: Ref<(string | Date)[]>) {
    const day = dayjs().date();
    const month = dayjs().month() + 1;
    // 判断当前日期是否小于2
    if (day < 2) {
      time.value = [
        dayjs('' + dayjs().year() + '-' + month + '-' + day)
          .subtract(2, 'day')
          .toDate(),
        dayjs('' + dayjs().year() + '-' + month + '-' + day)
          .subtract(1, 'day')
          .toDate()
      ];
    } else {
      time.value = [
        dayjs('' + dayjs().year() + '-' + month + '-01').toDate(),
        dayjs('' + dayjs().year() + '-' + month + '-' + (day - 1)).toDate()
      ];
    }
  }

  // function isLeapYear(year: number) {
  //   if (year % 4 === 0) {
  //     if (year % 100 === 0) {
  //       return year % 400 === 0
  //     } else {
  //       return true // 能被 4 整除但不能被 100 整除的年份是闰年
  //     }
  //   } else {
  //     return false // 不能被 4 整除的年份不是闰年
  //   }
  // }

  const configList: { [name: string]: btnItem[] } = {
    day: dayList,
    hou: houList,
    xun: xunList,
    month: monthList,
    year: yearList,
    season: seasonList,
    hour: hourList
  }

  if (timeScale.value)  list.value = configList[timeScale.value]
  watch(
    () => timeScale.value,
    (val: string) => {
      list.value = configList[val]
    },
    {
      immediate: true
    }
  );
  return { list };
}
