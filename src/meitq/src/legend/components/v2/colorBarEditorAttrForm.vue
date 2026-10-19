<script setup lang="ts">
import type { NestingOptionProps } from '@/types/common'
import { CirclePlus, Remove } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElIcon,
  ElRow,
  ElTag,
  type FormInstance
} from 'element-plus'
import 'element-plus/es/components/cascader/style/css'
import 'element-plus/es/components/form/style/css'
import 'element-plus/es/components/form-item/style/css'
import 'element-plus/es/components/row/style/css'
import 'element-plus/es/components/col/style/css'
import 'element-plus/es/components/date-picker/style/css'
import 'element-plus/es/components/collapse/style/css'
import 'element-plus/es/components/collapse-item/style/css'
import 'element-plus/es/components/icon/style/css'
import 'element-plus/es/components/tag/style/css'
import 'element-plus/es/components/message/style/css'
import '../../style/v2/colorBarEditorAttrForm.scss'
import '../../style/v2/colorBarEditorFormWrapper.scss'
import { computed, inject, reactive, Ref, ref, shallowRef, watch } from 'vue'
import { colorCodeInjectionKey } from '../../../configProvider/keys'
import type { ColorCode, ColorCodeOptions } from '../../../legend/type'
import MtSelection from '../../../selection/index.vue'
import {
  type ColorBarEditorAttrFormCondition,
  type ColorBarEditorAttrFormInfo,
  error,
  splitStr
} from './colorBarEditor'
import MtTreeSelector from './treeSelectorDialog.vue'

const DEFAULT_NESTING_OPTION: Required<NestingOptionProps> = {
  labelField: 'label',
  valueField: 'value',
  childrenField: 'children',
  searchable: false
}

defineOptions({ name: 'MtColorBarEditorAttr' })

defineExpose({ getForm })

const props = defineProps<{ colorCode: ColorCode }>()

const options = inject<Ref<ColorCodeOptions>>(colorCodeInjectionKey)

// 表单项的验证规则
const required = { required: true, message: '', trigger: 'change' }

const form = reactive<ColorBarEditorAttrFormInfo>({
  elementType: '',
  elementLevel: '',
  dataValueType: '',
  systemId: [],
  systemName: [],
  timePeriod: '',
  timeResolution: '',
  areaId: [],
  areaName: []
})

const formRef = shallowRef<FormInstance>()

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

// 适用模块(系统)设置的选项数据
const systemData = computed(() => options?.value?.systems ?? [])
const systemOptions = computed<Required<NestingOptionProps>>(() => ({
  ...DEFAULT_NESTING_OPTION,
  ...options?.value?.systemProps
}))
// 适用范围(区域)设置的选项数据
const areaData = computed(() => options?.value?.areas ?? [])
const areaOptions = computed<Required<NestingOptionProps>>(() => ({
  ...DEFAULT_NESTING_OPTION,
  ...options?.value?.areaProps
}))

// 色标属性设置的更多设置
const moreSettingActives = ref()

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

// 适用模块(系统)设置
const systemSetting = reactive({
  dialogVisible: false,
  defaultSystemId: [] as string[]
})
// 适用范围(区域)设置
const areaSetting = reactive({
  dialogVisible: false,
  defaultAreaId: [] as string[]
})

// 在组件挂载前先将传入的编辑信息更新到表单
watch(
  () => props.colorCode,
  info => {
    formRef.value?.resetFields()
    if (!info) return
    form.elementType = info.elementType
    form.elementLevel = info.elementLevel
    form.dataValueType = info.dataValueType

    // 解析选择的适用时段字符串内容
    const period = info.timePeriod
    if (!period) {
      timeType.value = '无'
    } else {
      form.timePeriod = period
      const arr = period.split(',')
      timeType.value = arr[0] as TimeType
      const selected = arr.slice(1) as string[]
      if ('日' === timeType.value) {
        const dates = selected.map(item => item.split('-').map(date => dayjs(date, 'MMDD').toDate()))
        dateSelected.splice(0, dateSelected.length, ...dates)
      } else if ('月' === timeType.value) {
        monthSelected.value = [...selected]
      } else if ('季' === timeType.value) {
        seasonSelected.value = selected[0]
      }
    }
    form.timeResolution = info.timeResolution

    const areaId = splitStr(info.areaId)
    form.areaId = areaId
    areaSetting.defaultAreaId = areaId
    form.areaName = splitStr(info.areaName)

    const systemId = splitStr(info.systemId)
    form.systemId = systemId
    systemSetting.defaultSystemId = systemId
    form.systemName = splitStr(info.systemName)
  },
  { immediate: true }
)

watch(
  () => form.elementType,
  () => {
    // 当要素类型变化时将当前选中的数据类型置为对应数据类型中的第一个类型
    form.dataValueType = dataValueTypes.value?.[0]?.[options?.value?.elementProps?.valueField ?? 'value']
    form.elementLevel = elementLevels.value?.[0]?.[options?.value?.elementProps?.valueField ?? 'value']
    // form.unit = dataValueTypes.value?.[0]?.[options?.value?.elementProps?.unitField ?? 'unit']
  }
)

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

function areaChange(areaNodes: Record<string, any>[]) {
  const areaIds = areaNodes.map(item => item[areaOptions.value.valueField])
  form.areaId = areaIds
  form.areaName = areaNodes.map(item => item[areaOptions.value.labelField])
  areaSetting.defaultAreaId = areaIds
}

