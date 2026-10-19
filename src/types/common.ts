export type SelectionValueType = string | number | boolean | object;

export interface NestingOptionProps {
  labelField?: string;
  valueField?: string;
  searchable?: boolean;
  childrenField?: string;
}
