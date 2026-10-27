import { cacheLife } from "next/cache";
import Script from "next/script";
import {
  getSiteConfig,
  safeGtmId,
  safeScriptSrc,
  type SiteScripts,
} from "@/lib/content/site-config";

type SiteScriptsProps = {
  scripts: SiteScripts;
};

export function SiteScripts({ scripts }: SiteScriptsProps) {
  const gtmId = safeGtmId(scripts.gtm_container_id);
  const external = (scripts.external_scripts ?? [])
    .map((script) => ({ ...script, src: safeScriptSrc(script.src) }))
    .filter((script): script is typeof script & { src: string } => script.src !== null);

  const inlineHtml = scripts.inline_head_html?.trim();

  return (
    <>
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {external.map((script) => (
        <Script
          key={script.src}
          src={script.src}
          strategy={script.strategy ?? "afterInteractive"}
        />
      ))}

      {/* Editor-supplied markup. Guarded by role permissions, not by code. */}
      {inlineHtml && <div dangerouslySetInnerHTML={{ __html: inlineHtml }} />}
    </>
  );
}

/** Caches its own read so the root layout can stay synchronous. */
export async function SiteScriptsSlot() {
  "use cache";
  cacheLife("content");

  const config = await getSiteConfig();

  if (!config) return null;

  return <SiteScripts scripts={config.scripts} />;
}
