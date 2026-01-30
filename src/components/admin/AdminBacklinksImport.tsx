import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";

interface ParsedRow {
  url?: string;
  domain?: string;
  category?: string;
  da?: number | null;
  dr?: number | null;
  traffic?: number | null;
  price?: number | null;
}

// Template data for download
const TEMPLATE_DATA = [
  {
    "URL": "https://exemplo.com.br",
    "Categoria": "Tecnologia",
    "DA": 45,
    "Tráfego Mensal": 15000,
    "Valor": 350.00
  },
  {
    "URL": "https://noticiasagora.com.br",
    "Categoria": "Notícias",
    "DA": 38,
    "Tráfego Mensal": 25000,
    "Valor": 450.00
  },
  {
    "URL": "https://saudebemestar.com.br",
    "Categoria": "Saúde",
    "DA": 55,
    "Tráfego Mensal": 50000,
    "Valor": 600.00
  }
];

function normalizeHeader(h: string) {
  return h
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Categorias permitidas (padrão fixo)
const ALLOWED_CATEGORIES = [
  "Geral",
  "Notícias",
  "Negócios",
  "Saúde",
  "Educação",
  "Tecnologia",
  "Finanças",
  "Imóveis",
  "Moda",
  "Turismo",
  "Alimentação",
  "Pets",
  "Automotivo",
  "Esportes",
  "Entretenimento",
  "Marketing",
  "Direito",
  "Maternidade",
] as const;

const normalizeCat = (s: string) => s
  .toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const ALLOWED_NORMALIZED = new Set(Array.from(ALLOWED_CATEGORIES).map(normalizeCat));

function isValidCategory(cat?: string) {
  // Categoria vazia é válida (será atribuída como "Geral")
  if (!cat) return true;
  return ALLOWED_NORMALIZED.has(normalizeCat(cat));
}

function toCanonicalCategory(cat?: string): string | undefined {
  if (!cat) return undefined;
  const n = normalizeCat(cat);
  const found = Array.from(ALLOWED_CATEGORIES).find(c => normalizeCat(c) === n);
  return found;
}

function parseMoneyToReais(value: any): number | null {
  if (value == null) return null;
  let s = String(value).trim();
  if (!s) return null;
  
  // Remove currency symbols and spaces
  s = s.replace(/[^0-9,.-]/g, "");
  if (!s) return null;
  
  // Brazilian format detection:
  // - "16.000" = 16000 (dot is thousands separator, no decimal)
  // - "16.000,00" = 16000.00 (dot is thousands, comma is decimal)
  // - "16,00" = 16.00 (comma is decimal)
  // - "16000" = 16000 (no separators)
  
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  
  if (hasComma && hasDot) {
    // Format: 1.234,56 (Brazilian with both separators)
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    // Format: 1234,56 or 16,00 (comma as decimal)
    s = s.replace(",", ".");
  } else if (hasDot) {
    // Format: 16.000 or 1.234.567 (dots are thousands separators in BR)
    // Check if it looks like Brazilian thousands format (dot followed by 3 digits)
    const isBrazilianThousands = /\.\d{3}(?:\.|$)/.test(s) || /\.\d{3}$/.test(s);
    if (isBrazilianThousands) {
      s = s.replace(/\./g, ""); // Remove all dots (thousands separators)
    }
    // Otherwise keep as-is (could be 16.50 meaning sixteen and a half)
  }
  
  const num = Number.parseFloat(s);
  if (Number.isNaN(num)) return null;
  return num;
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

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet(TEMPLATE_DATA);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 35 }, // URL
      { wch: 15 }, // Categoria
      { wch: 8 },  // DA
      { wch: 15 }, // Tráfego Mensal
      { wch: 12 }, // Valor
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sites");
    
    // Generate and download
    XLSX.writeFile(wb, "template-importacao-sites.xlsx");
    
    toast({
      title: "Template baixado!",
      description: "Preencha a planilha e faça o upload para importar.",
    });
  }

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
        const urlValue = mapped["site url"] ?? mapped["url"] ?? mapped["site"] ?? mapped["dominio"] ?? mapped["dominio/host"] ?? mapped["domain"] ?? "";
        const domainValue = mapped["site name"] ?? mapped["nome"] ?? mapped["nome do site"] ?? mapped["site"] ?? "";
        const category = mapped["categoria"] ?? mapped["category"] ?? "";
        const da = toNumber(mapped["da"] ?? mapped["domain authority"]);
        const dr = toNumber(mapped["dr"] ?? mapped["domain rating"]);
        const traffic = toNumber(mapped["trafego"] ?? mapped["trafego mensal"] ?? mapped["tráfego"] ?? mapped["tráfego mensal"] ?? mapped["traffic"]);
        const price = parseMoneyToReais(mapped["valor"] ?? mapped["preco"] ?? mapped["preço"] ?? mapped["price"] ?? mapped["value"]);

        const urlStr = String(urlValue || "").trim();
        const domainStr = String(domainValue || "").trim();

        return {
          url: urlStr || undefined,
          domain: domainStr || extractHost(urlStr) || undefined,
          category: String(category || "").trim() || undefined,
          da,
          dr,
          traffic,
          price,
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
        const url = r.url?.trim();
        const domain = r.domain?.trim() || extractHost(url);
      const categoryRaw = r.category?.trim();
        // Se categoria vazia ou não reconhecida, usa "Geral"
        const canonical = toCanonicalCategory(categoryRaw || "") || "Geral";
        const price = r.price ?? null;
        const da = r.da ?? null;
        const dr = r.dr ?? null;
        const traffic = r.traffic ?? null;
        if (!url && !domain) return null;
        return {
          url: url || null,
          domain: domain || null,
          category: canonical,
          price,
          da,
          dr,
          traffic,
          status: 'ativo',
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
        <CardDescription>
          Baixe o template, preencha com seus sites e faça o upload para importar em massa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template download section */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-lg border border-dashed">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">Modelo de Planilha</h4>
            <p className="text-xs text-muted-foreground">
              Colunas: URL, Categoria (opcional), DA, Tráfego Mensal (opcional), Valor
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Se categoria estiver vazia, será atribuída como "Geral"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Categorias válidas: {ALLOWED_CATEGORIES.filter(c => c !== 'Geral').join(", ")}
            </p>
          </div>
          <Button variant="outline" onClick={downloadTemplate} className="shrink-0">
            <Download className="h-4 w-4 mr-2" />
            Baixar Template
          </Button>
        </div>

        {/* File upload section */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="block text-sm"
            />
          </div>
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
                  <th className="p-2">URL</th>
                  <th className="p-2">Domínio</th>
                  <th className="p-2">Categoria</th>
                  <th className="p-2">DA</th>
                  <th className="p-2">DR</th>
                  <th className="p-2">Tráfego</th>
                  <th className="p-2">Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, idx) => {
                  const invalid = !isValidCategory(r.category);
                  return (
                    <tr key={idx} className={`border-t ${invalid ? 'bg-destructive/10' : ''}`}>
                      <td className="p-2">{r.url || "—"}</td>
                      <td className="p-2">{r.domain || (r.url ? extractHost(r.url) : "—")}</td>
                      <td className="p-2">
                        {r.category || "—"}
                        {invalid && <span className="ml-2 text-[10px] text-destructive font-semibold">categoria inválida</span>}
                      </td>
                      <td className="p-2">{r.da ?? "—"}</td>
                      <td className="p-2">{r.dr ?? "—"}</td>
                      <td className="p-2">{r.traffic ?? "—"}</td>
                      <td className="p-2">{r.price != null ? r.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</td>
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
                  {(r.domain || r.url || '—')} — categoria: "{r.category || '—'}"
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
