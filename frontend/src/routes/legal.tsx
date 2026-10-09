import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal & policies — TrustMart" },
      { name: "description", content: "Terms, privacy, refunds, cookies and acceptable use" },
      { property: "og:title", content: "Legal & policies — TrustMart" },
      { property: "og:description", content: "Terms, privacy, refunds, cookies and acceptable use" },
    ],
  }),
  component: Page,
});

const sections = [
  { title: "Terms of Service", body: "The agreement covering marketplace use, escrow and certificates." },
  { title: "Privacy Policy", body: "How identity documents and verification evidence are stored and retained." },
  { title: "Refund Policy", body: "When escrow refunds apply and how dispute decisions are executed." },
  { title: "Cookie Policy", body: "Cookies used for session, language preference and fraud prevention." },
  { title: "Acceptable Use", body: "Prohibited items, stolen-goods reporting and account suspension rules." },
];

function Page() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <PageHeader title="Legal & policies" description="Terms, privacy, refunds, cookies and acceptable use" />
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
