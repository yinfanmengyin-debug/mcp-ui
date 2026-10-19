# mcp-ui

一个使用 Vue 3、Vite 和 TypeScript 构建的气象行业 UI 组件库，包含数据展示卡片、项目气象组件，以及已整合进本仓库源码的 `@meitq/ui` 组件。使用者无需再安装内网的 `@meitq/ui` 包。

## 安装

```sh
npm install mcp-ui vue vue-router element-plus @element-plus/icons-vue dayjs zrender @handsontable/vue3 @texel/color @vueuse/core echarts file-saver handsontable lodash-es stk-table-vue xlsx
```

在应用入口加载样式并注册组件。Element Plus 由宿主应用注册，以便其全局标签可用：

```ts
import { createApp } from "vue";
import ElementPlus from "element-plus";
import McpUI from "mcp-ui";
import "mcp-ui/style.css";

createApp(App)
  .use(ElementPlus)
  .use(McpUI, {
    areaSelector: {
      areaList: [],
    },
  })
  .mount("#app");
```

全局插件注册项目组件和已集成的 `@meitq/ui` 组件。前一组包括 `AreaSelector`、`Collapse`、`ContentTab`、`DashHeader`、`DataForm`、`MtDate`、`MtHou`、`MtMonth`、`MtSeason`、`MtXun`、`MtYear`、`Empty`、`PageLayout`、`PanelItem`、`PublicDialog`、`RadioList`、`StatisticalPeriod`、`SubAreaCascader` 和 `TimeAxis`；`@meitq/ui` 组件使用 `Mt` 前缀，包括 `MtAreaSelector`、`MtChart`、`MtCheckbox`、`MtCheckButton`、`MtConfigProvider`、`MtDatePicker`、`MtEmpty`、`MtFormBlock`、`MtFormItem`、`MtLegend`、`MtListView`、`MtPageLayout`、`MtPageOffice`、`MtRadio`、`MtSelection`、`MtTable`、`MtTimeAxis`、`MtAddOrEditColorBar` 和 `MtAddOrEditColorCode`。组件也可以按需具名导入；`DataCard` 亦可具名导入。

`areaSelector` 插件选项包含 `areaList`、字段映射、分类布局和区域变化回调，参见 `AreaSelectorOptions` 类型。`@meitq/ui` 的设置选项可通过 `MtConfigProvider` 提供。运行自定义旬、候和季节日期逻辑时，组件包会为 Day.js 注册相应扩展。`@meitq/ui` 源码和内部工具已随本项目发布，不再需要配置内网 registry 或安装 `@meitq/ui`。

## 数据展示卡片

```vue
<script setup lang="ts">
import { DataCard } from "mcp-ui";
</script>

<template>
  <DataCard title="相对湿度" :trend="{ direction: 'up', value: '5%' }">
    68<span>%</span>
    <template #description>较昨日同期</template>
    <template #icon>◌</template>
  </DataCard>
</template>
```

卡片的标题通过 `title` 传入，主值使用默认插槽，说明和图标分别使用 `description`、`icon` 具名插槽。趋势方向必须显式传入，支持 `up`、`down`、`neutral`。

## 本地开发

```sh
npm install
npm run dev
npm test
npm run build
```

生产构建会在 `dist/` 输出 JavaScript、CSS 和 TypeScript 类型声明。
