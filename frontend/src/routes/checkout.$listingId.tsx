import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/shell/StateBlock";
import { EscrowStateTimeline } from "@/components/trust/EscrowStateTimeline";
import { useCheckoutQuote } from "@/lib/api/queries";
import { formatPKR } from "@/lib/currency";

const methods = [
  { id: "CARD", label: "Debit / credit card", hint: "Held in escrow, not paid to the seller yet" },
  { id: "BANK", label: "Bank transfer (IBFT)", hint: "Transfer to the TrustMart escrow account" },
  { id: "WALLET", label: "Mobile wallet", hint: "JazzCash / Easypaisa escrow deposit" },
];

export const Route = createFileRoute("/checkout/$listingId")({
  head: () => ({
    meta: [
      { title: "Escrow checkout — TrustMart" },
      { name: "description", content: "Pay into TrustMart escrow. Funds are released to the seller only after you confirm the item." },
      { property: "og:title", content: "Escrow checkout — TrustMart" },
      { property: "og:description", content: "Pay into TrustMart escrow. Funds release only after you confirm the item." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { listingId } = Route.useParams();
  const query = useCheckoutQuote(listingId);
  const [method, setMethod] = useState("CARD");
  const [paid, setPaid] = useState(false);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <PageHeader
          title="Escrow checkout"
          description="TrustMart holds your payment until you confirm the item matches its verified details."
        />
        {query.isLoading ? (
          <LoadingBlock rows={4} label="Loading checkout" />
        ) : query.isError ? (
          <ErrorBlock
            title="Checkout could not be loaded"
            description="The demo API returned an error while quoting escrow fees."
            onRetry={() => void query.refetch()}
          />
        ) : !query.data ? (
          <EmptyBlock
            title="Listing unavailable"
            description="This item is no longer available for escrow checkout."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/browse">Back to browse</Link>
              </Button>
            }
          />
        ) : paid ? (
          <div className="tm-card space-y-5 p-6">
            <p className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden /> Payment held in
              escrow
            </p>
            <p className="text-sm text-muted-foreground">
              Demo only — no real money moved. The seller can now ship. Funds release after you
              confirm receipt, or auto-release after the inspection window.
            </p>
            <EscrowStateTimeline status="PAYMENT_CONFIRMED" />
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/orders">Track this order</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/chat">Message the seller</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <section className="tm-card p-5">
                <h2 className="font-semibold">Payment method</h2>
                <RadioGroup
                  className="mt-4 space-y-3"
                  value={method}
                  onValueChange={setMethod}
                  aria-label="Payment method"
                >
                  {methods.map((m) => (
                    <Label
                      key={m.id}
                      htmlFor={m.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-primary"
                    >
                      <RadioGroupItem id={m.id} value={m.id} className="mt-0.5" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{m.label}</span>
                        <span className="block text-xs text-muted-foreground">{m.hint}</span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </section>

              <section className="rounded-xl border border-verified/30 bg-verified/5 p-5">
                <h2 className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="size-4 shrink-0 text-verified" aria-hidden /> How escrow
                  protects you
                </h2>
                <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>1. You pay TrustMart, not the seller.</li>
                  <li>2. The seller ships only after funds are confirmed held.</li>
                  <li>3. You inspect the item and confirm it matches the verified details.</li>
                  <li>4. Funds release to the seller, or you open a dispute.</li>
                </ol>
                <p className="mt-3 text-xs text-muted-foreground">
                  Never pay a seller directly or share an OTP — payments outside escrow are not
                  protected.
                </p>
              </section>
            </div>

            <aside className="tm-card h-fit space-y-4 p-5">
              <h2 className="font-semibold">Order summary</h2>
              <p className="text-sm text-muted-foreground">{query.data.listing.title}</p>
              <dl className="space-y-2 text-sm">
                <Row label="Item price" value={formatPKR(query.data.quote.pricePKR)} />
                <Row label="Escrow fee (1%)" value={formatPKR(query.data.quote.escrowFee)} />
                <Row label="Processing (0.5%)" value={formatPKR(query.data.quote.processingFee)} />
                <Row label="Verification fee" value={formatPKR(query.data.quote.verificationFee)} />
                <div className="border-t border-border pt-2">
                  <Row label="Total held in escrow" value={formatPKR(query.data.quote.totalPKR)} strong />
                </div>
              </dl>
              <Button className="w-full" onClick={() => setPaid(true)}>
                <Lock className="size-4" aria-hidden /> Pay into escrow
              </Button>
              <p className="text-xs text-muted-foreground">
                Demo checkout — no card is charged and no funds move.
              </p>
            </aside>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>{value}</dd>
    </div>
  );
}
