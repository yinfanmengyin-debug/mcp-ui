export type TimeAxisValue = string | number

export interface TimeAxisItem {
  label: string
  value: TimeAxisValue
  disabled?: boolean
}

export interface TimeAxisExpose {
  refreshLayout: () => void
  resetZoom: () => void
  prev: (step?: number) => void
  next: (step?: number) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
}
