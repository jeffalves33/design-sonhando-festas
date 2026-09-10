import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Field, Notes, SelectField, Modal, buttonClass } from "./forms";
import { PaymentForm } from "./finance-pages";
import {
  useStore,
  conflicts,
  stockProblems,
  dateLabel,
  uid,
  downloadText,
  type AppEvent,
} from "@/lib/store";
import { brlExact, type EventStatus } from "@/lib/data";

export function EventActions({ event }: { event: AppEvent }) {
  const { state, update } = useStore();
  const [mode, setMode] = useState<"edit" | "items" | "pay" | "approve" | null>(null);
  const [notes, setNotes] = useState(event.observacoes);
  const [status, setStatus] = useState<EventStatus>(event.status);
  const [items, setItems] = useState(event.itens);
  const [discount, setDiscount] = useState(event.desconto || 0);
  const [extras, setExtras] = useState(event.extras || 0);
  const [catalog, setCatalog] = useState("");
  const bills = state.contas.filter(
    (c) => c.eventoId === event.id && c.tipo === "receber" && c.pago < c.valor,
  );
  function check(value: AppEvent) {
    if (["Confirmado", "Em preparação"].includes(value.status)) {
      const clashes = conflicts(value, state.eventos);
      const shortages = stockProblems(value, state);
      if (clashes.length || shortages.length) {
        toast.error(
          clashes.length
            ? `Ajuste o horário: conflito com ${clashes.map((e) => e.cliente).join(", ")}.`
            : `Sem estoque suficiente: ${shortages.map((i) => i.nome).join(", ")}.`,
        );
        return false;
      }
    }
    return true;
  }
  function approve() {
    const next = { ...event, status: "Confirmado" as const };
    if (!check(next)) return;
    update((s) => {
      const current = s.eventos.find((e) => e.id === event.id);
      if (!current || current.status !== "Orçamento") return s;
      const alreadyHasBill = s.contas.some(
        (bill) => bill.eventoId === event.id && bill.tipo === "receber",
      );
      return {
        ...s,
        eventos: s.eventos.map((e) => (e.id === event.id ? next : e)),
        contas:
          alreadyHasBill || event.total <= event.pago
            ? s.contas
            : [
                ...s.contas,
                {
                  id: uid(),
                  nome: event.cliente,
                  categoria: "Eventos",
                  valor: event.total - event.pago,
                  pago: 0,
                  vencimento: event.date,
                  forma: "Pix",
                  eventoId: event.id,
                  tipo: "receber",
                },
              ],
      };
    });
    setMode(null);
    toast.success("Evento confirmado! Itens reservados e conta a receber criada.");
  }
  function saveItems(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subtotal = items.reduce((sum, item) => sum + item.qtd * item.preco, 0);
    const total = Number((subtotal - discount + extras).toFixed(2));
    if (
      !items.length ||
      items.some(
        (item) =>
          !item.nome.trim() ||
          !Number.isInteger(item.qtd) ||
          item.qtd < 1 ||
          !Number.isFinite(item.preco) ||
          item.preco < 0,
      ) ||
      discount < 0 ||
      discount > subtotal ||
      extras < 0 ||
      total <= 0
    ) {
      toast.error("Confira os itens, as quantidades, o desconto e os valores.");
      return;
    }
    update((s) => ({
      ...s,
      eventos: s.eventos.map((item) =>
        item.id === event.id ? { ...item, itens: items, desconto: discount, extras, total } : item,
      ),
    }));
    setMode(null);
    toast.success("Itens e valores da proposta atualizados.");
  }
  function edit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const value = (name: string) => String(f.get(name) || "").trim();
    const date = value("date");
    const next: AppEvent = {
      ...event,
      tema: value("tema"),
      date,
      data: dateLabel(date),
      dataCurta: dateLabel(date).slice(0, 5),
      inicio: value("inicio"),
      fim: value("fim"),
      montagem: value("montagem"),
      desmontagem: value("desmontagem"),
      local: value("local"),
      endereco: value("endereco"),
      deslocamento: `~${value("deslocamento")} min`,
      custos: Number(value("custos")),
      observacoes: notes,
      status,
    };
    if (!check(next)) return;
    if (status === "Cancelado" && event.pago > 0) {
      toast.error(
        "Este evento já tem recebimentos. Resolva os valores recebidos antes de cancelar no protótipo.",
      );
      return;
    }
    update((s) => ({
      ...s,
      eventos: s.eventos.map((ev) => (ev.id === event.id ? next : ev)),
      contas:
        status === "Cancelado"
          ? s.contas.filter((c) => c.eventoId !== event.id || c.tipo !== "receber")
          : s.contas,
    }));
    setMode(null);
    toast.success("Detalhes atualizados. Agenda e reservas também.");
  }
  async function share() {
    const subtotal = event.itens.reduce((s, i) => s + i.qtd * i.preco, 0);
    const adjustment = event.total - subtotal;
    const text = `${state.perfil.empresa}\nProposta para ${event.cliente}\n\n${event.tipo} · ${event.tema}\n${dateLabel(event.date)} · ${event.inicio} às ${event.fim}\n${event.local}\n${event.endereco}\nMontagem: ${event.montagem} · Desmontagem: ${event.desmontagem}\n\n${event.itens.map((i) => `${i.qtd} × ${i.nome} — ${brlExact(i.qtd * i.preco)}`).join("\n")}\n${event.desconto !== undefined ? `Desconto: ${brlExact(event.desconto)}\nExtras: ${brlExact(event.extras || 0)}` : `Ajustes negociados: ${brlExact(adjustment)}`}\nTotal: ${brlExact(event.total)}\n\n${event.observacoes}\n\nCom carinho, ${state.perfil.nome}\n${state.perfil.telefone}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Proposta · ${event.tema}`, text });
        update((s) => ({
          ...s,
          eventos: s.eventos.map((e) => (e.id === event.id ? { ...e, enviado: true } : e)),
        }));
        toast.success("Proposta compartilhada");
      } else {
        downloadText(`proposta-${event.id}.txt`, text);
        update((s) => ({
          ...s,
          eventos: s.eventos.map((e) => (e.id === event.id ? { ...e, enviado: true } : e)),
        }));
        toast.success("Proposta baixada. Envie ao cliente pelo canal que preferir.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        toast.error("Não foi possível compartilhar. Tente novamente.");
    }
  }
  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {event.status === "Orçamento" && (
          <button onClick={() => setMode("approve")} className={buttonClass + " col-span-2"}>
            Aprovar e criar evento
          </button>
        )}
        {event.status === "Orçamento" && (
          <button
            onClick={() => {
              setItems(event.itens);
              setDiscount(event.desconto || 0);
              setExtras(event.extras || 0);
              setMode("items");
            }}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold ring-1 ring-ink/25"
          >
            Editar itens e valores
          </button>
        )}
        {bills.length > 0 && event.status !== "Cancelado" && (
          <button onClick={() => setMode("pay")} className={buttonClass + " col-span-2"}>
            Registrar pagamento
          </button>
        )}
        <button
          onClick={() => {
            setStatus(event.status);
            setNotes(event.observacoes);
            setMode("edit");
          }}
          className="min-h-11 rounded-lg px-3 text-sm font-semibold ring-1 ring-ink/25"
        >
          Editar detalhes
        </button>
        <button
          onClick={share}
          className={`min-h-11 rounded-lg px-3 text-sm font-semibold text-brand ring-1 ring-brand/30 ${event.status === "Orçamento" ? "col-span-2" : ""}`}
        >
          {event.status === "Orçamento" ? "Compartilhar proposta" : "Compartilhar resumo"}
        </button>
      </div>
      <Modal open={mode === "approve"} onClose={() => setMode(null)} title="Confirmar essa festa?">
        <p className="text-sm text-ink/70">
          Ao aprovar, os itens físicos serão reservados na data do evento e{" "}
          {brlExact(event.total - event.pago)} entrará nas contas a receber.
        </p>
        <p className="text-xs text-ink/55">
          A agenda considera Marcia como única responsável. Conflitos de operação ou falta de
          estoque precisam ser ajustados antes da aprovação.
        </p>
        <button onClick={approve} className={buttonClass}>
          Confirmar aprovação
        </button>
      </Modal>
      <Modal open={mode === "pay"} onClose={() => setMode(null)} title="Recebimento do evento">
        {bills[0] && <PaymentForm bill={bills[0]} close={() => setMode(null)} />}
      </Modal>
      <Modal open={mode === "items"} onClose={() => setMode(null)} title="Itens da proposta">
        <form onSubmit={saveItems} className="space-y-3">
          <SelectField
            label="Adicionar do catálogo"
            value={catalog}
            required={false}
            onChange={(id) => {
              setCatalog("");
              const stock = state.estoque.find((item) => item.id === id);
              if (stock)
                setItems([
                  ...items,
                  { nome: stock.nome, qtd: 1, preco: stock.referencia, estoqueId: stock.id },
                ]);
            }}
          >
            <option value="">Escolha um item ou serviço</option>
            {state.estoque.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome} · {brlExact(item.referencia)}
              </option>
            ))}
          </SelectField>
          {items.map((item, index) => (
            <div
              key={`${item.estoqueId || "custom"}-${index}`}
              className="space-y-2 rounded-lg p-3 ring-1 ring-ink/15"
            >
              <div className="flex justify-between gap-2">
                <p className="text-xs text-ink/50">
                  {item.estoqueId ? "Item do catálogo" : "Serviço personalizado"}
                </p>
                <button
                  type="button"
                  aria-label={`Remover ${item.nome || "item"}`}
                  className="grid size-11 place-items-center text-accent"
                  onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <Field
                label="Nome"
                required
                value={item.nome}
                onChange={(change) =>
                  setItems(
                    items.map((current, itemIndex) =>
                      itemIndex === index ? { ...current, nome: change.target.value } : current,
                    ),
                  )
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="Quantidade"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={item.qtd}
                  onChange={(change) =>
                    setItems(
                      items.map((current, itemIndex) =>
                        itemIndex === index
                          ? { ...current, qtd: Number(change.target.value) }
                          : current,
                      ),
                    )
                  }
                />
                <Field
                  label="Preço unitário (R$)"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={item.preco}
                  onChange={(change) =>
                    setItems(
                      items.map((current, itemIndex) =>
                        itemIndex === index
                          ? { ...current, preco: Number(change.target.value) }
                          : current,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="min-h-11 w-full rounded-lg border border-dashed border-ink/30 text-sm"
            onClick={() => setItems([...items, { nome: "", qtd: 1, preco: 0 }])}
          >
            + Serviço personalizado
          </button>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Desconto (R$)"
              type="number"
              min="0"
              step="0.01"
              required
              value={discount}
              onChange={(change) => setDiscount(Number(change.target.value))}
            />
            <Field
              label="Extras (R$)"
              type="number"
              min="0"
              step="0.01"
              required
              value={extras}
              onChange={(change) => setExtras(Number(change.target.value))}
            />
          </div>
          <p className="text-right text-sm font-semibold">
            Total:{" "}
            {brlExact(
              items.reduce((sum, item) => sum + item.qtd * item.preco, 0) - discount + extras,
            )}
          </p>
          <button className={buttonClass + " w-full"}>Salvar itens e valores</button>
        </form>
      </Modal>
      <Modal open={mode === "edit"} onClose={() => setMode(null)} title="Editar detalhes">
        <form onSubmit={edit} className="space-y-3">
          <Field label="Tema" name="tema" required defaultValue={event.tema} />
          <Field label="Data" name="date" type="date" required defaultValue={event.date} />
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["inicio", "Início"],
                ["fim", "Fim"],
                ["montagem", "Montagem"],
                ["desmontagem", "Desmontagem"],
              ] as const
            ).map(([key, label]) => (
              <Field
                key={key}
                label={label}
                name={key}
                type="time"
                required
                defaultValue={event[key]}
              />
            ))}
          </div>
          <Field label="Local" name="local" required defaultValue={event.local} />
          <Field label="Endereço" name="endereco" required defaultValue={event.endereco} />
          <Field
            label="Deslocamento (min)"
            name="deslocamento"
            type="number"
            min="0"
            required
            defaultValue={event.deslocamento.replace(/\D/g, "")}
          />
          <Field
            label="Custos estimados (R$)"
            name="custos"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={event.custos}
          />
          <SelectField label="Status" value={status} onChange={(v) => setStatus(v as EventStatus)}>
            {(event.status === "Orçamento"
              ? ["Orçamento", "Cancelado"]
              : event.status === "Cancelado"
                ? ["Cancelado"]
                : ["Confirmado", "Em preparação", "Realizado", "Cancelado"]
            ).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </SelectField>
          <Notes value={notes} onChange={setNotes} />
          {status === "Cancelado" && (
            <p className="text-xs text-accent">
              Ao salvar, as reservas e as contas a receber não pagas deste evento serão removidas.
            </p>
          )}
          <button className={buttonClass + " w-full"}>Salvar alterações</button>
        </form>
      </Modal>
    </>
  );
}
