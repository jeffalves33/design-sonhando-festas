import { createFileRoute } from "@tanstack/react-router";
import { BillsPage } from "@/components/finance-pages";
export const Route = createFileRoute("/financeiro/pagar")({
  head: () => ({ meta: [{ title: "Contas a pagar · Sonhando Festas" }] }),
  component: () => <BillsPage type="pagar" />,
});
