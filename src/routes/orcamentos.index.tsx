import { createFileRoute } from "@tanstack/react-router";
import { QuotesPage } from "@/components/quote-pages";
export const Route = createFileRoute("/orcamentos/")({
  head: () => ({ meta: [{ title: "Orçamentos · Sonhando Festas" }] }),
  component: QuotesPage,
});
