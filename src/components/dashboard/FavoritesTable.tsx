import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function FavoritesTable({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: favs, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) console.error('Erro favoritos', error);
      const backlinkIds = (favs ?? []).map((f) => f.backlink_id);
      let backlinkMap: Record<string, string> = {};
      if (backlinkIds.length) {
        const { data: backs } = await supabase
          .from('backlinks')
          .select('id, domain, url')
          .in('id', backlinkIds);
        (backs ?? []).forEach((b) => { backlinkMap[b.id] = b.domain || b.url; });
      }
      if (mounted) setRows((favs ?? []).map((f) => ({ ...f, site: backlinkMap[f.backlink_id] })));
    })();
    return () => { mounted = false; };
  }, [userId]);

  return (
    <div className="border rounded-md overflow-x-auto bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/60">
          <tr className="text-left">
            <th className="p-3 uppercase font-bold tracking-wide">Site</th>
            <th className="p-3 uppercase font-bold tracking-wide">Adicionado</th>
            <th className="p-3 uppercase font-bold tracking-wide">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="p-4" colSpan={3}>Sem favoritos.</td></tr>
          ) : rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{r.site ?? r.backlink_id}</td>
              <td className="p-3">{new Date(r.created_at).toLocaleString('pt-BR')}</td>
              <td className="p-3">
                <Button variant="destructive" size="sm" onClick={async () => {
                  const { error } = await supabase.from('favoritos').delete().eq('id', r.id);
                  if (!error) setRows((prev) => prev.filter((x) => x.id !== r.id));
                }}>Remover</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
