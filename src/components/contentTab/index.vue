<template>
  <div class="page-child-content-wrapper">
    <el-radio-group v-model="innerValue">
      <el-radio-button
        v-for="(item, index) in list"
        :key="index"
        :label="item.label"
        :value="item.value"
      />
    </el-radio-group>
    <div class="page-child-content">
      <template v-if="activeItem">
        <slot
          :name="`tab-${String(activeItem.value)}`"
          :item="activeItem"
          :value="activeItem.value"
        >
          <slot
            :name="String(activeItem.value)"
            :item="activeItem"
            :value="activeItem.value"
          ></slot>
        </slot>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

defineOptions({ name: 'ContentTab' })

type ItemValue = number | string

interface Item {
  label: string
  value: ItemValue
}

const props = withDefaults(
  defineProps<{
    list?: Item[]
  }>(),
  {
    list: () => [
      { label: '空间分布', value: 0 },
      { label: '时序变化', value: 1 },
      { label: '区域对比', value: 2 }
    ]
  }
)

const innerValue = defineModel<ItemValue>({ default: 0 })

watch(
  () => props.list,
  list => {
    const values = list.map(item => item.value)
    const fallbackValue = values[0]
    const candidateValue = innerValue.value ?? fallbackValue
    innerValue.value = values.includes(candidateValue as ItemValue) ? candidateValue : fallbackValue
  },
  {
    immediate: true,
    deep: true
  }
)

const activeItem = computed(() => props.list.find(item => item.value === innerValue.value))
</script>

<style scoped lang="scss">
.page-child-content-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  .el-radio-group {
    position: absolute;
    left: 16px;
    top: 16px;
    --el-fill-color-blank: var(--theme-primary-opacity);
    --el-border-radius-base: 2px;
    :deep(.el-radio-button__inner) {
      border: 1px solid var(--theme-primary) !important;
      border-left: 0 !important;
    }
    .el-radio-button:first-child {
      :deep(.el-radio-button__inner) {
        border-left: 1px solid var(--theme-primary) !important;
      }
    }
    .el-radio-button.is-active {
      box-shadow: 0 4px 10px 2px var(--theme-shadow-color-1);
    }
  }
  .page-child-content {
    width: 100%;
    height: 100%;
  }
}
</style>
