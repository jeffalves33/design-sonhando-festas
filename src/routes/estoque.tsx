import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { AppShell, TopBar } from "@/components/app-shell";
import {
  AddButton,
  Field,
  SelectField,
  Modal,
  Empty,
  buttonClass,
  cardClass,
} from "@/components/forms";
import { useStore, uid, reservedFor, demoToday, activeEvent, type Stock } from "@/lib/store";
import { categorias, brlExact } from "@/lib/data";
export const Route = createFileRoute("/estoque")({
  head: () => ({ meta: [{ title: "Catálogo e estoque · Sonhando Festas" }] }),
  component: StockPage,
});

function StockForm({ item, close }: { item?: Stock | undefined; close: () => void }) {
  const { state, update } = useStore();
  const [category, setCategory] = useState(item?.categoria || "Decoração");
  const [kind, setKind] = useState(item?.servico ? "Serviço" : "Item físico");
  const [photo, setPhoto] = useState(item?.foto || "");
  const [loading, setLoading] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 1500000) {
      toast.error("Use JPG, PNG ou WebP de até 1,5 MB.");
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      setLoading(false);
    };
    reader.onerror = () => {
      toast.error("Não foi possível ler a foto.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const total = kind === "Serviço" ? 0 : Number(f.get("total"));
    const unavailable = kind === "Serviço" ? 0 : Number(f.get("indisponivel"));
    const name = String(f.get("nome") || "").trim();
    if (!name || unavailable > total) {
      toast.error("Confira o nome e as quantidades.");
      return;
    }
    if (
      item &&
      state.eventos.some(
        (e) => activeEvent(e) && reservedFor(item.id, e.date, state.eventos) > total - unavailable,
      ) &&
      kind !== "Serviço"
    ) {
      toast.error("A quantidade não pode ficar abaixo das reservas existentes.");
      return;
    }
    if (
      item &&
      kind !== (item.servico ? "Serviço" : "Item físico") &&
      state.eventos.some((e) => activeEvent(e) && e.itens.some((i) => i.estoqueId === item.id))
    ) {
      toast.error("Este item tem reservas. Preserve o tipo até concluir os eventos.");
      return;
    }
    const value: Stock = {
      id: item?.id || uid(),
      nome: name,
      categoria: category,
      total,
      disponivel: total - unavailable,
      reservado: 0,
      emUso: 0,
      indisponivel: unavailable,
      custo: Number(f.get("custo")),
      referencia: Number(f.get("referencia")),
      foto: photo,
      servico: kind === "Serviço",
    };
    update((s) => ({
      ...s,
      estoque: item ? s.estoque.map((i) => (i.id === item.id ? value : i)) : [...s.estoque, value],
    }));
    toast.success("Catálogo atualizado");
    close();
  }
  return (
    <form className="space-y-3" onSubmit={save}>
      <Field label="Nome" name="nome" required defaultValue={item?.nome} />
      <SelectField label="Tipo" value={kind} onChange={setKind}>
        <option>Item físico</option>
        <option>Serviço</option>
      </SelectField>
      <SelectField label="Categoria" value={category} onChange={setCategory}>
        {[...categorias.filter((c) => c !== "Todos"), "Outros"].map((c) => (
          <option key={c}>{c}</option>
        ))}
      </SelectField>
      {kind === "Item físico" && (
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Quantidade total"
            name="total"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={item?.total || 1}
          />
          <Field
            label="Indisponíveis"
            name="indisponivel"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={item?.indisponivel || 0}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="Custo unitário (R$)"
          name="custo"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={item?.custo || 0}
        />
        <Field
          label="Referência (R$)"
          name="referencia"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={item?.referencia || 0}
        />
      </div>
      <Field
        label="Foto · JPG, PNG ou WebP até 1,5 MB"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {photo && (
        <img src={photo} alt="Foto do item" className="h-28 w-full rounded-lg object-contain" />
      )}
      <button disabled={loading} className={buttonClass + " w-full"}>
        {loading ? "Carregando foto…" : "Salvar no catálogo"}
      </button>
    </form>
  );
}
function StockPage() {
  const { state } = useStore();
  const [date, setDate] = useState(demoToday);
  const [category, setCategory] = useState("Todos");
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<Stock | null>(null);
  const [open, setOpen] = useState(false);
  const enriched = state.estoque.map((i) => {
    const reserved = reservedFor(i.id, date, state.eventos);
    const inUse = state.eventos
      .filter((e) => e.date === date && e.status === "Em preparação")
      .reduce(
        (s, e) =>
          s +
          e.itens
            .filter((line) => line.estoqueId === i.id)
            .reduce((sum, line) => sum + line.qtd, 0),
        0,
      );
    return {
      ...i,
      reservado: Math.max(0, reserved - inUse),
      emUso: inUse,
      disponivel: Math.max(0, i.total - reserved - (i.indisponivel || 0)),
      shortage: reserved > i.total - (i.indisponivel || 0),
    };
  });
  const list = enriched.filter(
    (i) =>
      (category === "Todos" || i.categoria === category) &&
      i.nome.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "Todos" ||
        (filter === "Disponível" && (i.servico || i.disponivel > 0)) ||
        (filter === "Reservado" && i.reservado > 0) ||
        (filter === "Em uso" && i.emUso > 0) ||
        (filter === "Indisponível" && (i.indisponivel || 0) > 0)),
  );
  return (
    <AppShell>
      <TopBar
        title="Catálogo e estoque"
        overline="Tudo pronto para a próxima festa"
        back={{ to: "/", label: "Início" }}
        right={
          <AddButton
            label="Cadastrar item ou serviço"
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          />
        }
      />
      <div className="space-y-3 px-4 pt-4">
        <Field
          label="Disponibilidade na data"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Field
          label="Buscar item ou serviço"
          type="search"
          placeholder="Painel, mesa, decoração…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField label="Categoria" value={category} onChange={setCategory}>
          {[...categorias, "Outros"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SelectField>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {["Todos", "Disponível", "Reservado", "Em uso", "Indisponível"].map((f) => (
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
          Reservas por dia inteiro. “Em uso” acompanha eventos em preparação na data selecionada.
        </p>
        {list.map((i) => (
          <div key={i.id} className={cardClass}>
            <button
              onClick={() => {
                setEdit(i);
                setOpen(true);
              }}
              className="flex w-full items-center gap-3 text-left"
            >
              {i.foto ? (
                <img src={i.foto} alt={i.nome} className="size-14 rounded-lg object-cover" />
              ) : (
                <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                  <Package className="size-6" />
                </span>
              )}
              <div>
                <p className="text-sm font-semibold">{i.nome}</p>
                <p className="mt-1 text-xs text-ink/50">
                  {i.categoria} · {i.servico ? "Serviço" : "Item físico"}
                </p>
                <p className="mt-1 text-xs text-brand">Editar cadastro →</p>
              </div>
            </button>
            {!i.servico && (
              <div className="mt-3 grid grid-cols-4 gap-1 border-t border-ink/10 pt-3 text-center">
                {[
                  ["Total", i.total],
                  ["Livre", i.disponivel],
                  ["Reservado", i.reservado],
                  ["Em uso", i.emUso],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="font-mono text-lg font-bold">{value}</p>
                    <p className="text-[9px] text-ink/50">{label}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-ink/60">
              Custo {brlExact(i.custo)} · referência {brlExact(i.referencia)}
            </p>
            {(i.indisponivel || 0) > 0 && (
              <p className="mt-2 text-xs text-accent">
                {i.indisponivel} unidade(s) indisponível(is)
              </p>
            )}
            {i.shortage && (
              <p role="alert" className="mt-2 rounded-lg bg-accent/10 p-2 text-xs text-accent">
                Reservas excedem o estoque. Revise os eventos desta data.
              </p>
            )}
            {state.eventos
              .filter(
                (e) =>
                  activeEvent(e) &&
                  e.date === date &&
                  e.itens.some((line) => line.estoqueId === i.id),
              )
              .map((e) => (
                <Link
                  key={e.id}
                  to="/eventos/$id"
                  params={{ id: e.id }}
                  className="mt-2 block min-h-8 text-xs text-brand underline"
                >
                  Reservado para {e.cliente} · {e.tema}
                </Link>
              ))}
          </div>
        ))}
        {!list.length && (
          <Empty
            title="Nenhum item por aqui"
            text="Ajuste os filtros ou adicione um item ao catálogo."
          />
        )}
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? "Editar item" : "Novo item ou serviço"}
      >
        <StockForm item={edit || undefined} close={() => setOpen(false)} />
      </Modal>
    </AppShell>
  );
}
