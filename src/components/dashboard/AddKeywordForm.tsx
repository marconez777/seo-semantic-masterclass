import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface Props {
  projectId: string;
  currentCount: number;
  maxKeywords?: number;
  onAdded: () => void;
}

export function AddKeywordForm({ projectId, currentCount, maxKeywords = 60, onAdded }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const remaining = maxKeywords - currentCount;

  const handleAdd = async () => {
    const keywords = input
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);

    if (keywords.length === 0) {
      toast({ title: "Digite pelo menos uma palavra-chave" });
      return;
    }

    if (keywords.length > remaining) {
      toast({ title: `Limite excedido. Você pode adicionar mais ${remaining} palavras.` });
      return;
    }

    setLoading(true);
    const rows = keywords.map((keyword) => ({ project_id: projectId, keyword }));
    const { error } = await supabase.from("tracked_keywords").insert(rows);
    setLoading(false);

    if (error) {
      toast({ title: "Erro ao adicionar palavras-chave", description: error.message });
      return;
    }

    toast({ title: `${keywords.length} palavra(s) adicionada(s)!` });
    setInput("");
    onAdded();
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: comprar backlinks, seo brasil"
          disabled={remaining <= 0}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {currentCount}/{maxKeywords} palavras usadas. Separe por vírgula para adicionar várias.
        </p>
      </div>
      <Button size="sm" onClick={handleAdd} disabled={loading || remaining <= 0}>
        <Plus className="h-4 w-4 mr-1" />
        {loading ? "..." : "Adicionar"}
      </Button>
    </div>
  );
}
