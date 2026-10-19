<template>
  <div class="mt-form-block">
    <div v-if="title" class="block-title">
      <slot v-if="$slots['title-start']" name="title-start" />
      <span v-else class="label" :class="{ bold: titleBold }">
        {{ title }}
      </span>
      <slot name="title-end" />
    </div>
    <div v-if="$slots.default" class="block-container">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import './style/index.scss'

defineOptions({ name: 'MtFormBlock' })

withDefaults(
  defineProps<{
    title?: string
    titleBold?: boolean
  }>(),
  {
    title: '',
    titleBold: true
  }
)

defineSlots<{
  default: []
  'title-start': []
  'title-end': []
}>()
</script>
