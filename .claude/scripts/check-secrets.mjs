#!/usr/bin/env node
// Guarda de segredo. Roda em milissegundos; o que ela pega é irreversível.
// Variável com prefixo VITE_ vai para o bundle do navegador por definição.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["src", "supabase/functions", "scripts", "index.html", ".env.example"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".html", ".json", ".example"]);
const SKIP = new Set(["node_modules", "dist", ".git"]);

const REGRAS = [
  { re: /\b(?:VITE|NEXT_PUBLIC|PUBLIC)_[A-Z0-9_]*(?:SERVICE_ROLE|SECRET|PRIVATE_KEY|PASSWORD)\b/, msg: "segredo em variável pública (o bundler publica tudo com esse prefixo)" },
  { re: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, msg: "chave do Supabase escrita direto no código" },
  { re: /\bsb_secret_[A-Za-z0-9_-]{10,}/, msg: "secret key do Supabase escrita direto no código" },
  { re: /\bre_[A-Za-z0-9]{20,}/, msg: "chave da API do Resend escrita direto no código" },
  { re: /\bsk-[A-Za-z0-9]{20,}/, msg: "chave da OpenAI escrita direto no código" },
];

// Exceção conhecida e conferida em 2026-08-28: scripts/build-prerender.mjs,
// scripts/generate-redirects.js e scripts/prerender-supabase.js trazem uma chave
// "anon" (pública por design) de um projeto Supabase ANTIGO (ref lvinoytvsyloccajnrwp),
// que não é o desta aplicação (nxitvhrfloibpwrkskzx). É código morto — ver ADR-005.
// Ao apagar scripts/, apague esta exceção junto.
const REF_PROJETO_MORTO = "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aW5veXR2c3lsb2NjYWpucndw";

const achados = [];

function varrer(p) {
  let st;
  try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) {
    for (const e of readdirSync(p)) if (!SKIP.has(e)) varrer(join(p, e));
    return;
  }
  if (!EXT.has(extname(p))) return;
  const linhas = readFileSync(p, "utf8").split("\n");
  linhas.forEach((linha, i) => {
    for (const { re, msg } of REGRAS) {
      if (!re.test(linha)) continue;
      if (linha.includes(REF_PROJETO_MORTO)) continue;
      achados.push(`${p}:${i + 1} — ${msg}`);
    }
  });
}

for (const r of ROOTS) varrer(r);

if (achados.length) {
  console.error("Segredo exposto:\n" + achados.map((a) => "  - " + a).join("\n"));
  console.error("\nSegredo de edge function se configura no painel do Supabase. Ver .claude/rules/seguranca.md.");
  process.exit(2);
}
console.log("Guarda de segredo ok.");
