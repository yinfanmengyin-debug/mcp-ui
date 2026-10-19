import { createRoot } from "react-dom/client";
import { DataCard } from "./DataCard";
import "./DataCard.css";
import "./demo.css";

function App() {
  return (
    <main className="demo">
      <header className="demo__header">
        <p className="demo__eyebrow">MCP UI · 气象数据组件</p>
        <h1>天气概览</h1>
        <p>把温度、湿度、风速和降水等关键气象指标，一目了然地呈现出来。</p>
      </header>
      <section className="demo__grid" aria-label="天气指标概览">
        <DataCard
          title="当前气温"
          value={<>24.6<span className="demo__unit">°C</span></>}
          description="体感温度 26°C · 晴"
          icon="☀"
        />
        <DataCard
          title="相对湿度"
          value={<>68<span className="demo__unit">%</span></>}
          description="较昨日同期"
          trend={{ direction: "neutral", value: "+5%" }}
          icon="◌"
        />
        <DataCard
          title="平均风速"
          value={<>12<span className="demo__unit"> km/h</span></>}
          description="西南风 · 阵风 18 km/h"
          icon="↗"
        />
        <DataCard
          title="24 小时降水"
          value={<>8.4<span className="demo__unit"> mm</span></>}
          description="小雨 · 降水概率 60%"
          icon="☂"
        />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
