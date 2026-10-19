<script setup lang="ts">
defineOptions({ name: 'DashHeader' })
</script>

<template>
  <div class="dash-header-wrapper">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.dash-header-wrapper {
  width: 100%;
  height: fit-content;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--theme-border-color);
  display: flex;
  justify-content: space-between;
  :deep(> div) {
    display: flex;
    column-gap: 10px;
    flex-wrap: wrap;
    row-gap: 10px;
  }
  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}
</style>
