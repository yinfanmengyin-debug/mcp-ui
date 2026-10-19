<template>
  <div
    class="panel-item-wrapper"
    :class="{ isInner }"
  >
    <div class="panel-item-label-header">
      <div class="left">
        <div
          v-if="$slots.label || label"
          class="label"
        >
          <slot name="label">
            <span>{{ label }}</span>
          </slot>
        </div>
        <el-tooltip
          v-if="$slots.tooltip || tooltip"
          :content="tooltip"
          :placement="tooltipPlacement"
          :effect="tooltipEffect"
          :popper-class="tooltipClass"
        >
          <span class="tooltip-trigger">
            <i class="iconfont-common MT-shuoming"></i>
          </span>
          <template
            v-if="$slots.tooltip"
            #content
          >
            <slot name="tooltip"></slot>
          </template>
        </el-tooltip>
      </div>
      <div
        class="right"
        :style="{ width: headerSuffixWidth ? designPx2rem(headerSuffixWidth) : '40%' }"
      >
        <slot
          v-if="$slots['header-suffix']"
          name="header-suffix"
        ></slot>
        <el-switch
          v-else-if="switchable"
          v-model="visible"
          :active-text="switchActiveText"
          :inactive-text="switchInactiveText"
        />
      </div>
    </div>
    <div
      v-if="visible && $slots.default"
      class="panel-item-content"
    >
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { designPx2rem } from '../../utils/layout'

defineOptions({ name: 'PanelItem' })

withDefaults(
  defineProps<{
    // 标题
    label?: string
    // 标题右边插槽宽度
    headerSuffixWidth?: number
    // 是否内部嵌套
    isInner?: boolean
    // 标题说明提示
    tooltip?: string
    // tooltip 出现位置
    tooltipPlacement?:
      | 'top'
      | 'top-start'
      | 'top-end'
      | 'bottom'
      | 'bottom-start'
      | 'bottom-end'
      | 'left'
      | 'left-start'
      | 'left-end'
      | 'right'
      | 'right-start'
      | 'right-end'
    // tooltip 主题
    tooltipEffect?: 'dark' | 'light'
    // tooltip 自定义类名
    tooltipClass?: string
    // 是否显示内容显隐开关
    switchable?: boolean
    // 开关开启文案
    switchActiveText?: string
    // 开关关闭文案
    switchInactiveText?: string
  }>(),
  {
    label: '',
    labelFontSize: 18,
    tooltip: '',
    tooltipPlacement: 'top',
    tooltipEffect: 'light',
    tooltipClass: '',
    switchable: false,
    switchActiveText: '',
    switchInactiveText: ''
  }
)

const visible = defineModel<boolean>('visible', {
  default: true
})

defineSlots<{
  default?: () => void
  label?: () => void
  tooltip?: () => void
  'header-suffix'?: () => void
}>()
</script>

<style scoped lang="scss">
.panel-item-wrapper {
  padding: 8px 12px;
  background: linear-gradient(0deg, var(--theme-base) 50%, #ebf7ff 100%);
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  .panel-item-label-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .left {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }
  .right {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
    .el-switch {
      height: fit-content;
    }
  }
  .label {
    color: var(--theme-text-primary);
    font-size: 18px;
    font-weight: 700;
  }
  .iconfont-common {
    color: var(--theme-text-secondary);
    font-size: 16px;
  }
  .tooltip-trigger {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 2px;
  }
}
.isInner {
  padding: 8px 0 0 0;
  background: unset;
  .label {
    color: var(--theme-text-secondary);
    font-size: 16px;
  }
}
</style>
