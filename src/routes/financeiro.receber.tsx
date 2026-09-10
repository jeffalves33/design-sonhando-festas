import { createFileRoute } from "@tanstack/react-router";
import { BillsPage } from "@/components/finance-pages";
export const Route = createFileRoute("/financeiro/receber")({
  head: () => ({ meta: [{ title: "Contas a receber · Sonhando Festas" }] }),
  component: () => <BillsPage type="receber" />,
});
