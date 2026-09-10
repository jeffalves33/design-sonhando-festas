import { createFileRoute } from "@tanstack/react-router";
import { QuoteForm } from "@/components/quote-pages";
export const Route = createFileRoute("/orcamentos/novo")({
  head: () => ({ meta: [{ title: "Novo orçamento · Sonhando Festas" }] }),
  component: QuoteForm,
});
