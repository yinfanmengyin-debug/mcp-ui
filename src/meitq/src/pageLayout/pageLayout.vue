<template>
  <div class="mt-page-layout">
    <div class="page-content">
      <slot name="content"></slot>
      <div v-if="mask" class="content-mask"></div>
    </div>
    <div
      v-if="$slots['panel-content'] || $slots['panel-footer'] || $slots['panel-header']"
      class="page-panel"
      :class="{ 'is-expand': isExpand }"
    >
      <div v-if="foldIcon" class="fold-toggle-bar" @click="isExpand = !isExpand">
        <FoldIcon class="icon" />
      </div>
      <div class="panel-container">
        <div
          class="panel-header"
          :class="{
            'no-box-shadow': topDetectionElVisible
          }"
          :style="{ padding: $slots['panel-header'] ? '15px' : '8px' }"
        >
          <slot name="panel-header" />
        </div>
        <div class="panel-content-wrapper">
          <div ref="topDetectionElRef" class="top-detection-el" />
          <div class="panel-content">
            <slot name="panel-content" />
          </div>
          <div ref="bottomDetectionElRef" class="bottom-detection-el" />
        </div>
        <div
          v-if="$slots['panel-footer']"
          class="panel-footer"
          :class="{
            'no-box-shadow': bottomDetectionElVisible
          }"
        >
          <slot name="panel-footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import FoldIcon from './icons/foldIcon.vue'
import './style/index.scss'

defineOptions({ name: 'MtPageLayout' })
withDefaults(
  defineProps<{
    mask?: boolean
    foldIcon?: boolean
  }>(),
  {
    // 是否显示遮罩
    mask: true,
    // 是否显示折叠图标
    foldIcon: true
  }
)
defineSlots<{
  // 左侧内容插槽
  content(props: {}): void
  // 右侧面板顶部区域插槽
  'panel-header': (props: {}) => void
  // 右侧面板内容区域插槽
  'panel-content': (props: {}) => void
  // 右侧面板底部区域插槽
  'panel-footer': (props: {}) => void
}>()

// 当前panel的展开状态
const isExpand = ref(true)

// 用于做可见性检测的元素Ref
const topDetectionElRef = shallowRef(null)
const bottomDetectionElRef = shallowRef(null)
// 最顶/底部的元素是否可见
const topDetectionElVisible = ref(false)
const bottomDetectionElVisible = ref(false)
useIntersectionObserver(topDetectionElRef, ([{ isIntersecting }]) => {
  topDetectionElVisible.value = isIntersecting
})
useIntersectionObserver(bottomDetectionElRef, ([{ isIntersecting }]) => {
  bottomDetectionElVisible.value = isIntersecting
})
</script>
