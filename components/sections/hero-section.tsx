import Link from "next/link";
import { ContentstackImage } from "@/components/contentstack-image";
import { buttonVariants } from "@/components/ui/button";
import type { HeroFields } from "@/lib/content/page";

export function HeroSection({ heading, subheading, image, cta_label, cta_url }: HeroFields) {
  return (
    <section className="relative overflow-hidden">
      {image?.url && (
        <ContentstackImage
          asset={image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      )}

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-6 py-32">
        <h1 className="mb-0 text-4xl font-semibold tracking-tight">{heading}</h1>

        {subheading && (
          <p className="mb-0 max-w-2xl text-lg text-muted-foreground">{subheading}</p>
        )}

        {cta_label && cta_url && (
          <Link href={cta_url} className={buttonVariants({ size: "lg" })}>
            {cta_label}
          </Link>
        )}
      </div>
    </section>
  );
}
