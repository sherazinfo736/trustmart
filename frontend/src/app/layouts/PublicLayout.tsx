import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, MessageSquare, Package, ShieldCheck, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoDataBanner } from "@/components/trust/DemoDataBanner";
import { useI18n } from "@/lib/i18n";

const navItems = [
  { to: "/browse", key: "nav.browse" },
  { to: "/how-verification-works", key: "nav.howItWorks" },
  { to: "/trust-safety", key: "nav.trustSafety" },
  { to: "/report-scam", key: "nav.reportScam" },
] as const;

export function PublicLayout({ children }: { children: ReactNode }) {
  const { t, toggleLocale } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DemoDataBanner />
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:flex lg:justify-between lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold leading-none">TrustMart</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {t("brand.tagline")}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-muted text-foreground" }}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="sm" onClick={toggleLocale}>
              {t("lang.switch")}
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label={t("nav.chat")}>
              <Link to="/chat">
                <MessageSquare className="size-5" aria-hidden />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label={t("nav.orders")}>
              <Link to="/orders">
                <Package className="size-5" aria-hidden />
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/seller">{t("nav.sell")}</Link>
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-border bg-card px-4 py-3 lg:hidden">
            <nav className="flex flex-col">
              {[...navItems, { to: "/orders", key: "nav.orders" }, { to: "/chat", key: "nav.chat" }, { to: "/certificates", key: "nav.certificates" }].map(
                (item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {t(item.key)}
                  </Link>
                ),
              )}
            </nav>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="flex-1" asChild>
                <Link to="/seller" onClick={() => setMobileOpen(false)}>
                  {t("nav.sell")}
                </Link>
              </Button>
              <Button size="sm" variant="outline" onClick={toggleLocale}>
                {t("lang.switch")}
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div>
            <p className="font-bold">TrustMart</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Verified sellers, identity-checked products, escrow-protected payments.
            </p>
          </div>
          <FooterColumn
            title="Marketplace"
            links={[
              { to: "/browse", label: "Browse listings" },
              { to: "/categories", label: "All categories" },
              { to: "/pricing", label: "Boost & featured pricing" },
            ]}
          />
          <FooterColumn
            title="Trust"
            links={[
              { to: "/how-verification-works", label: "How verification works" },
              { to: "/trust-safety", label: "Trust & Safety Center" },
              { to: "/report-scam", label: "Report a scam" },
            ]}
          />
          <FooterColumn
            title="Support"
            links={[
              { to: "/help", label: "Help Center" },
              { to: "/contact", label: "Contact support" },
              { to: "/legal", label: "Legal & policies" },
            ]}
          />
        </div>
        <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground lg:px-8">
          © 2026 TrustMart · Prices in PKR · Times in Asia/Karachi
          <button onClick={toggleLocale} className="ms-2 underline">
            {t("lang.switch")}
          </button>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ to: string; label: string }>;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { Search };