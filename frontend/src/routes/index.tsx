import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Lock, MessageSquareWarning, Search, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingCard } from "@/components/listing/ListingCard";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/shell/StateBlock";
import { useCategories, useListings } from "@/lib/api/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrustMart — Pakistan's verified, escrow-protected marketplace" },
      {
        name: "description",
        content:
          "Browse verified listings with IMEI, serial and registration checks. Pay through escrow and get a digital ownership certificate.",
      },
      { property: "og:title", content: "TrustMart — verified listings, escrow payments" },
      {
        property: "og:description",
        content: "Every seller can be verified. Every payment can be escrow-protected.",
      },
    ],
  }),
  component: Home,
});

const trustSteps = [
  {
    icon: ShieldCheck,
    title: "Sellers are identity-checked",
    body: "CNIC and live face verification before a Verified Seller badge is issued.",
  },
  {
    icon: BadgeCheck,
    title: "Products are field-verified",
    body: "IMEI, serial number and registration are checked against evidence — field by field.",
  },
  {
    icon: Lock,
    title: "Payments sit in escrow",
    body: "Money is released only after you confirm the item matches what was verified.",
  },
  {
    icon: MessageSquareWarning,
    title: "Chat is scam-monitored",
    body: "Advance-payment, OTP and phishing patterns are flagged inside the conversation.",
  },
];

function Home() {
  const listingsQuery = useListings({});
  const categoriesQuery = useCategories();

  return (
    <PublicLayout>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1440px] px-4 py-14 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" aria-hidden /> Escrow-protected marketplace
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-5xl">
              Buy what was actually verified — not just what was claimed.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              TrustMart shows Seller-Claimed and Platform-Verified information side by side, holds
              your payment in escrow, and issues a digital ownership certificate when the sale
              completes.
            </p>
            <form
              className="mt-8 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="relative">
                <Search
                  className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  className="h-12 ps-9"
                  placeholder="Search phones, cars, laptops by model or IMEI"
                  aria-label="Search listings"
                />
              </div>
              <Button size="lg" className="h-12" asChild>
                <Link to="/browse">Search verified listings</Link>
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {(categoriesQuery.data ?? []).map((category) => (
                <Link
                  key={category.id}
                  to="/browse"
                  className="rounded-full border border-border bg-background px-3 py-1 hover:border-primary hover:text-primary"
                >
                  {category.nameEn}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 lg:px-8">
        <h2 className="text-xl font-bold">How TrustMart keeps you safe</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustSteps.map((step) => (
            <article key={step.title} className="tm-card p-5">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Featured verified listings</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/browse">View all</Link>
          </Button>
        </div>
        <div className="mt-5">
          {listingsQuery.isPending ? (
            <LoadingBlock rows={2} />
          ) : listingsQuery.isError ? (
            <ErrorBlock
              title="Listings didn't load"
              description="The marketplace feed could not be reached."
              onRetry={() => listingsQuery.refetch()}
            />
          ) : (listingsQuery.data ?? []).length === 0 ? (
            <EmptyBlock
              title="No featured listings yet"
              description="Verified listings will appear here as sellers complete verification."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(listingsQuery.data ?? []).map((listing) => {
                const verifiedFields = (listing.verifiedFields ?? {}) as Record<string, string>;
                const verifiedField =
                  Object.entries(verifiedFields).find(([, state]) => state.startsWith("verified"))?.[0] ?? null;
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
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
