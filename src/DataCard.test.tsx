import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataCard } from "./DataCard";

describe("DataCard", () => {
  it("renders its title, value, and optional description", () => {
    render(
      <DataCard
        title="Monthly revenue"
        value="$24,800"
        description="Compared with last month"
      />,
    );

    expect(screen.getByRole("article", { name: "Monthly revenue" })).toBeTruthy();
    expect(screen.getByText("$24,800")).toBeTruthy();
    expect(screen.getByText("Compared with last month")).toBeTruthy();
  });

  it("announces trend direction and value", () => {
    render(
      <DataCard
        title="Active users"
        value="2,420"
        trend={{ direction: "up", value: "8.2%" }}
      />,
    );

    expect(screen.getByLabelText("up 8.2%")).toBeTruthy();
  });

  it("combines a consumer class with the component class", () => {
    const { container } = render(
      <DataCard title="Conversion rate" value="3.6%" className="compact" />,
    );

    expect(container.firstElementChild?.classList.contains("data-card")).toBe(true);
    expect(container.firstElementChild?.classList.contains("compact")).toBe(true);
  });
});
