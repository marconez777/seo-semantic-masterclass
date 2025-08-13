import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

export type BacklinkItem = {
  id: string;
  site_name?: string | null;
  site_url?: string | null;
  dr?: number | null;
  da?: number | null;
  traffic?: number | null;
  category: string;
  price_cents: number;
};

function brl(v: number) {
  return (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const getCategoryBadgeClass = (category: string) => {
  const categoryColors: Record<string, string> = {
    'Tecnologia': 'bg-blue-100 text-blue-800 border-blue-200',
    'Entretenimento': 'bg-purple-100 text-purple-800 border-purple-200',
    'Notícias': 'bg-green-100 text-green-800 border-green-200',
    'Alimentação': 'bg-orange-100 text-orange-800 border-orange-200',
    'Automóveis': 'bg-red-100 text-red-800 border-red-200',
    'Direito': 'bg-slate-100 text-slate-800 border-slate-200',
    'Educação': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Esportes': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Finanças': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Marketing': 'bg-pink-100 text-pink-800 border-pink-200',
    'Moda': 'bg-rose-100 text-rose-800 border-rose-200',
    'Negócios': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Pets': 'bg-amber-100 text-amber-800 border-amber-200',
    'Turismo': 'bg-teal-100 text-teal-800 border-teal-200'
  };
  return categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function BacklinkTableRow({ item, onBuy }: { item: BacklinkItem; onBuy: (b: BacklinkItem) => void }) {
  const [favId, setFavId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('favoritos')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('backlink_id', item.id)
        .maybeSingle();
      if (mounted) setFavId(data?.id ?? null);
    })();
    return () => { mounted = false; };
  }, [item.id]);

  const toggleFavorite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Faça login para favoritar.');
      window.location.href = '/auth';
      return;
    }
    try {
      if (favId) {
        const { error } = await supabase.from('favoritos').delete().eq('id', favId);
        if (!error) setFavId(null);
        else console.error(error);
      } else {
        const { data, error } = await supabase
          .from('favoritos')
          .insert({ user_id: session.user.id, backlink_id: item.id })
          .select('id')
          .maybeSingle();
        if (!error && data) setFavId(data.id);
      }
    } catch (e) {
      console.error('favorite error', e);
    }
  };

  return (
    <tr className="border-t">
      <td className="p-4">{item.site_name || item.site_url}</td>
      <td className="p-4 text-primary font-medium">{item.dr ?? '-'}</td>
      <td className="p-4 text-muted-foreground">{item.da ?? '-'}</td>
      <td className="p-4">{item.traffic?.toLocaleString('pt-BR') ?? '-'}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryBadgeClass(item.category)}`}>
          {item.category}
        </span>
      </td>
      <td className="p-4 font-medium">{brl(item.price_cents)}</td>
      <td className="p-4 flex items-center justify-end gap-2">
        <Button size="sm" onClick={() => onBuy(item)}>Comprar</Button>
        <button aria-label="Favoritar" className={`p-2 rounded hover:bg-accent ${favId ? 'text-primary' : ''}`} onClick={toggleFavorite}>
          <Heart size={18} fill={favId ? 'currentColor' : 'none'} />
        </button>
      </td>
    </tr>
  );
}
