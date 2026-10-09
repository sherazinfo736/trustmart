import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { useSavedListings } from "@/lib/api/queries";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved listings — TrustMart" },
      { name: "description", content: "Your shortlisted TrustMart listings with live verification and risk status." },
      { property: "og:title", content: "Saved listings — TrustMart" },
      { property: "og:description", content: "Your shortlisted TrustMart listings with live verification and risk status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const query = useSavedListings();

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageHeader
          title="Saved listings"
          description="Shortlisted items. Verification and risk status update automatically."
          actions={
            <Button variant="outline" asChild>
              <Link to="/browse">Browse more</Link>
            </Button>
          }
        />
        <ListingGrid
          listings={query.data}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => void query.refetch()}
        />
      </div>
    </PublicLayout>
  );
}
