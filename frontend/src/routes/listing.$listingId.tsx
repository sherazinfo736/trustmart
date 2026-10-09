import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, ShieldAlert, Sparkles } from "lucide-react";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/shell/StateBlock";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { RiskChip } from "@/components/trust/RiskChip";
import { VerifiedBadge } from "@/components/trust/VerifiedBadge";
import { TrustScoreRing } from "@/components/trust/TrustScoreRing";
import { HealthReportChecklist } from "@/components/trust/HealthReportChecklist";
import {
  ClaimedFieldsPanel,
  DiscrepancyNotice,
  VerifiedFieldsPanel,
} from "@/components/trust/ClaimedVsVerifiedPanels";
import { useListing } from "@/lib/api/queries";
import { api } from "@/lib/api/client";
import type { ListingStatus } from "@/types";
import { formatPKR } from "@/lib/currency";
import { humanize, listingStatusTone } from "@/lib/status";

export const Route = createFileRoute("/listing/$listingId")({
  head: () => ({
    meta: [
      { title: "Listing detail — TrustMart" },
      { name: "description", content: "Claimed vs Verified fields, product health report, seller trust score and escrow options." },
      { property: "og:title", content: "Listing detail — TrustMart" },
      { property: "og:description", content: "Claimed vs Verified fields, product health report, seller trust score and escrow options." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { listingId } = Route.useParams();
  const query = useListing(listingId);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        {query.isLoading ? (
          <LoadingBlock rows={5} label="Loading listing" />
        ) : query.isError ? (
          <ErrorBlock
            title="Listing could not be loaded"
            description="The demo API returned an error for this listing."
            onRetry={() => query.refetch()}
          />
        ) : !query.data?.listing ? (
          <EmptyBlock
            title="Listing not found"
            description="This listing may have been removed, sold, or withheld during a fraud review."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/browse">Back to browse</Link>
              </Button>
            }
          />
        ) : (
          <Detail data={query.data} />
        )}
      </div>
    </PublicLayout>
  );
}

type ListingDetail = NonNullable<Awaited<ReturnType<typeof api.listing>>["data"]>;

function Detail({ data }: { data: ListingDetail }) {
  const { listing, seller, verification, risk, discrepancies } = data;
  const healthEntries = Object.keys(verification?.healthReport ?? {}).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <img
              src={listing.media[0]?.url}
              alt={listing.title}
              width={1024}
              height={768}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          {listing.media[0]?.aiFlags?.blurry ? (
            <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs">
              Automated image check flagged this photo as low quality. Ask the seller for a clearer
              photo before paying.
            </p>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={listing.status} tone={listingStatusTone[listing.status as ListingStatus]} />
            <RiskChip level={listing.riskLevel} risk={risk} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{listing.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {listing.publicId} · {humanize(listing.condition)}
            </p>
          </div>
          <p className="text-3xl font-bold tabular-nums">{formatPKR(listing.pricePKR)}</p>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden /> {listing.city}
          </p>

          {listing.riskLevel !== "LOW" ? (
            <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlert className="size-4 shrink-0 text-warning" aria-hidden /> This listing is
                risk-flagged
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Simulated risk signals are elevated. Pay through escrow only, and never send an
                advance payment outside TrustMart.
              </p>
            </div>
          ) : null}

          <div className="tm-card space-y-4 p-4">
            {seller ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{seller.fullName}</p>
                    {seller.verificationStatus === "VERIFIED" ? (
                      <VerifiedBadge variant="identity" className="mt-1" />
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Identity verification {humanize(seller.verificationStatus)}
                      </p>
                    )}
                  </div>
                  <TrustScoreRing score={seller.trustScore} showLabel={false} size={56} />
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/store/$sellerId" params={{ sellerId: seller.id }}>
                    View seller profile & Trust Score
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Seller record unavailable.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild className="flex-1">
              <Link to="/checkout/$listingId" params={{ listingId: listing.id }}>
                Pay with escrow
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/chat">Message seller</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Escrow holds your payment until you confirm the item matches. Demo payment screens only.
          </p>
        </div>
      </div>

      {discrepancies && discrepancies.length > 0 ? <DiscrepancyNotice items={discrepancies} /> : null}

      {/* Two structurally distinct panels — never merged into one list. */}
      <div className="grid gap-5 lg:grid-cols-2">
        <VerifiedFieldsPanel verification={verification} />
        <ClaimedFieldsPanel listing={listing} />
      </div>

      <section className="tm-card p-5">
        <h2 className="font-semibold">Product health report</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Condition ratings recorded during TrustMart inspection. Missing items were not inspected.
        </p>
        {!verification || healthEntries === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            No inspection has been recorded for this item yet.
          </p>
        ) : (
          <HealthReportChecklist
            className="mt-4"
            report={verification.healthReport}
            {...(verification.overallHealthScore !== undefined
              ? { overallScore: verification.overallHealthScore }
              : {})}
          />
        )}
      </section>

      <section className="tm-card p-5">
        <h2 className="font-semibold">Description</h2>
        <p className="mt-2 text-sm text-muted-foreground">{listing.description}</p>
      </section>

      {!risk ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 shrink-0 text-muted-foreground" aria-hidden /> Risk signals
            not available
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            The demo scoring service has not returned signals for this listing yet. Verification
            badges above are unaffected.
          </p>
        </div>
      ) : null}
    </div>
  );
}
