export type TrendDirection = "up" | "down" | "neutral";

export interface DataCardTrend {
  direction: TrendDirection;
  value: string | number;
}
