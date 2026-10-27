import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSection } from "./hero-section";

describe("HeroSection", () => {
  it("renders the heading as the page h1", () => {
    render(<HeroSection heading="Composable content" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Composable content" }),
    ).toBeInTheDocument();
  });

  it("omits the subheading when the editor left it empty", () => {
    const { container } = render(<HeroSection heading="H" />);

    expect(container.querySelector("p")).toBeNull();
  });

  it("renders the cta only when both label and url are set", () => {
    const { rerender } = render(
      <HeroSection heading="H" cta_label="Read more" cta_url="/blog" />,
    );

    expect(screen.getByRole("link", { name: "Read more" })).toHaveAttribute(
      "href",
      "/blog",
    );

    rerender(<HeroSection heading="H" cta_label="Read more" />);
    expect(screen.queryByRole("link")).toBeNull();

    rerender(<HeroSection heading="H" cta_url="/blog" />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("marks the background image as decorative", () => {
    render(
      <HeroSection
        heading="H"
        image={{
          uid: "blt_asset",
          url: "https://eu-images.contentstack.com/v3/assets/a/b/hero.jpg",
          title: "Hero background",
        }}
      />,
    );

    expect(screen.getByRole("presentation", { hidden: true })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Hero background" })).toBeNull();
  });
});
