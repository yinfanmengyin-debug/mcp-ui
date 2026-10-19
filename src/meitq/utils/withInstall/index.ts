import type { App, Plugin } from 'vue'

export type SFCWithInstall<T> = T & Plugin

export default <T>(comp: T, name?: string) => {
  const installable = comp as SFCWithInstall<T>
  const componentName = name || (comp as any).name || (comp as any).__name

  if (!componentName) {
    throw new Error('[MeitqUI] withInstall 组件缺少注册名称')
  }

  installable.install = (app: App) => {
    app.component(componentName, installable)
  }

  return installable
}
