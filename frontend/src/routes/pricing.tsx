import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Boost & featured pricing — TrustMart" },
      { name: "description", content: "Paid visibility tiers for verified sellers" },
      { property: "og:title", content: "Boost & featured pricing — TrustMart" },
      { property: "og:description", content: "Paid visibility tiers for verified sellers" },
    ],
  }),
  component: Page,
});

const sections = [
  { title: "Standard — free", body: "Published after automated pre-check. Appears in search and category browse." },
  { title: "Boost — PKR 1,500 / 7 days", body: "Higher placement in category browse plus a Boosted label." },
  { title: "Featured — PKR 4,000 / 14 days", body: "Home page featured rail, top of search for matching queries." },
  { title: "Store subscription — PKR 9,000 / month", body: "Business store page, bulk listing tools and team accounts." },
];

function Page() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <PageHeader title="Boost & featured pricing" description="Paid visibility tiers for verified sellers" />
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
