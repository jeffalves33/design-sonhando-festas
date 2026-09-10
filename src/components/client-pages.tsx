import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, Heart, ChevronRight } from "lucide-react";
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
        overline="Relacionamentos que ficam"
        title="Clientes"
        right={<AddButton label="Cadastrar cliente" onClick={() => setOpen(true)} />}
      />
      <div className="space-y-3 px-4 pt-4">
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
            className={cardClass + " flex items-center gap-3"}
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
  return (
    <AppShell>
      <TopBar
        title={c.nome}
        overline={c.recorrente ? "Cliente recorrente ♥" : `Com a gente desde ${c.desde}`}
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
      <div className="px-4 pt-4">
        <div className="rounded-xl bg-ink p-4 text-cream">
          <p className="text-xs text-cream/60">Histórias construídas juntos</p>
          <Money value={brlExact(total)} className="mt-2 block text-2xl" />
          <p className="mt-1 text-xs text-cream/60">em eventos contratados</p>
          <a
            href={`tel:${c.telefone.replace(/\D/g, "")}`}
            className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cream/10 text-sm"
          >
            <Phone className="size-4" />
            {c.telefone}
          </a>
        </div>
      </div>
      <Section title="Próxima oportunidade">
        <div className={cardClass}>
          <p className="text-sm font-semibold">
            {c.proximaOportunidade || "Vamos planejar uma nova festa?"}
          </p>
          <p className="mt-2 text-xs text-ink/60">
            Último evento:{" "}
            {live
              .filter((e) => e.status === "Realizado")
              .sort((a, b) => b.date.localeCompare(a.date))[0]?.tema || c.ultimoEvento}
          </p>
          {c.datas.map((d) => (
            <p key={d.label} className="mt-2 text-xs">
              {d.label} · <b>{d.valor}</b>
            </p>
          ))}
        </div>
      </Section>
      <Section title="Do jeito que o cliente gosta">
        <div className="flex flex-wrap gap-2">
          {c.preferencias.map((p) => (
            <span key={p} className="rounded-full bg-brand/10 px-3 py-2 text-xs text-brand">
              {p}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink/65">
          {c.observacoes || "Anote aqui os detalhes que fazem a diferença."}
        </p>
      </Section>
      <Section title="Histórico de eventos">
        <div className="space-y-2">
          {live
            .filter((e) => e.status !== "Orçamento")
            .map((e) => (
              <Link
                key={e.id}
                to="/eventos/$id"
                params={{ id: e.id }}
                className={cardClass + " block"}
              >
                <p className="text-sm font-semibold">{e.tema}</p>
                <p className="my-2 text-xs text-ink/55">
                  {dateLabel(e.date)} · {brlExact(e.total)}
                </p>
                <StatusChip label={e.status} tone={statusTone[e.status]} />
              </Link>
            ))}
          {historic.map((h, i) => (
            <div className={cardClass} key={i}>
              <p className="text-sm font-semibold">{h.titulo}</p>
              <p className="text-xs text-ink/55">
                {h.data} · {brlExact(h.valor)} · {h.status}
              </p>
            </div>
          ))}
          {!historic.length && !live.some((e) => e.status !== "Orçamento") && (
            <Empty title="A primeira festa vem aí" text="Os eventos confirmados aparecerão aqui." />
          )}
        </div>
      </Section>
      <Section title="Orçamentos">
        <div className="space-y-2">
          {live.map((e) => (
            <Link
              key={e.id}
              to="/eventos/$id"
              params={{ id: e.id }}
              className={cardClass + " block"}
            >
              <p className="text-sm font-semibold">{e.tema}</p>
              <p className="text-xs text-ink/55">
                {brlExact(e.total)} ·{" "}
                {e.status === "Orçamento"
                  ? e.enviado
                    ? "Enviado"
                    : "Pendente"
                  : e.status === "Cancelado"
                    ? "Cancelado"
                    : "Aprovado"}
              </p>
            </Link>
          ))}
          {c.orcamentos
            .filter((o) => !live.some((e) => e.total === o.valor))
            .map((o, i) => (
              <div key={i} className={cardClass}>
                <p className="text-sm font-semibold">{o.titulo}</p>
                <p className="text-xs text-ink/55">
                  {o.data} · {brlExact(o.valor)} · {o.status}
                </p>
              </div>
            ))}
          {!live.length && !c.orcamentos.length && <Empty title="Nenhum orçamento por enquanto" />}
        </div>
        <Link to="/orcamentos/novo" className={buttonClass + " mt-3 w-full"}>
          Criar orçamento
        </Link>
      </Section>
      <Modal open={open} onClose={() => setOpen(false)} title="Editar cliente">
        <ClientForm client={c} close={() => setOpen(false)} />
      </Modal>
    </AppShell>
  );
}
