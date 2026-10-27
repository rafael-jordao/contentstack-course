"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Unhandled error in route segment", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-6 py-32">
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          This page could not be rendered. Trying again often resolves it.
        </AlertDescription>
      </Alert>

      {error.digest && (
        <p className="mb-0 font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}

      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
