import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlogPost } from "@/lib/content/blog-post";

const getBlogPosts = vi.fn();

vi.mock("@/lib/content/blog-post", () => ({
  BLOG_POST_CONTENT_TYPE: "blog_post",
  getBlogPosts: (...args: unknown[]) => getBlogPosts(...args),
}));

const { PostListSection } = await import("./post-list-section");

function buildPost(uid: string, title: string): BlogPost {
  return {
    uid,
    locale: "en-us",
    created_at: "2026-10-27T00:00:00.000Z",
    updated_at: "2026-10-27T00:00:00.000Z",
    _version: 1,
    tags: [],
    blog_post_title: title,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    published_date: "2026-10-27T00:00:00.000Z",
    cover_image: null,
    body: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getBlogPosts.mockResolvedValue([]);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("PostListSection", () => {
  it("uses hand-picked posts without querying", async () => {
    const posts = [buildPost("blt1", "Curated post")];

    render(await PostListSection({ heading: "Picked", posts }));

    expect(getBlogPosts).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Curated post" })).toBeInTheDocument();
  });

  it("falls back to the most recent posts when none are picked", async () => {
    getBlogPosts.mockResolvedValue([buildPost("blt2", "Recent post")]);

    render(await PostListSection({ heading: "Latest", limit: 2 }));

    expect(getBlogPosts).toHaveBeenCalledWith({ limit: 2 });
    expect(screen.getByRole("link", { name: "Recent post" })).toBeInTheDocument();
  });

  it("defaults to three posts when no limit is set", async () => {
    await PostListSection({});

    expect(getBlogPosts).toHaveBeenCalledWith({ limit: 3 });
  });

  it("renders nothing when the fallback query finds no posts", async () => {
    const { container } = render(await PostListSection({ heading: "Latest" }));

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing and logs when the query fails", async () => {
    const error = new Error("service down");
    getBlogPosts.mockRejectedValue(error);

    const { container } = render(await PostListSection({ heading: "Latest" }));

    expect(container).toBeEmptyDOMElement();
    expect(console.error).toHaveBeenCalledWith(
      "Failed to load posts for the post list section",
      error,
    );
  });
});
