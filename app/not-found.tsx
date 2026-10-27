import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-6 py-32">
      <p className="mb-0 font-mono text-sm text-muted-foreground">404</p>

      <h1 className="mb-0 text-3xl font-semibold tracking-tight">
        This page does not exist
      </h1>

      <p className="mb-0 text-muted-foreground">
        It may have been unpublished, or the address may be wrong.
      </p>

      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to the homepage
      </Link>
    </main>
  );
}
