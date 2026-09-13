import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  AppShell,
  FilterChips,
  Money,
  StatusChip,
  TopBar,
  TopBarLinkAction,
} from "@/components/app-shell";
import { brlExact as brl, statusTone, type EventStatus } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/eventos/")({
  head: () => ({
    meta: [
      { title: "Eventos · Sonhando Festas" },
      {
        name: "description",
        content:
          "Lista de eventos com status, valores contratados, pagamentos e custos de cada festa.",
      },
      { property: "og:title", content: "Eventos · Sonhando Festas" },
      { property: "og:description", content: "Do orçamento ao evento realizado, em um só lugar." },
    ],
  }),
  component: Eventos,
});

const filtros: (EventStatus | "Todos")[] = [
  "Todos",
  "Confirmado",
  "Em preparação",
  "Realizado",
  "Cancelado",
];

function Eventos() {
  const {
    state: { eventos },
  } = useStore();
  const [filtro, setFiltro] = useState<EventStatus | "Todos">("Todos");
  const lista = eventos.filter(
    (e) => e.status !== "Orçamento" && (filtro === "Todos" || e.status === filtro),
  );

  return (
    <AppShell>
      <TopBar
        title="Eventos"
        right={<TopBarLinkAction to="/orcamentos/novo" label="Novo orçamento" icon={Plus} />}
      />

      <FilterChips options={filtros} value={filtro} onChange={setFiltro} />

      <div className="space-y-2.5 px-4 pt-2">
        {lista.map((e) => {
          const pendente = e.total - e.pago;
          return (
            <Link
              key={e.id}
              to="/eventos/$id"
              params={{ id: e.id }}
              className="block rounded-xl p-3.5 ring-1 ring-ink/15"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-ink/60">
                  {e.dataCurta} · {e.inicio}
                </span>
                <StatusChip label={e.status} tone={statusTone[e.status]} />
              </div>
              <p className="text-base font-semibold leading-tight">
                {e.tipo} · {e.cliente}
              </p>
              <p className="mt-1 text-[12px] text-ink/55">
                {e.tema} · {e.local}
              </p>
              <div className="mt-2.5 flex items-center justify-between border-t border-ink/10 pt-2.5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-ink/45">Total</p>
                  <Money value={brl(e.total)} className="text-sm" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-ink/45">Pendente</p>
                  <Money
                    value={brl(pendente)}
                    className={`text-sm ${pendente > 0 ? "text-accent" : "text-brand"}`}
                  />
                </div>
              </div>
            </Link>
          );
        })}

        {lista.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/25 px-4 py-10 text-center">
            <p className="text-[13px] font-semibold">Nenhum evento neste filtro</p>
            <p className="mt-1 text-[12px] text-ink/50">
              Crie um orçamento para começar um novo evento.
            </p>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
