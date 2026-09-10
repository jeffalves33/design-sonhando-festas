import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, TopBar, Section, Money } from "@/components/app-shell";
import { Field, Empty, buttonClass, cardClass } from "@/components/forms";
import { useStore, downloadText } from "@/lib/store";
import { brlExact } from "@/lib/data";
export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios · Sonhando Festas" }] }),
  component: Reports,
});
function Reports() {
  const { state } = useStore();
  const [month, setMonth] = useState("2026-06");
  const events = state.eventos.filter((e) => e.date.startsWith(month));
  const approved = events.filter((e) => !["Orçamento", "Cancelado"].includes(e.status));
  const revenue = approved.reduce((s, e) => s + e.total, 0);
  const costs = approved.reduce((s, e) => s + e.custos, 0);
  const bills = state.contas.filter((c) => c.tipo === "pagar" && c.vencimento.startsWith(month));
  const categories = [...new Set(bills.map((c) => c.categoria))]
    .map((name) => ({
      name,
      value: bills.filter((c) => c.categoria === name).reduce((s, c) => s + c.pago, 0),
    }))
    .sort((a, b) => b.value - a.value);
  const expenses = categories.reduce((s, c) => s + c.value, 0);
  const recurrent = state.clientes.filter(
    (c) => c.recorrente && approved.some((e) => e.clienteId === c.id),
  ).length;
  const usage = state.estoque
    .map((i) => ({
      name: i.nome,
      qtd: approved.reduce(
        (s, e) =>
          s +
          e.itens
            .filter((line) => line.estoqueId === i.id)
            .reduce((sum, line) => sum + line.qtd, 0),
        0,
      ),
    }))
    .filter((i) => i.qtd > 0)
    .sort((a, b) => b.qtd - a.qtd);
  const metrics: [[string, number], ...Array<[string, number]>] = [
    ["Faturamento contratado", revenue],
    ["Lucro estimado", revenue - costs],
    ["Despesas pagas", expenses],
    ["Eventos realizados", events.filter((e) => e.status === "Realizado").length],
    ["Orçamentos aprovados", approved.length],
    ["Clientes recorrentes", recurrent],
  ];
  function exportReport() {
    downloadText(
      `relatorio-${month}.csv`,
      "\uFEFFPeríodo;Indicador;Valor\n" +
        metrics.map(([l, v]) => `${month};${l};${v.toFixed(2).replace(".", ",")}`).join("\n"),
      "text/csv;charset=utf-8",
    );
  }
  return (
    <AppShell>
      <TopBar
        title="Relatórios"
        overline="Seu trabalho em perspectiva"
        back={{ to: "/", label: "Início" }}
      />
      <div className="space-y-3 px-4 pt-4">
        <Field
          label="Mês dos eventos e vencimentos"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          {metrics.map(([name, value], i) => (
            <div key={name} className={cardClass + (i === 0 ? " bg-ink text-cream" : "")}>
              <p className="text-[11px] opacity-60">{name}</p>
              <Money
                value={i < 3 ? brlExact(value) : String(value)}
                className="mt-2 block text-lg"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-ink/50">
          Lucro estimado = valor contratado menos custos estimados dos eventos. Despesas pagas
          mostram as saídas efetivamente registradas.
        </p>
      </div>
      <Section title="Despesas por categoria">
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.name} className={cardClass}>
              <p className="mb-2 flex justify-between text-xs">
                <span>{c.name}</span>
                <Money value={brlExact(c.value)} />
              </p>
              <div className="h-2 rounded-full bg-accent/10">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${expenses ? (c.value / expenses) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
          {!categories.length && <Empty title="Sem despesas neste mês" />}
        </div>
      </Section>
      <Section title="Itens mais utilizados">
        <div className="space-y-2">
          {usage.map((i, index) => (
            <div className={cardClass + " flex items-center gap-3"} key={i.name}>
              <span className="font-mono text-brand">{String(index + 1).padStart(2, "0")}</span>
              <p className="flex-1 text-sm">{i.name}</p>
              <span className="font-mono text-xs">{i.qtd} un.</span>
            </div>
          ))}
          {!usage.length && <Empty title="Sem itens reservados neste mês" />}
        </div>
        <button onClick={exportReport} className={buttonClass + " mt-4 w-full"}>
          Exportar resumo em CSV
        </button>
      </Section>
    </AppShell>
  );
}
