import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlogPost } from "@/lib/content/blog-post";

const getBlogPosts = vi.fn();

vi.mock("@/lib/content/blog-post", () => ({
  BLOG_POST_CONTENT_TYPE: "blog_post",
  getBlogPosts: () => getBlogPosts(),
}));

const { BlogPostList } = await import("./blog-post-list");

function buildPost(): BlogPost {
  return {
    uid: "blt1",
    locale: "en-us",
    created_at: "2026-10-27T00:00:00.000Z",
    updated_at: "2026-10-27T00:00:00.000Z",
    _version: 1,
    tags: [],
    title: "First post",
    url: "/blog/first-post",
    published_date: "2026-10-27T00:00:00.000Z",
    cover_image: null,
    body: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("BlogPostList", () => {
  it("renders the grid when posts come back", async () => {
    getBlogPosts.mockResolvedValue([buildPost()]);

    render(await BlogPostList());

    expect(screen.getByRole("link", { name: "First post" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an empty state when there are no posts", async () => {
    getBlogPosts.mockResolvedValue([]);

    render(await BlogPostList());

    expect(screen.getByText("No posts published yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("shows an error state when the fetch rejects", async () => {
    getBlogPosts.mockRejectedValue(new Error("service down"));

    render(await BlogPostList());

    expect(screen.getByText("Could not load posts")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("logs the failure instead of swallowing it", async () => {
    const error = new Error("service down");
    getBlogPosts.mockRejectedValue(error);

    render(await BlogPostList());

    expect(console.error).toHaveBeenCalledWith(
      "Failed to load blog posts",
      error,
    );
  });

  it("does not throw when the content service fails", async () => {
    getBlogPosts.mockRejectedValue(new Error("service down"));

    await expect(BlogPostList()).resolves.toBeDefined();
  });
});
