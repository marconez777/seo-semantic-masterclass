#!/usr/bin/env node
// Typecheck. Pula em silêncio se as dependências não estiverem instaladas,
// para não travar quem acabou de clonar o repo.
//
// Conferido em 2026-08-28: `npx tsc --noEmit` passa limpo neste repo, então
// este gate pode bloquear sem gerar atrito falso. Se um dia começar a acusar
// erro preexistente, conserte o erro — não afrouxe o gate.
//
// Lint NÃO é gate aqui de propósito: `npm run lint` acusa 124 erros
// preexistentes (2026-08-28). Ligar isso reprovaria toda edição no primeiro dia.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

if (!existsSync("node_modules/typescript")) {
  console.log("Typecheck pulado (dependências não instaladas — rode `npm ci`).");
  process.exit(0);
}

const r = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["tsc", "--noEmit"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(r.status ?? 0);
