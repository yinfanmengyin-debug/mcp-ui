export interface PageOfficeInjectOptions {
  // 打开文件的方法 返回html内容
  openFile?: (url: string, params?: PageOfficeOpenFileParams) => Promise<string>
  // 打开文件的请求url
  openFileUrl?: string
  // 保存文件的请求url (默认使用注入的url)
  saveFileUrl?: string
  // 无内容时的提示文本
  noContentText?: string
}

export type PageOfficeOpenFileParams = Record<string, string | number | boolean>

export interface PageOfficeProps extends PageOfficeInjectOptions {
  // 是否启用懒加载 (组件加载时不加载文档 默认false)
  lazy?: boolean
  // pageOffice内部标题 (默认使用文件名称)
  title?: string
  // pageOffice内部标题栏是否可见 (默认true)
  titleBarVisible?: boolean
  // pageOffice内部Office工具栏是否可见 (默认为true)
  toolbarVisible?: boolean
  // pageOffice内部自定义工具栏是否可见 (默认false)
  customToolbarVisible?: boolean
  // pageOffice窗口是否全屏展示 (默认false)
  fullscreen?: boolean
  // 打开文件的请求参数 (默认使用pageofficectrl.WindowParams)
  openFileParams?: PageOfficeOpenFileParams | (() => PageOfficeOpenFileParams)
  // 保存文件的请求参数
  saveFileParams?: PageOfficeOpenFileParams | (() => PageOfficeOpenFileParams)
  // 是否只读 (默认true)
  readonly?: boolean
}

// POBrowser窗口特征信息
export interface POBrowserWindowFeatures {
  // POBrowser窗口的x坐标。以像素计
  left?: number
  // POBrowser窗口的y坐标。以像素计
  top?: number
  // POBrowser窗口的宽度。以像素计
  width?: number
  // POBrowser窗口的高度。以像素计
  height?: number
  // 	是否显示POBrowser窗口的边框。默认是yes。
  frame?: 'yes' | 'no'
  // 是否可调节窗口的尺寸。默认是 yes。
  resizable?: 'yes' | 'no'
  // 是否全屏显示POBrowser窗口。默认是no。
  fullscreen?: 'yes' | 'no'
  // 是否显示POBrowser自带的loading图标。默认是yes
  showLoading?: 'yes' | 'no'
}
