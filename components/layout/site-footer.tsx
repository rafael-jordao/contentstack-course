import { cacheLife } from "next/cache";
import { NavLink } from "@/components/layout/nav-link";
import type { Footer } from "@/lib/content/footer";
import { getSiteConfig, SITE_NAME_FALLBACK } from "@/lib/content/site-config";
import { getCurrentYear } from "@/lib/current-year";

type SiteFooterProps = {
  footer: Footer | null;
  siteName: string;
  /** Passed in so the component stays deterministic and testable. */
  year: number;
};

export function SiteFooter({ footer, siteName, year }: SiteFooterProps) {
  if (!footer) return null;

  const navigation = footer.navigation ?? [];
  const copyright = footer.copyright?.trim() || siteName;

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <p className="mb-0 font-mono text-sm text-muted-foreground">
          © {year} {copyright}
        </p>

        {navigation.length > 0 && (
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-6">
            {navigation.map((link) => (
              <NavLink
                key={`${link.url}-${link.label}`}
                {...link}
                className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
              />
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}

/** Caches its own read so the root layout can stay synchronous. */
export async function SiteFooterSlot() {
  "use cache";
  cacheLife("content");

  const [config, year] = await Promise.all([getSiteConfig(), getCurrentYear()]);

  return (
    <SiteFooter
      footer={config?.footer ?? null}
      siteName={config?.siteName ?? SITE_NAME_FALLBACK}
      year={year}
    />
  );
}
