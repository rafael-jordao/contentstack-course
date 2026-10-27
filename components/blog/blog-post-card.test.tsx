import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogPostCard } from "./blog-post-card";
import type { BlogPost } from "@/lib/content/blog-post";

function buildPost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    uid: "blt_post",
    locale: "en-us",
    created_at: "2026-10-27T00:00:00.000Z",
    updated_at: "2026-10-27T00:00:00.000Z",
    _version: 1,
    tags: [],
    blog_post_title: "Building a Content Model That Scales",
    slug: "building-a-content-model-that-scales",
    published_date: "2026-10-27T00:00:00.000Z",
    cover_image: null,
    body: null,
    ...overrides,
  };
}

describe("BlogPostCard", () => {
  it("renders the title as a link to the post", () => {
    render(<BlogPostCard post={buildPost()} />);

    const link = screen.getByRole("link", {
      name: "Building a Content Model That Scales",
    });

    expect(link).toHaveAttribute(
      "href",
      "/blog/building-a-content-model-that-scales",
    );
  });

  it("exposes exactly one link, so the card is not announced twice", () => {
    render(<BlogPostCard post={buildPost()} />);

    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("hides the View Details affordance from assistive tech", () => {
    render(<BlogPostCard post={buildPost()} />);

    expect(screen.queryByRole("link", { name: /view details/i })).toBeNull();
    expect(screen.getByText("View Details")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("formats the published date as short month and year", () => {
    render(<BlogPostCard post={buildPost()} />);

    expect(screen.getByText("Oct 2026")).toBeInTheDocument();
  });

  it("omits the date element when there is no published date", () => {
    render(<BlogPostCard post={buildPost({ published_date: null })} />);

    expect(screen.queryByText(/2026/)).toBeNull();
  });

  it("falls back to a placeholder when there is no cover image", () => {
    render(<BlogPostCard post={buildPost()} />);

    expect(screen.getByText("No cover image")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders the cover image through the image delivery api", () => {
    render(
      <BlogPostCard
        post={buildPost({
          cover_image: {
            uid: "blt_asset",
            url: "https://eu-images.contentstack.com/v3/assets/blt1/blt2/cover.jpg",
            title: "A cover",
          },
        })}
      />,
    );

    const src =
      screen.getByRole("img", { name: "A cover" }).getAttribute("src") ?? "";

    expect(src).toBe(
      "https://eu-images.contentstack.com/v3/assets/blt1/blt2/cover.jpg",
    );
    expect(screen.queryByText("No cover image")).toBeNull();
  });

  it("names the image after the asset title, not the post", () => {
    render(
      <BlogPostCard
        post={buildPost({
          cover_image: {
            uid: "blt_asset",
            url: "https://eu-images.contentstack.com/v3/assets/blt1/blt2/cover.jpg",
            title: "A cover",
          },
        })}
      />,
    );

    expect(screen.getByRole("img", { name: "A cover" })).toBeInTheDocument();
  });
});
