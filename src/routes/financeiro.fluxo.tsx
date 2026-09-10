import { createFileRoute } from "@tanstack/react-router";
import { CashFlowPage } from "@/components/finance-pages";
export const Route = createFileRoute("/financeiro/fluxo")({
  head: () => ({ meta: [{ title: "Fluxo de caixa · Sonhando Festas" }] }),
  component: CashFlowPage,
});
