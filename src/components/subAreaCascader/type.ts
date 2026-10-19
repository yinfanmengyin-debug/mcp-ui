export interface AreaSelectItem {
  areaCode: string
  areaName: string
  areaType: string
  parentId: string
  disabled: boolean
  childrenAreaList?: AreaSelectItem[]
}
