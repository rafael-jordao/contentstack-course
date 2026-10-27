"use client";

import { useEffect } from "react";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Replaces the root layout when it is the layout itself that fails, so it has
 * to render its own html and body. Plain elements only: the shadcn components
 * live under a layout that is, by definition, not rendering here.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Unhandled error in the root layout", error);
  }, [error]);

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-6 py-32">
          <h1 className="mb-0 text-3xl font-semibold tracking-tight">
            Something went wrong
          </h1>

          <p className="mb-0 text-muted-foreground">
            The application failed to start rendering.
          </p>

          {error.digest && (
            <p className="mb-0 font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
