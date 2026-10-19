<template>
  <div class="meitq-area-selector">
    <PanelItem
      label="区域选择"
      :header-suffix-width="130"
    >
      <template
        v-if="searchable"
        #header-suffix
      >
        <el-autocomplete
          v-model="searchText"
          :fetch-suggestions="areaSearch"
          clearable
          class="area-search"
          placeholder="行政区、站点......"
          size="small"
          popper-class="area-search-autocomplete"
          @select="areaSearchSelect"
        />
      </template>
      <el-tabs
        v-if="areaList1.length"
        v-model="category"
        stretch
      >
        <el-tab-pane
          v-for="item in areaList1"
          :key="item[valueField]"
          :name="item[valueField]"
          :label="item[labelField]"
        >
          <el-collapse
            v-if="
              item.name === '地理区划' && item[childrenField]?.length && item[childrenField][0][childrenField]?.length
            "
            v-model="geographicalDivisionExpands"
            class="geographical-division"
            :accordion="!multiple.enabled"
          >
            <el-collapse-item
              v-for="subItem in item[childrenField]"
              :key="subItem[valueField]"
              :title="subItem.name"
              :name="subItem.code"
            >
              <CheckButton
                :model-value="areaCode"
                :label-field="labelField"
                :value-field="valueField"
                :list="subItem[childrenField] ?? []"
                size="small"
                :multiple="multiple.enabled"
                @update:model-value="value => updateAreaCode(value as any)"
                @click="(value: SelectionValueType) => buttonClick(subItem[childrenField], `${value}`, [subItem, item])"
              />
            </el-collapse-item>
          </el-collapse>
          <template v-else>
            <Collapse
              :collapsible="showAreaCollapse(item)"
              :max-height="showAreaCollapse(item) ? 38 : 1000"
              :expanded="isAreaExpanded(item)"
              @toggle="toggleAreaCollapse(item)"
            >
              <CheckButton
                :model-value="areaCode"
                :label-field="labelField"
                :value-field="valueField"
                :list="getDisplayAreaList(item)"
                :column="getAreaColumn(item)"
                size="small"
                :multiple="multiple.enabled"
                @update:model-value="value => updateAreaCode(value as any)"
                @click="(value: SelectionValueType) => buttonClick(item[childrenField], `${value}`, [item])"
              />
            </Collapse>
            <!-- 行政区划当前选中区域的下辖区县 -->
            <el-collapse
              v-if="showDistrict && districtList.length"
              v-model="administrativeDivisionExpands"
              class="administrative-division"
            >
              <el-collapse-item
                :title="`${administrativeDivisionExpands.length ? '折叠' : '展开'}所辖地区`"
                name="item"
              >
                <div class="tip">
                  <span>勾选后突出显示区县边界</span>
                </div>
                <MtCheckbox
                  v-model="districtCodeList"
                  :list="districtList"
                  :label-field="labelField"
                  :value-field="valueField"
                  size="small"
                />
              </el-collapse-item>
            </el-collapse>
          </template>
        </el-tab-pane>
      </el-tabs>
    </PanelItem>
  </div>
</template>

<script setup lang="ts">
import type { AreaSelectorProps, AreaSelectorOptions } from './type'
import type { SelectionValueType } from '../../types/common'
import { computed, inject, ref, shallowRef, watch, type Ref } from 'vue'
import { ElAutocomplete, ElCollapse, ElCollapseItem, ElTabPane, ElTabs } from 'element-plus'
import { areaSelectorInjectionKey } from '../configProvider'
import MtCheckbox from '../checkbox/index.vue'
import Collapse from '../collapse/index.vue'
import CheckButton from './checkButton.vue'
import 'element-plus/es/components/autocomplete/style/css'
import 'element-plus/es/components/tabs/style/css'
import 'element-plus/es/components/tab-pane/style/css'
import 'element-plus/es/components/collapse/style/css'
import 'element-plus/es/components/collapse-item/style/css'
import 'element-plus/es/components/collapse-transition/style/css'

defineOptions({ name: 'AreaSelector' })

const props = withDefaults(defineProps<AreaSelectorProps>(), {
  showDistrict: true
})

