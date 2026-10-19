import { createApp } from "vue";
import { describe, expect, it } from "vitest";
import plugin, { meitqComponents, weatherComponents } from "./plugin";

describe("mcp-ui plugin", () => {
  it("registers project and integrated @meitq/ui components", () => {
    const app = createApp({});
    app.use(plugin, { areaSelector: { areaList: [] } });

    expect(Object.keys(weatherComponents)).toHaveLength(19);
    expect(Object.keys(meitqComponents)).toHaveLength(19);
    expect(app.component("AreaSelector")).toBe(weatherComponents.AreaSelector);
    expect(app.component("MtAreaSelector")).toBe(meitqComponents.MtAreaSelector);
    expect(app.component("MtLegend")).toBe(meitqComponents.MtLegend);
  });
});
