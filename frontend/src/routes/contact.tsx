import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact support — TrustMart" },
      { name: "description", content: "Reach the TrustMart support team" },
      { property: "og:title", content: "Contact support — TrustMart" },
      { property: "og:description", content: "Reach the TrustMart support team" },
    ],
  }),
  component: Page,
});

const sections = [
  { title: "Support hours", body: "Every day, 9am–11pm (Asia/Karachi)." },
  { title: "Ticket lookup", body: "Enter a ticket number to check the current status of an open request." },
  { title: "Escalations", body: "Fraud and escrow escalations are routed to the platform operations team." },
];

function Page() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <PageHeader title="Contact support" description="Reach the TrustMart support team" />
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
