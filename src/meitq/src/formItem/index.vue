<script lang="ts">
import { defineComponent, h, mergeProps } from 'vue'
import { ElFormItem } from 'element-plus'
import 'element-plus/es/components/form-item/style/css'
import { reactiveOmit } from '@vueuse/core'
import { formItemProps } from 'element-plus/es/components/form/src/form-item'
import './style/index.scss'

export default defineComponent({
  name: 'FormItem',
  props: {
    ...formItemProps,
    // 标签文本是否加粗显示
    labelBold: {
      type: Boolean,
      default: false
    },
    // 是否不使用弹性布局
    noFlex: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const itemProps = reactiveOmit(props, 'labelBold')
    return () =>
      h(
        ElFormItem,
        mergeProps(itemProps, {
          class: {
            'mt-form-item': true,
            'label-bold': props.labelBold,
            'no-flex': props.noFlex
          }
        }) as Object,
        () => slots.default && slots.default()
      )
  }
})
</script>
