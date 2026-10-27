import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogPostGrid } from "./blog-post-grid";
import type { BlogPost } from "@/lib/content/blog-post";

function buildPost(uid: string, title: string, slug: string): BlogPost {
  return {
    uid,
    locale: "en-us",
    created_at: "2026-10-27T00:00:00.000Z",
    updated_at: "2026-10-27T00:00:00.000Z",
    _version: 1,
    tags: [],
    blog_post_title: title,
    slug,
    published_date: "2026-10-27T00:00:00.000Z",
    cover_image: null,
    body: null,
  };
}

const POSTS = [
  buildPost("blt1", "First post", "first-post"),
  buildPost("blt2", "Second post", "second-post"),
  buildPost("blt3", "Third post", "third-post"),
];

describe("BlogPostGrid", () => {
  it("renders one list item per post", () => {
    render(<BlogPostGrid posts={POSTS} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders the posts in the order it receives them", () => {
    render(<BlogPostGrid posts={POSTS} />);

    const titles = screen.getAllByRole("link").map((link) => link.textContent);

    expect(titles).toEqual(["First post", "Second post", "Third post"]);
  });

  it("exposes the posts as a list for assistive tech", () => {
    render(<BlogPostGrid posts={POSTS} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders an empty list when there are no posts", () => {
    render(<BlogPostGrid posts={[]} />);

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
