import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ParsedRow {
  site_url?: string;
  site_name?: string;
  category?: string;
  da?: number | null;
  dr?: number | null;
  traffic?: number | null;
  price_cents?: number | null;
}

function normalizeHeader(h: string) {
  return h
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Categorias permitidas (padrão fixo)
const ALLOWED_CATEGORIES = [
  "Notícias",
  "Negócios",
  "Saúde",
  "Educação",
  "Tecnologia",
  "Finanças",
  "Casa",
  "Moda",
  "Turismo",
  "Alimentação",
  "Pets",
  "Automotivo",
  "Esportes",
  "Entretenimento",
  "Marketing",
  "Direito",
] as const;

const normalizeCat = (s: string) => s
  .toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const ALLOWED_NORMALIZED = new Set(Array.from(ALLOWED_CATEGORIES).map(normalizeCat));

function isValidCategory(cat?: string) {
  if (!cat) return false;
  return ALLOWED_NORMALIZED.has(normalizeCat(cat));
}

function toCanonicalCategory(cat?: string): string | undefined {
  if (!cat) return undefined;
  const n = normalizeCat(cat);
  const found = Array.from(ALLOWED_CATEGORIES).find(c => normalizeCat(c) === n);
  return found;
}

function parseMoneyToCents(value: any): number | null {
  if (value == null) return null;
  let s = String(value).trim();
  if (!s) return null;
  // Handle formats like 1.234,56 or 1,234.56 or 1234.56
  const hasCommaDecimal = /,\d{2}$/.test(s);
  s = s.replace(/[^0-9,.-]/g, "");
  if (hasCommaDecimal) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    s = s.replace(/,/g, "");
  }
  const num = Number.parseFloat(s);
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100);
}

function toNumber(val: any): number | null {
  if (val == null || val === "") return null;
  const s = String(val).replace(/[^0-9,.-]/g, "");
  const hasCommaDecimal = /,\d{1,2}$/.test(s);
  const cleaned = hasCommaDecimal ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isNaN(n) ? null : n;
}

function extractHost(url?: string) {
  if (!url) return undefined;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function AdminBacklinksImport() {
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [invalidCategoryRows, setInvalidCategoryRows] = useState<ParsedRow[]>([]);

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParsing(true);
    setRows([]);
    setImported(0);
    setSkipped(0);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // Map headers
      const parsed: ParsedRow[] = json.map((r) => {
        const mapped: Record<string, any> = {};
        for (const key of Object.keys(r)) {
          const nk = normalizeHeader(key);
          mapped[nk] = r[key];
        }

        // Possible headers in PT/EN
        const siteUrl = mapped["site url"] ?? mapped["url"] ?? mapped["site"] ?? mapped["dominio"] ?? mapped["dominio/host"] ?? mapped["domain"] ?? "";
        const siteName = mapped["site name"] ?? mapped["nome"] ?? mapped["nome do site"] ?? mapped["site"] ?? "";
        const category = mapped["categoria"] ?? mapped["category"] ?? "";
        const da = toNumber(mapped["da"] ?? mapped["domain authority"]);
        const dr = toNumber(mapped["dr"] ?? mapped["domain rating"]);
        const traffic = toNumber(mapped["trafego"] ?? mapped["trafego mensal"] ?? mapped["tráfego"] ?? mapped["tráfego mensal"] ?? mapped["traffic"]);
        const price_cents = parseMoneyToCents(mapped["valor"] ?? mapped["preco"] ?? mapped["preço"] ?? mapped["price"] ?? mapped["value"]);

        const urlStr = String(siteUrl || "").trim();
        const nameStr = String(siteName || "").trim();

        return {
          site_url: urlStr || undefined,
          site_name: nameStr || extractHost(urlStr) || undefined,
          category: String(category || "").trim() || undefined,
          da,
          dr,
          traffic,
          price_cents,
        } as ParsedRow;
      });

      setRows(parsed);
      toast({ title: "Planilha carregada", description: `${parsed.length} linhas lidas.` });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro ao ler arquivo", description: err?.message || "Verifique o formato." });
    } finally {
      setParsing(false);
    }
  }

