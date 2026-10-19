<script setup lang="ts">
import { applyColorBarMinMaxInjectKey } from '@/src/legend/components/v2/colorBarEditor'
import { type ColorCode } from '@/src/legend/type'
import { Warning } from '@element-plus/icons-vue'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/dialog/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/icon/style/css'
import 'element-plus/es/components/popover/style/css'
import '../../style/v2/applyColorBar.scss'
import { ElButton, ElDialog, ElMessageBox, ElIcon, ElPopover } from 'element-plus'
import { pick } from 'lodash-es'
import { computed, inject, nextTick, provide, ref, shallowRef } from 'vue'
import { colorCodeInjectionKey } from '../../../configProvider/keys'
import MtColorBarEditor from './colorBarEditor.vue'
import MtColorBarList from './colorBarList.vue'

defineOptions({ name: 'MtApplyColorBar' })

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

provide(
  applyColorBarMinMaxInjectKey,
  computed(() => props.colorCode.minMax)
)
const options = inject(colorCodeInjectionKey)

// 当前选择的色标类型
const colorCodeType = ref<'system' | 'custom'>('system')

// 色标类型选项列表
const colorCodeTypes = shallowRef([
  { label: '系统默认色标', value: 'system' },
  { label: '用户自定义色标', value: 'custom' }
] as const)

// 色标列表
const systemColorCodeList = shallowRef<ColorCode[]>([])
const customColorCodeList = shallowRef<ColorCode[]>([])

// 色标列表的模板Ref
const systemListRef = shallowRef<InstanceType<typeof MtColorBarList>>()
const customListRef = shallowRef<InstanceType<typeof MtColorBarList>>()

// 色标编辑器的模板Ref
const editorRef = shallowRef<InstanceType<typeof MtColorBarEditor>>()
const editorKey = ref(0)

// 当前选中的系统默认色标
const systemColorCode = shallowRef<ColorCode>()
// 当前选中的用户自定义色标
const customColorCode = shallowRef<ColorCode>()

// 当前是否为新增自定义色标状态
const isNewCustom = computed(() => customColorCode.value === systemColorCode.value || !customColorCode.value)

/**
 * 获取色标数据
 * @param matchColorCodeState 是否匹配当前色标状态
 */
async function getColorCodeData(matchColorCodeState = true) {
  if (!options?.value?.getColorCodeList) return
  const colorCodes = await options.value.getColorCodeList(props.colorCode)

  // 设置色标列表
  systemColorCodeList.value = colorCodes.system || []
  // 按更新时间降序排列
  customColorCodeList.value = colorCodes.custom
    ? colorCodes.custom.sort((a, b) => b.updateTime!.localeCompare(a.updateTime!))
    : []

  if (!matchColorCodeState) return

  // 设置当前选中的色标
  for (let i = 0; i < colorCodeTypes.value.length; i++) {
    const type = colorCodeTypes.value[i].value
    const activeColorCode = colorCodes[type].find(item => item.id === props.colorCode.id)
    if (!activeColorCode) continue

    if (type === 'system') {
      systemColorCode.value = activeColorCode
      // 若当前选中的自定义色标有值, 检查其在自定义色标列表中是否存在, 若不存在则重置
      if (customColorCode.value && !customColorCodeList.value.some(item => item.id === customColorCode.value!.id)) {
        customColorCode.value = undefined
      }
    } else {
      customColorCode.value = activeColorCode
      // 若当前选中的系统色标有值, 检查其在系统色标列表中是否存在, 若不存在则重置
      if (systemColorCode.value && !systemColorCodeList.value.some(item => item.id === systemColorCode.value!.id)) {
        systemColorCode.value = undefined
      }
    }

    await setColorCodeType(type)
    break
  }
}

async function setColorCodeType(type: 'system' | 'custom', scrollToTop: boolean | 'all' = true) {
  colorCodeType.value = type
  if (!scrollToTop) return
  await nextTick()
  if (scrollToTop === 'all') {
    systemListRef.value?.setSelect(systemColorCode.value)
    customListRef.value?.setSelect(customColorCode.value)
  } else if (colorCodeType.value === 'system') {
    systemListRef.value?.setSelect(systemColorCode.value)
  } else {
    customListRef.value?.setSelect(customColorCode.value)
  }
}

// 复制色标到自定义色标编辑器
function copyColorCodeToEdit(colorCode?: ColorCode) {
  if (!colorCode) {
    resetEditor()
  } else {
    customColorCode.value = colorCode
  }
  // 切换到自定义色标展示
  setColorCodeType('custom')
}

// 应用色标
function applyColorCode(colorCode: ColorCode) {
  emit('apply', colorCode)
  emit('update:modelValue', false)
}

function resetEditor() {
  if (customColorCode.value) {
    customColorCode.value = undefined
  } else {
    editorKey.value = (editorKey.value + 1) % 2
  }
}

/**
 * 保存色标
 * @param saveAs 是否另存为新色标
 */
async function save(saveAs = false) {
  if (!options?.value?.save) return
  const info = await editorRef.value!.getCondition()
  const sourceColorCode = customColorCode.value
    ? undefined
    : pick(props.colorCode, [
        'elementType',
        'elementLevel',
        'dataValueType',
        'timePeriod',
        'timeResolution',
        'areaId',
        'areaName',
        'systemId',
        'systemName'
      ])
  const isSuccess = await options?.value?.save(
    {
      ...info,
      id: saveAs ? undefined : info.id,
      ...sourceColorCode
    },
    'MtApplyColorBar'
  )
  if (!isSuccess) return

  // 是否为新增色标: saveAs 为 true 或者 info.id 不存在
  const isAddNew = saveAs || !info.id
  // 由于新增色标后一定会再次回显, 所以不需要重置编辑器
  // resetEditor()
  await getColorCodeData(false)

  // 若是新增色标, 则将当前色标设置为新创建的色标
  if (isAddNew) {
    // 这里需要保证 customColorCodeList 中的第一个色标是新创建的色标
    customColorCode.value = customColorCodeList.value[0]
  } else {
    // 若不是新增色标, 则保持当前选中的色标不变
    customColorCode.value = customColorCodeList.value.find(t => t.id === info.id)
  }

  customListRef.value?.setSelect(customColorCode.value, true)
}

