// Imprime uma impressão digital do conteúdo publicado: sha256 de (slug, datas) de toda
// linha das FONTES (scripts/site.mjs), e das colunas de VIGIAR, se houver. São as mesmas linhas que o prerender.mjs lê, pela
// mesma chave pública. Usado pelo ops/regerar-se-mudou.sh, na VPS.
// Muda quando uma linha é criada, editada, publicada, despublicada ou apagada — por isso
// a lista inteira, e não só a data mais recente (despublicar a linha mais nova faria o
// máximo voltar para um valor já visto).
// Sai com erro, sem imprimir nada, se o banco não responder.
import { createHash } from "node:crypto";
import { loadEnv } from "vite";
import * as site from "./site.mjs";

const { FONTES } = site;
// Opcional em site.mjs: tabelas que não viram URL mas aparecem no HTML (catálogo, textos
// de página). Mudou alguma linha, o cron regera como se fosse conteúdo novo.
const VIGIAR = site.VIGIAR ?? [];

const POR_PAGINA = 1000;

async function main() {
  // Site sem banco: a impressão nunca muda e o cron nunca regera.
  if (!FONTES.length && !VIGIAR.length) return console.log("sem-fontes");

  const env = loadEnv("production", process.cwd(), "VITE_");
  const chave = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  const hash = createHash("sha256");

  const consultas = [
    ...FONTES.map((fonte) => {
      const colunaSlug = fonte.colunaSlug ?? "slug";
      return {
        tabela: fonte.tabela,
        colunas: [colunaSlug, ...(fonte.datas ?? [])].join(","),
        filtro: fonte.filtro,
        ordem: colunaSlug,
      };
    }),
    ...VIGIAR.map((v) => ({ tabela: v.tabela, colunas: v.colunas ?? "*", filtro: v.filtro, ordem: v.ordem ?? "id" })),
  ];

  for (const fonte of consultas) {
    const filtro = Object.entries(fonte.filtro ?? {})
      .map(([k, v]) => `&${encodeURIComponent(k)}=eq.${encodeURIComponent(v)}`)
      .join("");
    for (let de = 0; ; de += POR_PAGINA) {
      const url = `${env.VITE_SUPABASE_URL}/rest/v1/${fonte.tabela}?select=${fonte.colunas}${filtro}&order=${fonte.ordem}`;
      const resposta = await fetch(url, {
        headers: { apikey: chave, Authorization: `Bearer ${chave}`, Range: `${de}-${de + POR_PAGINA - 1}` },
        signal: AbortSignal.timeout(20_000),
      });
      if (!resposta.ok) throw new Error(`${fonte.tabela}: HTTP ${resposta.status}`);
      const linhas = await resposta.json();
      // Resposta que não é lista (erro em JSON com status 200, proxy no meio) não vira impressão.
      if (!Array.isArray(linhas)) throw new Error(`${fonte.tabela}: resposta inesperada do banco`);
      hash.update(`${fonte.tabela}\n${JSON.stringify(linhas)}\n`);
      if (linhas.length < POR_PAGINA) break;
    }
  }
  console.log(hash.digest("hex"));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
