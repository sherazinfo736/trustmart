import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/trust-safety")({
  head: () => ({
    meta: [
      { title: "Trust & Safety Center — TrustMart" },
      { name: "description", content: "Trust Score, escrow, certificates and scam protection" },
      { property: "og:title", content: "Trust & Safety Center — TrustMart" },
      { property: "og:description", content: "Trust Score, escrow, certificates and scam protection" },
    ],
  }),
  component: Page,
});

const sections = [
  { title: "Trust Score (0–100)", body: "Built from identity verification, order history, dispute outcomes, response behaviour and buyer reports. 80+ is strong, 50–79 is building, below 50 needs caution." },
  { title: "Escrow", body: "Funds are held until delivery is confirmed. High-risk seller accounts have release held for manual review." },
  { title: "Digital certificates", body: "Every completed order produces a portable certificate with ownership history." },
  { title: "Chat protection", body: "Advance-payment requests, OTP requests, phishing links and fake-courier patterns raise an in-chat warning." },
];

function Page() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <PageHeader title="Trust & Safety Center" description="Trust Score, escrow, certificates and scam protection" />
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
