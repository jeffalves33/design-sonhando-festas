import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Boxes, CalendarDays, ClipboardList, PlusCircle } from "lucide-react";
import { AppShell, Money, Section, StatusChip } from "@/components/app-shell";
import { brl, statusTone } from "@/lib/data";
import { useStore, demoToday, conflicts, activeEvent } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sonhando Festas · Gestão de festas e eventos" },
      {
        name: "description",
        content:
          "App de gestão para festas e eventos: agenda, orçamentos personalizados, clientes, estoque e controle financeiro no celular.",
      },
      { property: "og:title", content: "Sonhando Festas · Gestão de festas e eventos" },
      {
        property: "og:description",
        content: "Agenda sem conflitos, orçamentos personalizados e financeiro sob controle.",
      },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  const { state } = useStore();
  const { eventos } = state;
  const contasReceber = state.contas.filter((c) => c.tipo === "receber");
  const contasPagar = state.contas.filter((c) => c.tipo === "pagar");
  const upcoming = eventos
    .filter((e) => activeEvent(e) && e.date >= demoToday)
    .sort((a, b) => (a.date + a.inicio).localeCompare(b.date + b.inicio));
  const proximo = upcoming[0];
  const aReceber = contasReceber.reduce((s, t) => s + (t.valor - t.pago), 0);
  const aPagar = contasPagar.reduce((s, c) => s + c.valor - c.pago, 0);
  const pendentes = eventos.filter((e) => e.status === "Orçamento");
  const clash = upcoming.find((e) => conflicts(e, eventos).length > 0);
  const monthBills = state.contas.filter((c) => c.vencimento.startsWith("2026-06"));
  const entrada = monthBills.filter((c) => c.tipo === "receber").reduce((s, c) => s + c.pago, 0);
  const saida = monthBills.filter((c) => c.tipo === "pagar").reduce((s, c) => s + c.pago, 0);

  return (
    <AppShell>
      <header className="px-4 pb-3 pt-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">
              Domingo, 14 Jun · demonstração
            </p>
            <h1 className="truncate pb-0.5 text-2xl font-semibold leading-[1.15] tracking-tight">
              Bom dia, {state.perfil.nome.split(" ")[0]}
            </h1>
          </div>
          <Link to="/configuracoes" aria-label="Perfil e configurações de Marcia">
            <img
              src="/logo.jpg"
              alt="Sonhando Festas"
              className="size-20 shrink-0 rounded-lg object-contain ring-1 ring-ink/10"
            />
          </Link>
        </div>
      </header>

      <div className="px-4">
        <section aria-labelledby="acoes-principais" className="mb-4">
          <h2 id="acoes-principais" className="mb-2 text-sm font-semibold">
            O que você precisa fazer?
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/orcamentos/novo"
              className="flex min-h-20 items-center gap-3 rounded-xl bg-ink p-3 text-cream"
            >
              <PlusCircle className="size-5 shrink-0" />
              <span className="text-sm font-semibold">Novo orçamento</span>
            </Link>
            <Link
              to="/orcamentos"
              className="flex min-h-20 items-center gap-3 rounded-xl p-3 ring-1 ring-inset ring-ink/15"
            >
              <ClipboardList className="size-5 shrink-0 text-brand" />
              <span className="text-sm font-semibold">Orçamentos ({pendentes.length})</span>
            </Link>
            <Link
              to="/estoque"
              className="flex min-h-20 items-center gap-3 rounded-xl p-3 ring-1 ring-inset ring-ink/15"
            >
              <Boxes className="size-5 shrink-0 text-brand" />
              <span className="text-sm font-semibold">Catálogo e estoque</span>
            </Link>
            <Link
              to="/agenda"
              className="flex min-h-20 items-center gap-3 rounded-xl p-3 ring-1 ring-inset ring-ink/15"
            >
              <CalendarDays className="size-5 shrink-0 text-brand" />
              <span className="text-sm font-semibold">Ver agenda</span>
            </Link>
          </div>
        </section>

        {clash && (
          <Link
            to="/agenda"
            className="mb-3 flex items-center gap-2.5 rounded-lg bg-accent/10 px-3 py-2 ring-1 ring-accent/40"
          >
            <AlertTriangle className="size-4 shrink-0 text-accent" />
            <p className="text-[12px] leading-snug">
              Conflito de operação: <b>{clash.cliente}</b> e{" "}
              <b>
                {conflicts(clash, eventos)
                  .map((e) => e.cliente)
                  .join(", ")}
              </b>
              . Confira a agenda.
            </p>
          </Link>
        )}

        {proximo ? (
          <Link
            to="/eventos/$id"
            params={{ id: proximo.id }}
            className="mb-3 block rounded-xl bg-ink p-3.5 text-cream"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cream/60">
                Próximo evento
              </span>
              <span className="font-mono text-[11px] text-accent">
                {proximo.date === demoToday ? "HOJE" : proximo.dataCurta}
              </span>
            </div>
            <p className="text-lg font-semibold leading-tight">
              {proximo.tipo} · {proximo.cliente}
            </p>
            <p className="mt-1 text-[12px] text-cream/70">
              {proximo.inicio} · {proximo.local}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="rounded-full bg-cream/15 px-2.5 py-1 text-[10px] font-medium">
                {proximo.status}
              </span>
              <Money value={brl(proximo.total)} className="ml-auto text-[11px] text-cream/70" />
            </div>
          </Link>
        ) : (
          <p className="mb-3 rounded-xl bg-ink/5 p-4 text-sm">
            Sua agenda está livre para novos sonhos. Crie um orçamento para começar.
          </p>
        )}

        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <Link
            to="/financeiro/receber"
            className="rounded-lg bg-brand/12 p-3 ring-1 ring-brand/30"
          >
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/50">A receber</p>
            <Money value={brl(aReceber)} className="mt-1 block text-xl leading-none" />
          </Link>
          <Link
            to="/financeiro/pagar"
            className="rounded-lg bg-accent/12 p-3 ring-1 ring-accent/30"
          >
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/50">Contas vencendo</p>
            <Money value={brl(aPagar)} className="mt-1 block text-xl leading-none" />
          </Link>
        </div>

        <div className="mb-3 rounded-lg p-3 ring-1 ring-ink/15">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.14em] text-ink/50">
              Resumo do mês
            </span>
            <span className="font-mono text-[11px] text-ink/60">Jun/26</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-ink/50">Saldo</p>
              <Money value={brl(entrada - saida)} className="text-2xl leading-none" />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-ink/50">Entrada</p>
              <Money value={`+${brl(entrada)}`} className="text-sm text-brand" />
              <p className="mt-1 text-[10px] text-ink/50">Saída</p>
              <Money value={`−${brl(saida)}`} className="text-sm text-accent" />
            </div>
          </div>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-ink/10">
            <span
              className="inline-block h-full bg-brand"
              style={{ width: `${entrada + saida ? (entrada / (entrada + saida)) * 100 : 0}%` }}
            />
            <span
              className="inline-block h-full bg-accent"
              style={{ width: `${entrada + saida ? (saida / (entrada + saida)) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <Section
        title="Eventos do dia"
        action={
          <Link to="/agenda" className="text-[11px] text-ink/50">
            ver agenda
          </Link>
        }
      >
        <div className="space-y-2">
          {eventos
            .filter((e) => e.date === demoToday && activeEvent(e))
            .map((e) => (
              <Link
                key={e.id}
                to="/eventos/$id"
                params={{ id: e.id }}
                className="flex items-center gap-3 rounded-lg p-3 ring-1 ring-ink/15"
              >
                <span className="font-mono text-[11px] text-ink/60">{e.inicio}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">
                    {e.tipo} · {e.cliente}
                  </p>
                  <p className="truncate text-[11px] text-ink/50">{e.local}</p>
                </div>
                <StatusChip label={e.status} tone={statusTone[e.status]} />
              </Link>
            ))}
        </div>
      </Section>

      <Section
        title="Orçamentos pendentes"
        action={
          <Link to="/orcamentos/novo" className="text-[11px] font-semibold text-brand">
            novo
          </Link>
        }
      >
        <div className="space-y-2">
          {pendentes.map((e) => (
            <Link
              key={e.id}
              to="/orcamentos/$id"
              params={{ id: e.id }}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 ring-1 ring-ink/15"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">{e.cliente}</p>
                <p className="text-[11px] text-ink/50">Aguardando aprovação · {e.tipo}</p>
              </div>
              <Money value={brl(e.total)} className="text-sm text-brand" />
            </Link>
          ))}
          {!pendentes.length && (
            <p className="rounded-lg bg-ink/5 p-3 text-xs text-ink/60">
              Nenhuma proposta aguardando aprovação. Tudo acompanhado!
            </p>
          )}
        </div>
      </Section>
    </AppShell>
  );
}
