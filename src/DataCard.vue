<script setup lang="ts">
import type { DataCardTrend, TrendDirection } from "./types";

defineProps<{
  title: string;
  trend?: DataCardTrend;
}>();

const trendSymbols: Record<TrendDirection, string> = {
  up: "↑",
  down: "↓",
  neutral: "•",
};
</script>

<template>
  <article class="data-card" :aria-label="title">
    <div class="data-card__header">
      <h2 class="data-card__title">{{ title }}</h2>
      <span v-if="$slots.icon" class="data-card__icon" aria-hidden="true">
        <slot name="icon" />
      </span>
    </div>

    <div class="data-card__value">
      <slot />
    </div>

    <div v-if="$slots.description || trend" class="data-card__footer">
      <div v-if="$slots.description" class="data-card__description">
        <slot name="description" />
      </div>
      <span
        v-if="trend"
        class="data-card__trend"
        :class="`data-card__trend--${trend.direction}`"
        :aria-label="`${trend.direction} ${trend.value}`"
      >
        <span aria-hidden="true">{{ trendSymbols[trend.direction] }}</span>
        {{ trend.value }}
      </span>
    </div>
  </article>
</template>

<style src="./DataCard.css"></style>
