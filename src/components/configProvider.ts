import type { InjectionKey, Ref } from "vue";
import type { AreaSelectorOptions } from "./areaSelector/type";

export const areaSelectorInjectionKey: InjectionKey<
  Ref<AreaSelectorOptions | undefined>
> = Symbol("areaInjectionKey");
