<template>
  <el-dialog
    v-model="visible"
    :class="`public-dialog ${$attrs.class ?? ''} ${showHeader ? '' : 'hide-header'}`"
    :modal-class="modalClass"
    :title
    :width="!width.toString().includes('%') ? `${parseFloat(width as string) / 192}rem` : width"
    :style="{ height: !height.toString().includes('%') ? designPx2rem(parseFloat(height as string)) : height }"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="showClose"
    draggable
    align-center
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    @open="emit('open')"
    @opened="emit('opened')"
    @close="emit('close')"
    @closed="emit('closed')"
  >
    <div class="dialog-content">
      <slot />
    </div>
    <div
      v-if="footer"
      :class="`footer ${footerAlign}`"
    >
      <el-button
        v-if="showCancel"
        type="primary"
        :plain="isPlain"
        :disabled="cancelDisabled"
        @click="closeDialog"
      >
        {{ cancelText }}
      </el-button>
      <el-button
        type="primary"
        :disabled="confirmDisabled"
        @click="emit('confirm')"
      >
        {{ confirmText }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { designPx2rem } from '../../utils/layout'

defineOptions({ name: 'PublicDialog' })

const visible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  cancel: []
  confirm: []
  open: []
  opened: []
  close: []
  closed: []
}>()

withDefaults(
  defineProps<{
    title?: string
    width?: string | number
    height?: string | number
    footer?: boolean
    footerAlign?: 'left' | 'center' | 'right'
    cancelText?: string
    confirmText?: string
    cancelDisabled?: boolean
    confirmDisabled?: boolean
    destroyOnClose?: boolean
    showClose?: boolean
    isPlain?: boolean
    showHeader?: boolean
    showCancel?: boolean
    modalClass?: string
    appendToBody?: boolean
  }>(),
  {
    title: 'Public Dialog',
    width: '50%',
    height: '50%',
    footer: true,
    footerAlign: 'right',
    cancelText: '取消',
    confirmText: '确定',
    cancelDisabled: false,
    confirmDisabled: false,
    destroyOnClose: false,
    showClose: true,
    isPlain: true,
    showHeader: true,
    showCancel: true,
    appendToBody: true
  }
)

function closeDialog() {
  visible.value = false
  emit('cancel')
}
</script>
<style lang="scss">
@use 'index';
</style>
