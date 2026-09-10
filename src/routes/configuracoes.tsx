import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell, TopBar, Section } from "@/components/app-shell";
import { Field, MenuLink, Modal, buttonClass, cardClass } from "@/components/forms";
import { useStore, downloadText, initialState, isState } from "@/lib/store";
export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações · Sonhando Festas" }] }),
  component: Settings,
});
function Settings() {
  const { state, update } = useStore();
  const importRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
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
  async function importBackup(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5_000_000) {
      toast.error("Escolha uma cópia de até 5 MB.");
      return;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isState(parsed)) throw new Error("invalid");
      update(() => parsed);
      toast.success("Cópia restaurada com sucesso.");
    } catch {
      toast.error("Esse arquivo não é uma cópia válida do Sonhando Festas.");
    }
  }
  return (
    <AppShell>
      <TopBar title="Seu negócio" overline="Configurações" back={{ to: "/", label: "Início" }} />
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
          <MenuLink to="/relatorios" title="Relatórios" subtitle="Resultados do negócio" />
        </div>
      </Section>
      <Section title="Sobre esta demonstração">
        <div className={cardClass + " space-y-3 text-xs leading-relaxed text-ink/65"}>
          <p>
            Marcia, este é um protótipo interativo com dados fictícios de junho de 2026. A agenda
            considera você como a única responsável pela execução.
          </p>
          <p>
            As alterações ficam neste navegador. Ainda não há conta online, sincronização entre
            dispositivos ou envio automático de mensagens.
          </p>
          <p>
            Na proposta, você escolhe como compartilhar e mantém a conversa pessoal com cada
            cliente.
          </p>
          <button
            onClick={() =>
              downloadText(
                "sonhando-festas-backup.json",
                JSON.stringify(state, null, 2),
                "application/json",
              )
            }
            className={buttonClass + " w-full"}
          >
            Exportar cópia dos dados
          </button>
          <input
            ref={importRef}
            className="hidden"
            type="file"
            accept="application/json,.json"
            onChange={importBackup}
          />
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="min-h-11 w-full rounded-lg px-4 text-sm font-semibold text-brand ring-1 ring-brand/30"
          >
            Restaurar uma cópia
          </button>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="min-h-11 w-full rounded-lg px-4 text-sm font-semibold text-accent ring-1 ring-accent/30"
          >
            Restaurar dados da demonstração
          </button>
        </div>
      </Section>
      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restaurar a demonstração?"
      >
        <p className="text-sm text-ink/70">
          Isso substitui clientes, eventos, estoque e financeiro deste navegador pelos dados
          fictícios originais. Exporte uma cópia antes se quiser guardar suas alterações.
        </p>
        <button
          type="button"
          onClick={() => {
            update(() => structuredClone(initialState));
            setConfirmReset(false);
            toast.success("Demonstração restaurada. Tudo pronto para apresentar!");
          }}
          className={buttonClass + " bg-accent"}
        >
          Sim, restaurar demonstração
        </button>
      </Modal>
    </AppShell>
  );
}
