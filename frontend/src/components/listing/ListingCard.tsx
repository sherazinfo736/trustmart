import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { RiskChip } from "@/components/trust/RiskChip";
import { VerifiedBadge } from "@/components/trust/VerifiedBadge";
import { ClaimedChip } from "@/components/trust/ClaimedChip";
import { formatPKR } from "@/lib/currency";
import { humanize } from "@/lib/status";
import type { Listing, RiskScoreBreakdown } from "@/types";

export function ListingCard({
  listing,
  risk,
  verifiedField,
}: {
  listing: Listing;
  risk?: RiskScoreBreakdown | null;
  verifiedField?: string | null;
}) {
  return (
    <article className="tm-card group overflow-hidden transition-shadow hover:shadow-md">
      <Link to="/listing/$listingId" params={{ listingId: listing.id }} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={listing.media[0]?.url}
            alt={listing.title}
            loading="lazy"
            width={1024}
            height={768}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {verifiedField ? (
            <VerifiedBadge variant="field" field={verifiedField} />
          ) : (
            <ClaimedChip field={Object.keys(listing.claimedFields)[0] ?? "details"} />
          )}
          <RiskChip level={listing.riskLevel} risk={risk ?? null} />
        </div>
        <Link to="/listing/$listingId" params={{ listingId: listing.id }} className="block">
          <h3 className="line-clamp-2 font-semibold leading-snug hover:text-primary">
            {listing.title}
          </h3>
        </Link>
        <p className="text-lg font-bold tabular-nums">{formatPKR(listing.pricePKR)}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{listing.city}</span>
          </span>
          <span className="shrink-0">{humanize(listing.condition)}</span>
        </div>
      </div>
    </article>
  );
}