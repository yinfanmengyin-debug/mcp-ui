<template>
  <div
    class="collapse-container"
    :style="{ 'max-height': !expanded ? designPx2rem(maxHeight) : designPx2rem(1000) }"
  >
    <slot />
    <div
      v-if="collapsible"
      class="collapse-toggle"
      @click="emit('toggle')"
    >
      <div class="line"></div>
      <i
        class="iconfont-common"
        :class="[expanded ? 'MT-shangshouqi' : 'MT-xiazhankai']"
      ></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { designPx2rem } from '../../utils/layout'

defineOptions({ name: 'CollapseContainer' })

defineProps<{
  collapsible?: boolean
  expanded?: boolean
  maxHeight: number
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<style scoped lang="scss">
.collapse-container {
  transition: max-height 1s;
  .collapse-toggle {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 8px;
    cursor: pointer;
    user-select: none;
    margin-top: 6px;
    .line {
      width: 100%;
      height: 1px;
      border-bottom: 1px dashed var(--theme-border-color);
    }

    .iconfont-common {
      position: absolute;
      z-index: 1;
      font-size: 10px;
      color: var(--theme-text-primary);
      background: var(--theme-base);
      padding: 0 4px;
      left: 50%;
      top: 4px;
      transform: translate(-50%, -50%);
      transition:
        color 0.24s ease,
        transform 0.24s ease;
    }
  }
}
</style>
