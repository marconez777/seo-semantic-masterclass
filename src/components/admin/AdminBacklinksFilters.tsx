import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OFFICIAL_CATEGORIES } from "@/lib/categories";
import type { AdminFilters } from "./AdminBacklinksManager";

interface Props {
  q: string;
  setQ: (v: string) => void;
  filters: AdminFilters;
  setFilters: (f: AdminFilters) => void;
  onRefresh: () => void;
  loading: boolean;
}

const DA_RANGES = [
  { label: "Todos", value: "todos" },
  { label: "0–10", value: "0-10" },
  { label: "10–20", value: "10-20" },
  { label: "20–30", value: "20-30" },
  { label: "30–40", value: "30-40" },
  { label: "40–50", value: "40-50" },
  { label: "50–60", value: "50-60" },
  { label: "60–70", value: "60-70" },
  { label: "70–80", value: "70-80" },
  { label: "80–90", value: "80-90" },
  { label: "90–99", value: "90-99" },
];

const TRAFFIC_RANGES = [
  { label: "Todos", value: "todos" },
  { label: "0–100", value: "0-100" },
  { label: "100–1k", value: "100-1000" },
  { label: "1k–10k", value: "1000-10000" },
  { label: "10k–100k", value: "10000-100000" },
  { label: "100k+", value: "100000+" },
];

const PRICE_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Até R$ 50", value: "50" },
  { label: "Até R$ 100", value: "100" },
  { label: "Até R$ 200", value: "200" },
  { label: "Até R$ 500", value: "500" },
  { label: "Até R$ 1.000", value: "1000" },
];

const selectClass = "h-9 rounded-md border border-input bg-background px-2 text-sm";

export default function AdminBacklinksFilters({ q, setQ, filters, setFilters, onRefresh, loading }: Props) {
  const update = (key: keyof AdminFilters, value: string) =>
    setFilters({ ...filters, [key]: value });

  const hasActiveFilters =
    filters.category !== "todos" ||
    filters.daRange !== "todos" ||
    filters.trafficRange !== "todos" ||
    filters.maxPrice !== "" ||
    filters.status !== "todos";

  const resetFilters = () =>
    setFilters({ category: "todos", daRange: "todos", trafficRange: "todos", maxPrice: "", status: "todos" });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Buscar</label>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Domínio ou URL…"
          className="w-56 h-9"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Categoria</label>
        <select
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
          className={selectClass}
        >
          <option value="todos">Todas</option>
          {OFFICIAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">DA</label>
        <select
          value={filters.daRange}
          onChange={(e) => update("daRange", e.target.value)}
          className={selectClass}
        >
          {DA_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Tráfego</label>
        <select
          value={filters.trafficRange}
          onChange={(e) => update("trafficRange", e.target.value)}
          className={selectClass}
        >
          {TRAFFIC_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Preço máx.</label>
        <select
          value={filters.maxPrice}
          onChange={(e) => update("maxPrice", e.target.value)}
          className={selectClass}
        >
          {PRICE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Status</label>
        <select
          value={filters.status}
          onChange={(e) => update("status", e.target.value)}
          className={selectClass}
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
          Buscar
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
