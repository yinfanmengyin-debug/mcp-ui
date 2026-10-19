<script setup lang="ts">
import { merge } from 'lodash-es'
import { computed, inject, ref } from 'vue'
import './style/index.scss'
import { EmptyOptions } from './type'
import { emptyInjectionKey } from '@/src/configProvider/keys'

defineOptions({ name: 'MtEmpty' })

const props = withDefaults(defineProps<EmptyOptions>(), {
  borderWidth: 1,
  fontSize: 14,
  fontWeight: 'normal',
  text: '暂无数据',
  renderer: undefined
})

defineSlots<{
  default(): void
}>()

const _ = inject(emptyInjectionKey, ref())

const options = computed(() => merge({}, _.value, props))

const style = computed(() => {
  return {
    border: `${options.value.borderWidth}px solid`,
    fontSize: `${options.value.fontSize}px`,
    fontWeight: options.value.fontWeight
  }
})
</script>

<template>
  <div class="mt-empty" :style>
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else-if="options.renderer">
      <component :is="options.renderer" />
    </template>
    <template v-else>
      {{ options.text }}
    </template>
  </div>
</template>
