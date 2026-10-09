import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookmarkPlus, Search as SearchIcon } from "lucide-react";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingFilters } from "@/components/listing/ListingFilters";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { usePublicListings, type BrowseFilters } from "@/lib/api/queries";

type SearchParams = { q: string; verified?: boolean | undefined; city?: string | undefined };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    ...(search["verified"] === true || search["verified"] === "true" ? { verified: true } : {}),
    ...(typeof search["city"] === "string" ? { city: search["city"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Search verified listings — TrustMart" },
      { name: "description", content: "Search phones, cars, laptops and bikes by model, IMEI or listing ID across verified TrustMart sellers." },
      { property: "og:title", content: "Search verified listings — TrustMart" },
      { property: "og:description", content: "Search verified TrustMart listings by model, IMEI or listing ID." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [draft, setDraft] = useState(search.q);
  const [saved, setSaved] = useState(false);

  const filters: BrowseFilters = {
    ...(search.q ? { query: search.q } : {}),
    ...(search.city ? { city: search.city } : {}),
    ...(search.verified ? { verifiedOnly: true } : {}),
  };
  const query = usePublicListings(filters);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-8">
        <PageHeader
          title={search.q ? `Results for “${search.q}”` : "Search listings"}
          description="Search by model, IMEI fragment or TrustMart listing ID."
        />
        <form
          className="mb-6 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: (prev: SearchParams) => ({ ...prev, q: draft }) });
          }}
        >
          <label className="sr-only" htmlFor="search-input">
            Search listings
          </label>
          <Input
            id="search-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. iPhone 14, MacBook, TM-PH-88213"
            className="max-w-md"
          />
          <Button type="submit">
            <SearchIcon className="size-4" aria-hidden /> Search
          </Button>
        </form>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ListingFilters
            value={filters}
            onChange={(next) =>
              navigate({
                search: (prev: SearchParams) => ({
                  ...prev,
                  ...("city" in next ? { city: next.city } : {}),
                  ...("verifiedOnly" in next ? { verified: next.verifiedOnly || undefined } : {}),
                }),
              })
            }
            onClear={() => navigate({ search: { q: search.q } })}
          />
          <div className="space-y-4">
            {search.q && query.data && query.data.length > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {saved
                    ? "Saved. You'll be notified when new verified matches are listed (demo)."
                    : `Save “${search.q}” and get notified about new verified matches?`}
                </p>
                {!saved ? (
                  <Button variant="outline" size="sm" onClick={() => setSaved(true)}>
                    <BookmarkPlus className="size-4" aria-hidden /> Save this search
                  </Button>
                ) : null}
              </div>
            ) : null}
            <ListingGrid
              listings={query.data}
              isLoading={query.isLoading}
              isError={query.isError}
              onRetry={() => void query.refetch()}
              hasFilters
              onClearFilters={() => void navigate({ search: { q: "" } })}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
