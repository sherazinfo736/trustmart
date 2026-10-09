import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/seller")({
  head: () => ({
    meta: [
      { title: "Seller dashboard — TrustMart" },
      { name: "description", content: "Verification, listings, orders, payouts and analytics." },
      { property: "og:title", content: "Seller dashboard — TrustMart" },
      { property: "og:description", content: "Verification, listings, orders, payouts and analytics." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageHeader title="Seller dashboard" description="Verification, listings, orders, payouts and analytics." />
        <p className="text-sm text-muted-foreground">
          This surface is being built next on top of the shared trust components and mock API.
        </p>
      </div>
    </PublicLayout>
  );
}
