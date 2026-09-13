import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, TopBar, Section, Money } from "./app-shell";
import { AddButton, Field, SelectField, Modal, Empty, buttonClass, cardClass } from "./forms";
import { useStore, uid, demoToday, dateLabel, downloadText, type Bill } from "@/lib/store";
import { brlExact } from "@/lib/data";

export function FinancePage() {
  const { state } = useStore();
  const [periodMode, setPeriodMode] = useState<"month" | "year">("month");
  const [month, setMonth] = useState("2026-06");
  const [year, setYear] = useState("2026");
  const period = periodMode === "month" ? month : year;
  const years = [
    ...new Set([
      year,
      ...state.contas.map((bill) => bill.vencimento.slice(0, 4)),
      ...state.eventos.map((event) => event.date.slice(0, 4)),
    ]),
  ].sort((a, b) => b.localeCompare(a));
  const bills = state.contas.filter((c) => c.vencimento.startsWith(period));
  const income = bills.filter((c) => c.tipo === "receber").reduce((s, c) => s + c.pago, 0);
  const expense = bills.filter((c) => c.tipo === "pagar").reduce((s, c) => s + c.pago, 0);
  const receivable = bills
    .filter((c) => c.tipo === "receber")
    .reduce((s, c) => s + c.valor - c.pago, 0);
  const payable = bills.filter((c) => c.tipo === "pagar").reduce((s, c) => s + c.valor - c.pago, 0);
  const events = state.eventos.filter(
    (e) => e.date.startsWith(period) && !["Cancelado", "Orçamento"].includes(e.status),
  );
  const revenue = events.reduce((s, e) => s + e.total, 0);
  const costs = events.reduce((s, e) => s + e.custos, 0);
  const paidExpenses = bills.filter((c) => c.tipo === "pagar");
  const expenseCategories = [...new Set(paidExpenses.map((bill) => bill.categoria))]
    .map((name) => ({
      name,
      value: paidExpenses
        .filter((bill) => bill.categoria === name)
        .reduce((sum, bill) => sum + bill.pago, 0),
    }))
    .filter((category) => category.value > 0)
    .sort((a, b) => b.value - a.value);
  const paidExpenseTotal = expenseCategories.reduce((sum, category) => sum + category.value, 0);
  const clientResults = state.clientes
    .map((client) => {
      const clientEvents = events.filter((event) => event.clienteId === client.id);
      return {
        ...client,
        periodEvents: clientEvents.length,
        periodValue: clientEvents.reduce((sum, event) => sum + event.total, 0),
      };
    })
    .filter((client) => client.periodEvents > 0)
    .sort((a, b) => b.periodValue - a.periodValue);
  const recurrentClients = clientResults.filter((client) => client.recorrente).length;
  const averageTicket = events.length ? revenue / events.length : 0;
  const itemUsage = state.estoque
    .map((item) => ({
      name: item.nome,
      quantity: events.reduce(
        (total, event) =>
          total +
          event.itens
            .filter((line) => line.estoqueId === item.id)
            .reduce((sum, line) => sum + line.qtd, 0),
        0,
      ),
    }))
    .filter((item) => item.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);
  function exportSummary() {
    const rows = [
      ["Faturamento contratado", revenue],
      ["Lucro estimado", revenue - costs],
      ["Entradas recebidas", income],
      ["Despesas pagas", expense],
      ["A receber", receivable],
      ["A pagar", payable],
      ["Eventos contratados", events.length],
      ["Clientes atendidos", clientResults.length],
    ] as const;
    downloadText(
      "financeiro-" + period + ".csv",
      "\uFEFFPeríodo;Indicador;Valor\n" +
        rows
          .map(([label, value]) => period + ";" + label + ";" + String(value).replace(".", ","))
          .join("\n"),
      "text/csv;charset=utf-8",
    );
  }
  return (
    <AppShell>
      <TopBar title="Financeiro" />
      <div className="space-y-3 px-4 pt-4">
        <div className="rounded-xl bg-ink/5 p-1 ring-1 ring-inset ring-ink/10">
          <div className="grid grid-cols-2 gap-1">
            {(["month", "year"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={periodMode === mode}
                onClick={() => {
                  setPeriodMode(mode);
                  if (mode === "year") setYear(month.slice(0, 4));
                  else setMonth(`${year}-${month.slice(5)}`);
                }}
                className={`min-h-10 rounded-lg text-xs font-semibold transition-colors ${
                  periodMode === mode ? "bg-cream text-ink shadow-sm" : "text-ink/50"
                }`}
              >
                {mode === "month" ? "Mensal" : "Anual"}
              </button>
            ))}
          </div>
        </div>
        <label className="block space-y-1.5 text-xs font-medium">
          <span>{periodMode === "month" ? "Mês do relatório" : "Ano do relatório"}</span>
          {periodMode === "month" ? (
            <input
              aria-label="Mês do relatório"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-ink/20 bg-cream px-3 py-2 text-base outline-none focus:ring-2 focus:ring-brand"
            />
          ) : (
            <select
              aria-label="Ano do relatório"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-ink/20 bg-cream px-3 py-2 text-base outline-none focus:ring-2 focus:ring-brand"
            >
              {years.map((availableYear) => (
                <option key={availableYear} value={availableYear}>
                  {availableYear}
                </option>
              ))}
            </select>
          )}
        </label>
        <div className="rounded-xl bg-ink p-4 text-cream">
          <p className="text-xs text-cream/60">Saldo do período</p>
          <Money value={brlExact(income - expense)} className="my-2 block text-3xl" />
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-cream/15 pt-3">
            <div>
              <p className="text-xs text-cream/60">Entradas</p>
              <Money value={brlExact(income)} className="text-sm" />
            </div>
            <div>
              <p className="text-xs text-cream/60">Saídas</p>
              <Money value={brlExact(expense)} className="text-sm text-orange-300" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-brand/10 p-3 ring-1 ring-brand/30">
            <p className="text-xs">A receber</p>
            <Money value={brlExact(receivable)} className="mt-1 block text-lg" />
          </div>
          <div className="rounded-xl bg-accent/10 p-3 ring-1 ring-accent/30">
            <p className="text-xs">A pagar</p>
            <Money value={brlExact(payable)} className="mt-1 block text-lg" />
          </div>
        </div>
        <div className={cardClass}>
          <p className="flex justify-between gap-2 text-xs">
            Faturamento contratado <Money value={brlExact(revenue)} />
          </p>
          <p className="mt-3 flex justify-between gap-2 text-xs">
            Lucro estimado dos eventos <Money value={brlExact(revenue - costs)} />
          </p>
          <p className="mt-2 text-[11px] text-ink/50">
            Valor contratado menos custos estimados. Pode mudar até a festa acontecer.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            ["Eventos contratados", String(events.length)],
            ["Ticket médio", brlExact(averageTicket)],
            ["Clientes atendidos", String(clientResults.length)],
            ["Clientes recorrentes", String(recurrentClients)],
          ].map(([label, value]) => (
            <div key={label} className={cardClass}>
              <p className="text-[11px] text-ink/50">{label}</p>
              <p className="mt-1 font-mono text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-6 px-4 pb-6 pt-5">
        <section aria-labelledby="movimentacoes-relatorio">
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink/45">Relatório</p>
              <h2 id="movimentacoes-relatorio" className="text-sm font-semibold">
                Contas e movimentações
              </h2>
            </div>
            <span className="text-[10px] text-ink/45">Realizado · Pendente · Total</span>
          </div>
          <div className="overflow-hidden rounded-xl ring-1 ring-ink/15">
            {[
              ["Recebimentos", income, receivable, income + receivable],
              ["Pagamentos", expense, payable, expense + payable],
            ].map(([label, realized, pending, total], index) => (
              <div
                key={String(label)}
                className={`px-3 py-3 ${index ? "border-t border-ink/10" : ""}`}
              >
                <p className="mb-2 text-xs font-semibold">{label}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["Realizado", realized],
                    ["Pendente", pending],
                    ["Total", total],
                  ].map(([valueLabel, value]) => (
                    <div key={String(valueLabel)} className="min-w-0">
                      <p className="text-[9px] uppercase tracking-wide text-ink/40">{valueLabel}</p>
                      <Money
                        value={brlExact(Number(value))}
                        className={`mt-0.5 block truncate text-[11px] ${
                          valueLabel === "Total" ? "font-semibold" : "text-ink/65"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="resultado-eventos">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 id="resultado-eventos" className="text-sm font-semibold">
              Resultado dos eventos
            </h2>
            <span className="text-[11px] text-ink/45">{events.length} eventos</span>
          </div>
          {events.length ? (
            <div className="overflow-hidden rounded-xl ring-1 ring-ink/15">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 bg-ink/[0.035] px-3 py-2 text-[9px] font-semibold uppercase tracking-wide text-ink/45">
                <span>Evento</span>
                <span className="text-right">Lucro estimado</span>
              </div>
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 ${
                    index ? "border-t border-ink/10" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{event.tema}</p>
                    <p className="mt-0.5 truncate text-[10px] text-ink/50">
                      {event.cliente} · {dateLabel(event.date)}
                    </p>
                  </div>
                  <Money
                    value={brlExact(event.total - event.custos)}
                    className="text-xs text-brand"
                  />
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Nenhum evento neste período" />
          )}
        </section>

        <section aria-labelledby="clientes-periodo">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 id="clientes-periodo" className="text-sm font-semibold">
              Clientes no período
            </h2>
            <span className="text-[11px] text-ink/45">Por valor contratado</span>
          </div>
          {clientResults.length ? (
            <div className="overflow-hidden rounded-xl ring-1 ring-ink/15">
              {clientResults.map((client, index) => (
                <div
                  key={client.id}
                  className={`grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-2.5 px-3 py-3 ${
                    index ? "border-t border-ink/10" : ""
                  }`}
                >
                  <span className="font-mono text-[10px] text-ink/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{client.nome}</p>
                    <p className="mt-0.5 text-[10px] text-ink/50">
                      {client.periodEvents} {client.periodEvents === 1 ? "evento" : "eventos"}
                      {client.recorrente ? " · recorrente" : ""}
                    </p>
                  </div>
                  <Money value={brlExact(client.periodValue)} className="text-xs text-brand" />
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Nenhum cliente atendido neste período" />
          )}
        </section>

        <section aria-labelledby="despesas-categoria">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 id="despesas-categoria" className="text-sm font-semibold">
              Despesas por categoria
            </h2>
            <Money value={brlExact(paidExpenseTotal)} className="text-xs text-ink/55" />
          </div>
          {expenseCategories.length ? (
            <div className="overflow-hidden rounded-xl ring-1 ring-ink/15">
              {expenseCategories.map((category, index) => (
                <div
                  key={category.name}
                  className={`px-3 py-3 ${index ? "border-t border-ink/10" : ""}`}
                >
                  <div className="mb-2 flex justify-between gap-2 text-xs">
                    <span>{category.name}</span>
                    <Money value={brlExact(category.value)} />
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-accent/10">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: paidExpenseTotal
                          ? String((category.value / paidExpenseTotal) * 100) + "%"
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Nenhuma despesa paga neste período" />
          )}
        </section>

        <section aria-labelledby="itens-utilizados">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 id="itens-utilizados" className="text-sm font-semibold">
              Itens mais utilizados
            </h2>
            <span className="text-[11px] text-ink/45">Top 3</span>
          </div>
          {itemUsage.length ? (
            <div className="overflow-hidden rounded-xl ring-1 ring-ink/15">
              {itemUsage.map((item, index) => (
                <div
                  key={item.name}
                  className={`grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-2.5 px-3 py-3 ${
                    index ? "border-t border-ink/10" : ""
                  }`}
                >
                  <span className="font-mono text-[10px] text-ink/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="min-w-0 truncate text-xs">{item.name}</p>
                  <span className="font-mono text-xs font-semibold">{item.quantity} un.</span>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Nenhum item utilizado neste período" />
          )}
          <button type="button" onClick={exportSummary} className={buttonClass + " mt-4 w-full"}>
            Exportar relatório financeiro
          </button>
        </section>
      </div>
    </AppShell>
  );
}
export function PaymentForm({ bill, close }: { bill: Bill; close: () => void }) {
  const { update } = useStore();
  const [value, setValue] = useState(String(Number((bill.valor - bill.pago).toFixed(2))));
  const [method, setMethod] = useState(bill.forma);
  function save(e: FormEvent) {
    e.preventDefault();
    const amount = Number(value);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > Number((bill.valor - bill.pago).toFixed(2))
    )
      return;
    update((s) => {
      const current = s.contas.find((c) => c.id === bill.id);
      if (!current || amount > Number((current.valor - current.pago).toFixed(2))) return s;
      return {
        ...s,
        contas: s.contas.map((c) =>
          c.id === bill.id
            ? { ...c, pago: Number((c.pago + amount).toFixed(2)), forma: method }
            : c,
        ),
        eventos:
          bill.tipo === "receber"
            ? s.eventos.map((ev) =>
                ev.id === bill.eventoId
                  ? { ...ev, pago: Number((ev.pago + amount).toFixed(2)) }
                  : ev,
              )
            : s.eventos,
      };
    });
    toast.success(
      bill.tipo === "receber"
        ? "Recebimento registrado, Marcia!"
        : "Pagamento registrado. Tudo em dia!",
    );
    close();
  }
  return (
    <form className="space-y-3" onSubmit={save}>
      <p className="text-sm">
        {bill.nome} · pendente <b>{brlExact(bill.valor - bill.pago)}</b>
      </p>
      <Field
        label="Valor recebido/pago (R$)"
        type="number"
        step="0.01"
        min="0.01"
        max={Number((bill.valor - bill.pago).toFixed(2))}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <SelectField label="Forma de pagamento" value={method} onChange={setMethod}>
        {[
          ...new Set([
            bill.forma,
            "Pix",
            "Dinheiro",
            "Débito",
            "Crédito",
            "Boleto",
            "Transferência",
          ]),
        ].map((m) => (
          <option key={m}>{m}</option>
        ))}
      </SelectField>
      <button className={buttonClass + " w-full"}>Confirmar registro</button>
    </form>
  );
}
function NewBill({ type, close }: { type: Bill["tipo"]; close: () => void }) {
  const { state, update } = useStore();
  const [eventId, setEventId] = useState("");
  const [method, setMethod] = useState("Pix");
  const [category, setCategory] = useState(type === "receber" ? "Eventos" : "Compras");
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const total = Number(f.get("valor"));
    const count = Number(f.get("parcelas"));
    const due = String(f.get("data"));
    const name = String(f.get("nome")).trim();
    if (
      !name ||
      !Number.isFinite(total) ||
      total <= 0 ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > 24 ||
      Math.round(total * 100) < count
    ) {
      toast.error("Confira o valor e a quantidade de parcelas.");
      return;
    }
    const cents = Math.round(total * 100);
    const each = Math.floor(cents / count);
    const base = new Date(due + "T12:00:00");
    const bills: Bill[] = Array.from({ length: count }, (_, i) => {
      const date = new Date(base.getFullYear(), base.getMonth() + i, 1, 12);
      date.setDate(
        Math.min(base.getDate(), new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()),
      );
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return {
        id: uid(),
        nome: count > 1 ? `${name} · ${i + 1}/${count}` : name,
        tipo: type,
        categoria: category,
        valor: (each + (i === count - 1 ? cents - each * count : 0)) / 100,
        pago: 0,
        vencimento: iso,
        forma: method,
        eventoId: eventId || undefined,
      };
    });
    update((s) => ({ ...s, contas: [...s.contas, ...bills] }));
    toast.success(count > 1 ? "Parcelamento criado" : "Conta adicionada");
    close();
  }
  return (
    <form onSubmit={save} className="space-y-3">
      <Field
        label={type === "receber" ? "Cliente / descrição" : "Fornecedor / descrição"}
        name="nome"
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="Valor total (R$)"
          name="valor"
          type="number"
          min="0.01"
          step="0.01"
          required
        />
        <Field
          label="Parcelas"
          name="parcelas"
          type="number"
          min="1"
          max="24"
          defaultValue="1"
          required
        />
      </div>
      <Field
        label="Primeiro vencimento"
        type="date"
        name="data"
        defaultValue={demoToday}
        required
      />
      <SelectField label="Categoria" value={category} onChange={setCategory}>
        {(type === "receber"
          ? ["Eventos", "Outras receitas"]
          : ["Compras", "Deslocamento", "Fixo", "Manutenção", "Mão de obra", "Outros"]
        ).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </SelectField>
      <SelectField label="Forma de pagamento" value={method} onChange={setMethod}>
        {["Pix", "Dinheiro", "Débito", "Crédito", "Boleto", "Transferência"].map((m) => (
          <option key={m}>{m}</option>
        ))}
      </SelectField>
      {type === "pagar" && (
        <SelectField
          label="Evento relacionado (opcional)"
          required={false}
          value={eventId}
          onChange={setEventId}
        >
          <option value="">Sem vínculo</option>
          {state.eventos
            .filter((e) => e.status !== "Cancelado")
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.tema}
              </option>
            ))}
        </SelectField>
      )}
      {type === "receber" && (
        <p className="text-xs text-ink/55">
          Para receber um evento já contratado, use a conta gerada pelo orçamento. Aqui você
          adiciona outras receitas.
        </p>
      )}
      <p className="text-xs text-ink/55">
        Parcelas mensais, com ajuste para o último dia de cada mês.
      </p>
      <button className={buttonClass + " w-full"}>Salvar conta</button>
    </form>
  );
}
export function BillsPage({ type }: { type: Bill["tipo"] }) {
  const { state } = useStore();
  const [filter, setFilter] = useState("Pendentes");
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState<Bill | null>(null);
  const [open, setOpen] = useState(false);
  const list = state.contas
    .filter(
      (c) =>
        c.tipo === type &&
        c.nome.toLowerCase().includes(search.toLowerCase()) &&
        (filter === "Todas" ||
          (filter === "Quitadas"
            ? c.pago >= c.valor
            : c.pago < c.valor && (filter !== "Atrasadas" || c.vencimento < demoToday))),
    )
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  const pending = state.contas
    .filter((c) => c.tipo === type)
    .reduce((s, c) => s + c.valor - c.pago, 0);
  return (
    <AppShell>
      <TopBar
        title={type === "receber" ? "Contas a receber" : "Contas a pagar"}
        back={{ to: "/financeiro", label: "Financeiro" }}
        right={<AddButton label="Adicionar conta" onClick={() => setOpen(true)} />}
      />
      <div className="space-y-3 px-4 pt-4">
        <div className={`rounded-xl p-4 ${type === "receber" ? "bg-brand/10" : "bg-accent/10"}`}>
          <p className="text-xs text-ink/60">Total pendente · todos os períodos</p>
          <Money value={brlExact(pending)} className="mt-1 block text-2xl" />
        </div>
        <Field
          label="Buscar conta"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nome ou descrição"
        />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {["Pendentes", "Atrasadas", "Quitadas", "Todas"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`min-h-11 shrink-0 rounded-full px-3 text-xs ${filter === f ? "bg-ink text-cream" : "ring-1 ring-inset ring-ink/20"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-ink/50">
          Vencimentos comparados à data da demonstração: 14/06/2026.
        </p>
        {list.map((c) => (
          <div key={c.id} className={cardClass}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">{c.nome}</p>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${c.pago >= c.valor ? "bg-brand/10 text-brand" : c.vencimento < demoToday ? "bg-accent/10 text-accent" : "bg-ink/5"}`}
              >
                {c.pago >= c.valor
                  ? "Quitada"
                  : c.vencimento < demoToday
                    ? "Atrasada"
                    : c.vencimento === demoToday
                      ? "Vence hoje"
                      : c.pago > 0
                        ? "Parcial"
                        : "Em dia"}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink/55">
              {dateLabel(c.vencimento)} · {c.forma} · {c.categoria}
            </p>
            {c.eventoId && (
              <Link
                to="/eventos/$id"
                params={{ id: c.eventoId }}
                className="mt-2 block text-xs text-brand underline"
              >
                Ver financeiro do evento
              </Link>
            )}
            <div className="mt-3 flex justify-between text-xs">
              <span>Valor {brlExact(c.valor)}</span>
              <span>Pago {brlExact(c.pago)}</span>
            </div>
            {c.pago < c.valor && (
              <button onClick={() => setPayment(c)} className={buttonClass + " mt-3 w-full"}>
                {type === "receber" ? "Registrar recebimento" : "Registrar pagamento"} ·{" "}
                {brlExact(c.valor - c.pago)}
              </button>
            )}
          </div>
        ))}
        {!list.length && (
          <Empty title="Tudo tranquilo por aqui" text="Nenhuma conta corresponde a este filtro." />
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Nova conta">
        <NewBill type={type} close={() => setOpen(false)} />
      </Modal>
      <Modal
        open={!!payment}
        onClose={() => setPayment(null)}
        title={type === "receber" ? "Registrar recebimento" : "Registrar pagamento"}
      >
        {payment && <PaymentForm bill={payment} close={() => setPayment(null)} />}
      </Modal>
    </AppShell>
  );
}
export function CashFlowPage() {
  const { state } = useStore();
  const [year, setYear] = useState("2026");
  const rows = Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, "0")}`;
    const bills = state.contas.filter((c) => c.vencimento.startsWith(month));
    return {
      month,
      label: new Date(Number(year), i, 1).toLocaleDateString("pt-BR", { month: "short" }),
      entrada: bills.filter((c) => c.tipo === "receber").reduce((s, c) => s + c.pago, 0),
      saida: bills.filter((c) => c.tipo === "pagar").reduce((s, c) => s + c.pago, 0),
      previsto: bills.reduce((s, c) => s + (c.tipo === "receber" ? 1 : -1) * (c.valor - c.pago), 0),
    };
  });
  const max = Math.max(1, ...rows.flatMap((r) => [r.entrada, r.saida]));
  let balance = 0;
  return (
    <AppShell>
      <TopBar title="Fluxo de caixa" back={{ to: "/financeiro", label: "Financeiro" }} />
      <div className="space-y-3 px-4 pt-4">
        <SelectField label="Ano" value={year} onChange={setYear}>
          {[
            ...new Set([
              "2025",
              "2026",
              "2027",
              ...state.contas.map((c) => c.vencimento.slice(0, 4)),
            ]),
          ]
            .sort()
            .map((y) => (
              <option key={y}>{y}</option>
            ))}
        </SelectField>
        <p className="text-xs text-ink/55">
          Agrupado pelo vencimento das contas. Saldo acumulado do ano, com saldo inicial zero.
        </p>
        <div className="flex gap-4 text-xs">
          <span className="text-brand">● Entradas recebidas</span>
          <span className="text-accent">● Saídas pagas</span>
        </div>
        {rows.map((r) => {
          balance += r.entrada - r.saida;
          return (
            <div key={r.month} className={cardClass}>
              <div className="mb-3 flex justify-between text-sm font-semibold">
                <span className="capitalize">{r.label}</span>
                <Money value={brlExact(r.entrada - r.saida)} />
              </div>
              <div className="mb-1 h-2 rounded bg-brand/10">
                <div
                  className="h-2 rounded bg-brand"
                  style={{ width: `${(r.entrada / max) * 100}%` }}
                />
              </div>
              <div className="mb-3 h-2 rounded bg-accent/10">
                <div
                  className="h-2 rounded bg-accent"
                  style={{ width: `${(r.saida / max) * 100}%` }}
                />
              </div>
              <p className="text-xs text-ink/60">
                Entradas {brlExact(r.entrada)} · saídas {brlExact(r.saida)}
              </p>
              <p className="mt-1 text-xs">Acumulado: {brlExact(balance)}</p>
              <p className="mt-1 text-xs text-ink/60">
                Ainda previsto no mês: {brlExact(r.previsto)}
              </p>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
