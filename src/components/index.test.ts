import { createApp } from "vue";
import { describe, expect, it } from "vitest";
import plugin, { components } from "./index";

describe("weather component plugin", () => {
  it("registers all provided components with Vue", () => {
    const app = createApp({});
    app.use(plugin, { areaSelector: { areaList: [] } });

    expect(Object.keys(components)).toHaveLength(19);
    expect(app.component("AreaSelector")).toBe(components.AreaSelector);
    expect(app.component("TimeAxis")).toBe(components.TimeAxis);
  });
});
