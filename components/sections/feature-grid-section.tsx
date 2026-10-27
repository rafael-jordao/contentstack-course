import { ContentstackImage } from "@/components/contentstack-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeatureGridFields } from "@/lib/content/page";

export function FeatureGridSection({ heading, items }: FeatureGridFields) {
  if (!items?.length) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      {heading && (
        <h2 className="mb-12 text-2xl font-semibold tracking-tight">{heading}</h2>
      )}

      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item) => (
          <li key={item.item_title}>
            <Card>
              <CardHeader>
                {item.icon?.url && (
                  <ContentstackImage
                    asset={item.icon}
                    alt=""
                    width={32}
                    height={32}
                    className="mb-2 size-8"
                  />
                )}
                <CardTitle>{item.item_title}</CardTitle>
              </CardHeader>
              {item.item_description && (
                <CardContent className="text-muted-foreground">
                  {item.item_description}
                </CardContent>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
