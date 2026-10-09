import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/certificates")({
  head: () => ({
    meta: [
      { title: "My certificates — TrustMart" },
      { name: "description", content: "Digital ownership certificates from completed orders." },
      { property: "og:title", content: "My certificates — TrustMart" },
      { property: "og:description", content: "Digital ownership certificates from completed orders." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageHeader title="My certificates" description="Digital ownership certificates from completed orders." />
        <p className="text-sm text-muted-foreground">
          This surface is being built next on top of the shared trust components and mock API.
        </p>
      </div>
    </PublicLayout>
  );
}
