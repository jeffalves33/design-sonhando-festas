import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell, TopBar, Section } from "@/components/app-shell";
import { Field, MenuLink, buttonClass, cardClass } from "@/components/forms";
import { useStore } from "@/lib/store";
export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações · Sonhando Festas" }] }),
  component: Settings,
});
function Settings() {
  const { state, update } = useStore();
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nome = String(f.get("nome") || "").trim();
    const empresa = String(f.get("empresa") || "").trim();
    if (!nome || !empresa) return;
    update((s) => ({
      ...s,
      perfil: {
        nome,
        empresa,
        telefone: String(f.get("telefone") || ""),
        cidade: String(f.get("cidade") || ""),
      },
    }));
    toast.success("Perfil atualizado, Marcia!");
  }
  return (
    <AppShell>
      <TopBar title="Seu negócio" back={{ to: "/", label: "Início" }} />
      <div className="px-4 pt-4">
        <div className={cardClass + " flex items-center gap-4"}>
          <img
            src="/logo.jpg"
            alt="Logo Sonhando Festas"
            className="size-20 rounded-lg object-contain"
          />
          <div>
            <p className="text-lg font-semibold">{state.perfil.nome}</p>
            <p className="text-xs text-ink/55">Administradora · {state.perfil.empresa}</p>
          </div>
        </div>
      </div>
      <Section title="Um atendimento com a sua cara">
        <form onSubmit={save} className="space-y-3">
          <Field label="Seu nome" name="nome" required defaultValue={state.perfil.nome} />
          <Field
            label="Nome da empresa"
            name="empresa"
            required
            defaultValue={state.perfil.empresa}
          />
          <Field
            label="Telefone de contato"
            name="telefone"
            type="tel"
            defaultValue={state.perfil.telefone}
          />
          <Field label="Cidade" name="cidade" defaultValue={state.perfil.cidade} />
          <button className={buttonClass + " w-full"}>Salvar configurações</button>
        </form>
      </Section>
      <Section title="Organização">
        <div className="space-y-2">
          <MenuLink to="/orcamentos" title="Orçamentos" subtitle="Propostas e aprovações" />
          <MenuLink to="/estoque" title="Catálogo e estoque" subtitle="Itens físicos e serviços" />
          <MenuLink
            to="/financeiro"
            title="Financeiro e resultados"
            subtitle="Caixa, eventos e clientes"
          />
        </div>
      </Section>
    </AppShell>
  );
}