async function startImport() {
  if (!rows.length) return;
  setImporting(true);
  setImported(0);
  setSkipped(0);
  setInvalidCategoryRows([]);

  let ok = 0, skip = 0;
  const invalids: ParsedRow[] = [];
  const chunkSize = 100;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    // Filtra e prepara; ignora categorias fora do padrão
    const payload = chunk
      .map((r) => {
        const site_url = r.site_url?.trim();
        const site_name = r.site_name?.trim() || extractHost(site_url);
        const categoryRaw = r.category?.trim();
        const canonical = toCanonicalCategory(categoryRaw || "");
        const price_cents = r.price_cents ?? null;
        const da = r.da ?? null;
        const dr = r.dr ?? null;
        const traffic = r.traffic ?? null;
        if (!site_url && !site_name) return null;
        if (!canonical) {
          invalids.push(r);
          return null;
        }
        return {
          site_url: site_url || null,
          site_name: site_name || null,
          category: canonical,
          price_cents,
          da,
          dr,
          traffic,
          is_active: true,
        };
      })
      .filter(Boolean) as any[];

    const toSkip = chunk.length - payload.length;
    skip += toSkip;

    if (payload.length) {
      const { error, count } = await supabase
        .from("backlinks")
        .insert(payload, { count: "exact" });
      if (error) {
        console.error("Erro ao importar", error);
        toast({ title: "Erro ao importar", description: error.message });
        // Conta todo o payload como ignorado em caso de erro para prosseguir
        skip += payload.length;
      } else {
        ok += count || payload.length;
        setImported(ok);
        setSkipped(skip);
      }
    }
  }

  setInvalidCategoryRows(invalids);
  setImporting(false);
  toast({ title: "Importação concluída", description: `${ok} inseridos, ${skip} ignorados. ${invalids.length ? invalids.length + ' com categoria inválida.' : ''}` });
}

  function reset() {
    setFileName("");
    setRows([]);
    setImported(0);
    setSkipped(0);
    setInvalidCategoryRows([]);
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Importar Sites (CSV/XLSX)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="block"
          />
          {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={reset} disabled={!rows.length || parsing || importing}>Limpar</Button>
            <Button onClick={startImport} disabled={!rows.length || parsing || importing}>Importar</Button>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Total linhas: {rows.length}. Inseridos: {imported}. Ignorados: {skipped}
          </div>
        )}

        {preview.length > 0 && (
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-accent/40">
                <tr className="text-left">
                  <th className="p-2">Site URL</th>
                  <th className="p-2">Site Nome</th>
                  <th className="p-2">Categoria</th>
                  <th className="p-2">DA</th>
                  <th className="p-2">DR</th>
                  <th className="p-2">Tráfego</th>
                  <th className="p-2">Valor (centavos)</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, idx) => {
                  const invalid = !isValidCategory(r.category);
                  return (
                    <tr key={idx} className={`border-t ${invalid ? 'bg-destructive/10' : ''}`}>
                      <td className="p-2">{r.site_url || "—"}</td>
                      <td className="p-2">{r.site_name || (r.site_url ? extractHost(r.site_url) : "—")}</td>
                      <td className="p-2">
                        {r.category || "—"}
                        {invalid && <span className="ml-2 text-[10px] text-destructive font-semibold">categoria inválida</span>}
                      </td>
                      <td className="p-2">{r.da ?? "—"}</td>
                      <td className="p-2">{r.dr ?? "—"}</td>
                      <td className="p-2">{r.traffic ?? "—"}</td>
                      <td className="p-2">{r.price_cents ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {invalidCategoryRows.length > 0 && (
          <div className="border rounded-md p-3 bg-destructive/5">
            <div className="font-semibold text-destructive mb-2">
              {invalidCategoryRows.length} linha(s) ignoradas por categoria inválida
            </div>
            <ul className="list-disc pl-5 text-sm">
              {invalidCategoryRows.slice(0, 50).map((r, i) => (
                <li key={i}>
                  {(r.site_name || r.site_url || '—')} — categoria: "{r.category || '—'}"
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
