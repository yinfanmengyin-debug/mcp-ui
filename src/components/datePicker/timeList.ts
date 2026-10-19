import type { TimeListItem } from './type'

export function normalizeTimeListStep(step?: number) {
  const normalized = Number(step)
  return Number.isFinite(normalized) && normalized > 0 ? Math.floor(normalized) : 1
}

export function buildIndexedTimeList(
  startIndex: number,
  endIndex: number,
  step: number,
  getItem: (index: number) => TimeListItem
) {
  if (endIndex < startIndex) {
    return []
  }

  const normalizedStep = normalizeTimeListStep(step)
  const items: TimeListItem[] = []

  for (let index = startIndex; index <= endIndex; index += normalizedStep) {
    items.push(getItem(index))
  }

  if (!items.length || startIndex === endIndex) {
    return items
  }

  const lastItem = items.at(-1)
  const endItem = getItem(endIndex)
  if (!lastItem || lastItem.value !== endItem.value) {
    items.push(endItem)
  }

  return items
}

export function buildSortedSelectedTimeList<T>(
  values: T[],
  getIndex: (value: T) => number,
  getItem: (value: T) => TimeListItem
) {
  const uniqueMap = new Map<number, T>()

  values.forEach(value => {
    uniqueMap.set(getIndex(value), value)
  })

  return [...uniqueMap.entries()]
    .sort((entryA, entryB) => entryA[0] - entryB[0])
    .map(([, value]) => getItem(value))
}
