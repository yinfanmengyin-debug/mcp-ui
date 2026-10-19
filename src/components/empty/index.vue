<template>
  <div class="no-data">
    <slot v-if="$slots.default" />
    <template v-else>
      <div class="content">
        <img
          :src="type !== 1 ? emptyOne : emptyTwo"
          alt="empty"
        /><span class="text">{{ content }}</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import emptyOne from './images/1.png'
import emptyTwo from './images/2.png'

defineOptions({ name: 'Empty' })

withDefaults(
  defineProps<{
    content?: string
    type?: number
  }>(),
  {
    content: '暂无相关内容',
    type: 1
  }
)
</script>

<style lang="scss" scoped>
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.content {
  position: relative;
  width: 250px;
  height: 250px;

  img {
    width: 100%;
    height: 100%;
  }
}

.text {
  position: absolute;
  bottom: 60px;
  left: 50%;
  color: var(--theme-text-primary);
  font-size: 16px;
  transform: translateX(-50%);
}
</style>
