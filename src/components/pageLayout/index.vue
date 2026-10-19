<template>
  <div class="mt-page-layout">
    <div class="page-content-wrapper">
      <div class="page-content">
        <slot name="page-content"></slot>
      </div>
    </div>
    <div
      v-if="$slots['panel-content']"
      class="page-panel"
      :class="{ 'is-expand': isExpand }"
    >
      <div class="panel-container">
        <slot
          v-if="isExpand"
          name="panel-content"
        ></slot>
      </div>
      <i
        class="iconfont"
        :class="[isExpand ? 'qh-cebianlanshouqi' : 'qh-cebianlanzhankai']"
        @click="isExpand = !isExpand"
      ></i>
      <div
        v-if="isExpand"
        class="search-button-wrap"
      >
        <div
          class="search-button"
          @click="emits('search')"
        >
          查询
        </div>
      </div>
    </div>
    <!-- 默认插槽，用于放置弹窗等全局组件 -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'PageLayout' })
withDefaults(
  defineProps<{
    foldIcon?: boolean
  }>(),
  {
    // 是否显示折叠图标
    foldIcon: true
  }
)
defineSlots<{
  // 左侧内容插槽
  'page-content': (props: {}) => void
  // 右侧面板内容区域插槽
  'panel-content': (props: {}) => void
  // 右侧面板内容区域插槽
  'default': (props: {}) => void
}>()

const emits = defineEmits<{
  search: []
}>()
// 当前panel的展开状态
const isExpand = ref(true)
</script>
<style scoped lang="scss">
@use './index.scss';
</style>