function systemChange(systemNodes: Record<string, any>[]) {
  const systemIds = systemNodes.map(item => item[systemOptions.value.valueField])
  form.systemId = systemIds
  form.systemName = systemNodes.map(item => item[systemOptions.value.labelField])
  systemSetting.defaultSystemId = systemIds
}

async function getForm(): Promise<ColorBarEditorAttrFormCondition> {
  try {
    await formRef.value!.validate()
  } catch (e: any) {
    error('请检查色标属性设置是否填写完整', e)
  }
  let timePeriod = ''
  const type = timeType.value
  if ('日' === type) {
    timePeriod = `日,${dateSelected
      .map(([date1, date2]) => `${dayjs(date1).format('MMDD')}-${dayjs(date2).format('MMDD')}`)
      .join(',')}`
  } else if ('月' === type) {
    timePeriod = `月,${monthSelected.value.join(',')}`
  } else if ('季' === type) {
    timePeriod = `季,${seasonSelected.value}`
  }
  return {
    elementType: form.elementType,
    elementLevel: form.elementLevel ?? '',
    dataValueType: form.dataValueType,
    timePeriod,
    timeResolution: form.timeResolution ?? '',
    areaId: form.areaId.join(),
    areaName: form.areaName.join(),
    systemId: form.systemId.join(),
    systemName: form.systemName.join()
  }
}
</script>

<template>
  <div class="mt-color-bar-editor-attr-form mt-color-bar-editor-form-wrapper">
    <div class="form-title">色标属性设置</div>
    <el-form ref="formRef" :model="form" :label-width="100">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="气象要素：" prop="elementType" :rules="required">
            <MtSelection
              v-model="form.elementType"
              :list="options?.elements ?? []"
              :filterable="options?.elementProps?.searchable ?? true"
              :label-field="options?.elementProps?.labelField ?? 'label'"
              :value-field="options?.elementProps?.valueField ?? 'value'"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="elementLevels?.length" :span="12">
          <el-form-item label="高度层：" prop="elementLevel" :rules="required">
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
          <el-form-item label="统计方式：" prop="dataValueType" :rules="required">
            <MtSelection
              v-model="form.dataValueType"
              :list="dataValueTypes as any"
              :filterable="options?.elementProps?.searchable ?? true"
              :label-field="options?.elementProps?.labelField ?? 'label'"
              :value-field="options?.elementProps?.valueField ?? 'value'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-collapse v-model="moreSettingActives">
            <el-collapse-item title="更多设置：" name="attrFormMortSetting">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="时间分辨率：" prop="timeResolution">
                    <MtSelection
                      v-model="form.timeResolution"
                      :list="options?.timeScales"
                      :filterable="options?.timeScaleProps?.searchable ?? true"
                      :label-field="options?.timeScaleProps?.labelField ?? 'label'"
                      :value-field="options?.timeScaleProps?.valueField ?? 'value'"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="适用时段：">
                    <div class="time-period-wrapper">
                      <MtSelection
                        v-model="timeType"
                        :list="timeTypes"
                        :class="['无', '日'].includes(timeType) ? 'full-width' : 'half-width'"
                      />
                      <div v-if="timeType === '日'" class="day-period-wrapper">
                        <div v-for="i in dateSelected.length" :key="i" class="day-period">
                          <el-date-picker v-model="dateSelected[i - 1][0]" format="MM-DD" :clearable="false" />
                          ~
                          <div class="second-date-select">
                            <div v-if="isNextYear(dateSelected[i - 1])" class="next-year">次年</div>
                            <el-date-picker v-model="dateSelected[i - 1][1]" format="MM-DD" :clearable="false" />
                          </div>
                          <el-icon v-if="dateSelected.length > 1" :size="20" @click="removeDateSelected(i - 1)">
                            <Remove />
                          </el-icon>
                          <el-icon v-if="i === dateSelected.length" :size="20" @click="addDateSelected">
                            <CirclePlus />
                          </el-icon>
                        </div>
                      </div>
                      <div v-if="timeType === '月'" class="half-width">
                        <MtSelection v-model="monthSelected" :list="monthOptions" multiple />
                      </div>
                      <div v-if="timeType === '季'" class="half-width">
                        <MtSelection v-model="seasonSelected" :list="seasonOptions" />
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="适用模块：" prop="systemId">
                    <div class="setting-wrapper">
                      <div class="names">
                        <span v-if="!form.systemName.length" class="no-data">未设置</span>
                        <template v-else>
                          <el-tag v-for="(name, index) in form.systemName" :key="index">
                            {{ name }}
                          </el-tag>
                        </template>
                      </div>
                      <div class="custom-setting" @click="systemSetting.dialogVisible = true">自定义设置</div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="适用范围：" prop="areaId">
                    <div class="setting-wrapper">
                      <div class="names">
                        <span v-if="!form.areaName.length" class="no-data">未设置</span>
                        <template v-else>
                          <el-tag v-for="(name, index) in form.areaName" :key="index">
                            {{ name }}
                          </el-tag>
                        </template>
                      </div>
                      <div class="custom-setting" @click="areaSetting.dialogVisible = true">自定义设置</div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
    </el-form>
    <MtTreeSelector
      v-model="areaSetting.dialogVisible"
      title="区域选择器"
      :data="areaData"
      :default-checked-values="areaSetting.defaultAreaId"
      :options="areaOptions"
      @confirm="areaChange"
    />
    <MtTreeSelector
      v-model="systemSetting.dialogVisible"
      title="功能模块选择器"
      :data="systemData"
      :default-checked-values="systemSetting.defaultSystemId"
      :options="systemOptions"
      @confirm="systemChange"
    />
  </div>
</template>
