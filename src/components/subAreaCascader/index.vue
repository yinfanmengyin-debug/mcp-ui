<template>
  <div class="sub-area-cascader">
    <el-cascader
      v-model="currentValue"
      class="sub-area-cascader__input"
      :options="cascaderOptions"
      :props="cascaderProps"
      :show-all-levels="true"
      :filter-method="filterCascaderNode"
      :disabled="disabled || !cascaderOptions.length"
      :placeholder="placeholder"
      filterable
      clearable
      separator=" / "
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElCascader } from 'element-plus'
import type { AreaSelectItem } from './type'
import 'element-plus/es/components/cascader/style/css'

type CascaderAreaOption = AreaSelectItem & {
  [key: string]: any
  childrenAreaList?: CascaderAreaOption[]
}

defineOptions({
  name: 'SubAreaCascader'
})

const props = withDefaults(
  defineProps<{
    modelValue?: string
    areaType?: string
    areaCode?: string
    areaList?: AreaSelectItem[]
    defaultAreaCode?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    areaType: '1',
    areaCode: '',
    areaList: () => [],
    defaultAreaCode: '000000',
    placeholder: '请选择下级区域',
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string, selected: AreaSelectItem | undefined]
}>()

const currentValue = ref<string[]>([])

const cascaderProps = {
  value: 'areaCode',
  label: 'areaName',
  children: 'childrenAreaList',
  checkStrictly: true,
  emitPath: true
} as const

const currentAreaCode = computed(() => props.areaCode || props.defaultAreaCode)
const currentAreaType = computed(() => props.areaList.find(item => item.areaCode === props.areaType))

const cascaderOptions = computed<CascaderAreaOption[]>(() => {
  const sourceList = currentAreaType.value?.childrenAreaList ?? []
  if (!sourceList.length) return []

  if (currentAreaCode.value === '000000') {
    return sourceList.map(cloneAreaNode)
  }

  if (currentAreaCode.value) {
    const matchedNode = findAreaNode(sourceList, currentAreaCode.value)
    if (matchedNode) {
      return [cloneAreaNode(matchedNode)]
    }
  }

  return sourceList.map(cloneAreaNode)
})

const cascaderCodeSet = computed(() => {
  const codeSet = new Set<string>()
  collectAreaCodes(cascaderOptions.value, codeSet)
  return codeSet
})

const defaultValue = computed(() => getDefaultPath(cascaderOptions.value))

watch(
  [cascaderOptions, () => props.modelValue],
  () => {
    const nextValue =
      props.modelValue && cascaderCodeSet.value.has(props.modelValue)
        ? (findAreaPath(cascaderOptions.value, props.modelValue) ?? defaultValue.value)
        : defaultValue.value

    currentValue.value = [...nextValue]

    const selectedValue = nextValue[nextValue.length - 1] ?? ''
    if (selectedValue && selectedValue !== props.modelValue) {
      emit('update:modelValue', selectedValue)
    }
  },
  { immediate: true }
)

function handleChange(value: any) {
  const nextPath = normalizePathValue(value)
  const selectedValue = nextPath[nextPath.length - 1] ?? ''
  currentValue.value = nextPath
  emit('update:modelValue', selectedValue)
  emit('change', selectedValue, findAreaNode(cascaderOptions.value, selectedValue))
}

function filterCascaderNode(node: any, keyword: string) {
  const searchText = keyword.trim()
  if (!searchText) return true
  return String(node?.pathLabels?.join(' / ') ?? '')
    .toLowerCase()
    .includes(searchText.toLowerCase())
}

function cloneAreaNode(area: AreaSelectItem): CascaderAreaOption {
  return {
    ...area,
    childrenAreaList: area.childrenAreaList?.map(cloneAreaNode)
  }
}

function normalizePathValue(value: any): string[] {
  if (!Array.isArray(value)) {
    return value ? [String(value)] : []
  }
  return value.map(item => String(item))
}

function getDefaultPath(list: CascaderAreaOption[]) {
  return list[0] ? [list[0].areaCode] : []
}

function collectAreaCodes(list: CascaderAreaOption[], codeSet: Set<string>) {
  list.forEach(item => {
    codeSet.add(item.areaCode)
    if (item.childrenAreaList?.length) {
      collectAreaCodes(item.childrenAreaList, codeSet)
    }
  })
}

function findAreaNode(list: CascaderAreaOption[], targetCode: string): CascaderAreaOption | undefined {
  for (const item of list) {
    if (item.areaCode === targetCode) {
      return item
    }
    if (item.childrenAreaList?.length) {
      const matchedNode = findAreaNode(item.childrenAreaList, targetCode)
      if (matchedNode) {
        return matchedNode
      }
    }
  }
}

function findAreaPath(list: CascaderAreaOption[], targetCode: string, parentPath: string[] = []): string[] | undefined {
  for (const item of list) {
    const currentPath = [...parentPath, item.areaCode]
    if (item.areaCode === targetCode) {
      return currentPath
    }
    if (item.childrenAreaList?.length) {
      const matchedPath = findAreaPath(item.childrenAreaList, targetCode, currentPath)
      if (matchedPath) {
        return matchedPath
      }
    }
  }
}
</script>

<style scoped lang="scss">
.sub-area-cascader {
  width: 200px;
}

:deep(.sub-area-cascader__input) {
  width: 100%;
  .el-input__wrapper {
    background-color: var(--theme-bg-color);
  }
}
</style>
