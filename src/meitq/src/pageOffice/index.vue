<script setup lang="ts">
import './style/index.scss'
import { pageOfficeInjectionKey } from '@/src/configProvider/keys'
import { computed, inject, onMounted, ref } from 'vue'
import type { PageOfficeProps } from './type'

defineOptions({ name: 'MtPageOffice' })

const props = withDefaults(defineProps<PageOfficeProps>(), {
  // 是否启用懒加载 (组件加载时不加载文档 默认false)
  lazy: false,
  // 打开文件的方法 返回html内容 (默认使用注入的openFile方法)
  openFile: undefined,
  // 打开文件的请求url (默认使用注入的url)
  openFileUrl: undefined,
  // 打开文件的请求参数
  openFileParams: undefined,
  // 保存文件的请求参数
  saveFileParams: undefined,
  // 保存文件的请求url (默认是常用注入的url)
  saveFileUrl: undefined,
  // pageOffice内部标题 (默认使用文件名称)
  title: undefined,
  // pageOffice内部标题栏是否可见 (默认true)
  titleBarVisible: true,
  // pageOffice内部Office工具栏是否可见 (默认true)
  toolbarVisible: true,
  // pageOffice内部自定义工具栏是否可见 (默认false)
  customToolbarVisible: false,
  // pageOffice窗口是否全屏展示
  fullscreen: false,
  // 无内容时的提示文本
  noContentText: '请生成文档后进行查看',
  // 是否只读
  readonly: true
})

const slots = defineSlots<{
  noContent?: (props: { text: string }) => any
}>()

defineExpose({
  close,
  load
})

const options = inject(pageOfficeInjectionKey)

const openFile = computed(() => props.openFile ?? options?.value?.openFile)
const openFileUrl = computed(() => props.openFileUrl ?? options?.value?.openFileUrl)
const saveFileUrl = computed(() => props.saveFileUrl ?? options?.value?.saveFileUrl)
const noContentText = computed(() => props.noContentText ?? options?.value?.noContentText)

// pageOffice客户端控件的html
const html = ref<string>()

onMounted(async () => {
  if (props.lazy) return
  await load()
})

async function load() {
  let params = pageofficectrl.WindowParams ? JSON.parse(pageofficectrl.WindowParams) : undefined
  if (props.openFileParams) {
    params = typeof props.openFileParams === 'function' ? props.openFileParams() : props.openFileParams
  }
  let saveParams
  if (props.saveFileParams) {
    saveParams = typeof props.saveFileParams === 'function' ? props.saveFileParams() : props.saveFileParams
  }
  if (saveFileUrl.value) {
    let paramsStr
    if (saveParams) {
      paramsStr = Object.keys(saveParams).map(key => `${key}=${saveParams[key]}`).join('&')
    }
    pageofficectrl.SaveFilePage = paramsStr ? `${saveFileUrl.value}?${paramsStr}` : saveFileUrl.value!
  }
  const isLoaded = !!html.value
  html.value = await openFile.value!(openFileUrl.value!, params)
  window.POPageMounted = {
    OnPageOfficeCtrlInit: onPageOfficeCtrlInit,
    AfterDocumentOpened: afterDocumentOpened
  }
  if (isLoaded) {
    // 如果文档已经加载过，则需要重新加载
    pageofficectrl.Reload()
  }
}

function close() {
  pageofficectrl.CloseWindow()
}

function afterDocumentOpened() {
  // 将标题栏的标题设置为文档名称
  pageofficectrl.Caption = decodeURI(pageofficectrl.DocumentFileName)
}

function onPageOfficeCtrlInit() {
  pageofficectrl.Caption = '文档加载中...'
  pageofficectrl.CustomToolbar = props.readonly ? false : props.customToolbarVisible
  pageofficectrl.Titlebar = props.titleBarVisible
  pageofficectrl.OfficeToolbars = props.readonly ? false : props.toolbarVisible
  pageofficectrl.DisableSave = props.readonly
  pageofficectrl.FullScreen = props.fullscreen
}
</script>

<template>
  <div class="mt-page-office">
    <div v-if="html" class="mt-page-office-content" v-html="html" />
    <template v-else-if="slots.noContent">
      <slot name="noContent" :text="noContentText" />
    </template>
    <div v-else class="mt-page-office-no-content__text">
      {{ noContentText }}
    </div>
  </div>
</template>
