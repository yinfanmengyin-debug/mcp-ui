import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import DataCard from "./DataCard.vue";

describe("DataCard", () => {
  it("renders the title, value slot, description, and icon", () => {
    const wrapper = mount(DataCard, {
      props: { title: "当前气温" },
      slots: {
        default: "24.6°C",
        description: "体感温度 26°C · 晴",
        icon: "☀",
      },
    });

    expect(wrapper.get("article").attributes("aria-label")).toBe("当前气温");
    expect(wrapper.get(".data-card__value").text()).toBe("24.6°C");
    expect(wrapper.get(".data-card__description").text()).toBe(
      "体感温度 26°C · 晴",
    );
    expect(wrapper.get(".data-card__icon").text()).toBe("☀");
  });

  it("announces the explicit trend direction and value", () => {
    const wrapper = mount(DataCard, {
      props: {
        title: "相对湿度",
        trend: { direction: "up", value: "5%" },
      },
      slots: { default: "68%" },
    });

    expect(wrapper.get(".data-card__trend").attributes("aria-label")).toBe(
      "up 5%",
    );
    expect(wrapper.get(".data-card__trend").classes()).toContain(
      "data-card__trend--up",
    );
  });

  it("supports Vue class fallthrough on the card root", () => {
    const wrapper = mount(DataCard, {
      attrs: { class: "compact" },
      props: { title: "风速" },
      slots: { default: "12 km/h" },
    });

    expect(wrapper.get("article").classes()).toContain("data-card");
    expect(wrapper.get("article").classes()).toContain("compact");
  });
});
