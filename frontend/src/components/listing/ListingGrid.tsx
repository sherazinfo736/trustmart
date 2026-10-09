import { ListingCard } from "./ListingCard";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/shell/StateBlock";
import type { Listing, RiskScoreBreakdown } from "@/types";

/** A listing as returned by the API — risk + verification signals travel
 * with the listing itself (see mockApi/httpApi `listings()`), never looked
 * up separately by ID from a side-channel table. */
type ListingWithSignals = Listing & {
  risk?: RiskScoreBreakdown | null;
  verifiedFields?: Record<string, string>;
};

/** One grid used by Browse, Search, Saved and Seller Profile. */
export function ListingGrid({
  listings,
  isLoading,
  isError,
  onRetry,
  hasFilters,
  onClearFilters,
}: {
  listings?: ListingWithSignals[] | undefined;
  isLoading?: boolean | undefined;
  isError?: boolean | undefined;
  onRetry?: (() => void) | undefined;
  hasFilters?: boolean | undefined;
  onClearFilters?: (() => void) | undefined;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingBlock key={i} rows={2} label="Loading listings" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorBlock
        title="Listings could not be loaded"
        description="The demo API returned an error. Retry to load the mock listings again."
        onRetry={onRetry}
      />
    );
  }

  if (!listings || listings.length === 0) {
    return hasFilters ? (
      <EmptyBlock
        title="No listings match these filters"
        description="Try widening the price range, clearing the Verified Only toggle, or picking another city."
        action={
          onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-sm font-medium text-primary underline"
            >
              Clear all filters
            </button>
          ) : undefined
        }
      />
    ) : (
      <EmptyBlock
        title="Nothing listed here yet"
        description="Verified listings appear here as sellers complete identity and product verification."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => {
        const verified = listing.verifiedFields ?? {};
        const verifiedField =
          Object.entries(verified).find(([, state]) => state.startsWith("verified"))?.[0] ?? null;
        return (
          <ListingCard
            key={listing.id}
            listing={listing}
            risk={listing.risk ?? null}
            verifiedField={verifiedField}
          />
        );
      })}
    </div>
  );
}
