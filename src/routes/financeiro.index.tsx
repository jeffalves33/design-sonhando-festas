import { createFileRoute } from "@tanstack/react-router";
import { FinancePage } from "@/components/finance-pages";
export const Route = createFileRoute("/financeiro/")({
  head: () => ({ meta: [{ title: "Financeiro · Sonhando Festas" }] }),
  component: FinancePage,
});
