import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — TrustMart" },
      { name: "description", content: "Fraud review, escrow oversight and dispute resolution." },
      { property: "og:title", content: "Admin panel — TrustMart" },
      { property: "og:description", content: "Fraud review, escrow oversight and dispute resolution." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageHeader title="Admin panel" description="Fraud review, escrow oversight and dispute resolution." />
        <p className="text-sm text-muted-foreground">
          This surface is being built next on top of the shared trust components and mock API.
        </p>
      </div>
    </PublicLayout>
  );
}
