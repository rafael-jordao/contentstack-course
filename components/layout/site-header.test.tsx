import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";
import type { Header } from "@/lib/content/header";

function buildHeader(overrides: Partial<Header> = {}): Header {
  return {
    uid: "blt_header",
    locale: "en-us",
    created_at: "2026-10-27T00:00:00.000Z",
    updated_at: "2026-10-27T00:00:00.000Z",
    _version: 1,
    tags: [],
    title: "Main header",
    navigation: [
      { label: "Home", url: "/" },
      { label: "Blog", url: "/blog" },
    ],
    ...overrides,
  };
}

describe("SiteHeader", () => {
  it("renders nothing when no header is configured", () => {
    const { container } = render(
      <SiteHeader header={null} siteName="Acme" logo={null} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("falls back to the site name when there is no logo", () => {
    render(<SiteHeader header={buildHeader()} siteName="Acme" logo={null} />);

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("prefers the header logo over the site logo", () => {
    render(
      <SiteHeader
        header={buildHeader({
          logo: { uid: "a", url: "https://eu-images.contentstack.com/a.png" },
        })}
        siteName="Acme"
        logo={{ uid: "b", url: "https://eu-images.contentstack.com/b.png" }}
      />,
    );

    expect(screen.getByRole("img", { name: "Acme" }).getAttribute("src")).toContain(
      "a.png",
    );
  });

  it("renders the navigation in order", () => {
    render(<SiteHeader header={buildHeader()} siteName="Acme" logo={null} />);

    const nav = screen.getByRole("navigation", { name: "Main" });
    const labels = [...nav.querySelectorAll("a")].map((link) => link.textContent);

    expect(labels).toEqual(["Home", "Blog"]);
  });

  it("renders the cta only when label and url are both set", () => {
    const { rerender } = render(
      <SiteHeader
        header={buildHeader({ cta_label: "Start", cta_url: "/signup" })}
        siteName="Acme"
        logo={null}
      />,
    );

    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute(
      "href",
      "/signup",
    );

    rerender(
      <SiteHeader
        header={buildHeader({ cta_label: "Start" })}
        siteName="Acme"
        logo={null}
      />,
    );

    expect(screen.queryByRole("link", { name: "Start" })).toBeNull();
  });

  it("copes with a header that has no navigation", () => {
    render(
      <SiteHeader
        header={buildHeader({ navigation: undefined })}
        siteName="Acme"
        logo={null}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });
});
