import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock3, MapPin, Paperclip } from "lucide-react";
import { AppShell, Money, Section, StatusChip, TopBar } from "@/components/app-shell";
import { EventActions } from "@/components/event-actions";
import { Empty } from "@/components/forms";
import { brlExact as brl, statusTone } from "@/lib/data";
import { dateLabel, useStore } from "@/lib/store";

export const Route = createFileRoute("/orcamentos/$id")({
  head: () => ({ meta: [{ title: "Detalhes do orçamento · Sonhando Festas" }] }),
  component: DetalheOrcamento,
});

function DetalheOrcamento() {
  const { state } = useStore();
  const { id } = Route.useParams();
  const quote = state.eventos.find((event) => event.id === id);

  if (!quote || quote.status !== "Orçamento") {
    return (
      <AppShell>
        <TopBar
          title="Orçamento não encontrado"
          back={{ to: "/orcamentos", label: "Orçamentos" }}
        />
        <Section title="Propostas em aberto">
          <Empty text="Este orçamento foi aprovado, excluído ou não existe mais." />
        </Section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar
        title={quote.cliente}
        back={{ to: "/orcamentos", label: "Orçamentos" }}
        right={<StatusChip label="Aguardando" tone={statusTone.Orçamento} />}
      />
      <div className="space-y-3 px-4 pt-4">
        <div className="rounded-xl bg-ink p-4 text-cream">
          <p className="text-[10px] uppercase tracking-[0.16em] text-cream/55">{quote.tipo}</p>
          <h2 className="mt-1 text-xl font-semibold">{quote.tema}</h2>
          <div className="mt-4 space-y-2 border-t border-cream/15 pt-3 text-xs text-cream/75">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4" /> {dateLabel(quote.date)}
            </p>
            <p className="flex items-center gap-2">
              <Clock3 className="size-4" /> {quote.inicio} às {quote.fim}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-4" /> {quote.local}
            </p>
          </div>
        </div>
        <p className="rounded-lg bg-brand/8 p-3 text-xs leading-relaxed text-ink/65 ring-1 ring-brand/20">
          Esta proposta ainda não ocupa a agenda nem reserva itens. Ao aprovar, ela vira um evento
          confirmado e cria a conta a receber.
        </p>
      </div>

      {quote.referenciaImagem && (
        <Section title="Referência do cliente">
          <div className="overflow-hidden rounded-xl ring-1 ring-ink/15">
            <img
              src={quote.referenciaImagem}
              alt="Referência enviada pelo cliente"
              className="h-52 w-full object-cover"
            />
            <p className="flex items-center gap-2 p-3 text-xs">
              <Paperclip className="size-4 text-brand" /> Imagem anexada à proposta em PDF
            </p>
          </div>
        </Section>
      )}

      <Section title="Itens e valores">
        <div className="divide-y divide-ink/10 rounded-xl ring-1 ring-ink/15">
          {quote.itens.map((item, index) => (
            <div
              key={item.nome + index}
              className="flex items-center justify-between gap-3 p-3 text-xs"
            >
              <div>
                <p className="font-semibold">{item.nome}</p>
                <p className="mt-1 text-ink/50">
                  {item.qtd} × {brl(item.preco)}
                </p>
              </div>
              <Money value={brl(item.qtd * item.preco)} />
            </div>
          ))}
          <div className="flex items-center justify-between bg-ink/5 p-3 text-sm">
            <span className="font-semibold">Total da proposta</span>
            <Money value={brl(quote.total)} className="text-base text-brand" />
          </div>
        </div>
      </Section>

      <Section title="Observações e ações">
        <p className="rounded-lg p-3 text-xs leading-relaxed text-ink/65 ring-1 ring-ink/15">
          {quote.observacoes || "Sem observações."}
        </p>
        <EventActions event={quote} quoteWorkspace />
        <Link
          to="/clientes/$id"
          params={{ id: quote.clienteId }}
          className="mt-3 inline-flex min-h-11 items-center text-xs text-brand underline"
        >
          Ver cadastro do cliente
        </Link>
      </Section>
    </AppShell>
  );
}
