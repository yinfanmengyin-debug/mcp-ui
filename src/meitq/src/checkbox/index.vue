<script lang="ts">
import { computed, defineComponent, h } from 'vue'
import { ElCheckbox, ElCheckboxButton, ElCheckboxGroup } from 'element-plus'
import 'element-plus/es/components/checkbox/style/css'
import 'element-plus/es/components/checkbox-button/style/css'
import 'element-plus/es/components/checkbox-group/style/css'
import type { PropType } from 'vue'
import { SelectionItem } from '@/types/common'

export default defineComponent({
  name: 'MtCheckbox',
  props: {
    list: {
      type: Array as PropType<SelectionItem[] | Array<string | number>>,
      required: true
    },
    // 当前选中项绑定值
    modelValue: {
      type: Array as PropType<Array<string | number | boolean>>,
      required: true
    },
    // 显示内容的字段名称 默认: label
    labelField: {
      type: String,
      default: 'label'
    },
    // 选中值的字段名称 默认: value
    valueField: {
      type: String,
      default: 'value'
    },
    // 组件大小
    size: {
      type: String as PropType<'large' | 'default' | 'small'>,
      default: 'default'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否为按钮样式
    isButton: {
      type: Boolean,
      default: false
    },
    // 非按钮时是否显示边框
    border: {
      type: Boolean,
      default: false
    },
    // 可被勾选的 checkbox 的最小数量
    min: {
      type: Number,
      default: undefined
    },
    // 可被勾选的 checkbox 的最大数量
    max: {
      type: Number,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const normalizedList = computed(() => props.list.map(item =>
      typeof item === 'object'
        ? item
        : {
          [props.labelField]: `${item}`,
          [props.valueField]: item,
          disabled: false
        }
    ))
    return () =>
      h(
        ElCheckboxGroup,
        {
          modelValue: props.modelValue,
          'onUpdate:modelValue': (val: string | number) => emit('update:modelValue', val),
          onChange: (val: string | number) => emit('change', val),
          disabled: props.disabled,
          size: props.size,
          min: props.min,
          max: props.max
        } as Object,
        () =>
          normalizedList.value.map(item =>
            h(
              props.isButton ? ElCheckboxButton : ElCheckbox,
              {
                value: item[props.valueField],
                disabled: item['disabled'],
                border: props.isButton ? undefined : props.border,
                checked: item['checked']
              },
              () => item[props.labelField]
            )
          )
      )
  }
})
</script>
