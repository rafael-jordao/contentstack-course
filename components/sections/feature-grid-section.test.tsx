import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeatureGridSection } from "./feature-grid-section";

const ITEMS = [
  { item_title: "One page content type", item_description: "No deploy needed." },
  { item_title: "Sections as blocks" },
];

describe("FeatureGridSection", () => {
  it("renders one list item per entry", () => {
    render(<FeatureGridSection heading="Features" items={ITEMS} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<FeatureGridSection heading="Features" items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when items is absent", () => {
    const { container } = render(<FeatureGridSection heading="Features" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the description only for items that have one", () => {
    render(<FeatureGridSection items={ITEMS} />);

    expect(screen.getByText("No deploy needed.")).toBeInTheDocument();
    expect(screen.getByText("Sections as blocks")).toBeInTheDocument();
  });

  it("omits the heading when the editor left it empty", () => {
    render(<FeatureGridSection items={ITEMS} />);

    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
  });
});
