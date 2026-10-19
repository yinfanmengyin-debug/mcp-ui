<script setup lang="ts">
import { computed } from "vue";
import {
  ElCheckbox,
  ElCheckboxButton,
  ElCheckboxGroup,
} from "element-plus";
import "element-plus/es/components/checkbox/style/css";
import "element-plus/es/components/checkbox-button/style/css";
import "element-plus/es/components/checkbox-group/style/css";

type CheckboxOption = Record<string, any> | string | number | boolean;

const props = withDefaults(
  defineProps<{
    list: CheckboxOption[];
    modelValue: Array<string | number | boolean>;
    labelField?: string;
    valueField?: string;
    size?: "large" | "default" | "small";
    disabled?: boolean;
    isButton?: boolean;
    border?: boolean;
    min?: number;
    max?: number;
  }>(),
  {
    labelField: "label",
    valueField: "value",
    size: "default",
    disabled: false,
    isButton: false,
    border: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: Array<string | number | boolean>];
  change: [value: Array<string | number | boolean>];
}>();

const options = computed(() =>
  props.list.map((item) =>
    typeof item === "object" && item !== null
      ? item
      : {
          [props.labelField]: String(item),
          [props.valueField]: item,
          disabled: false,
        },
  ),
);

const checkboxGroupProps = computed(() => ({
  modelValue: props.modelValue,
  disabled: props.disabled,
  size: props.size,
  min: props.min,
  max: props.max,
}));
</script>

<template>
  <ElCheckboxGroup
    v-bind="checkboxGroupProps as object"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event)"
  >
    <component
      :is="isButton ? ElCheckboxButton : ElCheckbox"
      v-for="(option, index) in options"
      :key="String(option[valueField]) + index"
      :value="option[valueField]"
      :disabled="Boolean(option.disabled)"
      :border="isButton ? undefined : border"
    >
      {{ option[labelField] }}
    </component>
  </ElCheckboxGroup>
</template>
