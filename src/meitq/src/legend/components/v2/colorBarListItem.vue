<script setup lang="ts">
import MtColorBar from '../colorBar.vue'
import type { ColorCode } from '@/src/legend/type'
import '../../style/v2/colorBarListItem.scss'
import { ElIcon } from 'element-plus'
import 'element-plus/es/components/icon/style/css'
import { CircleClose } from '@element-plus/icons-vue'

defineOptions({ name: 'MtColorBarListItem' })

defineProps<{
  item: ColorCode
  showRemoveIcon: boolean
}>()

const emit = defineEmits<{
  (e: 'remove', item: ColorCode): void
}>()
</script>

<template>
  <div class="mt-color-bar-list-item">
    <div v-if="showRemoveIcon" class="remove-icon-container">
      <el-icon class="remove-icon-box" :size="16" @click.stop="emit('remove', item)"><CircleClose /></el-icon>
    </div>
    <MtColorBar
      :name="item.name"
      :unit="item.unit"
      :colors="item.colors"
      :levels="item.levels"
      :labels="item.levelLabels"
    />
  </div>
</template>
