import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SectionRenderer } from "./section-renderer";
import type { PageSection } from "@/lib/content/page";

vi.mock("@/components/sections/post-list-section", () => ({
  PostListSection: ({ heading }: { heading?: string }) => (
    <div data-testid="post-list">{heading}</div>
  ),
}));

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("SectionRenderer", () => {
  it("renders nothing when there are no sections", () => {
    const { container } = render(
      <SectionRenderer sections={undefined} pageUid="blt1" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders each block with its own component", () => {
    const sections: PageSection[] = [
      { hero: { heading: "Hero heading" } },
      { feature_grid: { heading: "Features", items: [{ item_title: "One" }] } },
      { post_list: { heading: "Latest posts" } },
    ];

    render(<SectionRenderer sections={sections} pageUid="blt1" />);

    expect(
      screen.getByRole("heading", { name: "Hero heading" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Features" })).toBeInTheDocument();
    expect(screen.getByTestId("post-list")).toHaveTextContent("Latest posts");
  });

  it("preserves the order the editor arranged", () => {
    const sections: PageSection[] = [
      { feature_grid: { heading: "Second", items: [{ item_title: "x" }] } },
      { hero: { heading: "First" } },
    ];

    render(<SectionRenderer sections={sections} pageUid="blt1" />);

    const headings = screen
      .getAllByRole("heading")
      .map((heading) => heading.textContent);

    expect(headings).toEqual(["Second", "First"]);
  });

  it("skips an unknown block instead of breaking the page", () => {
    const sections = [
      { cta_band: { heading: "Not implemented" } },
      { hero: { heading: "Still rendered" } },
    ] as unknown as PageSection[];

    render(<SectionRenderer sections={sections} pageUid="blt1" />);

    expect(
      screen.getByRole("heading", { name: "Still rendered" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Not implemented")).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });
});
