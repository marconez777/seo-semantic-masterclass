#!/usr/bin/env node
// Checagem de drift: compara o last_validated de cada doc com a última
// alteração dos caminhos declarados em covers. Avisa, nunca bloqueia —
// documentação velha não deve travar o trabalho.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

// CLAUDE.md fica de fora de propósito: é o contrato, não descreve um trecho
// fixo de código, e por isso não leva frontmatter de validação.
const ALVOS = [".claude/rules", "docs"];
const docs = [];

function coletar(p) {
  let st;
  try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) { for (const e of readdirSync(p)) coletar(join(p, e)); return; }
  if (p.endsWith(".md")) docs.push(p);
}
for (const a of ALVOS) coletar(a);

const semFrontmatter = [];
const stale = [];
const vencidos = [];
const coversQuebrado = [];
const hoje = new Date().toISOString().slice(0, 10);

for (const doc of docs) {
  const texto = readFileSync(doc, "utf8");
  const validated = texto.match(/^last_validated:\s*(\S+)/m)?.[1];
  const reviewBy = texto.match(/^review_by:\s*(\S+)/m)?.[1];
  const coversRaw = texto.match(/^covers:\s*\[([^\]]*)\]/m)?.[1];

  if (!validated || coversRaw === undefined) { semFrontmatter.push(doc); continue; }
  if (reviewBy && reviewBy < hoje) vencidos.push(`${doc} (review_by ${reviewBy})`);

  for (const caminho of coversRaw.split(",").map((c) => c.trim()).filter(Boolean)) {
    const base = caminho.replace(/\/?\*\*.*$/, "").replace(/\/[^/]*\*[^/]*$/, "");
    try { statSync(base); } catch { coversQuebrado.push(`${doc} → "${caminho}" não existe`); continue; }
    let mudou = "";
    try {
      mudou = execSync(`git log -1 --format=%cs -- "${caminho}"`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch { continue; }
    if (mudou && mudou > validated) stale.push(`${doc} (validado ${validated}, "${caminho}" mudou ${mudou})`);
  }
}

const bloco = (titulo, itens) => itens.length && console.log(`\n${titulo}\n` + [...new Set(itens)].map((i) => "  - " + i).join("\n"));

bloco("SEM FRONTMATTER (a checagem não alcança estes):", semFrontmatter);
bloco("COVERS QUEBRADO (corrija: caminho inexistente faz a checagem passar sempre):", coversQuebrado);
bloco("PROVAVELMENTE DESATUALIZADO (código coberto mudou depois da validação):", stale);
bloco("VENCIDO (passou do review_by):", vencidos);

if (!semFrontmatter.length && !coversQuebrado.length && !stale.length && !vencidos.length) {
  console.log(`Documentação em dia (${docs.length} arquivos).`);
}
