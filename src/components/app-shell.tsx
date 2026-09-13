import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CalendarDays, Home, PartyPopper, Users, Wallet, type LucideIcon } from "lucide-react";
import { useStore } from "@/lib/store";

const tabs = [
  { to: "/", label: "Início", icon: Home },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/eventos", label: "Eventos", icon: PartyPopper },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { ready } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="riso min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-cream ring-1 ring-ink/10">
        <main className="flex-1 pb-24">
          {ready ? (
            children
          ) : (
            <div role="status" className="space-y-4 p-5">
              <img src="/logo.jpg" alt="Sonhando Festas" className="mx-auto size-20 rounded-xl" />
              <p className="text-center text-sm text-ink/60">Preparando tudo para você, Marcia…</p>
              <div className="h-40 animate-pulse rounded-xl bg-ink/10" />
              <div className="h-24 animate-pulse rounded-xl bg-ink/5" />
            </div>
          )}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] border-t-2 border-ink bg-cream px-2 pb-[env(safe-area-inset-bottom)] pt-2">
          <div className="flex items-stretch justify-between">
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 transition-colors ${
                    active ? "text-ink" : "text-ink/40"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                  <span className={`text-[10px] ${active ? "font-semibold" : ""}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function TopBar({
  title,
  right,
  back,
}: {
  title: string;
  right?: ReactNode;
  back?: { to: string; label?: string };
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/95 px-4 pb-3 pt-5 backdrop-blur">
      {back ? (
        <Link
          to={back.to}
          className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/50"
        >
          ← {back.label ?? "Voltar"}
        </Link>
      ) : null}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate pb-0.5 text-2xl font-semibold leading-[1.15] tracking-tight">
            {title}
          </h1>
        </div>
        {right ? <div className="flex min-h-10 shrink-0 items-center">{right}</div> : null}
      </div>
    </header>
  );
}

export const topBarActionClass =
  "grid size-10 shrink-0 place-items-center rounded-full bg-ink text-cream transition-colors hover:bg-ink/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function TopBarLinkAction({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link to={to} aria-label={label} title={label} className={topBarActionClass}>
      <Icon className="size-5" />
    </Link>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2 pt-4">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === value}
          onClick={() => onChange(option)}
          className={`min-h-9 shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold leading-4 ${
            option === value ? "bg-ink text-cream" : "text-ink/55 ring-1 ring-inset ring-ink/20"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="px-4 pt-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatusChip({ label, tone }: { label: string; tone: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${tone}`}>{label}</span>
  );
}

export function Progress({ value, tone = "bg-brand" }: { value: number; tone?: string }) {
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
      <span className={`block h-full ${tone}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function Money({ value, className = "" }: { value: string; className?: string }) {
  return <span className={`font-mono font-bold ${className}`}>{value}</span>;
}
