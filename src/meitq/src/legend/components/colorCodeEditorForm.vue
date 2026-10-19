<template>
  <el-form
    ref="formRef"
    :model="form"
    :label-width="100"
    class="mt-color-code-editor-form"
    hide-required-asterisk
    :show-message="false"
    :disabled="disabled ?? false"
  >
    <el-form-item label="色标名称：" prop="name" :rules="required">
      <el-input v-model="form.name" placeholder="请输入色标名称" />
    </el-form-item>
    <el-form-item v-if="options?.systems?.length" label="所属子系统：" prop="systemId" :rules="required">
      <MtSelection
        v-model="form.systemId"
        :list="options?.systems"
        :filterable="options?.systemProps?.searchable ?? true"
        :label-field="options?.systemProps?.labelField ?? 'label'"
        :value-field="options?.systemProps?.valueField ?? 'value'"
      />
    </el-form-item>
    <el-row>
      <el-col :span="12">
        <el-form-item label="要素：" prop="elementType">
          <MtSelection
            v-model="form.elementType"
            :list="options?.elements ?? []"
            :filterable="options?.elementProps?.searchable ?? true"
            :label-field="options?.elementProps?.labelField ?? 'label'"
            :value-field="options?.elementProps?.valueField ?? 'value'"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="要素类型：" prop="dataValueType">
          <MtSelection
            v-model="form.dataValueType"
            :list="dataValueTypes as any"
            :filterable="options?.elementProps?.searchable ?? true"
            :label-field="options?.elementProps?.labelField ?? 'label'"
            :value-field="options?.elementProps?.valueField ?? 'value'"
          />
        </el-form-item>
      </el-col>
      <el-col v-if="elementLevels?.length" :span="12">
        <el-form-item label="高度层：" prop="elementLevel">
          <MtSelection
            v-model="form.elementLevel"
            :list="elementLevels as any"
            :filterable="options?.elementProps?.searchable ?? true"
            :label-field="options?.elementProps?.labelField ?? 'label'"
            :value-field="options?.elementProps?.valueField ?? 'value'"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="单位：" prop="unit">
          <el-input v-model="form.unit" class="unit-input" placeholder="请输入色标单位" :rules="required" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item v-if="options?.timeScales?.length" label="时间分辨率：" prop="timeResolution">
      <MtSelection
        v-model="form.timeResolution"
        :list="options?.timeScales"
        :filterable="options?.timeScaleProps?.searchable ?? true"
        :label-field="options?.timeScaleProps?.labelField ?? 'label'"
        :value-field="options?.timeScaleProps?.valueField ?? 'value'"
      />
    </el-form-item>
    <el-form-item label="适用时段：">
      <div class="time-period-select">
        <MtSelection v-model="timeType" :list="timeTypes" />
        <div v-if="timeType === '日'" class="period-select">
          <div v-for="i in dateSelected.length" :key="i" class="period">
            <el-date-picker v-model="dateSelected[i - 1][0]" format="MM-DD" :teleported="false" :clearable="false" />
            ~
            <div class="second-date-select">
              <div v-if="isNextYear(dateSelected[i - 1])" class="next-year">次年</div>
              <el-date-picker v-model="dateSelected[i - 1][1]" format="MM-DD" :teleported="false" :clearable="false" />
            </div>
            <el-icon v-if="dateSelected.length > 1" @click="removeDateSelected(i - 1)">
              <Remove />
            </el-icon>
            <el-icon v-if="i === dateSelected.length" @click="addDateSelected">
              <CirclePlus />
            </el-icon>
          </div>
        </div>
        <div v-if="timeType === '月'">
          <MtSelection v-model="monthSelected" :list="monthOptions" multiple />
        </div>
        <div v-if="timeType === '季'">
          <MtSelection v-model="seasonSelected" :list="seasonOptions" />
        </div>
      </div>
    </el-form-item>
    <el-form-item v-if="options?.areas?.length" label="区域：" prop="areaId">
      <el-cascader
        ref="areaRef"
        v-model="form.areaId"
        :options="options?.areas"
        :props="computedAreaProps as any"
        :show-all-levels="false"
        :filterable="options?.areaProps?.searchable ?? false"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ElCascader, ElForm, ElFormItem, ElRow, ElCol, ElDatePicker } from 'element-plus'
import { Remove, CirclePlus } from '@element-plus/icons-vue'
import 'element-plus/es/components/cascader/style/css'
import 'element-plus/es/components/form/style/css'
import 'element-plus/es/components/form-item/style/css'
import 'element-plus/es/components/row/style/css'
import 'element-plus/es/components/col/style/css'
import 'element-plus/es/components/date-picker/style/css'
import { computed, inject, reactive, Ref, ref, shallowRef, watch } from 'vue'
import type { ColorCode, ColorCodeOptions, Condition } from '../type'
import dayjs from 'dayjs'
import '../style/colorCodeEditorForm.scss'
import MtSelection from '@/src/selection/index.vue'
import { colorCodeInjectionKey } from '@/src/configProvider/keys'

defineOptions({ name: 'MtColorCodeEditorForm' })
defineExpose({ getCondition })

const props = defineProps<{
  // 若是编辑模式则传入需要编辑的色标信息
  editInfo?: ColorCode
  // 是否禁用
  disabled?: boolean
}>()

const options = inject<Ref<ColorCodeOptions>>(colorCodeInjectionKey)

const form = reactive({
  name: '',
  elementType: '',
  elementLevel: '',
  dataValueType: '',
  timePeriod: '',
  timeResolution: '',
  areaId: '',
  areaName: '',
  unit: '',
  systemId: '',
  systemName: ''
})

