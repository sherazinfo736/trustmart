import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/how-verification-works")({
  head: () => ({
    meta: [
      { title: "How verification works — TrustMart" },
      { name: "description", content: "Identity, product and payment verification explained" },
      { property: "og:title", content: "How verification works — TrustMart" },
      { property: "og:description", content: "Identity, product and payment verification explained" },
    ],
  }),
  component: Page,
});

const sections = [
  { title: "1. Seller identity", body: "The seller submits CNIC front/back plus a live face capture with liveness checks. Only after review does a Verified Seller badge appear." },
  { title: "2. Product fields", body: "Category-specific fields — IMEI for phones, serial for laptops, registration for vehicles — are checked against uploaded evidence. Each field carries its own Platform Verified badge." },
  { title: "3. Escrow payment", body: "Your payment is held by TrustMart, not the seller. It is released only after delivery is confirmed, or refunded if a dispute goes your way." },
  { title: "4. Ownership certificate", body: "When the order completes, a Digital Transaction Certificate with a QR verification link is issued to the buyer." },
];

function Page() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <PageHeader title="How verification works" description="Identity, product and payment verification explained" />
        <div className="space-y-4">
          {sections.map((section) => (
            <article key={section.title} className="tm-card p-5">
              <h2 className="font-semibold">{section.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{section.body}</p>
            </article>
          ))}
          {sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Category directory content is served from the CMS. Escrow eligibility and verifiable
              fields are shown per category once the API is connected.
            </p>
          ) : null}
        </div>
      </div>
    </PublicLayout>
  );
}
