import { cacheLife } from "next/cache";
import Link from "next/link";
import { ContentstackImage } from "@/components/contentstack-image";
import { NavLink } from "@/components/layout/nav-link";
import { buttonVariants } from "@/components/ui/button";
import type { ContentstackAsset } from "@/lib/contentstack";
import type { Header } from "@/lib/content/header";
import { getSiteConfig, SITE_NAME_FALLBACK } from "@/lib/content/site-config";

type SiteHeaderProps = {
  header: Header | null;
  siteName: string;
  logo: ContentstackAsset | null;
};

export function SiteHeader({ header, siteName, logo }: SiteHeaderProps) {
  if (!header) return null;

  const resolvedLogo = header.logo ?? logo;
  const navigation = header.navigation ?? [];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 rounded-md">
          {resolvedLogo?.url ? (
            <ContentstackImage
              asset={resolvedLogo}
              alt={siteName}
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          ) : (
            <span className="font-heading text-lg font-semibold text-heading">
              {siteName}
            </span>
          )}
        </Link>

        <nav aria-label="Main" className="flex items-center gap-6">
          {navigation.map((link) => (
            <NavLink
              key={`${link.url}-${link.label}`}
              {...link}
              className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
            />
          ))}

          {header.cta_label && header.cta_url && (
            <NavLink
              label={header.cta_label}
              url={header.cta_url}
              className={buttonVariants({ size: "sm" })}
            />
          )}
        </nav>
      </div>
    </header>
  );
}

/** Caches its own read so the root layout can stay synchronous. */
export async function SiteHeaderSlot() {
  "use cache";
  cacheLife("content");

  const config = await getSiteConfig();

  return (
    <SiteHeader
      header={config?.header ?? null}
      siteName={config?.siteName ?? SITE_NAME_FALLBACK}
      logo={config?.logo ?? null}
    />
  );
}
