import type { Component, Plugin } from "vue";
import WeatherComponents, {
  components as weatherComponents,
  type MeitqBasicComponentsOptions,
} from "./components";
import {
  MtAddOrEditColorBar,
  MtAddOrEditColorCode,
  MtAreaSelector,
  MtChart,
  MtCheckbox,
  MtCheckButton,
  MtConfigProvider,
  MtDatePicker,
  MtEmpty,
  MtFormBlock,
  MtFormItem,
  MtLegend,
  MtListView,
  MtPageLayout,
  MtPageOffice,
  MtRadio,
  MtSelection,
  MtTable,
  MtTimeAxis,
} from "./meitq/src";

const meitqComponents: Record<string, Component> = {
  MtAddOrEditColorBar,
  MtAddOrEditColorCode,
  MtAreaSelector,
  MtChart,
  MtCheckbox,
  MtCheckButton,
  MtConfigProvider,
  MtDatePicker,
  MtEmpty,
  MtFormBlock,
  MtFormItem,
  MtLegend,
  MtListView,
  MtPageLayout,
  MtPageOffice,
  MtRadio,
  MtSelection,
  MtTable,
  MtTimeAxis,
};

const plugin: Plugin = {
  install(app, options: MeitqBasicComponentsOptions = {}) {
    app.use(WeatherComponents, options);
    for (const [name, component] of Object.entries(meitqComponents)) {
      app.component(name, component);
    }
  },
};

export { meitqComponents, weatherComponents };
export default plugin;
