# mcp-ui

这是一个气象行业常用的 UI 组件，使用 Vue 3、Vite 和 TypeScript 构建。

## 数据展示卡片

轻量、可复用的 Vue 3 数据卡片，适合展示气象仪表盘中的温度、湿度、风速、降水量等指标。支持具名插槽、辅助说明、装饰图标和趋势提示；趋势方向由调用方明确指定，避免错误推断气象变化的好坏。

### 使用

```vue
<script setup lang="ts">
import { DataCard } from "mcp-ui";
import "mcp-ui/style.css";
</script>

<template>
  <DataCard
    title="相对湿度"
    :trend="{ direction: 'up', value: '5%' }"
  >
    68<span>%</span>
    <template #description>较昨日同期</template>
    <template #icon>◌</template>
  </DataCard>
</template>
```

Vue 3 为 peer dependency。卡片主值通过默认插槽传入，说明和图标分别通过 `description`、`icon` 具名插槽传入。可以通过 `class` 和 `--data-card-*` CSS 自定义属性调整外观。

### 属性与插槽

| 名称 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 是 | 卡片标题，同时作为无障碍名称。 |
| 默认插槽 | `VNode` | 是 | 主要数据，可传入文本、格式化数值或其他 Vue 内容。 |
| `description` 插槽 | `VNode` | 否 | 数据的补充说明。 |
| `trend` | `{ direction: "up" \| "down" \| "neutral"; value: string \| number }` | 否 | 趋势方向与变化值；方向由调用方提供。 |
| `icon` 插槽 | `VNode` | 否 | 标题旁的装饰内容。 |
| `class` | `string` | 否 | 用于自定义布局和样式的额外 class。 |

### 本地开发

```sh
npm install
npm run dev
npm test
npm run build
```

示例页包含温度、相对湿度、风速和降水量卡片。生产构建会在 `dist/` 输出 JavaScript、CSS 和 TypeScript 类型声明。
