import { describe, expect, it } from "vitest";
import { jsonRteToHtml } from "./rich-text";

const DOCUMENT = {
  type: "doc",
  uid: "doc-1",
  attrs: {},
  children: [
    {
      type: "p",
      uid: "p-1",
      attrs: {},
      children: [{ text: "First paragraph." }],
    },
    {
      type: "p",
      uid: "p-2",
      attrs: {},
      children: [{ text: "Second paragraph." }],
    },
  ],
};

describe("jsonRteToHtml", () => {
  it("serializes paragraphs to html", () => {
    const html = jsonRteToHtml(DOCUMENT);

    expect(html).toContain("<p>First paragraph.</p>");
    expect(html).toContain("<p>Second paragraph.</p>");
  });

  it("returns an empty string for null or undefined", () => {
    expect(jsonRteToHtml(null)).toBe("");
    expect(jsonRteToHtml(undefined)).toBe("");
  });

  it("serializes inline marks", () => {
    const html = jsonRteToHtml({
      type: "doc",
      uid: "doc-2",
      children: [
        {
          type: "p",
          uid: "p-1",
          children: [{ text: "bold text", bold: true }],
        },
      ],
    });

    expect(html).toContain("<strong>bold text</strong>");
  });

  it("does not mutate the document it is given", () => {
    const document = structuredClone(DOCUMENT);

    jsonRteToHtml(document);

    expect(document).toEqual(DOCUMENT);
  });

  it("escapes markup carried in text nodes", () => {
    const html = jsonRteToHtml({
      type: "doc",
      uid: "doc-3",
      children: [
        {
          type: "p",
          uid: "p-1",
          children: [{ text: "<script>alert(1)</script>" }],
        },
      ],
    });

    expect(html).not.toContain("<script>");
  });
});
