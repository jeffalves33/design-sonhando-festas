import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, TopBar, Money } from "./app-shell";
import { Field, SelectField, Notes, Empty, buttonClass, cardClass } from "./forms";
import { useStore, uid, dateLabel, conflicts, stockProblems, type AppEvent } from "@/lib/store";
import { brlExact } from "@/lib/data";

export function QuotesPage() {
  const { state } = useStore();
  const [filter, setFilter] = useState("Pendentes");
  const list = state.eventos.filter((e) =>
    filter === "Pendentes"
      ? e.status === "Orçamento"
      : filter === "Aprovados"
        ? !["Orçamento", "Cancelado"].includes(e.status)
        : e.status === "Cancelado",
  );
  return (
    <AppShell>
      <TopBar
        title="Orçamentos"
        overline="Cada sonho, uma proposta"
        back={{ to: "/", label: "Início" }}
        right={
          <Link aria-label="Novo orçamento" to="/orcamentos/novo" className={buttonClass}>
            <Plus className="size-4" />
          </Link>
        }
      />
      <div className="space-y-3 px-4 pt-4">
        <div className="flex gap-2">
          {["Pendentes", "Aprovados", "Cancelados"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`min-h-11 rounded-full px-3 text-xs ${f === filter ? "bg-ink text-cream" : "ring-1 ring-inset ring-ink/20"}`}
            >
              {f}
            </button>
          ))}
        </div>
        {list.map((e) => (
          <Link to="/eventos/$id" params={{ id: e.id }} key={e.id} className={cardClass + " block"}>
            <p className="text-sm font-semibold">{e.cliente}</p>
            <p className="mt-1 text-xs text-ink/55">
              {e.tema} · {dateLabel(e.date)}
            </p>
            <div className="mt-3 flex justify-between gap-2">
              <Money value={brlExact(e.total)} />
              <span className="text-xs text-brand">
                {e.status === "Orçamento"
                  ? e.enviado
                    ? "Compartilhado"
                    : "Aguardando aprovação"
                  : e.status}
              </span>
            </div>
          </Link>
        ))}
        {!list.length && (
          <Empty
            title="Nenhuma proposta neste filtro"
            text="Comece pelo cliente e monte cada detalhe da festa."
          />
        )}
        <Link to="/orcamentos/novo" className={buttonClass + " w-full"}>
          Criar orçamento personalizado
        </Link>
      </div>
    </AppShell>
  );
}
export function QuoteForm() {
  const { state, update } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState<AppEvent["itens"]>([]);
  const [catalog, setCatalog] = useState("");
  const [details, setDetails] = useState({
    tipo: "Aniversário infantil",
    tema: "",
    date: "2026-06-18",
    inicio: "16:00",
    fim: "20:00",
    montagem: "12:00",
    desmontagem: "21:00",
    local: "",
    endereco: "",
    deslocamento: "30",
    convidados: "50",
    observacoes: "",
    desconto: "0",
    extras: "0",
    custos: "0",
  });
  const set = (k: keyof typeof details, v: string) => setDetails((d) => ({ ...d, [k]: v }));
  const client = state.clientes.find((c) => c.id === customer);
  const subtotal = items.reduce((s, i) => s + i.qtd * i.preco, 0);
  const total = Number((subtotal - Number(details.desconto) + Number(details.extras)).toFixed(2));
  const preview: AppEvent = {
    id: "preview",
    cliente: client?.nome || "",
    clienteId: customer,
    tipo: details.tipo,
    tema: details.tema,
    date: details.date,
    data: dateLabel(details.date),
    dataCurta: dateLabel(details.date).slice(0, 5),
    inicio: details.inicio,
    fim: details.fim,
    montagem: details.montagem,
    desmontagem: details.desmontagem,
    local: details.local,
    endereco: details.endereco,
    deslocamento: `~${details.deslocamento} min`,
    convidados: Number(details.convidados),
    status: "Orçamento",
    total,
    pago: 0,
    custos: Number(details.custos),
    observacoes: details.observacoes,
    itens: items,
    desconto: Number(details.desconto),
    extras: Number(details.extras),
  };
  const clashes = conflicts(preview, state.eventos);
  const shortages = stockProblems(preview, state);
  function next(e: FormEvent) {
    e.preventDefault();
    if (step === 0 && !client) return;
    if (
      step === 2 &&
      (!items.length ||
        items.some(
          (i) =>
            !i.nome.trim() ||
            i.qtd < 1 ||
            !Number.isInteger(i.qtd) ||
            !Number.isFinite(i.preco) ||
            i.preco < 0,
        ))
    ) {
      toast.error("Adicione pelo menos um item com nome, quantidade e preço válidos.");
      return;
    }
    if (step === 3 && (total <= 0 || Number(details.desconto) > subtotal)) {
      toast.error("O desconto não pode superar os itens e o total deve ser positivo.");
      return;
    }
    setStep(Math.min(4, step + 1));
  }
  function save() {
    const event = { ...preview, id: uid() };
    update((s) => ({ ...s, eventos: [...s.eventos, event] }));
    toast.success("Orçamento salvo. Cada detalhe pronto para conversar com o cliente.");
    navigate({ to: "/eventos/$id", params: { id: event.id } });
  }
  const labels = ["Cliente", "Evento", "Itens", "Valores", "Resumo"];
  return (
    <AppShell>
      <TopBar
        title="Novo orçamento"
        overline={`Passo ${step + 1} de 5`}
        back={{ to: "/orcamentos", label: "Orçamentos" }}
      />
      <div className="px-4 pt-4">
        <div className="mb-5 grid grid-cols-5 gap-1">
          {labels.map((l, i) => (
            <div key={l}>
              <div className={`h-1 rounded-full ${i <= step ? "bg-brand" : "bg-ink/10"}`} />
              <p
                className={`mt-2 text-center text-[10px] ${i === step ? "font-bold text-brand" : "text-ink/50"}`}
              >
                {l}
              </p>
            </div>
          ))}
        </div>
        <form onSubmit={next} className="space-y-4">
          {step === 0 && (
            <>
              <h2 className="text-lg font-semibold">Para quem vamos criar?</h2>
              <p className="text-sm text-ink/60">Tudo começa com uma boa conversa.</p>
              <SelectField label="Selecione o cliente" value={customer} onChange={setCustomer}>
                <option value="">Escolha um cliente</option>
                {state.clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </SelectField>
              {client && (
                <div className={cardClass}>
                  <p className="text-sm font-semibold">{client.nome}</p>
                  <p className="mt-1 text-xs">{client.telefone}</p>
                  <p className="mt-2 text-xs text-ink/60">{client.preferencias.join(" · ")}</p>
                </div>
              )}
              <Link
                to="/clientes"
                className="inline-flex min-h-11 items-center text-sm text-brand underline"
              >
                Cadastrar um novo cliente
              </Link>
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold">Conte sobre a festa</h2>
              <SelectField
                label="Tipo de evento"
                value={details.tipo}
                onChange={(v) => set("tipo", v)}
              >
                {[
                  "Aniversário infantil",
                  "Casamento",
                  "Chá revelação",
                  "Chá de bebê",
                  "Corporativo",
                  "Formatura",
                  "Outro",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </SelectField>
              <Field
                label="Tema"
                required
                value={details.tema}
                onChange={(e) => set("tema", e.target.value)}
              />
              <Field
                label="Data do evento"
                type="date"
                required
                value={details.date}
                onChange={(e) => set("date", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["inicio", "Início"],
                    ["fim", "Fim"],
                    ["montagem", "Montagem"],
                    ["desmontagem", "Desmontagem"],
                  ] as const
                ).map(([k, l]) => (
                  <Field
                    key={k}
                    label={l}
                    type="time"
                    required
                    value={details[k]}
                    onChange={(e) => set(k, e.target.value)}
                  />
                ))}
              </div>
              <p className="text-xs text-ink/50">
                Se a desmontagem for antes da montagem, consideramos o dia seguinte.
              </p>
              <Field
                label="Local"
                required
                value={details.local}
                onChange={(e) => set("local", e.target.value)}
              />
              <Field
                label="Endereço completo"
                required
                value={details.endereco}
                onChange={(e) => set("endereco", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Deslocamento (min)"
                  type="number"
                  min="0"
                  required
                  value={details.deslocamento}
                  onChange={(e) => set("deslocamento", e.target.value)}
                />
                <Field
                  label="Convidados"
                  type="number"
                  min="1"
                  required
                  value={details.convidados}
                  onChange={(e) => set("convidados", e.target.value)}
                />
              </div>
              {clashes.length > 0 && (
                <p role="alert" className="rounded-lg bg-accent/10 p-3 text-xs text-accent">
                  Atenção, Marcia: a operação coincide com{" "}
                  {clashes.map((e) => e.cliente).join(", ")}. Combine outro horário antes de
                  aprovar.
                </p>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold">Monte do seu jeito</h2>
              <p className="text-xs text-ink/60">
                O catálogo é uma referência. Você decide o preço de cada proposta.
              </p>
              <SelectField
                label="Adicionar do catálogo"
                required={false}
                value={catalog}
                onChange={(v) => {
                  setCatalog("");
                  const item = state.estoque.find((i) => i.id === v);
                  if (item)
                    setItems([
                      ...items,
                      { nome: item.nome, qtd: 1, preco: item.referencia, estoqueId: item.id },
                    ]);
                }}
              >
                <option value="">Escolha um item ou serviço</option>
                {state.estoque.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} · {brlExact(i.referencia)}
                  </option>
                ))}
              </SelectField>
              {items.map((item, index) => (
                <div key={index} className={cardClass + " space-y-3"}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink/50">
                      {item.estoqueId
                        ? "Item do catálogo · reserva na aprovação"
                        : "Serviço personalizado"}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remover ${item.nome || "item"}`}
                      onClick={() => setItems(items.filter((_, i) => i !== index))}
                      className="grid size-11 place-items-center text-accent"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <Field
                    label="Nome"
                    required
                    value={item.nome}
                    onChange={(e) =>
                      setItems(
                        items.map((x, i) => (i === index ? { ...x, nome: e.target.value } : x)),
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
                      onChange={(e) =>
                        setItems(
                          items.map((x, i) =>
                            i === index ? { ...x, qtd: Number(e.target.value) } : x,
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
                      onChange={(e) =>
                        setItems(
                          items.map((x, i) =>
                            i === index ? { ...x, preco: Number(e.target.value) } : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <p className="text-right text-sm font-semibold">
                    {brlExact(item.qtd * item.preco)}
                  </p>
                </div>
              ))}
              <button
                type="button"
                className="min-h-11 w-full rounded-lg border border-dashed border-ink/30 text-sm"
                onClick={() => setItems([...items, { nome: "", qtd: 1, preco: 0 }])}
              >
                + Serviço personalizado
              </button>
              {!items.length && (
                <Empty
                  title="A proposta começa aqui"
                  text="Adicione itens do catálogo ou um serviço personalizado."
                />
              )}
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold">Ajuste os últimos detalhes</h2>
              <Field
                label="Desconto (R$)"
                type="number"
                min="0"
                max={subtotal}
                step="0.01"
                required
                value={details.desconto}
                onChange={(e) => set("desconto", e.target.value)}
              />
              <Field
                label="Deslocamento e extras cobrados (R$)"
                type="number"
                min="0"
                step="0.01"
                required
                value={details.extras}
                onChange={(e) => set("extras", e.target.value)}
              />
              <Field
                label="Custo estimado da operação (R$)"
                type="number"
                min="0"
                step="0.01"
                required
                value={details.custos}
                onChange={(e) => set("custos", e.target.value)}
              />
              <p className="text-xs text-ink/55">
                O custo estimado é interno e não aparece na proposta compartilhada.
              </p>
              <Notes value={details.observacoes} onChange={(v) => set("observacoes", v)} />
            </>
          )}
          {step === 4 && (
            <>
              <div className="rounded-xl bg-ink p-4 text-cream">
                <img
                  src="/logo.jpg"
                  alt="Sonhando Festas"
                  className="mb-3 size-16 rounded-lg object-contain"
                />
                <p className="text-xs text-cream/60">Proposta para</p>
                <h2 className="text-xl font-semibold">{client?.nome}</h2>
                <p className="mt-2 text-sm">{details.tema}</p>
                <p className="text-xs text-cream/60">
                  {dateLabel(details.date)} · {details.inicio} · {details.local}
                </p>
              </div>
              {items.map((i, index) => (
                <div key={index} className="flex justify-between gap-3 text-sm">
                  <span>
                    {i.qtd} × {i.nome}
                  </span>
                  <Money value={brlExact(i.qtd * i.preco)} />
                </div>
              ))}
              <div className={cardClass + " space-y-2 text-sm"}>
                <p className="flex justify-between">
                  <span>Itens e serviços</span>
                  <span>{brlExact(subtotal)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Desconto</span>
                  <span>− {brlExact(Number(details.desconto))}</span>
                </p>
                <p className="flex justify-between">
                  <span>Deslocamento e extras</span>
                  <span>{brlExact(Number(details.extras))}</span>
                </p>
                <p className="flex justify-between border-t border-ink/10 pt-3 font-semibold">
                  <span>Total</span>
                  <Money value={brlExact(total)} />
                </p>
              </div>
              <p className="text-xs text-ink/60">{details.observacoes}</p>
              {(clashes.length > 0 || shortages.length > 0) && (
                <div role="alert" className="rounded-lg bg-accent/10 p-3 text-xs text-accent">
                  {clashes.length > 0 && (
                    <p>Há conflito de agenda com {clashes.map((e) => e.cliente).join(", ")}.</p>
                  )}
                  {shortages.length > 0 && (
                    <p>Estoque insuficiente: {shortages.map((i) => i.nome).join(", ")}.</p>
                  )}
                  <p className="mt-2">
                    Você pode salvar a proposta e ajustar os detalhes antes de aprovar.
                  </p>
                </div>
              )}
              <button type="button" onClick={save} className={buttonClass + " w-full"}>
                Salvar orçamento
              </button>
              <p className="text-center text-xs text-ink/50">
                Depois de salvar, você pode compartilhar a proposta pessoalmente.
              </p>
            </>
          )}
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="min-h-11 rounded-lg px-4 text-sm ring-1 ring-ink/20"
              >
                Voltar
              </button>
            )}
            {step < 4 && <button className={buttonClass + " flex-1"}>Continuar</button>}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
