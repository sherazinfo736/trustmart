import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All categories — TrustMart" },
      { name: "description", content: "Every category and the fields TrustMart can verify" },
      { property: "og:title", content: "All categories — TrustMart" },
      { property: "og:description", content: "Every category and the fields TrustMart can verify" },
    ],
  }),
  component: Page,
});

const sections: { title: string; body: string }[] = [];

function Page() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <PageHeader title="All categories" description="Every category and the fields TrustMart can verify" />
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
