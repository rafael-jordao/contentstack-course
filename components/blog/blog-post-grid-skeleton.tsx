import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function BlogPostGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="pt-0">
          <div className="aspect-video w-full bg-muted" />
          <CardHeader>
            <div className="h-4 w-4/5 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-3 w-20 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
