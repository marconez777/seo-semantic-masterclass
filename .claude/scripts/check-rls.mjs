#!/usr/bin/env node
// Gate de RLS — leitura estática das migrations.
//
// Não substitui teste de RLS com token real (ver .claude/rules/seguranca.md),
// mas pega deterministicamente os erros que vazam dado em projeto Supabase.
//
// Migrations até BASELINE são histórico: nelas as regras estritas viram aviso.
// Migrations novas passam pela regra cheia.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "supabase/migrations";
const BASELINE = "20260828120000"; // última migration existente em 2026-08-28
const NOT_A_TABLE = new Set(["if", "for", "to", "as", "the", "with", "on"]);

// Objetos do checkout antigo, removidos pela migration de quarentena 20250823111026
// via SQL dinâmico (que este script não consegue ler). Nenhum aparece em
// src/integrations/supabase/types.ts, ou seja, não existem mais no banco.
// Se algum dia reaparecerem em types.ts, TIRE daqui — o alerta era verdadeiro.
const LEGADO_QUARENTENADO = new Set(["pedidos_pii_secure", "pedidos_pii_masked", "checkout_migration_log"]);

// Tabelas cujo conteúdo é público por definição — SELECT liberado é o esperado.
const CONTEUDO_PUBLICO = new Set(["page_seo_content", "categories", "backlinks_public"]);

const RE_TABELA = /create table\s+(?:if not exists\s+)?(?:public\.)?["']?([a-z0-9_]+)/g;
const RE_RLS_ON = /alter table\s+(?:public\.)?["']?([a-z0-9_]+)["']?\s+enable row level security/g;
const RE_DROP = /drop (?:table|view)(?: if exists)?\s+(?:public\.)?["']?([a-z0-9_]+)/g;
const RE_VIEW = /create(?: or replace)? view\s+(?:public\.)?["']?([a-z0-9_]+)["']?([\s\S]{0,200})/g;
const RE_POLICY = /create\s+policy\s+"?([^";\n]+?)"?\s+on\s+(?:public\.)?"?([a-z0-9_]+)"?([\s\S]{0,300}?);/gi;

let files;
try {
  files = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();
} catch {
  process.exit(0);
}

const all = files.map((f) => ({ file: f, sql: readFileSync(join(DIR, f), "utf8") }));
const allLower = all.map((f) => f.sql.toLowerCase()).join("\n");

const rlsEnabledAnywhere = new Set([...allLower.matchAll(RE_RLS_ON)].map((m) => m[1]));
const dropped = new Set([...allLower.matchAll(RE_DROP)].map((m) => m[1]));

const errors = [];
const warnings = [];
const abertas = [];

for (const { file, sql } of all) {
  const lower = sql.toLowerCase();
  const isNew = file.replace(/[^0-9].*$/, "") > BASELINE;

  // 1. tabela criada sem RLS
  for (const m of lower.matchAll(RE_TABELA)) {
    const table = m[1];
    if (NOT_A_TABLE.has(table) || dropped.has(table) || LEGADO_QUARENTENADO.has(table)) continue;
    const sameFile = new RegExp(`alter table\s+(?:public\.)?["']?${table}["']?\s+enable row level security`).test(lower);
    if (!rlsEnabledAnywhere.has(table)) {
      errors.push(`${file}: tabela "${table}" NUNCA recebeu "enable row level security" — dado exposto`);
    } else if (isNew && !sameFile) {
      errors.push(`${file}: tabela "${table}" criada sem RLS na mesma migration`);
    }
  }

  // 2. view sobre tabela protegida sem security_invoker
  for (const m of lower.matchAll(RE_VIEW)) {
    const view = m[1];
    if (NOT_A_TABLE.has(view) || LEGADO_QUARENTENADO.has(view)) continue;
    if (m[2].includes("security_invoker")) continue;
    const msg = `${file}: view "${view}" sem "WITH (security_invoker = true)" — ela fura RLS`;
    isNew || !dropped.has(view) ? errors.push(msg) : warnings.push(msg);
  }

  // 3. policy nova usando profiles.is_admin em vez de is_admin()/has_role()
  if (isNew && /create policy/i.test(sql) && /profiles[\s\S]{0,80}is_admin\s*=\s*true/i.test(sql)) {
    errors.push(`${file}: policy usando "profiles.is_admin" — use is_admin(auth.uid()) ou has_role(...)`);
  }

  // 4. policy de SELECT liberada para todo mundo.
  // Policies permissivas se SOMAM: uma dessas anula todas as restritivas da tabela.
  for (const m of sql.matchAll(RE_POLICY)) {
    const [, nome, tabela, corpo] = m;
    if (!/for\s+select/i.test(corpo)) continue;
    if (!/using\s*\(\s*true\s*\)/i.test(corpo)) continue;
    const t = tabela.toLowerCase();
    if (CONTEUDO_PUBLICO.has(t) || LEGADO_QUARENTENADO.has(t)) continue;
    const msg = `${file}: policy "${nome}" em "${tabela}" faz SELECT USING (true) — libera a tabela inteira`;
    isNew ? errors.push(msg) : abertas.push(msg);
  }
}

for (const w of warnings) console.log("  aviso: " + w);
for (const a of abertas) console.log("  ABERTA: " + a);
if (abertas.length) console.log("  → policy permissiva antiga anula as restritivas da mesma tabela. Ver docs/GOTCHAS.md.");

if (errors.length) {
  console.error("Gate de RLS falhou:\n" + errors.map((e) => "  - " + e).join("\n"));
  console.error("\nVeja .claude/rules/seguranca.md. Corrija a migration antes de continuar.");
  process.exit(2);
}
console.log(`Gate de RLS ok (${files.length} migrations, ${rlsEnabledAnywhere.size} tabelas com RLS).`);
