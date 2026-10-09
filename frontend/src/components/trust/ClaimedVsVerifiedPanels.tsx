import { CircleDashed, ShieldCheck, TriangleAlert } from "lucide-react";
import { ClaimedChip } from "./ClaimedChip";
import { VerifiedBadge } from "./VerifiedBadge";
import { humanize } from "@/lib/status";
import type { FieldVerificationState, Listing, ProductVerification } from "@/types";

/**
 * TWO structurally separate panels. They are deliberately never merged into one
 * table, one list, or one card: a seller claim and a platform verification must
 * never look like the same class of fact.
 */

export function VerifiedFieldsPanel({
  verification,
}: {
  verification: ProductVerification | null;
}) {
  const entries = Object.entries(verification?.verifiedFields ?? {}).filter(([, state]) =>
    state.startsWith("verified"),
  ) as Array<[string, FieldVerificationState]>;

  return (
    <section className="rounded-xl border-2 border-verified/40 bg-verified/5 p-5" aria-labelledby="verified-panel">
      <header className="flex items-center gap-2">
        <ShieldCheck className="size-5 shrink-0 text-verified" aria-hidden />
        <h2 id="verified-panel" className="font-semibold">
          Verified by TrustMart
        </h2>
      </header>
      <p className="mt-1 text-xs text-muted-foreground">
        Checked by the platform against documents, records or video evidence.
      </p>
      {entries.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-card px-3 py-4 text-sm text-muted-foreground">
          Nothing on this listing has been platform-verified yet. Treat every detail below as a
          seller claim only.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {entries.map(([field, state]) => (
            <li
              key={field}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-card px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm font-medium">{humanize(field)}</span>
              <VerifiedBadge
                variant="field"
                field={humanize(field)}
                {...(state === "verified_video"
                  ? { evidence: "video" as const }
                  : state === "verified_screenshot"
                    ? { evidence: "screenshot" as const }
                    : {})}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ClaimedFieldsPanel({ listing }: { listing: Listing }) {
  const entries = Object.entries(listing.claimedFields);

  return (
    <section
      className="rounded-xl border border-dashed border-border bg-muted/40 p-5"
      aria-labelledby="claimed-panel"
    >
      <header className="flex items-center gap-2">
        <CircleDashed className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <h2 id="claimed-panel" className="font-semibold">
          Stated by the seller
        </h2>
      </header>
      <p className="mt-1 text-xs text-muted-foreground">
        Not checked by TrustMart. These are the seller's own words.
      </p>
      {entries.length === 0 ? (
        <p className="mt-4 rounded-lg border border-border bg-card px-3 py-4 text-sm text-muted-foreground">
          The seller added no extra unverified claims to this listing.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {entries.map(([field, value]) => (
            <li
              key={field}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-card px-3 py-2"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{humanize(field)}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                </span>
              </span>
              <ClaimedChip />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function DiscrepancyNotice({
  items,
}: {
  items: Array<{ field: string; claimed: string; verified: string }>;
}) {
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
      <div className="flex items-center gap-2">
        <TriangleAlert className="size-5 shrink-0 text-warning" aria-hidden />
        <p className="text-sm font-semibold">Seller claim disagrees with verified records</p>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.field} className="rounded-lg bg-card p-3 text-sm">
            <p className="font-medium">{humanize(item.field)}</p>
            <p className="mt-1 text-muted-foreground">
              <span className="font-medium text-foreground">Claimed:</span> {item.claimed}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Verified:</span> {item.verified}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
