import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { ListingFilters } from "@/components/listing/ListingFilters";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { usePublicListings, type BrowseFilters } from "@/lib/api/queries";

type Search = {
  category?: string | undefined;
  condition?: string | undefined;
  city?: string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  sort?: BrowseFilters["sort"] | undefined;
  verified?: boolean | undefined;
};

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search["category"] === "string" ? { category: search["category"] } : {}),
    ...(typeof search["condition"] === "string" ? { condition: search["condition"] } : {}),
    ...(typeof search["city"] === "string" ? { city: search["city"] } : {}),
    ...(Number(search["min"]) ? { min: Number(search["min"]) } : {}),
    ...(Number(search["max"]) ? { max: Number(search["max"]) } : {}),
    ...(typeof search["sort"] === "string" ? { sort: search["sort"] as BrowseFilters["sort"] } : {}),
    ...(search["verified"] === true || search["verified"] === "true" ? { verified: true } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Browse verified listings — TrustMart" },
      { name: "description", content: "Filter by category, city, price, verification status and risk level." },
      { property: "og:title", content: "Browse verified listings — TrustMart" },
      { property: "og:description", content: "Filter by category, city, price, verification status and risk level." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const filters: BrowseFilters = {
    ...(search.category ? { categorySlug: search.category } : {}),
    ...(search.condition ? { condition: search.condition } : {}),
    ...(search.city ? { city: search.city } : {}),
    ...(search.min ? { minPrice: search.min } : {}),
    ...(search.max ? { maxPrice: search.max } : {}),
    ...(search.sort ? { sort: search.sort } : {}),
    ...(search.verified ? { verifiedOnly: true } : {}),
  };

  const query = usePublicListings(filters);
  const hasFilters = Object.keys(filters).length > 0;

  const update = (next: { [K in keyof BrowseFilters]?: BrowseFilters[K] | undefined }) =>
    navigate({
      search: (prev: Search) => ({
        ...prev,
        ...("categorySlug" in next ? { category: next.categorySlug } : {}),
        ...("condition" in next ? { condition: next.condition } : {}),
        ...("city" in next ? { city: next.city } : {}),
        ...("minPrice" in next ? { min: next.minPrice } : {}),
        ...("maxPrice" in next ? { max: next.maxPrice } : {}),
        ...("sort" in next ? { sort: next.sort } : {}),
        ...("verifiedOnly" in next ? { verified: next.verifiedOnly || undefined } : {}),
      }),
    });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-8">
        <PageHeader
          title="Browse verified listings"
          description="Filter by category, city, price, verification status and risk signals. High-risk listings stay out of public results."
        />
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ListingFilters value={filters} onChange={update} onClear={() => navigate({ search: {} })} />
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground" role="status">
              {query.data ? `${query.data.length} listing(s)` : "Loading listings…"}
            </p>
            <ListingGrid
              listings={query.data}
              isLoading={query.isLoading}
              isError={query.isError}
              onRetry={() => void query.refetch()}
              hasFilters={hasFilters}
              onClearFilters={() => void navigate({ search: {} })}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
