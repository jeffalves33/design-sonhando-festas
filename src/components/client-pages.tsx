import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, FileText, Heart, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell, TopBar, Section, Money, StatusChip } from "./app-shell";
import { AddButton, Field, Notes, Modal, Empty, buttonClass, cardClass } from "./forms";
import { useStore, uid, dateLabel } from "@/lib/store";
import { brlExact, statusTone, type Cliente } from "@/lib/data";

function ClientForm({ client, close }: { client?: Cliente; close: () => void }) {
  const { update } = useStore();
  const [dates, setDates] = useState(client?.datas || []);
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (key: string) => String(f.get(key) || "").trim();
    if (!get("nome")) return;
    const value: Cliente = {
      id: client?.id || uid(),
      nome: get("nome"),
      telefone: get("telefone"),
      desde: client?.desde || "2026",
      recorrente: f.get("recorrente") === "on",
      movimentado: client?.movimentado || 0,
      ultimoEvento: client?.ultimoEvento || "—",
      proximaOportunidade: get("oportunidade"),
      preferencias: get("preferencias")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      datas: dates.filter((d) => d.label.trim() && d.valor.trim()),
      observacoes: get("observacoes"),
      eventos: client?.eventos || [],
      orcamentos: client?.orcamentos || [],
    };
    update((s) => ({
      ...s,
      clientes: client
        ? s.clientes.map((c) => (c.id === client.id ? value : c))
        : [...s.clientes, value],
    }));
    toast.success(
      client ? "Dados do cliente atualizados" : "Cliente cadastrado. Vamos sonhar a próxima festa!",
    );
    close();
  }
  return (
    <form onSubmit={save} className="space-y-3">
      <Field label="Nome do cliente" name="nome" required defaultValue={client?.nome} />
      <Field label="Telefone" name="telefone" type="tel" required defaultValue={client?.telefone} />
      <Field
        label="Preferências (separadas por vírgula)"
        name="preferencias"
        defaultValue={client?.preferencias.join(", ")}
        placeholder="Tons pastel, flores naturais"
      />
      <Field
        label="Próxima oportunidade"
        name="oportunidade"
        defaultValue={client?.proximaOportunidade}
      />
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="recorrente"
          defaultChecked={client?.recorrente}
          className="size-5 accent-brand"
        />
        Cliente recorrente
      </label>
      {dates.map((d, index) => (
        <div key={index} className="rounded-lg border border-ink/15 p-3">
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Ocasião"
              required
              value={d.label}
              onChange={(e) =>
                setDates(
                  dates.map((date, i) => (i === index ? { ...date, label: e.target.value } : date)),
                )
              }
            />
            <Field
              label="Data importante"
              required
              placeholder="22/05"
              value={d.valor}
              onChange={(e) =>
                setDates(
                  dates.map((date, i) => (i === index ? { ...date, valor: e.target.value } : date)),
                )
              }
            />
          </div>
          <button
            type="button"
            className="mt-1 min-h-11 text-xs text-accent"
            onClick={() => setDates(dates.filter((_, i) => i !== index))}
          >
            Remover data
          </button>
        </div>
      ))}
      <button
        type="button"
        className="min-h-11 text-sm text-brand"
        onClick={() => setDates([...dates, { label: "", valor: "" }])}
      >
        + Adicionar data importante
      </button>
      <Field label="Observações" name="observacoes" defaultValue={client?.observacoes} />
      <button className={buttonClass + " w-full"}>Salvar cliente</button>
    </form>
  );
}
export function ClientsPage() {
  const { state } = useStore();
  const [search, setSearch] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [open, setOpen] = useState(false);
  const list = state.clientes.filter(
    (c) =>
      (c.nome + c.telefone).toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
      (!recurring || c.recorrente),
  );
  return (
    <AppShell>
      <TopBar
        title="Clientes"
        right={<AddButton label="Cadastrar cliente" onClick={() => setOpen(true)} />}
      />
      <div className="w-full min-w-0 space-y-3 px-4 pt-4">
        <Field
          label="Buscar cliente"
          type="search"
          placeholder="Nome ou telefone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setRecurring(!recurring)}
          aria-pressed={recurring}
          className={`min-h-11 rounded-full px-4 text-xs ring-1 ring-ink/20 ${recurring ? "bg-ink text-cream" : ""}`}
        >
          <Heart className="mr-2 inline size-3.5" />
          Clientes recorrentes
        </button>
        <p className="text-xs text-ink/50">
          {list.length} relacionamentos · cada festa tem uma história
        </p>
        {list.map((c) => (
          <Link
            key={c.id}
            to="/clientes/$id"
            params={{ id: c.id }}
            className={cardClass + " flex min-w-0 items-center gap-3 overflow-hidden"}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand/10 font-mono text-brand">
              {c.nome
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {c.nome} {c.recorrente && <Heart className="inline size-3 text-accent" />}
              </p>
              <p className="mt-1 truncate text-xs text-ink/50">
                {c.proximaOportunidade || "Uma nova história começa aqui"}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0" />
          </Link>
        ))}
        {!list.length && (
          <Empty
            title="Nenhum cliente encontrado"
            text="Tente outro nome ou cadastre um novo cliente."
          />
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Novo cliente">
        <ClientForm close={() => setOpen(false)} />
      </Modal>
    </AppShell>
  );
}
export function ClientDetail({ id }: { id: string }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const c = state.clientes.find((c) => c.id === id);
  if (!c)
    return (
      <AppShell>
        <TopBar title="Cliente não encontrado" back={{ to: "/clientes" }} />
        <Section title="Vamos voltar?">
          <Empty text="Escolha um cliente na lista para ver sua história." />
        </Section>
      </AppShell>
    );
  const live = state.eventos.filter((e) => e.clienteId === id);
  const historic = c.eventos.filter(
    (h) =>
      !live.some(
        (e) => e.tema === h.titulo || (e.total === h.valor && dateLabel(e.date) === h.data),
      ),
  );
  const total =
    live
      .filter((e) => !["Cancelado", "Orçamento"].includes(e.status))
      .reduce((s, e) => s + e.total, 0) +
    historic.filter((e) => e.status !== "Cancelado").reduce((s, e) => s + e.valor, 0);
  const eventHistory = live.filter((e) => e.status !== "Orçamento");
  const savedQuotes = c.orcamentos.filter((o) => !live.some((e) => e.total === o.valor));
  const quoteCount = live.length + savedQuotes.length;
  const lastEvent = live
    .filter((e) => e.status === "Realizado")
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.tema;
  return (
    <AppShell>
      <TopBar
        title={c.nome}
        back={{ to: "/clientes", label: "Clientes" }}
        right={
          <button
            onClick={() => setOpen(true)}
            className="min-h-11 text-xs font-semibold text-brand"
          >
            Editar
          </button>
        }
      />
      <main className="space-y-4 px-4 pb-6 pt-4">
        <section className="overflow-hidden rounded-2xl bg-ink text-cream">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-lg font-semibold text-cream">
                {c.nome.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{c.nome}</p>
                <p className="mt-0.5 text-[11px] text-cream/55">
                  Cliente desde {c.desde}
                  {c.recorrente ? " · Recorrente" : ""}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-cream/50">
                Total contratado
              </p>
              <Money value={brlExact(total)} className="mt-1 block text-3xl leading-none" />
            </div>

            <div className="mt-4 grid grid-cols-2 divide-x divide-cream/15 rounded-xl bg-cream/8 py-3">
              <div className="px-3">
                <p className="text-lg font-semibold leading-none">
                  {eventHistory.length + historic.length}
                </p>
                <p className="mt-1 text-[10px] text-cream/55">eventos no histórico</p>
              </div>
              <div className="px-3">
                <p className="text-lg font-semibold leading-none">{quoteCount}</p>
                <p className="mt-1 text-[10px] text-cream/55">orçamentos registrados</p>
              </div>
            </div>
          </div>
          <a
            href={`tel:${c.telefone.replace(/\D/g, "")}`}
            className="flex min-h-12 items-center justify-center gap-2 border-t border-cream/10 bg-cream/8 px-4 text-sm font-medium"
          >
            <Phone className="size-4" />
            Ligar para {c.telefone}
          </a>
        </section>

        <section
          aria-labelledby="relacionamento-cliente"
          className="rounded-2xl ring-1 ring-ink/15"
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                  Próxima oportunidade
                </p>
                <h2
                  id="relacionamento-cliente"
                  className="mt-1 text-base font-semibold leading-snug"
                >
                  {c.proximaOportunidade || "Vamos planejar uma nova festa?"}
                </h2>
                <p className="mt-2 text-xs text-ink/55">
                  Último evento: {lastEvent || c.ultimoEvento}
                </p>
              </div>
            </div>
          </div>
          {!!c.datas.length && (
            <div className="border-t border-ink/10 px-4 py-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                <CalendarDays className="size-4 text-brand" /> Datas importantes
              </div>
              <div className="grid grid-cols-2 gap-2">
                {c.datas.map((d) => (
                  <div key={d.label} className="rounded-lg bg-ink/5 px-3 py-2.5">
                    <p className="text-[10px] text-ink/50">{d.label}</p>
                    <p className="mt-0.5 text-xs font-semibold">{d.valor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section
          aria-labelledby="preferencias-cliente"
          className="rounded-2xl bg-brand/7 p-4 ring-1 ring-brand/15"
        >
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-brand" />
            <h2 id="preferencias-cliente" className="text-sm font-semibold">
              Do jeito que o cliente gosta
            </h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.preferencias.map((p) => (
              <span
                key={p}
                className="rounded-full bg-cream px-3 py-2 text-xs text-brand ring-1 ring-brand/15"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-cream/70 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
              Observações
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink/70">
              {c.observacoes || "Anote aqui os detalhes que fazem a diferença."}
            </p>
          </div>
        </section>

        <section aria-labelledby="historico-eventos">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-brand" />
              <h2 id="historico-eventos" className="text-sm font-semibold">
                Histórico de eventos
              </h2>
            </div>
            <span className="text-[11px] text-ink/45">
              {eventHistory.length + historic.length} registros
            </span>
          </div>
          <div className="space-y-2">
            {eventHistory.map((e) => (
              <Link
                key={e.id}
                to="/eventos/$id"
                params={{ id: e.id }}
                className={cardClass + " flex items-center gap-3"}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.tema}</p>
                  <p className="mt-1 text-xs text-ink/55">
                    {dateLabel(e.date)} · {brlExact(e.total)}
                  </p>
                  <div className="mt-2">
                    <StatusChip label={e.status} tone={statusTone[e.status]} />
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-ink/30" />
              </Link>
            ))}
            {historic.map((h, i) => (
              <div className={cardClass + " bg-ink/[0.025]"} key={i}>
                <p className="text-sm font-semibold">{h.titulo}</p>
                <p className="mt-1 text-xs text-ink/55">
                  {h.data} · {brlExact(h.valor)} · {h.status}
                </p>
              </div>
            ))}
            {!historic.length && !live.some((e) => e.status !== "Orçamento") && (
              <Empty
                title="A primeira festa vem aí"
                text="Os eventos confirmados aparecerão aqui."
              />
            )}
          </div>
        </section>

        <section aria-labelledby="orcamentos-cliente">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-brand" />
              <h2 id="orcamentos-cliente" className="text-sm font-semibold">
                Orçamentos
              </h2>
            </div>
            <span className="text-[11px] text-ink/45">{quoteCount} registros</span>
          </div>
          <div className="space-y-2">
            {live.map((e) => (
              <Link
                key={e.id}
                to="/eventos/$id"
                params={{ id: e.id }}
                className={cardClass + " flex items-center gap-3"}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.tema}</p>
                  <p className="mt-1 text-xs text-ink/55">
                    {brlExact(e.total)} ·{" "}
                    {e.status === "Orçamento"
                      ? e.enviado
                        ? "Enviado"
                        : "Pendente"
                      : e.status === "Cancelado"
                        ? "Cancelado"
                        : "Aprovado"}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-ink/30" />
              </Link>
            ))}
            {savedQuotes.map((o, i) => (
              <div key={i} className={cardClass}>
                <p className="text-sm font-semibold">{o.titulo}</p>
                <p className="mt-1 text-xs text-ink/55">
                  {o.data} · {brlExact(o.valor)} · {o.status}
                </p>
              </div>
            ))}
            {!live.length && !c.orcamentos.length && (
              <Empty title="Nenhum orçamento por enquanto" />
            )}
          </div>
          <Link to="/orcamentos/novo" className={buttonClass + " mt-3 w-full"}>
            Criar orçamento
          </Link>
        </section>
      </main>
      <Modal open={open} onClose={() => setOpen(false)} title="Editar cliente">
        <ClientForm client={c} close={() => setOpen(false)} />
      </Modal>
    </AppShell>
  );
}
