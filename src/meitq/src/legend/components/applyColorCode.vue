<template>
  <el-dialog
    title="色标设置"
    draggable
    append-to-body
    :model-value="modelValue"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @opened="getColorCodeData()"
    @update:model-value="(value: boolean) => emit('update:modelValue', value)"
  >
    <div class="mt-apply-color-code">
      <div class="left">
        <div class="color-code-select">
          <span>色标选择：</span>
          <el-radio-group v-model="colorCodeType">
            <el-radio v-for="item in colorCodeTypes" :key="item.value" :value="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </div>

        <div class="color-code-list">
          <div
            v-for="(item, index) in colorCodeList"
            :key="item.id"
            class="color-code-item"
            :class="{
              'is-checked': index === colorCodeIdxObj[colorCodeType]
            }"
            @click="colorCodeIdxObj[colorCodeType] = colorCodeIdxObj[colorCodeType] === index ? -1 : index"
          >
            <div v-if="item.id === currentUsingId" class="using">使用中</div>
            <ColorBar
              :name="item.name"
              :colors="item.colors"
              :levels="item.levels"
              :labels="item.levelLabels"
              :unit="item.unit"
            />
          </div>
        </div>
      </div>
      <div class="right">
        <template v-if="colorCodeType === 'system'">
          <template v-if="colorCodeIdxObj['system'] !== -1">
            <ColorCodeEditor v-if="isAddSystem2Custom" ref="colorCodeEditorRef" :edit-info="editInfo" can-edit-name />
            <ColorCodeEditorForm v-else :edit-info="editInfo" disabled />
          </template>
          <div v-else class="choose-tip">请从左侧色标列表选择一项查看详情</div>
        </template>
        <template v-else>
          <ColorCodeEditor
            v-if="colorCodeIdxObj['custom'] !== -1 || isAddCustom"
            ref="colorCodeEditorRef"
            :edit-info="editInfo"
            can-edit-name
          />
          <div v-else class="choose-tip">
            <ul class="tip">
              <li>自定义色标为用户自行设置的色标</li>
              <li>请从左侧列表选中进行编辑或应用</li>
            </ul>
            <el-button type="primary" @click="isAddCustom = true"> 新增 </el-button>
          </div>
        </template>
      </div>
    </div>
    <template #footer>
      <template v-if="colorCodeType === 'custom' && (colorCodeIdxObj['custom'] !== -1 || isAddCustom)">
        <el-popconfirm v-if="!isAddCustom" title="确认要删除此色标吗？" @confirm="deleteColorCode">
          <template #reference>
            <el-button type="primary"> 删除 </el-button>
          </template>
        </el-popconfirm>
        <el-button v-if="isAddCustom" type="primary" plain @click="isAddCustom = false"> 退出编辑且不保存 </el-button>
        <el-button type="primary" @click="saveColorCode"> 保存 </el-button>
      </template>
      <template v-else-if="colorCodeType === 'system' && colorCodeIdxObj['system'] !== -1">
        <template v-if="isAddSystem2Custom">
          <el-button type="primary" plain @click="isAddSystem2Custom = false"> 退出编辑且不保存 </el-button>
          <el-button type="primary" @click="saveColorCode"> 保存至自定义色标 </el-button>
        </template>
        <el-button v-else type="primary" @click="isAddSystem2Custom = true"> 编辑色标 </el-button>
      </template>
      <el-button v-if="editInfo && editInfo.id !== colorCode.id" type="primary" @click="applyNewColorCode">
        应用此色标
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { omit } from 'lodash-es'
import { computed, inject, reactive, ref, shallowRef, watch } from 'vue'
import ColorCodeEditor from './colorCodeEditor.vue'
import ColorCodeEditorForm from './colorCodeEditorForm.vue'
import ColorBar from './colorBar.vue'
import { ColorCode, ColorCodeResult } from '../type'
import '../style/applyColorCode.scss'
import { colorCodeInjectionKey } from '@/src/configProvider/keys'

defineOptions({ name: 'MtApplyColorCode' })
const props = defineProps<{
  // 弹窗显示/隐藏
  modelValue: boolean
  // 当前使用的色标信息
  colorCode: ColorCode
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'apply', colorCode: ColorCode): void
}>()

const options = inject(colorCodeInjectionKey)

// 当前选择的色标类型
const colorCodeType = ref<'system' | 'custom'>('system')

// 色标类型选项列表
const colorCodeTypes = shallowRef([
  { label: '系统色标', value: 'system' },
  { label: '自定义色标', value: 'custom' }
])

// 色标
const colorCodeObj = shallowRef<ColorCodeResult>({
  system: [],
  custom: []
})

// 当前选中的色标类型对应的色标列表
const colorCodeList = computed(() => colorCodeObj.value[colorCodeType.value])
// 色标列表当前选中的色标项对应的索引
const colorCodeIdxObj = reactive({
  system: -1,
  custom: -1
})
const colorCodeEditorRef = shallowRef()

// 当前正在编辑的色标
const editInfo = computed(() => colorCodeList.value[colorCodeIdxObj[colorCodeType.value]])
// 当前使用中的色标对应的id
const currentUsingId = ref(props.colorCode?.id)

// 当前是否为用户新增自定义色标状态
const isAddCustom = ref(false)
// 当前是否为用户添加系统色标到自定义色标中
const isAddSystem2Custom = ref(false)

watch(
  () => props.colorCode,
  info => {
    if (info.id !== currentUsingId.value) {
      currentUsingId.value = info.id
    }
  }
)

watch(
  () => colorCodeIdxObj.custom,
  index => {
    if (index !== -1) {
      isAddCustom.value = false
    }
  }
)

async function getColorCodeData() {
  if (!options?.value?.getColorCodeList) return
  colorCodeObj.value = await options.value.getColorCodeList(props.colorCode)
}

async function saveColorCode() {
  if (!options?.value?.save) return
  let colorInfo
  try {
    colorInfo = colorCodeEditorRef.value.getColorInfo()
  } catch (error: any) {
    ElMessage.error({
      message: error?.message ?? '表单校验失败',
      duration: 2000,
      grouping: true,
      showClose: true
    })
    throw error
  }
  let sourceColorInfo
  if (isAddCustom.value) {
    sourceColorInfo = omit(props.colorCode, 'id')
  } else if (isAddSystem2Custom.value) {
    sourceColorInfo = omit(editInfo.value, 'id')
  } else {
    sourceColorInfo = editInfo.value
  }
  const isSuccess = await options.value.save(
    {
      ...sourceColorInfo,
      enable: editInfo.value?.enable ?? true,
      ...colorInfo
    },
    'MtApplyColorCode'
  )
  if (isSuccess) {
    colorCodeIdxObj[colorCodeType.value] = -1
    isAddCustom.value = false
    isAddSystem2Custom.value = false
    await getColorCodeData()
  }
}

async function deleteColorCode() {
  if (!options?.value?.remove || !editInfo.value.id) return
  const isSuccess = await options.value.remove(editInfo.value.id)
  if (isSuccess) {
    const index = colorCodeIdxObj[colorCodeType.value]
    colorCodeIdxObj[colorCodeType.value] = index - 1
    await getColorCodeData()
  }
}

function applyNewColorCode() {
  emit('apply', editInfo.value)
  currentUsingId.value = editInfo.value.id!
}
</script>
