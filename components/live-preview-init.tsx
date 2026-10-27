"use client";

import { useEffect } from "react";

type LivePreviewInitProps = {
  apiKey: string;
  environment: string;
  appHost: string;
};

export function LivePreviewInit({ apiKey, environment, appHost }: LivePreviewInitProps) {
  useEffect(() => {
    let cancelled = false;

    // Imported lazily so the edit button never ships to visitors.
    import("@contentstack/live-preview-utils").then(({ default: LivePreview }) => {
      if (cancelled) return;

      LivePreview.init({
        enable: true,
        ssr: true,
        mode: "preview",
        stackDetails: { apiKey, environment },
        clientUrlParams: { host: appHost },
        editButton: { enable: false },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [apiKey, environment, appHost]);

  return null;
}
