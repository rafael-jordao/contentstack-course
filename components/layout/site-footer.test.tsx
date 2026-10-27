import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";
import type { Footer } from "@/lib/content/footer";

function buildFooter(overrides: Partial<Footer> = {}): Footer {
  return {
    uid: "blt_footer",
    locale: "en-us",
    created_at: "2026-10-27T00:00:00.000Z",
    updated_at: "2026-10-27T00:00:00.000Z",
    _version: 1,
    tags: [],
    title: "Main footer",
    navigation: [{ label: "Blog", url: "/blog" }],
    copyright: "Acme Inc",
    ...overrides,
  };
}

describe("SiteFooter", () => {
  it("renders nothing when no footer is configured", () => {
    const { container } = render(
      <SiteFooter footer={null} siteName="Acme" year={2026} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the copyright with the year it is given", () => {
    render(<SiteFooter footer={buildFooter()} siteName="Acme" year={2026} />);

    expect(screen.getByText(/2026 Acme Inc/)).toBeInTheDocument();
  });

  it("falls back to the site name when copyright is empty", () => {
    render(
      <SiteFooter footer={buildFooter({ copyright: "   " })} siteName="Acme" year={2026} />,
    );

    expect(screen.getByText(/2026 Acme/)).toBeInTheDocument();
  });

  it("omits the navigation element when there are no links", () => {
    render(
      <SiteFooter footer={buildFooter({ navigation: [] })} siteName="Acme" year={2026} />,
    );

    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("labels the navigation for assistive tech", () => {
    render(<SiteFooter footer={buildFooter()} siteName="Acme" year={2026} />);

    expect(screen.getByRole("navigation", { name: "Footer" })).toBeInTheDocument();
  });
});
