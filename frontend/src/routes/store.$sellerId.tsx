import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Star } from "lucide-react";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/shell/StateBlock";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { TrustScoreRing } from "@/components/trust/TrustScoreRing";
import { VerifiedBadge } from "@/components/trust/VerifiedBadge";
import { useSellerProfile } from "@/lib/api/queries";
import { humanize } from "@/lib/status";

export const Route = createFileRoute("/store/$sellerId")({
  head: () => ({
    meta: [
      { title: "Seller profile & Trust Score — TrustMart" },
      { name: "description", content: "Seller verification status, Trust Score history, verified-purchase reviews and active listings." },
      { property: "og:title", content: "Seller profile & Trust Score — TrustMart" },
      { property: "og:description", content: "Seller verification status, Trust Score, verified reviews and active listings." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { sellerId } = Route.useParams();
  const query = useSellerProfile(sellerId);
  const data = query.data;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        {query.isLoading ? (
          <LoadingBlock rows={4} label="Loading seller profile" />
        ) : query.isError ? (
          <ErrorBlock
            title="Seller profile could not be loaded"
            description="The demo API returned an error."
            onRetry={() => void query.refetch()}
          />
        ) : !data ? (
          <EmptyBlock
            title="Seller not found"
            description="This seller account may have been suspended during a fraud review."
          />
        ) : (
          <div className="space-y-8">
            <header className="tm-card flex flex-wrap items-start justify-between gap-6 p-6">
              <div className="min-w-0 space-y-3">
                <h1 className="text-2xl font-bold tracking-tight">{data.seller.fullName}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  {data.seller.verificationStatus === "VERIFIED" ? (
                    <VerifiedBadge variant="identity" />
                  ) : (
                    <span className="rounded-md border border-dashed border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      Identity {humanize(data.seller.verificationStatus)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" aria-hidden /> Joined{" "}
                    {new Date(data.seller.createdAt).toLocaleDateString("en-PK", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <TrustScoreRing score={data.seller.trustScore} />
            </header>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Active listings</h2>
              <ListingGrid
                listings={data.listings}
                onRetry={() => void query.refetch()}
                hasFilters={false}
              />
              <p className="text-xs text-muted-foreground">
                Risk-flagged listings from this seller are withheld from public storefronts.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Reviews</h2>
              {data.reviews.length === 0 ? (
                <EmptyBlock
                  title="No reviews yet"
                  description="Reviews appear only after an escrow order is completed."
                />
              ) : (
                <ul className="space-y-3">
                  {data.reviews.map((review) => (
                    <li key={review.id} className="tm-card space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{review.authorName}</p>
                        <span
                          className="inline-flex items-center gap-1 text-sm"
                          aria-label={`${review.rating} out of 5`}
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={
                                i < review.rating
                                  ? "size-4 fill-warning text-warning"
                                  : "size-4 text-muted-foreground"
                              }
                              aria-hidden
                            />
                          ))}
                        </span>
                      </div>
                      {review.verifiedPurchase ? <VerifiedBadge variant="field" field="Verified purchase" /> : null}
                      <p className="text-sm text-muted-foreground">{review.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
