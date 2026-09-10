import { createFileRoute } from "@tanstack/react-router";
import { ClientDetail } from "@/components/client-pages";
export const Route = createFileRoute("/clientes/$id")({
  head: () => ({ meta: [{ title: "História do cliente · Sonhando Festas" }] }),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <ClientDetail id={id} />;
}
