<template>
  <div
    class="mt-data-form"
    :style="containerStyle"
  >
    <div
      v-for="item in visibleData"
      :key="getFieldKey(item)"
      class="mt-data-form__item"
      :class="getItemClass(item)"
    >
      <div
        class="mt-data-form__main"
        :style="getMainStyle(item)"
      >
        <div
          class="mt-data-form__label"
          :style="getLabelStyle()"
        >
          <div
            class="mt-data-form__label-content"
            :class="`is-horizontal-${getHorizontalAlign(item)}`"
          >
            <slot
              v-if="item.labelSlot"
              :name="item.labelSlot"
              :item="item"
            />
            <template v-else>
              <RequiredIcon
                v-if="item.required"
                class="mt-data-form__required"
              />
              <span class="mt-data-form__label-text"> {{ item.name }}{{ normalizedOptions.labelSuffix }} </span>
            </template>
          </div>
        </div>
        <div
          class="mt-data-form__content-main"
          :style="getContentStyle()"
        >
          <slot
            v-if="item.type === 'slot' || item.slot"
            :name="item.slot || getFieldKey(item)"
            :item="item"
            :value="item.value"
            :error="errors[getFieldKey(item)]"
            :data="localData"
            :set-value="(value: any) => setItemValue(item, value)"
          />
          <el-select
            v-else-if="item.type === 'select'"
            :model-value="item.value"
            v-bind="getComponentProps(item)"
            @update:model-value="setItemValue(item, $event)"
          >
            <el-option
              v-for="option in item.options ?? []"
              :key="String(option.value)"
              :label="option.label"
              :value="option.value"
              :disabled="option.disabled"
            />
          </el-select>
          <el-date-picker
            v-else-if="item.type === 'date'"
            :model-value="item.value"
            v-bind="getComponentProps(item)"
            @update:model-value="setItemValue(item, $event)"
          />
          <el-switch
            v-else-if="item.type === 'switch'"
            :model-value="item.value"
            v-bind="getComponentProps(item)"
            @update:model-value="setItemValue(item, $event)"
          />
          <el-radio-group
            v-else-if="item.type === 'radio'"
            :model-value="item.value"
            v-bind="getComponentProps(item)"
            @update:model-value="setItemValue(item, $event)"
          >
            <el-radio
              v-for="option in item.options ?? []"
              :key="String(option.value)"
              :value="option.value"
              :disabled="option.disabled"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
          <el-checkbox-group
            v-else-if="item.type === 'checkbox'"
            :model-value="item.value"
            v-bind="getComponentProps(item)"
            @update:model-value="setItemValue(item, $event)"
          >
            <el-checkbox
              v-for="option in item.options ?? []"
              :key="String(option.value)"
              :value="option.value"
              :disabled="option.disabled"
            >
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>
          <el-input
            v-else
            :model-value="item.value"
            v-bind="getComponentProps(item)"
            @update:model-value="setItemValue(item, $event)"
          />
        </div>
      </div>
      <div
        v-if="errors[getFieldKey(item)] || normalizedOptions.inlineMessage"
        class="mt-data-form__error-row"
      >
        <div
          class="mt-data-form__error-spacer"
          :style="getLabelStyle()"
        ></div>
        <div
          class="mt-data-form__error-wrap"
          :style="getContentStyle()"
        >
          <div
            class="mt-data-form__error"
            :style="errorStyle"
          >
            {{ errors[getFieldKey(item)] ?? '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { designPx2rem } from '../../utils/layout'
import RequiredIcon from './icon.vue'
import type { DataFormData, DataFormExpose, DataFormOptions, DataFormRule, DataFormValidateContext } from './type'

defineOptions({
  name: 'DataForm'
})

const props = withDefaults(
  defineProps<{
    data: DataFormData[]
    options?: DataFormOptions
  }>(),
  {
    data: () => [],
    options: () => ({})
  }
)

const emit = defineEmits<{
  'update:data': [data: DataFormData[]]
  change: [payload: { item: DataFormData; data: DataFormData[] }]
  validate: [valid: boolean]
}>()

const errors = ref<Record<string, string>>({})
const localData = ref<DataFormData[]>([])
const initialData = ref<DataFormData[]>([])
const isInternalUpdate = ref(false)
type InlineStyle = Record<string, string | number | undefined>
type ComponentBindProps = Record<string, unknown>

const normalizedOptions = computed<Required<DataFormOptions>>(() => ({
  width: props.options?.width ?? '100%',
  height: props.options?.height ?? 'auto',
  labelWidth: props.options?.labelWidth ?? 'auto',
  contentWidth: props.options?.contentWidth ?? 'auto',
  gapX: props.options?.gapX ?? 20,
  gapY: props.options?.gapY ?? 20,
  rows: props.options?.rows ?? 0,
  columns: props.options?.columns ?? 1,
  itemMinWidth: props.options?.itemMinWidth ?? 0,
  labelSuffix: props.options?.labelSuffix ?? '：',
  inlineMessage: props.options?.inlineMessage ?? true,
  errorMinHeight: props.options?.errorMinHeight ?? 18
}))

const visibleData = computed<DataFormData[]>(() => {
  const result: DataFormData[] = []
  for (const item of localData.value) {
    if (!item.hidden) {
      result.push(item)
    }
  }
  return result
})

const containerStyle = computed<InlineStyle>(() => ({
  width: toCssSize(normalizedOptions.value.width, '100%'),
  height: toCssSize(normalizedOptions.value.height, 'auto'),
  columnGap: `${normalizedOptions.value.gapX}px`,
  rowGap: `${normalizedOptions.value.gapY}px`,
  gridTemplateRows: normalizedOptions.value.rows
    ? `repeat(${normalizedOptions.value.rows}, minmax(auto, auto))`
    : undefined,
  gridTemplateColumns: `repeat(${normalizedOptions.value.columns}, minmax(${toCssSize(
    normalizedOptions.value.itemMinWidth,
    '0px'
  )}, 1fr))`
}))

const labelStyle = computed<InlineStyle>(() => {
  const width = normalizedOptions.value.labelWidth
  return {
    width: width === 'auto' ? 'auto' : toCssSize(width),
    minWidth: width === 'auto' ? 'auto' : toCssSize(width)
  }
})

const contentStyle = computed<InlineStyle>(() => {
  const width = normalizedOptions.value.contentWidth

  if (width === 'auto') {
    return {
      flex: 1
    }
  }

  const cssWidth = toCssSize(width)
  return {
    width: cssWidth,
    maxWidth: '100%',
    flex: '0 0 auto'
  }
})

const errorStyle = computed<InlineStyle>(() => ({
  height: normalizedOptions.value.errorMinHeight ? toCssSize(normalizedOptions.value.errorMinHeight, '0px') : undefined
}))

function getLabelStyle() {
  return labelStyle.value
}

function getContentStyle() {
  return contentStyle.value
}

function getHorizontalAlign(item: DataFormData) {
  return item.horizontalAlign ?? 'right'
}

function getMainStyle(item: DataFormData): InlineStyle {
  return {
    alignItems: item.verticalAlign === 'center' ? 'center' : 'flex-start'
  }
}

watch(
  () => props.data,
  data => {
    localData.value = cloneData(data)
    if (!isInternalUpdate.value) {
      initialData.value = cloneData(data)
    }
    isInternalUpdate.value = false
  },
  {
    deep: true,
    immediate: true
  }
)

function cloneData(data: DataFormData[]) {
  return data.map(item => cloneItem(item))
}

function cloneItem(item: DataFormData): DataFormData {
  if (item.type === 'select' || item.type === 'radio' || item.type === 'checkbox') {
    return {
      ...item,
      options: item.options?.map(option => ({ ...option })),
      props: item.props ? { ...item.props } : item.props
    }
  }

  if (item.type === 'date') {
    return {
      ...item,
      props: item.props ? { ...item.props } : item.props
    }
  }

  if (item.type === 'switch') {
    return {
      ...item,
      props: item.props ? { ...item.props } : item.props
    }
  }

  if (item.type === 'slot') {
    return {
      ...item,
      props: item.props ? { ...item.props } : item.props
    }
  }

  return {
    ...item,
    props: item.props ? { ...item.props } : item.props
  }
}

function getFieldKey(item: DataFormData) {
  return item.field?.trim() || item.name
}

function toCssSize(value?: string | number, fallback = 'auto') {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'number') return designPx2rem(value)
  return value
}

function getItemClass(item: DataFormData) {
  const classNames = []
  if (errors.value[getFieldKey(item)]) {
    classNames.push('is-error')
  }
  return classNames.join(' ')
}

function getComponentProps(item: DataFormData): ComponentBindProps {
  const type = item.type ?? 'input'
  const placeholder = getDefaultPlaceholder(item)

  if (type === 'textarea') {
    return {
      type: 'textarea',
      rows: 4,
      placeholder,
      ...(item.props ?? {})
    }
  }

  if (type === 'select') {
    return {
      placeholder,
      clearable: true,
      ...(item.props ?? {})
    }
  }

  if (type === 'date') {
    return {
      type: 'date',
      clearable: true,
      valueFormat: 'YYYY-MM-DD',
      placeholder,
      ...(item.props ?? {})
    }
  }

  if (type === 'switch') {
    return {
      ...(item.props ?? {})
    }
  }

  if (type === 'radio' || type === 'checkbox') {
    return {
      ...(item.props ?? {})
    }
  }

  return {
    clearable: true,
    placeholder,
    ...(item.props ?? {})
  }
}

function getDefaultPlaceholder(item: DataFormData) {
  switch (item.type) {
    case 'select':
      return `请选择${item.name}`
    case 'date':
      return `请选择${item.name}`
    case 'textarea':
    case 'input':
    default:
      return `请输入${item.name}`
  }
}

function setItemValue(item: DataFormData, value: any) {
  const target = localData.value.find(field => getFieldKey(field) === getFieldKey(item))
  if (!target) return

  target.value = value
  syncValue(target)
  void validateItem(target)
}

function isEmptyValue(value: any) {
  if (Array.isArray(value)) return value.length === 0
  return value === undefined || value === null || value === ''
}

async function validateRule(item: DataFormData, rule: DataFormRule, context: DataFormValidateContext) {
  if (typeof rule === 'string') {
    const valid = new RegExp(rule).test(String(context.value ?? ''))
    if (!valid) {
      errors.value[getFieldKey(item)] = item.message ?? `${item.name}格式不正确`
    }
    return valid
  }

  const result = await rule(context.value, context)
  if (result === true) return true

  errors.value[getFieldKey(item)] = typeof result === 'string' ? result : (item.message ?? `${item.name}校验未通过`)
  return false
}

async function validateItem(item: DataFormData) {
  const field = getFieldKey(item)
  delete errors.value[field]

  if (item.hidden) return true

  if (item.required && isEmptyValue(item.value)) {
    errors.value[field] =
      item.requiredMessage ??
      (item.type === 'select' || item.type === 'date' || item.type === 'radio' || item.type === 'checkbox'
        ? `请选择${item.name}`
        : `请输入${item.name}`)
    return false
  }

  if (isEmptyValue(item.value) || !item.rule) return true

  const context: DataFormValidateContext = {
    item,
    data: localData.value,
    value: item.value
  }

  return validateRule(item, item.rule, context)
}

async function validateField(field: string) {
  const item = localData.value.find(current => getFieldKey(current) === field || current.name === field)
  if (!item) return false
  return validateItem(item)
}

function clearValidate(field?: string) {
  if (!field) {
    errors.value = {}
    return
  }
  delete errors.value[field]
}

function reset() {
  localData.value = cloneData(initialData.value)
  clearValidate()
  const cloned = cloneData(localData.value)
  isInternalUpdate.value = true
  emit('update:data', cloned)
}

function getFormData() {
  return localData.value.reduce<Record<string, any>>((result, item) => {
    result[getFieldKey(item)] = item.value
    return result
  }, {})
}

function setFieldValue(field: string, value: any) {
  const item = localData.value.find(current => getFieldKey(current) === field || current.name === field)
  if (!item) return
  setItemValue(item, value)
}

function syncValue(item: DataFormData) {
  const cloned = cloneData(localData.value)
  isInternalUpdate.value = true
  emit('update:data', cloned)
  emit('change', {
    item: { ...item },
    data: cloned
  })
}

async function validate() {
  const result = await Promise.all(localData.value.map(item => validateItem(item)))
  const valid = result.every(Boolean)
  emit('validate', valid)
  return valid
}

defineExpose<DataFormExpose>({
  validate,
  validateField,
  clearValidate,
  reset,
  getFormData,
  setFieldValue
})
</script>

<style scoped lang="scss">
.mt-data-form {
  width: 100%;
  display: grid;
  align-content: start;
}

.mt-data-form__item {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.mt-data-form__main,
.mt-data-form__error-row {
  min-width: 0;
  display: flex;
}

.mt-data-form__error-row {
  align-items: flex-start;
}

.mt-data-form__label {
  flex-shrink: 0;
  height: 100%;
  display: flex;
  align-items: center;
  color: var(--el-text-color-primary);
  box-sizing: border-box;
}

.mt-data-form__label-content {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
}

.mt-data-form__label-content.is-horizontal-left {
  justify-content: flex-start;
}

.mt-data-form__label-content.is-horizontal-center {
  justify-content: center;
}

.mt-data-form__label-content.is-horizontal-right {
  justify-content: flex-end;
}

.mt-data-form__label-content.is-horizontal-justify {
  justify-content: space-between;
}

.mt-data-form__label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mt-data-form__content-main,
.mt-data-form__error-wrap {
  min-width: 0;
  flex: 1;
  :deep(.el-checkbox),
  :deep(.el-radio),
  :deep(.el-switch) {
    height: fit-content !important;
  }
}

.mt-data-form__content-main {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.mt-data-form__error {
  color: var(--el-color-danger);
  font-size: 12px;
  line-height: 18px;
}

.mt-data-form__error-spacer {
  flex-shrink: 0;
  min-height: 0;
}

.mt-data-form__required {
  margin-top: -1px;
}

.is-error :deep(.el-input__wrapper),
.is-error :deep(.el-textarea__inner),
.is-error :deep(.el-select__wrapper),
.is-error :deep(.el-date-editor.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}
</style>
