import { createRoot, hydrateRoot } from "react-dom/client";
import { hydrate, type DehydratedState } from "@tanstack/react-query";
import App from "./App.tsx";
import { queryClient } from "@/lib/queryClient";
import "./index.css";

const root = document.getElementById("root")!;

// O build estático (scripts/prerender.mjs) marca o #root com o path que renderizou e
// embute o cache das consultas. Sem a marca — `npm run dev`, shell das rotas só-app —
// é render normal no cliente. Marca de outro path (o 404.html servido numa URL qualquer)
// também cai no render normal: hidratar o HTML de outra rota daria mismatch.
const semBarraFinal = (p: string) => p.replace(/\/+$/, "") || "/";
const ssgPath = root.dataset.ssgPath;

if (ssgPath && semBarraFinal(ssgPath) === semBarraFinal(window.location.pathname)) {
  const state = (window as { __RQ_STATE__?: DehydratedState }).__RQ_STATE__;
  if (state) {
    hydrate(queryClient, state);
    // O que veio no HTML não é buscado de novo ao abrir a página. Sem isto o cache
    // nasce vencido e toda visita refaz as consultas; com o banco fora do ar a
    // rebusca falha, e página que trata erro como "não existe" manda o visitante
    // para o 404 com o conteúdo inteiro já na tela.
    for (const { queryKey } of state.queries) {
      queryClient.setQueryDefaults(queryKey, { staleTime: Infinity });
    }
  }
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
