import { createFileRoute } from "@tanstack/react-router";
import { ClientsPage } from "@/components/client-pages";
export const Route = createFileRoute("/clientes/")({
  head: () => ({ meta: [{ title: "Clientes · Sonhando Festas" }] }),
  component: ClientsPage,
});
