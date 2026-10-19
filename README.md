# mcp-ui

这是一个气象行业常用的 UI 组件。

## 数据展示卡片

轻量、可复用的 React 数据卡片，适合展示气象仪表盘中的温度、湿度、风速、降水量等指标。支持辅助说明、装饰图标和趋势提示；趋势方向由调用方明确指定，避免错误推断气象变化的好坏。

### 使用

```tsx
import { DataCard } from "mcp-ui";
import "mcp-ui/style.css";

export function WeatherSummary() {
  return (
    <DataCard
      title="当前气温"
      value={<>24.6<span>°C</span></>}
      description="体感温度 26°C · 晴"
      icon="☀"
    />
  );
}
```

React 和 React DOM 18 或 19 为 peer dependency。在应用入口导入一次样式文件；可以通过 `className` 和 `--data-card-*` CSS 自定义属性调整外观。

### 属性

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 是 | 卡片标题，同时作为无障碍名称。 |
| `value` | `ReactNode` | 是 | 主要数据，可传格式化文本或 JSX。 |
| `description` | `ReactNode` | 否 | 数据的补充说明。 |
| `trend` | `{ direction: "up" \| "down" \| "neutral"; value: string \| number }` | 否 | 趋势方向与变化值；方向应由调用方提供。 |
| `icon` | `ReactNode` | 否 | 标题旁的装饰内容。 |
| `className` | `string` | 否 | 用于自定义布局和样式的额外 class。 |

### 本地开发

```sh
npm install
npm run dev
npm test
npm run build
```

示例页包含温度、相对湿度、风速和降水量卡片。生产构建会在 `dist/` 输出 JavaScript、CSS 和 TypeScript 类型声明。