// 表单的模板Ref
const formRef = shallowRef<InstanceType<typeof ElForm>>()
// 表单项的验证规则
const required = { required: true, message: '', trigger: 'blur' }

// 区域选择组件的模板Ref
const areaRef = shallowRef<InstanceType<typeof ElCascader>>()
const computedAreaProps = computed(() => ({
  expandTrigger: 'click',
  emitPath: false,
  label: options?.value?.areaProps?.labelField ?? 'label',
  value: options?.value?.areaProps?.valueField ?? 'value',
  children: options?.value?.areaProps?.childrenField ?? 'children'
}))

// 要素的数据类型选项 距平、原值等
const dataValueTypes = computed(
  () =>
    options?.value?.elements?.find(
      item => item[options?.value?.elementProps?.valueField ?? 'value'] === form.elementType
    )?.[options?.value?.elementProps?.childrenField ?? 'children'] ?? []
)

// 要素的高度选项 当选择如"位势高度"要素时会有高度选项
const elementLevels = computed(
  () =>
    options?.value?.elements?.find(
      item => item[options?.value?.elementProps?.valueField ?? 'value'] === form.elementType
    )?.[options?.value?.elementProps?.heightField ?? 'height'] ?? []
)

type TimeType = '无' | '日' | '月' | '季'
// 当前选中的适用时段类型
const timeType = ref<TimeType>('无')
// 适用时段的类型选项列表
const timeTypes = ['无', '日', '月', '季']

// 适用时段"日"对应的时间段列表
const dateSelected = reactive([[new Date('2023/01/01'), new Date('2023/01/01')]])

// 适用时段"月"对应的选项列表
const monthOptions = Array.from({ length: 12 }).map((_, index) => {
  const m = dayjs().year(2023).month(index)
  return {
    label: `${index + 1}月`,
    value: `${m.startOf('month').format('MMDD')}-${m.endOf('month').format('MMDD')}`
  }
})
// 适用时段"月"的选中项
const monthSelected = shallowRef<string[]>([])

// 适用时段"季"对应的选项列表
const seasonOptions = [
  { label: '春季', value: '0301-0531' },
  { label: '夏季', value: '0601-0831' },
  { label: '秋季', value: '0901-1130' },
  { label: '冬季', value: '1201-0228' }
]
const seasonSelected = ref('0301-0531')

// 在组件挂载前先将传入的编辑信息更新到表单
watch(
  () => props.editInfo,
  info => {
    if (!info) return
    form.name = info.name
    form.elementType = info.elementType
    form.elementLevel = info.elementLevel
    form.dataValueType = info.dataValueType

    // 解析选择的适用时段字符串内容
    const period = info.timePeriod
    if (!period) {
      timeType.value = '无'
    } else {
      const arr = period.split(',')
      timeType.value = arr[0] as TimeType
      const selected = arr.slice(1) as string[]
      ;({
        无: () => {},
        日: () => {
          const dates = selected.map(item => item.split('-').map(date => dayjs(date, 'MMDD').toDate()))
          dateSelected.splice(0, dateSelected.length, ...dates)
        },
        月: () => {
          monthSelected.value = [...selected]
        },
        季: () => {
          seasonSelected.value = selected[0]
        }
      })[timeType.value]()
    }
    form.timeResolution = info.timeResolution
    form.areaId = info.areaId
    form.unit = info.unit
    form.systemId = info.systemId
  },
  { immediate: true }
)

watch([dataValueTypes, elementLevels, dataValueTypes], () => {
  // 当要素类型变化时将当前选中的数据类型置为对应数据类型中的第一个类型
  form.dataValueType = dataValueTypes.value?.[0]?.[options?.value?.elementProps?.valueField ?? 'value']
  form.elementLevel = elementLevels.value?.[0]?.[options?.value?.elementProps?.valueField ?? 'value']
  form.unit = dataValueTypes.value?.[0]?.[options?.value?.elementProps?.unitField ?? 'unit']
})

// 添加适用时段为"日"时的时间段设置项
function addDateSelected() {
  dateSelected.push([new Date('2023/01/01'), new Date('2023/01/01')])
}

/**
 * 删除适用时段为"日"时的时间段设置项
 * @param index 要删除的时间段设置项的索引
 */
function removeDateSelected(index: number) {
  dateSelected.splice(index, 1)
}

// 判断时间段是否存在跨年
function isNextYear(dates: Date[]) {
  return dates[0].getTime() > dates[1].getTime()
}

// 获取表单条件
async function getCondition(): Promise<Condition> {
  try {
    await formRef.value!.validate()
  } catch (e) {
    throw new Error('请检查表单是否填写完整')
  }
  const timePeriod: string = {
    无: () => '',
    日: () =>
      `日,${dateSelected
        .map(([date1, date2]) => `${dayjs(date1).format('MMDD')}-${dayjs(date2).format('MMDD')}`)
        .join(',')}`,
    月: () => `月,${monthSelected.value.join(',')}`,
    季: () => `季,${seasonSelected.value}`
  }[timeType.value]()
  return {
    elementType: form.elementType,
    elementLevel: form.elementLevel ?? '',
    dataValueType: form.dataValueType,
    timePeriod,
    timeResolution: form.timeResolution ?? '',
    areaId: form.areaId ?? '',
    areaName: areaRef.value?.getCheckedNodes(true)?.[0]?.label ?? '',
    unit: form.unit ?? '',
    systemId: form.systemId,
    systemName: options?.value?.systems?.find(
      o => o[options?.value?.systemProps?.valueField ?? 'value'] === form.systemId
    )?.[options?.value?.systemProps?.labelField ?? 'label'],
    name: form.name
  }
}
</script>
