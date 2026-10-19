import type { MtChartFontConfig } from '@/src/chart/type'

export function normalizeFontConfig(
  config: MtChartFontConfig | undefined,
  d: Required<MtChartFontConfig>
): Required<MtChartFontConfig> {
  return {
    fontFamily: config?.fontFamily ?? d.fontFamily,
    fontWeight: config?.fontWeight ?? d.fontWeight,
    fontSize: config?.fontSize ?? d.fontSize
  }
}
