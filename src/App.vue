<script setup lang="ts">
import { DataCard } from "./index";
</script>

<template>
  <main class="demo">
    <header class="demo__header">
      <p class="demo__eyebrow">MCP UI · 气象数据组件</p>
      <h1>天气概览</h1>
      <p>把温度、湿度、风速和降水等关键气象指标，一目了然地呈现出来。</p>
    </header>
    <section class="demo__grid" aria-label="天气指标概览">
      <DataCard title="当前气温">
        24.6<span class="demo__unit">°C</span>
        <template #description>体感温度 26°C · 晴</template>
        <template #icon>☀</template>
      </DataCard>
      <DataCard
        title="相对湿度"
        :trend="{ direction: 'neutral', value: '+5%' }"
      >
        68<span class="demo__unit">%</span>
        <template #description>较昨日同期</template>
        <template #icon>◌</template>
      </DataCard>
      <DataCard title="平均风速">
        12<span class="demo__unit"> km/h</span>
        <template #description>西南风 · 阵风 18 km/h</template>
        <template #icon>↗</template>
      </DataCard>
      <DataCard title="24 小时降水">
        8.4<span class="demo__unit"> mm</span>
        <template #description>小雨 · 降水概率 60%</template>
        <template #icon>☂</template>
      </DataCard>
    </section>
  </main>
</template>

<style src="./demo.css"></style>
