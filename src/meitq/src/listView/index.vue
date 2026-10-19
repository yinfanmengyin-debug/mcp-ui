<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { debounce, uniqueId } from 'lodash-es'
import './style/index.scss'
import type { MtListViewProps, MtListViewValueType } from './type'

const uniq = uniqueId('uniq')

defineOptions({ name: 'ListView' })

const props = withDefaults(defineProps<MtListViewProps>(), {
  modelValue: '',
  list: () => [],
  labelField: 'label',
  valueField: 'value',
  size: 'default',
  height: '100%',
  searchable: true,
  placeholder: '请输入关键字搜索',
  emptyText: '暂无数据',
  noMatchText: '无匹配数据'
})

const emit = defineEmits<{
  'update:modelValue': [value: MtListViewValueType]
  change: [value: MtListViewValueType]
}>()

// 组件高度
const height = computed(() => (typeof props.height === 'number' ? `${props.height}px` : props.height))
// 输入框的值
const inputValue = ref('')
// 占位提示
const placeholder = computed(() => {
  const selected = props.list.find(item => item[props.valueField] === props.modelValue)
  return selected ? selected[props.labelField] : props.placeholder
})
// 显示的是否为默认的占位提示
const isDefaultPlaceholder = computed(() => placeholder.value === props.placeholder)
// 输入框是否获得焦点
const isForce = ref(false)

const list = shallowRef(props.list)
const listRef = shallowRef<HTMLUListElement>()
watch(
  () => props.list,
  val => {
    list.value = val ?? []
    if (!list.value.find(item => item[props.valueField] === props.modelValue)) {
      changeValue('')
    }
  }
)

watch(
  inputValue,
  debounce(async val => {
    if (!inputValue.value) {
      list.value = props.list ?? []

      await nextTick()
      // 总是在清除搜索关键字时滚动到所选项的位置
      const index = list.value.findIndex(item => item[props.valueField] === props.modelValue)
      if (index == -1) return
      let tryCount = 3
      do {
        const num = await new Promise<number>(resolve =>
          setTimeout(() => {
            const el = document.querySelector(`.item[data-index="${uniq}-item${index}"]`)
            if (el) {
              el.scrollIntoView({ block: 'nearest' })
              resolve(3)
            } else {
              resolve(1)
            }
          }, 100)
        )
        tryCount -= num
      } while (tryCount > 0)
    } else {
      list.value = props.list.filter(item => (item[props.labelField] as string | undefined)?.includes(val))
      await nextTick()
      listRef.value?.scrollTo(0, 0)
    }
  }, 100)
)

function inputBlur() {
  isForce.value = false
  // 避免通过搜索选中后显示选中项时出现闪回
  setTimeout(() => (inputValue.value = ''), 100)
}

function choose(index: number) {
  changeValue(list.value[index][props.valueField])
  inputValue.value = ''
}

function changeValue(value: MtListViewValueType) {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div :class="`mt-list-view ${size}`" :style="{ height }">
    <div v-if="searchable" class="input-box">
      <el-input v-model="inputValue" :size @focus="isForce = true" @blur="inputBlur" />
      <div
        v-show="!inputValue"
        class="placeholder"
        :class="{ 'is-default-placeholder': isDefaultPlaceholder, 'is-input-force': isForce }"
      >
        {{ placeholder }}
      </div>
    </div>
    <div ref="listRef" class="list-content">
      <ul v-if="list.length" class="list">
        <li
          v-for="(item, index) in list"
          :key="index"
          class="item"
          :class="{ 'is-checked': item[valueField] === modelValue }"
          :data-index="`${uniq}-item${index}`"
          @click="choose(index)"
        >
          {{ item[labelField] }}
        </li>
      </ul>
      <div v-else class="empty">{{ props.list?.length ? noMatchText : emptyText }}</div>
    </div>
  </div>
</template>
