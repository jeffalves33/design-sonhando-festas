import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  clientes,
  estoque,
  eventos,
  contasPagar,
  type Cliente,
  type Evento,
  type ItemEstoque,
} from "./data";
import { toast } from "sonner";

export type AppEvent = Omit<Evento, "itens"> & {
  date: string;
  desconto?: number;
  extras?: number;
  enviado?: boolean;
  itens: (Evento["itens"][number] & { estoqueId?: string | undefined })[];
};
export type Stock = ItemEstoque & { foto?: string; servico?: boolean; indisponivel?: number };
export type Bill = {
  id: string;
  nome: string;
  categoria: string;
  valor: number;
  pago: number;
  vencimento: string;
  forma: string;
  eventoId?: string | undefined;
  tipo: "receber" | "pagar";
};
export type State = {
  eventos: AppEvent[];
  clientes: Cliente[];
  estoque: Stock[];
  contas: Bill[];
  perfil: { nome: string; empresa: string; telefone: string; cidade: string };
};
export const demoToday = "2026-06-14";
export const dateLabel = (date: string) => new Date(date + "T12:00:00").toLocaleDateString("pt-BR");
export const uid = () => crypto.randomUUID();
const seedEvents: AppEvent[] = eventos.map((e) => ({
  ...e,
  date: `2026-${e.dataCurta.slice(3)}-${e.dataCurta.slice(0, 2)}`,
  desconto: Math.max(0, e.itens.reduce((s, i) => s + i.qtd * i.preco, 0) - e.total),
  extras: Math.max(0, e.total - e.itens.reduce((s, i) => s + i.qtd * i.preco, 0)),
  itens: e.itens
    .flatMap((i) =>
      i.nome === "Mesa principal + carrinho"
        ? [
            { nome: "Mesa provençal grande", qtd: 1, preco: 950 },
            { nome: "Carrinho de doces", qtd: 1, preco: 450 },
          ]
        : [i],
    )
    .map((i) => ({
      ...i,
      estoqueId: i.nome.includes("Painel redondo")
        ? "itm-painel-redondo"
        : i.nome.includes("Carrinho de doces")
          ? "itm-carrinho-doces"
          : i.nome.includes("Mesa provençal")
            ? "itm-mesa-provencal"
            : i.nome.includes("Cordão")
              ? "itm-luzes"
              : i.nome === "Painel de nuvens"
                ? "itm-painel-nuvens"
                : i.nome === "Balões orgânicos"
                  ? "itm-baloes"
                  : undefined,
    })),
}));
export const initialState: State = {
  eventos: seedEvents,
  clientes,
  estoque: [
    ...estoque.map((i) => ({ ...i, reservado: 0, emUso: 0, disponivel: i.total, alerta: "" })),
    {
      id: "itm-painel-nuvens",
      nome: "Painel de nuvens",
      categoria: "Painéis",
      total: 2,
      disponivel: 2,
      reservado: 0,
      emUso: 0,
      custo: 400,
      referencia: 1800,
    },
  ],
  contas: [
    ...seedEvents
      .filter((e) => e.status !== "Orçamento")
      .flatMap((e) => [
        ...(e.pago > 0
          ? [
              {
                id: `entrada-${e.id}`,
                nome: e.cliente,
                categoria: "Eventos",
                valor: e.pago,
                pago: e.pago,
                vencimento: e.date.slice(0, 8) + "01",
                forma: "Pix",
                eventoId: e.id,
                tipo: "receber" as const,
              },
            ]
          : []),
        ...(e.total > e.pago
          ? [
              {
                id: `saldo-${e.id}`,
                nome: e.cliente,
                categoria: "Eventos",
                valor: e.total - e.pago,
                pago: 0,
                vencimento: e.date,
                forma: "Pix",
                eventoId: e.id,
                tipo: "receber" as const,
              },
            ]
          : []),
      ]),
    ...contasPagar.map((c) => ({
      ...c,
      pago: 0,
      vencimento: `2026-06-${c.vencimento.slice(0, 2)}`,
      forma: "Pix",
      tipo: "pagar" as const,
    })),
    {
      id: "pag-materiais",
      nome: "Materiais das festas de junho",
      categoria: "Compras",
      valor: 3200,
      pago: 3200,
      vencimento: "2026-06-10",
      forma: "Débito",
      tipo: "pagar",
    },
  ],
  perfil: { nome: "Marcia Silva", empresa: "Sonhando Festas", telefone: "", cidade: "São Paulo" },
};
export function isState(value: unknown): value is State {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<State>;
  return (
    Array.isArray(candidate.eventos) &&
    candidate.eventos.every(
      (event) =>
        event &&
        typeof event.id === "string" &&
        typeof event.cliente === "string" &&
        typeof event.date === "string" &&
        typeof event.total === "number" &&
        Array.isArray(event.itens),
    ) &&
    Array.isArray(candidate.clientes) &&
    candidate.clientes.every(
      (client) => client && typeof client.id === "string" && typeof client.nome === "string",
    ) &&
    Array.isArray(candidate.estoque) &&
    candidate.estoque.every(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.nome === "string" &&
        typeof item.total === "number",
    ) &&
    Array.isArray(candidate.contas) &&
    candidate.contas.every(
      (bill) =>
        bill &&
        typeof bill.id === "string" &&
        typeof bill.valor === "number" &&
        (bill.tipo === "receber" || bill.tipo === "pagar"),
    ) &&
    !!candidate.perfil &&
    typeof candidate.perfil.nome === "string" &&
    typeof candidate.perfil.empresa === "string"
  );
}
export const activeEvent = (e: AppEvent) => ["Confirmado", "Em preparação"].includes(e.status);
const minutes = (v: string) => {
  const [h = 0, m = 0] = v.split(":").map(Number);
  return h * 60 + m;
};
export function overlaps(a: AppEvent, b: AppEvent) {
  const interval = (e: AppEvent): [number, number] => {
    const base = new Date(e.date + "T00:00:00").getTime() / 60000;
    const start = minutes(e.montagem || e.inicio);
    let end = minutes(e.desmontagem || e.fim);
    if (end <= start) end += 1440;
    return [base + start - (Number(e.deslocamento.replace(/\D/g, "")) || 0), base + end];
  };
  const [as, ae] = interval(a);
  const [bs, be] = interval(b);
  return as < be && bs < ae;
}
export function conflicts(e: AppEvent, all: AppEvent[]) {
  return all.filter((other) => other.id !== e.id && activeEvent(other) && overlaps(e, other));
}
export function reservedFor(itemId: string, date: string, all: AppEvent[], ignore?: string) {
  return all
    .filter(
      (e) =>
        e.id !== ignore &&
        activeEvent(e) &&
        (e.date === date ||
          (e.date < date &&
            e.desmontagem <= e.montagem &&
            new Date(new Date(e.date + "T12:00:00").getTime() + 86400000)
              .toISOString()
              .slice(0, 10) === date)),
    )
    .reduce(
      (sum, e) =>
        sum + e.itens.filter((i) => i.estoqueId === itemId).reduce((s, i) => s + i.qtd, 0),
      0,
    );
}
export function stockProblems(event: AppEvent, state: State) {
  return state.estoque
    .filter((i) => !i.servico && event.itens.some((line) => line.estoqueId === i.id))
    .filter((i) => {
      const needed = event.itens
        .filter((line) => line.estoqueId === i.id)
        .reduce((s, line) => s + line.qtd, 0);
      // Reserve physical items for the whole day, including an overnight teardown.
      const dates = [event.date];
      if (event.desmontagem <= event.montagem)
        dates.push(
          new Date(new Date(event.date + "T12:00:00").getTime() + 86400000)
            .toISOString()
            .slice(0, 10),
        );
      return dates.some(
        (date) =>
          needed + reservedFor(i.id, date, state.eventos, event.id) >
          i.total - (i.indisponivel || 0),
      );
    });
}
const Context = createContext<{
  state: State;
  ready: boolean;
  update: (fn: (state: State) => State) => void;
} | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sonhando-festas-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isState(parsed)) setState(parsed);
      }
    } catch {
      toast.error("Não foi possível recuperar os dados deste navegador.");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("sonhando-festas-v1", JSON.stringify(state));
      } catch {
        toast.error("O navegador não conseguiu salvar. Exporte uma cópia em Configurações.");
      }
    }
  }, [state, ready]);
  return (
    <Context.Provider value={{ state, ready, update: (fn) => setState(fn) }}>
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("StoreProvider ausente");
  return ctx;
}
export function downloadText(name: string, content: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
