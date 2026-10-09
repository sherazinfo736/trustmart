import { useState, type ComponentType, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoDataBanner } from "@/components/trust/DemoDataBanner";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { can, type PermissionKey } from "@/lib/permissions/can";
import type { User } from "@/types";

export type NavEntry = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  permission?: PermissionKey;
};

export function DashboardLayout({
  surface,
  surfaceLabel,
  user,
  nav,
  children,
}: {
  surface: "seller" | "admin";
  surfaceLabel: string;
  user: User;
  nav: NavEntry[];
  children: ReactNode;
}) {
  const { t, toggleLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const visible = nav.filter((item) => !item.permission || can(user, item.permission));

  return (
    <div className={cn("min-h-screen bg-background", surface === "admin" && "dark")}>
      <DemoDataBanner />
      <div className="flex">
        <aside
          className={cn(
            "fixed inset-y-0 z-50 w-64 shrink-0 border-e border-sidebar-border bg-sidebar transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0",
          )}
        >
          <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <ShieldCheck className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-sidebar-foreground">TrustMart</p>
              <p className="truncate text-[11px] text-muted-foreground">{surfaceLabel}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-0.5 p-2">
            {visible.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                activeProps={{
                  className: "bg-sidebar-primary/12 text-sidebar-primary",
                }}
                activeOptions={{ exact: item.to === `/${surface}` }}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-3">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden />
              Back to marketplace
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Toggle navigation"
              onClick={() => setOpen((prev) => !prev)}
            >
              <Menu className="size-4" />
            </Button>
            <p className="min-w-0 truncate text-sm font-semibold">{surfaceLabel}</p>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleLocale}>
                {t("lang.switch")}
              </Button>
              <div className="hidden text-end sm:block">
                <p className="text-xs font-semibold leading-tight">{user.fullName}</p>
                <p className="text-[11px] text-muted-foreground">{user.role.replace(/_/g, " ")}</p>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}