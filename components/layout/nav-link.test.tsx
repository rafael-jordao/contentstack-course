import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavLink } from "./nav-link";

describe("NavLink", () => {
  it("renders an internal path without target or rel", () => {
    render(<NavLink label="Blog" url="/blog" />);

    const link = screen.getByRole("link", { name: "Blog" });

    expect(link).toHaveAttribute("href", "/blog");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("opens an external url safely", () => {
    render(<NavLink label="Docs" url="https://contentstack.com/docs" />);

    const link = screen.getByRole("link", { name: "Docs" });

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("treats a protocol-bearing url as external regardless of case", () => {
    render(<NavLink label="Site" url="HTTPS://example.com" />);

    expect(screen.getByRole("link", { name: "Site" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });
});
