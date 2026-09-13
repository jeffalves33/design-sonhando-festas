import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { AppShell, Money, Progress, Section, StatusChip, TopBar } from "@/components/app-shell";
import { brlExact as brl, statusTone } from "@/lib/data";
import { useStore, conflicts, dateLabel } from "@/lib/store";
import { EventActions } from "@/components/event-actions";
import { Empty } from "@/components/forms";

export const Route = createFileRoute("/eventos/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do evento · Sonhando Festas" },
      {
        name: "description",
        content:
          "Itens contratados, montagem, desmontagem, valores pagos, custos e lucro estimado do evento.",
      },
      { property: "og:title", content: "Detalhes do evento · Sonhando Festas" },
      { property: "og:description", content: "Tudo sobre a festa: itens, valores e lucro." },
    ],
  }),
  component: DetalheEvento,
});

function DetalheEvento() {
  const { state } = useStore();
  const { id } = Route.useParams();
  const found = state.eventos.find((e) => e.id === id);
  if (!found)
    return (
      <AppShell>
        <TopBar title="Evento não encontrado" back={{ to: "/eventos" }} />
        <Section title="Vamos voltar à lista?">
          <Empty text="Escolha um evento para visualizar seus detalhes." />
        </Section>
      </AppShell>
    );
  const clashes = ["Confirmado", "Em preparação", "Orçamento"].includes(found.status)
    ? conflicts(found, state.eventos)
    : [];
  const e = {
    ...found,
    conflito: clashes.length
      ? `A operação coincide com ${clashes.map((c) => c.cliente).join(", ")}. Ajuste a data ou os horários de montagem, desmontagem e deslocamento.`
      : undefined,
  };
  const pendente = e.total - e.pago;
  const lucro = e.total - e.custos;
  const pagoPct = e.total > 0 ? Math.round((e.pago / e.total) * 100) : 0;

  return (
    <AppShell>
      <TopBar
        back={{ to: "/eventos", label: "Eventos" }}
        title={e.tipo}
        right={<StatusChip label={e.status} tone={statusTone[e.status]} />}
      />

      <div className="px-4 pt-4">
        <div className="rounded-xl bg-ink p-4 text-cream">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cream/60">
            Cliente
          </p>
          <Link
            to="/clientes/$id"
            params={{ id: e.clienteId }}
            className="text-lg font-semibold leading-tight underline decoration-cream/30 underline-offset-4"
          >
            {e.cliente}
          </Link>
          <p className="mt-2 text-[12px] text-cream/70">Tema: {e.tema}</p>
          <p className="text-[12px] text-cream/70">{e.endereco}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-cream/15 pt-3 text-center">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-cream/50">Montagem</p>
              <p className="font-mono text-xs font-bold">{e.montagem}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-cream/50">Desmontagem</p>
              <p className="font-mono text-xs font-bold">{e.desmontagem}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-cream/50">Deslocamento</p>
              <p className="font-mono text-xs font-bold">{e.deslocamento}</p>
            </div>
          </div>
        </div>

        {e.conflito ? (
          <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-accent/10 px-3 py-2 ring-1 ring-accent/40">
            <AlertTriangle className="size-4 shrink-0 text-accent" />
            <p className="text-[12px] leading-snug">{e.conflito}</p>
          </div>
        ) : null}
      </div>

      {e.referenciaImagem && (
        <Section title="Referência do cliente">
          <div className="overflow-hidden rounded-xl ring-1 ring-ink/15">
            <img
              src={e.referenciaImagem}
              alt="Imagem de referência enviada pelo cliente"
              className="h-56 w-full object-cover"
            />
            <div className="p-3">
              <p className="text-xs font-semibold">Imagem recebida pelo WhatsApp</p>
              <p className="mt-1 text-[11px] text-ink/55">
                Inspiração de estilo, cores e composição para esta proposta. Será incluída no
                relatório em PDF.
              </p>
            </div>
          </div>
        </Section>
      )}

      <Section title="Itens e serviços contratados">
        <div className="divide-y divide-ink/10 rounded-lg ring-1 ring-ink/15">
          {e.itens.map((i) => (
            <div key={i.nome} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{i.nome}</p>
                <p className="font-mono text-[11px] text-ink/50">
                  {i.qtd} × {brl(i.preco)}
                </p>
              </div>
              <Money value={brl(i.qtd * i.preco)} className="text-[13px]" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Financeiro do evento">
        <div className="rounded-lg p-3.5 ring-1 ring-ink/15">
          {(e.desconto !== undefined || e.extras !== undefined) && (
            <div className="mb-3 border-b border-ink/10 pb-3 text-xs text-ink/60">
              <p className="flex justify-between">
                <span>Desconto negociado</span>
                <span>−{brl(e.desconto || 0)}</span>
              </p>
              <p className="mt-2 flex justify-between">
                <span>Deslocamento e extras cobrados</span>
                <span>{brl(e.extras || 0)}</span>
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-ink/60">Valor contratado</p>
            <Money value={brl(e.total)} className="text-sm" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[12px] text-ink/60">Custos estimados</p>
            <Money value={`−${brl(e.custos)}`} className="text-sm text-accent" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[12px] text-ink/60">Recebido</p>
            <Money value={brl(e.pago)} className="text-sm text-brand" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={pagoPct} />
            <span className="font-mono text-[10px] text-ink/50">{pagoPct}% pago</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-ink/10 pt-3">
            <div className="rounded-lg bg-accent/12 p-3 ring-1 ring-accent/30">
              <p className="text-[10px] uppercase tracking-[0.1em] text-ink/50">Pendente</p>
              <Money value={brl(pendente)} className="mt-1 block text-lg leading-none" />
            </div>
            <div className="rounded-lg bg-brand/12 p-3 ring-1 ring-brand/30">
              <p className="text-[10px] uppercase tracking-[0.1em] text-ink/50">Lucro estimado</p>
              <Money value={brl(lucro)} className="mt-1 block text-lg leading-none" />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Pagamentos e despesas vinculados">
        <div className="space-y-2">
          {state.contas
            .filter((c) => c.eventoId === e.id)
            .map((c) => (
              <div key={c.id} className="rounded-lg p-3 ring-1 ring-ink/15">
                <p className="text-xs font-semibold">
                  {c.tipo === "receber" ? "Recebimento" : c.categoria} · {c.nome}
                </p>
                <p className="mt-1 text-xs text-ink/55">
                  Vencimento {dateLabel(c.vencimento)} · {c.forma}
                </p>
                <p className="mt-2 text-xs">
                  {brl(c.pago)} de {brl(c.valor)} ·{" "}
                  {c.pago >= c.valor ? "Quitado" : c.pago > 0 ? "Parcial" : "Pendente"}
                </p>
              </div>
            ))}
          {!state.contas.some((c) => c.eventoId === e.id) && (
            <p className="text-xs text-ink/55">
              A conta a receber será criada ao aprovar o orçamento.
            </p>
          )}
        </div>
        <Link
          to="/financeiro/pagar"
          className="mt-2 inline-flex min-h-11 items-center text-xs text-brand underline"
        >
          Registrar uma despesa vinculada
        </Link>
      </Section>
      <Section title="Observações">
        <p className="rounded-lg p-3 text-[13px] leading-relaxed text-ink/75 ring-1 ring-ink/15">
          {e.observacoes || "Nenhum detalhe adicional por enquanto."}
        </p>
        <EventActions event={found} />
      </Section>
    </AppShell>
  );
}
