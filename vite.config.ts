import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

const externalPackages = [
  "vue",
  "vue-router",
  "dayjs",
  "element-plus",
  "@element-plus/icons-vue",
  "@handsontable/vue3",
  "@texel/color",
  "@vueuse/core",
  "echarts",
  "file-saver",
  "handsontable",
  "lodash-es",
  "stk-table-vue",
  "xlsx",
  "zrender",
  "amfe-flexible",
];

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/meitq", import.meta.url)),
    },
  },
  plugins: [vue()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "DataDisplayCard",
      fileName: "mcp-ui",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: (id) =>
        !id.endsWith(".css") &&
        externalPackages.some(
          (dependency) => id === dependency || id.startsWith(`${dependency}/`),
        ),
      output: {
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
          dayjs: "dayjs",
          "element-plus": "ElementPlus",
          "@element-plus/icons-vue": "ElementPlusIconsVue",
          "@handsontable/vue3": "HandsontableVue",
          "@texel/color": "TexelColor",
          "@vueuse/core": "VueUse",
          echarts: "echarts",
          "file-saver": "FileSaver",
          handsontable: "Handsontable",
          "lodash-es": "_",
          "stk-table-vue": "StkTableVue",
          xlsx: "XLSX",
          zrender: "zrender",
          "amfe-flexible": "amfeFlexible",
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    css: true,
    server: {
      deps: {
        inline: ["element-plus"],
      },
    },
  },
});