const multiple = computed(() => {
  let temp
  if (typeof props.multiple === 'boolean') {
    temp = { enabled: props.multiple }
  } else {
    temp = props.multiple ?? {}
  }
  const { enabled, separator, rule } = temp
  return {
    enabled: enabled ?? false,
    separator: separator ?? ',',
    rule:
      rule ??
      ((oldVal, newVal) => {
        if (newVal.areaTypeName !== '行政区划') {
          return [newVal.areaCodes[newVal.areaCodes.length - 1]]
        }
        if (!newVal.areaCodes.length) {
          return [oldVal.areaCodes[oldVal.areaCodes.length - 1]]
        }
        return newVal.areaCodes
      })
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:areaType': [value: string]
  'update:areaName': [value: string]
  'update:areaTypeName': [value: string]
  click: [selected: Record<string, any>[]]
}>()

defineExpose({ getSelectedInfo, getDistrictInfo, setSelection })

const options = inject<Ref<AreaSelectorOptions>>(areaSelectorInjectionKey)!

const areaList = computed(() => options?.value?.areaList ?? [])
const layouts = computed(() => options?.value?.layouts ?? {})
const labelField = computed(() => options?.value?.labelField ?? 'label')
const valueField = computed(() => options?.value?.valueField ?? 'value')
const searchable = computed(() => options?.value?.searchable ?? false)
const childrenField = computed(() => options?.value?.childrenField ?? 'children')

// 过滤 可选择的区域类型名称列表 后的区域列表
const areaList1 = computed(() => {
  let tempList = props.areaTypeNames?.length
    ? areaList.value.filter(item => props.areaTypeNames!.includes(item[labelField.value]))
    : areaList.value
  if (props.areaFilter) {
    // 定制
    tempList = tempList.map(item => {
      let children
      if (item[labelField.value] === '地理区划') {
        children = item[childrenField.value].map((it: Record<string, any>) => {
          const list = it[childrenField.value].filter((subItem: Record<string, any>) =>
            props.areaFilter?.(subItem, {
              areaType: item[valueField.value],
              areaTypeName: item[labelField.value],
              labelField: labelField.value,
              valueField: valueField.value
            })
          )
          return {
            ...it,
            [childrenField.value]: list
          }
        })
      } else {
        children = item[childrenField.value].filter((subItem: Record<string, any>) =>
          props.areaFilter?.(subItem, {
            areaType: item[valueField.value],
            areaTypeName: item[labelField.value],
            labelField: labelField.value,
            valueField: valueField.value
          })
        )
      }
      return {
        ...item,
        [childrenField.value]: children
      }
    })
  }
  return tempList
})

// 自动补全列表
const autocompleteList = shallowRef<Record<string, any>>([])
// 搜索字符串
const searchText = ref('')

// 当前选中的区域code
const areaCode = ref<string | string[]>(
  multiple.value.enabled
    ? props.modelValue
      ? props.modelValue.split(multiple.value.separator)
      : []
    : (props.modelValue ?? '')
)
const areaName = ref(props.areaName ?? '')
// 当前选中的区域类型标识
const category = ref(props.areaType ?? '')

// 当前选中的区域类型信息
const categoryInfo = computed(() => areaList1.value.find(item => item[valueField.value] === category.value)!)

// "行政区划"的所辖地区展开项
const administrativeDivisionExpands = ref([])
// 当前"行政区划"勾选的区县code列表
const districtCodeList = ref([])

// "地理区划"的展开项
const geographicalDivisionExpands = ref<string | string[]>()
// 各区域类型的展开状态
const expandedAreaTypes = ref<string[]>([])

// "行政区划"的所辖地区列表
const districtList = computed(() => {
  if (categoryInfo.value?.[labelField.value] !== '行政区划') return []
  const areaCodes = getAreaCodes()
  return categoryInfo.value?.[childrenField.value]
    ?.filter((item: Record<string, any>) => areaCodes.includes(item[valueField.value]))
    ?.flatMap((item: Record<string, any>) => item[childrenField.value] ?? [])
})

watch(
  areaList1,
  list => {
    if (!list.some(item => item[valueField.value] === category.value)) {
      category.value = list[0]?.[valueField.value]
    }
    // 初始化自动补全列表
    const tempList: Record<string, any> = []
    list.forEach(item => {
      const [label, value] = [item[labelField.value], item[valueField.value]]
      item[childrenField.value].forEach((subItem: Record<string, any>) => {
        const [subLabel, subValue] = [subItem[labelField.value], subItem[valueField.value]]
        if (
          label === '地理区划' &&
          item[childrenField.value]?.length &&
          item[childrenField.value][0][childrenField.value]?.length
        ) {
          subItem[childrenField.value].forEach((thirdItem: Record<string, any>) => {
            const [thirdLabel, thirdValue] = [thirdItem[labelField.value], thirdItem[valueField.value]]
            tempList.push({
              value: [label, subLabel, thirdLabel].join(' / '),
              data: [value, subValue, thirdValue]
            })
          })
        } else {
          tempList.push({ value: [label, subLabel].join(' / '), data: [value, subValue] })
        }
      })
    })
    autocompleteList.value = tempList
  },
  { immediate: true }
)

watch(
  categoryInfo,
  (info, oldValue) => {
    if (!info) return
    const areaCodes = getAreaCodes()
    const subList = info[childrenField.value]
    const newAreaCodes: string[] = []
    // 如果当前选中的区域类型下没有选中的区域, 则将区域code设置为第一个区域的code
    if (info[labelField.value] === '地理区划' && subList?.[0]?.[childrenField.value]?.length) {
      const subItems = subList?.filter((item: Record<string, any>) =>
        item?.[childrenField.value]?.some((subItem: Record<string, any>) => subItem[valueField.value] === areaCodes[0])
      )
      if (!subItems.length) {
        geographicalDivisionExpands.value = subList?.[0]?.[valueField.value]
        const item = subList?.[0]?.[childrenField.value]?.[0]
        newAreaCodes.push(item?.[valueField.value])
      } else {
        geographicalDivisionExpands.value = subItems.map((item: Record<string, any>) => item[valueField.value])
      }
    } else if (!subList?.some((item: Record<string, any>) => item[valueField.value] === areaCodes[0])) {
      newAreaCodes.push(subList?.[0]?.[valueField.value])
    }
    newAreaCodes.length &&
      updateAreaCode(
        multiple.value.enabled ? newAreaCodes : newAreaCodes[0],
        oldValue?.[valueField.value],
        oldValue?.[labelField.value]
      )
    options?.value?.areaTypeChange?.(info[valueField.value])
    emit('update:areaType', info[valueField.value])
    emit('update:areaTypeName', info[labelField.value])
  },
  { immediate: true }
)

watch(districtList, () => {
  districtCodeList.value = []
})

watch(districtCodeList, value => {
  options?.value?.districtListChange?.(value)
})

// 是否为外部修改modelValue
let isExternalUpdate = false
watch(
  () => props.modelValue,
  value => {
    if (!value || value === getAreaCodes().join()) return
    isExternalUpdate = true
    updateAreaCode(value)
    isExternalUpdate = false
  }
)

// 触发首次更新
updateAreaCode(getAreaCodes())

function buttonClick(list: Record<string, any>[], value: string, parents: Record<string, any>[]) {
  searchText.value = ''
  emit('click', [list.find(item => item[valueField.value] === value)!, ...parents])
}

function getAreaCodes(code?: string | string[]) {
  if (!code) code = areaCode.value
  return multiple.value.enabled && Array.isArray(code) ? code : [code as string]
}

function areaSearch(query: string, cb: (list: any) => void) {
  const list = query.trim()
    ? autocompleteList.value.filter((item: Record<string, any>) => item.value.includes(query))
    : []
  cb(list)
}

function isAreaExpanded(item: Record<string, any>) {
  return expandedAreaTypes.value.includes(item[valueField.value])
}

function getAreaColumn(item: Record<string, any>) {
  return layouts.value[item[valueField.value]]?.column ?? 3
}

function getAreaRow(item: Record<string, any>) {
  return layouts.value[item[valueField.value]]?.row ?? 0
}

function showAreaCollapse(item: Record<string, any>) {
  const row = getAreaRow(item)
  if (!row) return false
  const list = item[childrenField.value] ?? []
  return list.length > row * getAreaColumn(item)
}

function getDisplayAreaList(item: Record<string, any>) {
  const list = item[childrenField.value] ?? []
  if (!showAreaCollapse(item) || isAreaExpanded(item)) return list
  return list.slice(0, getAreaRow(item) * getAreaColumn(item))
}

function toggleAreaCollapse(item: Record<string, any>) {
  const areaType = item[valueField.value]
  expandedAreaTypes.value = isAreaExpanded(item)
    ? expandedAreaTypes.value.filter(type => type !== areaType)
    : [...expandedAreaTypes.value, areaType]
}

function expandAreaType(areaType: string) {
  if (expandedAreaTypes.value.includes(areaType)) return
  expandedAreaTypes.value = [...expandedAreaTypes.value, areaType]
}

async function areaSearchSelect(item: Record<string, any>) {
  const values = item.data
  const oldAreaType = categoryInfo.value[valueField.value]
  const oldAreaTypeName = categoryInfo.value[labelField.value]
  let tempAreaCode
  if (values.length === 3) {
    geographicalDivisionExpands.value = values[1]
    category.value = values[0]
    tempAreaCode = values[2]
  } else {
    category.value = values[0]
    expandAreaType(values[0])
    tempAreaCode = values[1]
  }
  updateAreaCode(getAreaCodes(tempAreaCode), oldAreaType, oldAreaTypeName)
}

// 供外部调用设置选中区域 必须是完整的选中层级 [category, subCategory?, areaCode]
function setSelection(codes: string[]) {
  areaSearchSelect({
    data: codes
  })
}

function setAreaName(name: string) {
  areaName.value = name
  emit('update:areaName', name)
}

function getSelectedInfo() {
  return {
    areaCode: getAreaCodes().join(multiple.value.separator),
    areaName: areaName.value,
    areaType: categoryInfo.value[valueField.value],
    areaTypeName: categoryInfo.value[labelField.value],
    districtCode: districtCodeList.value.join(multiple.value.separator),
    districtName: districtCodeList.value
      .map(
        code =>
          districtList.value?.find((district: Record<string, any>) => district[valueField.value] === code)?.[
            labelField.value
          ]
      )
      .filter(Boolean)
      .join(multiple.value.separator)
  }
}

function updateAreaCode(code: string | string[], oldAreaType?: string, oldAreaTypeName?: string) {
  let areaCodes = Array.isArray(code) ? code : [code]
  const newAreaType = categoryInfo.value[valueField.value]
  const newAreaTypeName = categoryInfo.value[labelField.value]

  areaCodes = multiple.value.enabled
    ? multiple.value.rule(
        {
          areaType: oldAreaType ?? newAreaType,
          areaTypeName: oldAreaTypeName ?? newAreaTypeName,
          areaCodes: [...areaCode.value]
        },
        { areaType: newAreaType, areaTypeName: newAreaTypeName, areaCodes }
      )
    : areaCodes

  const tempList = categoryInfo.value?.[childrenField.value] ?? []
  if (!tempList.length) return

  const selectedAreas: Record<string, any>[] = []
  // 若为地理区划时 且 有下级区域时 则需要在地理区划的下级的区域列表中查找
  if (newAreaTypeName === '地理区划' && tempList?.[0]?.[childrenField.value]?.length) {
    outer: for (let i = 0; i < tempList.length; i++) {
      const subList = tempList[i][childrenField.value]
      for (let j = 0; j < subList.length; j++) {
        const subItem = subList[j]
        if (areaCodes.includes(subItem[valueField.value])) {
          selectedAreas.push(subItem)
          if (selectedAreas.length === areaCodes.length) break outer
        }
      }
    }
  } else {
    for (let i = 0; i < tempList.length; i++) {
      const item = tempList[i]
      if (areaCodes.includes(item[valueField.value])) {
        selectedAreas.push(item)
        if (selectedAreas.length === areaCodes.length) break
      }
    }
  }
  // 根据areaCodes的顺序重新排序
  selectedAreas.sort((a: Record<string, any>, b: Record<string, any>) => {
    const indexA = areaCodes.indexOf(a[valueField.value])
    const indexB = areaCodes.indexOf(b[valueField.value])
    return indexA - indexB
  })
  setAreaName(selectedAreas.map(item => item[labelField.value]).join(multiple.value.separator))

  areaCode.value = multiple.value.enabled ? areaCodes : areaCodes[0]
  const areaCodeStr = areaCodes.join(multiple.value.separator)

  if (areaCodeStr === props.modelValue) {
    // 外部更新时值一致还是要触发areaCodeChange
    isExternalUpdate && options?.value?.areaCodeChange?.(areaCodeStr)
    return
  }

  options?.value?.areaCodeChange?.(areaCodeStr)
  emit('update:modelValue', areaCodeStr)
}

// 获取当前选择的下辖区县的code与name
function getDistrictInfo() {
  return districtCodeList.value.map(code => {
    const item = districtList.value?.find((district: Record<string, any>) => district[valueField.value] === code)
    return {
      [valueField.value]: code,
      [labelField.value]: item?.[labelField.value]
    }
  })
}
</script>
<style lang="scss">
@use './index';
</style>
