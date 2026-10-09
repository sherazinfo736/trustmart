import { Download, QrCode, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/currency";
import type { DigitalCertificate } from "@/types";

export function CertificateCard({ certificate }: { certificate: DigitalCertificate }) {
  return (
    <article className="tm-card overflow-hidden">
      <header className="flex items-start justify-between gap-4 border-b border-border bg-muted/50 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Digital Transaction Certificate
          </p>
          <h3 className="truncate font-semibold">{certificate.certificateNumber}</h3>
        </div>
        <div className="grid size-16 shrink-0 place-items-center rounded-md border border-border bg-card">
          <QrCode className="size-10 text-foreground" aria-hidden />
        </div>
      </header>
      <dl className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Item</dt>
          <dd className="font-medium">{certificate.itemTitle}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Amount</dt>
          <dd className="font-medium tabular-nums">{formatPKR(certificate.amountPKR)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Order</dt>
          <dd className="font-medium">{certificate.orderId}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Issued</dt>
          <dd className="font-medium">
            {new Date(certificate.issuedAt).toLocaleDateString("en-PK")}
          </dd>
        </div>
      </dl>
      <footer className="flex flex-wrap gap-2 border-t border-border px-5 py-4">
        <Button size="sm">
          <Download className="size-4" aria-hidden /> Download PDF (demo)
        </Button>
        <Button size="sm" variant="outline">
          <Share2 className="size-4" aria-hidden /> Copy verification link
        </Button>
      </footer>
    </article>
  );
}