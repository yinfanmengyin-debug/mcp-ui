<template>
  <div :style="{ columnCount: rowNum, columnGap: '8px' }" class="shortcut-key">
    <div
      v-for="(item, index) in lists"
      :key="index"
      :style="{ width: `calc(${100 / rowNum}% - ${16 / rowNum}px)`, marginBottom: '6px' }"
      @mouseup="key = ''"
      v-show="item.show"
    >
      <template v-if="item.info">
        <el-tooltip effect="light" placement="bottom" popper-class="date-picker-tooltip-popper">
          <template #content>
            <div class="popper-item">{{ item.info }}</div>
          </template>
          <div
            v-if="item.label !== 'add'"
            :class="key === item.label ? 'active' : ''"
            class="shortcut-item"
            @click="item.callBack()"
            @mousedown="key = item.label"
          >
            {{ item.label }}
          </div>
          <div v-else class="fold-label" @click="isFold = !isFold">
            <div>{{ fold[isFold ? 'fold' : 'unfold'].label }}</div>
            <el-icon :class="{ 'fold-icon': true, fold: isFold }">
              <DArrowLeft />
            </el-icon>
          </div>
        </el-tooltip>
      </template>
      <template v-else>
        <div
          v-if="item.label !== 'add'"
          :class="key === item.label ? 'active' : ''"
          class="shortcut-item"
          @click="item.callBack()"
          @mousedown="key = item.label"
        >
          {{ item.label }}
        </div>
        <div v-else class="fold-label" @click="isFold = !isFold">
          <div>{{ fold[isFold ? 'fold' : 'unfold'].label }}</div>
          <el-icon :class="{ 'fold-icon': true, fold: isFold }">
            <DArrowLeft />
          </el-icon>
          <!--        <i :class="fold[isFold ? 'fold' : 'unfold'].icon" />-->
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type btnItem, type Prop, useShortcut } from '../hooks/use-shortcut'
import { DArrowLeft } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'

defineOptions({ name: 'ShortcutKey' })
const props = withDefaults(defineProps<Prop>(), {
  fold: () => ({
    fold: {
      label: '展开',
      icon: 'iconfont sd-yonghu'
    },
    unfold: {
      label: '收缩',
      icon: 'iconfont sd-yonghu'
    }
  }),
  preAppend: () => [],
  sufAppend: () => [],
  exclude: () => []
})
const emit = defineEmits(['update:modelValue'])

const time = ref<(string | Date)[]>(props.modelValue)
const type = ref<string>(props.type)
const { list } = useShortcut(time, type)
const index = props.rowNum * props.colNum - 1
const isFold = ref(true)
const lists = computed(() => {
  const tem: btnItem[] = props.reList
    ? [...props.reList]
    : [...props.preAppend, ...list.value.filter(item => !props.exclude.includes(item.label)), ...props.sufAppend]
  tem.forEach((item, ind: number) => {
    item.show = ind <= index - 1 || !isFold.value || tem.length <= index + 1
  })
  if (index > props.rowNum - 2 && tem.length > index + 1) {
    tem.splice(index, 0, {
      label: 'add',
      show: true,
      callBack: () => {}
    })
  }
  return tem
})

watch(
  () => props.type,
  () => {
    type.value = props.type
  },
  { deep: true }
)

watch(
  () => time,
  () => {
    emit('update:modelValue', time.value)
  },
  { deep: true }
)

const key = ref<string>('')
</script>

<style lang="scss" scoped></style>