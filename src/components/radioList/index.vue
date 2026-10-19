<template>
  <div class="radio-list-wrapper">
    <el-radio-group v-model="innerValue">
      <el-radio-button
        v-for="(item, index) in list"
        :key="index"
        :label="item"
        :value="index"
      />
    </el-radio-group>
  </div>
</template>
<script setup lang="ts">
import { watch } from 'vue'

defineOptions({ name: 'RadioList' })
const props = defineProps<{
  list?: string[]
}>()
const innerValue = defineModel<number>({ default: 0 })

watch(
  () => props.list,
  list => {
    if (!list) return
    const values = list.map((_, index) => index)
    const fallbackValue = values[0]
    const candidateValue = innerValue.value ?? fallbackValue
    innerValue.value = values.includes(candidateValue) ? candidateValue : fallbackValue
  },
  {
    immediate: true,
    deep: true
  }
)
</script>
<style scoped lang="scss">
.radio-list-wrapper {
  min-width: 120px;
  position: absolute;
  left: 16px;
  top: 68px;
  .el-radio-group {
    --el-fill-color-blank: var(--theme-primary-opacity);
    --el-border-radius-base: 2px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    width: 100%;
    .el-radio-button {
      width: 100%;
      :deep(.el-radio-button__inner) {
        width: 100%;
        border: 1px solid var(--theme-primary) !important;
      }
    }
  }
}
</style>
