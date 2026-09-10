import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
} from "@tanstack/react-router";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col items-center justify-center bg-cream px-6 text-center">
      <img src="/logo.jpg" alt="Sonhando Festas" className="mb-5 size-24 rounded-xl" />
      <p className="font-mono text-sm text-brand">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Esse caminho não existe</h1>
      <p className="mt-3 text-sm text-ink/60">
        Marcia, vamos voltar e encontrar o que você precisa?
      </p>
      <Link to="/" className="mt-6 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-cream">
        Voltar ao início
      </Link>
    </div>
  );
}
function ErrorComponent({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col items-center justify-center bg-cream px-6 text-center">
      <h1 className="text-xl font-semibold">Não foi possível abrir esta página</h1>
      <p className="mt-3 text-sm text-ink/60">Tente carregar novamente para continuar.</p>
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="mt-5 rounded-lg bg-ink px-5 py-3 text-sm text-cream"
      >
        Tentar novamente
      </button>
      <Link to="/" className="mt-3 p-3 text-sm text-brand">
        Ir para o início
      </Link>
    </div>
  );
}
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { title: "Sonhando Festas · Gestão de eventos" },
      {
        name: "description",
        content:
          "Cada festa, cada detalhe. Clientes, agenda, orçamentos e financeiro com Marcia Silva.",
      },
      { property: "og:title", content: "Sonhando Festas" },
      { property: "og:description", content: "Sua próxima festa começa com organização." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <HeadContent />
        <Outlet />
        <Toaster position="top-center" richColors />
      </StoreProvider>
    </QueryClientProvider>
  );
}
