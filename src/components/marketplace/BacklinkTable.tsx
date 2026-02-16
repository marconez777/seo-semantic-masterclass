import { useMemo, useState } from "react";
import BacklinkTableRow, { BacklinkItem } from "./BacklinkTableRow";
import TableAuthGate from "@/components/auth/TableAuthGate";
import { sortBacklinks } from "@/hooks/useBacklinksQuery";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SortKey = 'site_name' | 'dr' | 'da' | 'traffic' | 'category' | 'price_cents';

interface BacklinkTableProps {
  data: BacklinkItem[];
  isLoading: boolean;
  isAuthenticated: boolean;
  onBuy?: (b: BacklinkItem) => void;
}

export default function BacklinkTable({ 
  data, 
  isLoading, 
  isAuthenticated,
  onBuy 
}: BacklinkTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const sorted = useMemo(() => {
    return sortBacklinks(data, sortKey, sortDir);
  }, [data, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount);

  const visible = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const items = sorted.slice(start, start + itemsPerPage);

    if (isAuthenticated) {
      return items.map(item => ({ ...item, shouldBlur: false }));
    }

    // For non-authenticated users: show first 4 complete + 3 with blur
    return items.slice(0, 7).map((item, index) => ({
      ...item,
      shouldBlur: index >= 4
    }));
  }, [sorted, currentPage, itemsPerPage, isAuthenticated]);

  // Reset page when data changes
  useMemo(() => {
    setPage(1);
  }, [data.length, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown size={14} className="text-muted-foreground/50" />;
    return sortDir === 'desc' 
      ? <ArrowDown size={14} />
      : <ArrowUp size={14} />;
  };

  if (isLoading) {
    return (
      <div className="border rounded-xl bg-card shadow-sm p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-xl bg-card shadow-sm p-8 text-center">
        <p className="text-muted-foreground">Nenhum backlink encontrado com os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-[400px]">
        <div className="overflow-x-auto border rounded-xl bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-accent/40">
              <tr className="text-left">
                <th
                  className="p-4 cursor-pointer select-none hover:bg-accent/60 transition-colors"
                  onClick={() => handleSort('site_name')}
                >
                  <span className="inline-flex items-center gap-1">SITE <SortIcon columnKey="site_name" /></span>
                </th>
                <th
                  className="p-4 cursor-pointer select-none hover:bg-accent/60 transition-colors"
                  onClick={() => handleSort('da')}
                >
                  <span className="inline-flex items-center gap-1">DA <SortIcon columnKey="da" /></span>
                </th>
                <th
                  className="p-4 cursor-pointer select-none hover:bg-accent/60 transition-colors"
                  onClick={() => handleSort('traffic')}
                >
                  <span className="inline-flex items-center gap-1">TRÁFEGO <SortIcon columnKey="traffic" /></span>
                </th>
                <th
                  className="p-4 cursor-pointer select-none hover:bg-accent/60 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <span className="inline-flex items-center gap-1">CATEGORIA <SortIcon columnKey="category" /></span>
                </th>
                <th
                  className="p-4 cursor-pointer select-none hover:bg-accent/60 transition-colors"
                  onClick={() => handleSort('price_cents')}
                >
                  <span className="inline-flex items-center gap-1">PREÇO <SortIcon columnKey="price_cents" /></span>
                </th>
                <th className="p-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <BacklinkTableRow
                  key={item.id}
                  item={item}
                  onBuy={onBuy}
                  shouldBlur={item.shouldBlur}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Auth gate overlay for non-authenticated users */}
        {!isAuthenticated && <TableAuthGate />}
      </div>

      {/* Pagination */}
      {isAuthenticated && pageCount > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Por página:</span>
            <select
              className="border rounded px-2 py-1 text-sm bg-background"
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="text-sm">
              Página {currentPage} de {pageCount}
            </span>
            <button
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
            >
              Próxima
            </button>
          </div>
          <span className="text-sm text-muted-foreground">
            {sorted.length} sites encontrados
          </span>
        </div>
      )}
    </>
  );
}
