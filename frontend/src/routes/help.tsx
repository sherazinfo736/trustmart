import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Center — TrustMart" },
      { name: "description", content: "Answers grouped by buying, selling, escrow, disputes and verification" },
      { property: "og:title", content: "Help Center — TrustMart" },
      { property: "og:description", content: "Answers grouped by buying, selling, escrow, disputes and verification" },
    ],
  }),
  component: Page,
});

const sections = [
  { title: "Buying", body: "How to read Claimed vs Verified, how escrow release works, when you can dispute." },
  { title: "Selling", body: "Verification requirements, listing pre-checks, payout timelines." },
  { title: "Escrow", body: "Fee breakdown, auto-release windows, blocked releases." },
  { title: "Disputes", body: "Evidence windows, who decides, possible outcomes." },
  { title: "Verification", body: "What documents are needed and what happens if verification is rejected." },
];

function Page() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <PageHeader title="Help Center" description="Answers grouped by buying, selling, escrow, disputes and verification" />
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
