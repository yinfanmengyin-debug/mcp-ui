<script setup lang="ts">
import type { MaybeArray, SelectionValueType } from '@/types/common'
import { computed, h, nextTick, render, watch } from 'vue'
import { ElButton, ElIcon } from 'element-plus'
import { DArrowLeft } from '@element-plus/icons-vue'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/icon/style/css'
import type { CheckButtonProps } from '@/src/checkButton/type'
import './style/index.scss'
import { uniqueId } from 'lodash-es'

defineOptions({ name: 'MtCheckButton' })
const emit = defineEmits<{
  'update:modelValue': [value: MaybeArray<SelectionValueType>]
  change: [value: MaybeArray<SelectionValueType>]
  click: [value: SelectionValueType, label: string]
}>()

const props = withDefaults(defineProps<CheckButtonProps>(), {
  list: () => [],
  labelField: 'label',
  valueField: 'value',
  size: 'default',
  disabled: false,
  multiple: false,
  column: 3,
  rowLimit: 0,
  gap: 10,
  singleCancel: false
})

const className = uniqueId('mt-check-button')

watch(
  () => props.multiple,
  val => {
    if (val && !Array.isArray(props.modelValue)) {
      throw new Error(`mt-check-button: when multiple selection, modelValue must be an array`)
    }
  },
  { immediate: true }
)

// 是否自动布局
const isAuto = computed(() => props.column === 'auto')
const normalizedList = computed(() => {
  return props.list.map(item =>
    typeof item === 'object'
      ? item
      : {
          [props.labelField]: `${item}`,
          [props.valueField]: item
        }
  )
})

watch(
  normalizedList,
  async list => {
    const length = list.length
    const { column, rowLimit, gap } = props
    if (!length || !rowLimit || rowLimit <= 0 || (typeof column === 'number' && column * rowLimit >= length)) return
    await nextTick()
    const container = document.querySelector(`.${className}`) as HTMLElement
    const children = container?.children
    if (!children) return

    let line = 0
    let insertNode: HTMLElement | undefined
    const firstNode = children.item(0) as HTMLElement
    const left = firstNode?.offsetLeft
    for (let i = 0; i < children.length; i++) {
      const child = children.item(i) as HTMLElement
      if (child?.offsetLeft === left) {
        line++
      }
      if (!insertNode && line > 1) {
        // 按钮宽度
        const foldButtonWidth = 20
        let index = i - 1
        // 记录插入位置
        const node = children.item(index) as HTMLElement

        if (node.clientWidth < foldButtonWidth) {
          // 若前一个按钮宽度小于折叠按钮宽度，则找下一个按钮位置
          --index
          index = index >= 0 ? index : 0
        } else if (container.clientWidth - (node.offsetLeft + node.clientWidth) > foldButtonWidth + gap) {
          // 若前一个按钮右侧空间足够，则找下一个按钮位置
          ++index
          index = index < children.length ? index : children.length - 1
        }
        insertNode = children.item(index) as HTMLElement
      }
      if (line > rowLimit) {
        const last = children.item(i) as HTMLElement
        if (insertNode && last) {
          const node = document.createElement('div')
          node.className = 'fold-button-wrapper'
          render(
            foldComponent(
              getComputedStyle(firstNode).fontSize,
              last.offsetTop - gap,
              container.clientHeight,
              container
            ),
            node
          )
          insertNode.before(node)
          break
        }
      }
    }
  },
  { immediate: true }
)

// 折叠按钮组件
function foldComponent(fontSize: string, minHeight: number, maxHeight: number, container: HTMLElement) {
  container.style.height = `${minHeight}px`
  // 是否折叠
  let fold = true
  return h(
    'div',
    {
      class: 'fold-button',
      style: {
        fontSize
      },
      onClick: () => {
        fold = !fold
        if (fold) {
          container.style.height = `${minHeight}px`
        } else {
          container.style.height = `${maxHeight}px`
        }

        const text = document.querySelector(`.${className} .fold-button > span`) as HTMLElement
        text.innerText = fold ? '展开' : '收起'

        const icon = document.querySelector(`.${className} .fold-button > .fold-icon`) as HTMLElement
        icon.classList.toggle('fold')
      }
    },
    [h('span', '展开'), h(ElIcon, { class: 'fold-icon fold' }, () => h(DArrowLeft))]
  )
}

function handleClick(value: SelectionValueType) {
  emit('click', value, normalizedList.value.find(t => t[props.valueField] === value)?.[props.labelField])
  if (props.multiple) {
    const arr = [...(props.modelValue as Array<SelectionValueType>)]
    if (arr.includes(value)) {
      const index = arr.findIndex(item => item === value)
      arr.splice(index, 1)
    } else {
      arr.push(value)
    }
    emit('update:modelValue', arr)
    emit('change', arr)
  } else {
    if (props.singleCancel && props.modelValue === value) {
      emit('update:modelValue', '')
      emit('change', '')
      return
    }
    if (props.modelValue !== value) {
      emit('update:modelValue', value)
      emit('change', value)
    }
  }
}
</script>

<template>
  <div
    class="mt-check-button"
    :class="className"
    :style="{
      gap: `${gap}px`,
      display: isAuto ? 'flex' : 'grid',
      flexWrap: isAuto ? 'wrap' : undefined,
      width: isAuto ? 'fit-content' : undefined,
      gridTemplateColumns: isAuto ? undefined : `repeat(${column}, 1fr)`
    }"
  >
    <el-button
      v-for="(item, index) in normalizedList"
      :key="index"
      class="mt-check-button-item"
      :type="
        (multiple && (modelValue as Array<SelectionValueType>).includes(item[valueField])) ||
        (!multiple && modelValue === item[valueField])
          ? 'primary'
          : 'default'
      "
      :disabled="!!(disabled || item.disabled)"
      :size="size"
      :title="item[labelField]"
      @click="handleClick(item[valueField])"
    >
      {{ item[labelField] }}
    </el-button>
  </div>
</template>
