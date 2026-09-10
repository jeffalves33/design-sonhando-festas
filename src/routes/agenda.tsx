import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Navigation } from "lucide-react";
import { AppShell, Section, StatusChip, TopBar } from "@/components/app-shell";
import { Empty } from "@/components/forms";
import { statusTone } from "@/lib/data";
import { useStore, conflicts, demoToday } from "@/lib/store";
export const Route = createFileRoute("/agenda")({
  head: () => ({ meta: [{ title: "Agenda · Sonhando Festas" }] }),
  component: Agenda,
});
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function Agenda() {
  const { state } = useStore();
  const [mode, setMode] = useState("Semana");
  const [selected, setSelected] = useState(demoToday);
  const date = new Date(selected + "T12:00:00");
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  const monthDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const days =
    mode === "Mês"
      ? Array.from(
          { length: monthDays },
          (_, i) => new Date(date.getFullYear(), date.getMonth(), i + 1, 12),
        )
      : Array.from(
          { length: 7 },
          (_, i) =>
            new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i, 12),
        );
  const list = state.eventos
    .filter(
      (e) =>
        e.status !== "Cancelado" &&
        (mode === "Dia"
          ? e.date === selected
          : mode === "Mês"
            ? e.date.startsWith(selected.slice(0, 7))
            : e.date >= iso(weekStart) && e.date <= iso(days[6]!)),
    )
    .sort((a, b) => (a.date + a.montagem).localeCompare(b.date + b.montagem));
  function move(delta: number) {
    const next = new Date(date);
    if (mode === "Mês") {
      next.setDate(1);
      next.setMonth(next.getMonth() + delta);
    } else next.setDate(next.getDate() + delta * (mode === "Dia" ? 1 : 7));
    setSelected(iso(next));
  }
  return (
    <AppShell>
      <TopBar
        overline="Uma festa de cada vez"
        title="Agenda"
        right={
          <Link
            to="/orcamentos/novo"
            className="inline-flex min-h-11 items-center text-xs font-semibold text-brand"
          >
            + Orçamento
          </Link>
        }
      />
      <div className="px-4 pt-4">
        <div className="mb-4 flex rounded-lg bg-ink/5 p-1">
          {["Dia", "Semana", "Mês"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`min-h-11 flex-1 rounded-md text-xs font-semibold ${mode === m ? "bg-ink text-cream" : "text-ink/55"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="mb-3 flex items-center justify-between">
          <button
            aria-label="Período anterior"
            onClick={() => move(-1)}
            className="grid size-11 place-items-center"
          >
            <ChevronLeft className="size-5" />
          </button>
          <p className="text-sm font-semibold capitalize">
            {date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
          <button
            aria-label="Próximo período"
            onClick={() => move(1)}
            className="grid size-11 place-items-center"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map((d) => (
            <span key={d} className="pb-2 text-[9px] text-ink/45">
              {d}
            </span>
          ))}
          {mode === "Mês" &&
            Array.from({ length: (monthStart.getDay() + 6) % 7 }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
          {days.map((d) => {
            const day = iso(d);
            const events = state.eventos.filter((e) => e.date === day && e.status !== "Cancelado");
            const conflict = events.some((e) => conflicts(e, state.eventos).length > 0);
            return (
              <button
                aria-label={d.toLocaleDateString("pt-BR")}
                aria-pressed={selected === day}
                key={day}
                onClick={() => {
                  setSelected(day);
                  setMode("Dia");
                }}
                className={`relative min-h-11 rounded-lg py-2 font-mono text-xs ${selected === day ? "bg-ink text-cream" : conflict ? "bg-accent/10 text-accent" : events.length ? "bg-brand/10 text-brand" : "text-ink/60"}`}
              >
                {d.getDate()}
                {events.length > 0 && (
                  <span
                    className={`absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full ${conflict ? "bg-accent" : "bg-brand"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setSelected(demoToday)}
          className="mt-3 min-h-11 text-xs text-brand underline"
        >
          Voltar a 14 de junho · demonstração
        </button>
      </div>
      <Section
        title={
          mode === "Dia"
            ? date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
            : `${list.length} eventos ${mode === "Mês" ? "no mês" : "na semana"}`
        }
      >
        <div className="space-y-3">
          {list.map((e) => {
            const clash = conflicts(e, state.eventos);
            return (
              <Link
                to="/eventos/$id"
                params={{ id: e.id }}
                key={e.id}
                className={`block rounded-xl p-3.5 ring-1 ${clash.length ? "bg-accent/10 ring-accent/60" : "ring-ink/15"}`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-brand">
                    {e.dataCurta} · {e.inicio} – {e.fim}
                  </span>
                  <StatusChip label={e.status} tone={statusTone[e.status]} />
                </div>
                <p className="text-base font-semibold">
                  {e.tipo} · {e.cliente}
                </p>
                <p className="mt-1 text-xs text-ink/55">{e.tema}</p>
                <p className="mt-3 flex gap-2 text-xs text-ink/65">
                  <Clock className="size-3.5 shrink-0" />
                  Montagem {e.montagem} · desmontagem {e.desmontagem}
                </p>
                <p className="mt-1 flex gap-2 text-xs text-ink/65">
                  <MapPin className="size-3.5 shrink-0" />
                  {e.local} · {e.endereco}
                </p>
                <p className="mt-1 flex gap-2 text-xs text-ink/65">
                  <Navigation className="size-3.5 shrink-0" />
                  Deslocamento {e.deslocamento}
                </p>
                {clash.length > 0 && (
                  <div className="mt-3 border-t border-accent/20 pt-3">
                    <p className="text-xs font-semibold text-accent">
                      Conflito com {clash.map((c) => c.cliente).join(", ")}
                    </p>
                    <p className="mt-1 text-xs text-ink/60">
                      Marcia é a única responsável. Toque para ajustar a data e os horários.
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
          {!list.length && (
            <Empty
              title="Espaço para novos sonhos"
              text="Nenhum evento neste período. Navegue pelo calendário ou crie um orçamento."
            />
          )}
        </div>
      </Section>
    </AppShell>
  );
}