async function saveAndApply(isNewCustom: boolean) {
  await save(isNewCustom)
  applyColorCode(customColorCode.value!)
}

async function removeItem(item: ColorCode) {
  if (!options?.value?.remove) return
  await ElMessageBox.confirm(
    '当前用户自定义与账号绑定，删除后将无法再使用此色标出图，且不可恢复，是否确定删除系统默认色标？',
    '删除自定义色标',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  const isSuccess = await options?.value?.remove(item.id!)
  if (!isSuccess) return
  await getColorCodeData(false)
  // 若当前选中的色标在删除后不存在于自定义色标列表中, 则重置为第一个
  if (customColorCode.value && !customColorCodeList.value.find(t => t.id === customColorCode.value?.id)) {
    customColorCode.value = customColorCodeList.value[0]
  }
  customListRef.value?.setSelect(customColorCode.value, true)
}
</script>

<template>
  <el-dialog
    class="mt-apply-color-bar"
    width="1250px"
    draggable
    title="色标应用设置"
    :model-value="modelValue"
    :close-on-click-modal="false"
    :show-close="false"
    append-to-body
    @opened="getColorCodeData()"
    @update:model-value="(visible: boolean) => emit('update:modelValue', visible)"
  >
    <div class="mt-apply-color-bar-wrapper">
      <div class="color-bar-list-wrapper">
        <div class="list-title">
          <div class="name">
            色标样式选择：
            <el-popover
              placement="bottom-start"
              :width="285"
              trigger="hover"
              popper-class="mt-add-or-edit-color-bar-popover"
            >
              <template #reference>
                <el-icon :size="18">
                  <Warning />
                </el-icon>
              </template>
              <div class="tips">
                1、在当前弹窗选定的色标样式可临时绘制个性化的色斑图，页面刷新或再次进入系统时按系统默认色标出图。<br />
                2、选定系统默认色标点击编辑按钮后，将以默认色标为基础进行编辑，并可保存为新的自定义色标。<br />
              </div>
            </el-popover>
          </div>
          <span class="add-text" @click="copyColorCodeToEdit()">新建色标样式</span>
        </div>
        <ul class="color-code-types">
          <li
            v-for="item in colorCodeTypes"
            :key="item.value"
            :class="{ active: item.value === colorCodeType }"
            @click="setColorCodeType(item.value, false)"
          >
            {{ item.label }}
          </li>
        </ul>
        <div class="color-bar-list-container">
          <MtColorBarList
            ref="systemListRef"
            class="system-color-code-list"
            :class="{ visible: colorCodeType === 'system' }"
            :list="systemColorCodeList"
            :click-can-cancel="false"
            :show-remove-icon="false"
            @select-change="(cc?: ColorCode) => (systemColorCode = cc)"
          />
          <MtColorBarList
            ref="customListRef"
            class="custom-color-code-list"
            :class="{ visible: colorCodeType === 'custom' }"
            :list="customColorCodeList"
            :click-can-cancel="false"
            :show-remove-icon="!!options?.remove"
            @select-change="(cc?: ColorCode) => (customColorCode = cc)"
            @remove="removeItem"
          />
        </div>
      </div>
      <div class="color-bar-editor-container">
        <MtColorBarEditor
          v-if="colorCodeType === 'custom'"
          :key="editorKey"
          ref="editorRef"
          :color-code="customColorCode"
          :show-attr-form="false"
        />
        <div class="system-color-code-preview" v-else>
          <div class="preview-title">图例编辑/预览</div>
          <ul v-if="!!systemColorCode" class="preview-content">
            <li>
              <div class="item-name">色标名称：</div>
              <div class="item-content">
                {{ systemColorCode.name }}{{ systemColorCode.unit ? `（${systemColorCode.unit}）` : '' }}
              </div>
            </li>
            <li>
              <div class="item-name">时间分辨率：</div>
              <div class="item-content">
                {{ systemColorCode.timeResolution }}
              </div>
            </li>
            <li>
              <div class="item-name">适用时段：</div>
              <div class="item-content">{{ systemColorCode.timePeriod }}</div>
            </li>
            <li>
              <div class="item-name">适用模块：</div>
              <div class="item-content">{{ systemColorCode.systemName }}</div>
            </li>
            <li>
              <div class="item-name">适用范围：</div>
              <div class="item-content">{{ systemColorCode.areaName }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <template v-if="colorCodeType === 'system'" #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <template v-if="!!systemColorCode">
        <el-button type="primary" @click="copyColorCodeToEdit(systemColorCode)">复制以生成新色标</el-button>
        <el-button type="primary" @click="applyColorCode(systemColorCode)">绘制</el-button>
      </template>
    </template>
    <template v-else #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button v-if="!!customColorCode && customColorCode !== systemColorCode" @click="save(true)">另存为</el-button>
      <el-button type="primary" @click="save(isNewCustom)">{{ isNewCustom ? '新增' : '保存' }}</el-button>
      <el-button type="primary" @click="saveAndApply(isNewCustom)">
        {{ isNewCustom ? '新增' : '保存' }}并绘制
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
