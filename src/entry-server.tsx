// Entrada do build estático. Não roda no navegador: é empacotada por
// `vite build --ssr` e chamada por scripts/prerender.mjs, uma vez por URL.
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient, dehydrate, type Query, type QueryObserverOptions } from "@tanstack/react-query";
import { AppProviders, AppRoutes } from "./App";

// Página → consulta → componente → outra consulta. Cada passada resolve um nível
// (um artigo de blog com autor e relacionados costuma pedir 4). O teto só existe para
// um laço de consultas não travar o build.
const MAX_PASSADAS = 8;

type HelmetData = Record<string, { toString(): string } | undefined>;

function renderizar(url: string, client: QueryClient, helmetContext: object): Promise<string> {
  return new Promise((resolve, reject) => {
    const partes: Buffer[] = [];
    const saida = new PassThrough();
    saida.on("data", (c: Buffer) => partes.push(c));
    saida.on("end", () => resolve(Buffer.concat(partes).toString("utf8")));
    saida.on("error", reject);

    const { pipe } = renderToPipeableStream(
      <AppProviders client={client} helmetContext={helmetContext}>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AppProviders>,
      {
        // onAllReady, e não onShellReady: espera os React.lazy das páginas, senão o
        // HTML sai com o "Carregando..." do Suspense no lugar do conteúdo.
        onAllReady: () => pipe(saida),
        onShellError: reject,
        onError: reject,
      },
    );
  });
}

// O useQuery não busca nada fora do navegador (a busca nasce num efeito). A consulta
// fica registrada no cache como pendente; aqui ela é executada entre uma passada e outra.
function consultasPendentes(client: QueryClient): Query[] {
  return client
    .getQueryCache()
    .getAll()
    .filter((q) => {
      // `enabled` é opção do observer; o cache guarda a do último useQuery que montou.
      const { enabled } = q.options as QueryObserverOptions;
      const ligada = typeof enabled === "function" ? enabled(q) : enabled !== false;
      return q.state.status === "pending" && q.state.fetchStatus === "idle" && ligada;
    });
}

export async function render(url: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const errosDeConsulta: string[] = [];
  let html = "";
  let helmet: HelmetData = {};
  let passadas = 0;

  for (;;) {
    const helmetContext: { helmet?: HelmetData } = {};
    html = await renderizar(url, client, helmetContext);
    helmet = helmetContext.helmet ?? {};
    passadas++;

    const pendentes = consultasPendentes(client);
    if (pendentes.length === 0) break;
    if (passadas >= MAX_PASSADAS) {
      throw new Error(`${url}: consultas ainda pendentes depois de ${MAX_PASSADAS} passadas`);
    }
    await Promise.all(
      pendentes.map((q) =>
        q.fetch().catch((e: unknown) => {
          errosDeConsulta.push(`${JSON.stringify(q.queryKey)}: ${e instanceof Error ? e.message : String(e)}`);
        }),
      ),
    );
  }

  // `priority` só existe com <Helmet prioritizeSeoTags>: description, canonical e og vão
  // para ele em vez de meta/link. Sem ler, a página sai sem descrição nem canonical.
  const head = ["title", "priority", "meta", "link", "script"].map((k) => helmet[k]?.toString() ?? "").join("");
  return { html, head, state: dehydrate(client), passadas, errosDeConsulta };
}
