import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Keyword {
  id: string;
  keyword: string;
  volume: number;
  cpc: number;
  position: number;
}

interface Props {
  clientId: string;
  readOnly: boolean;
}

export function ConsultingKeywords({ clientId, readOnly }: Props) {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState("");
  const [newVolume, setNewVolume] = useState("");
  const [newCpc, setNewCpc] = useState("");

  const fetchKeywords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("consulting_keywords")
      .select("*")
      .eq("client_id", clientId)
      .order("position", { ascending: true });
    setKeywords(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchKeywords(); }, [clientId]);

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;
    const { error } = await supabase.from("consulting_keywords").insert({
      client_id: clientId,
      keyword: newKeyword.trim(),
      volume: parseInt(newVolume) || 0,
      cpc: parseFloat(newCpc) || 0,
      position: keywords.length + 1,
    });
    if (error) {
      toast({ title: "Erro", description: error.message });
    } else {
      setNewKeyword(""); setNewVolume(""); setNewCpc("");
      fetchKeywords();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("consulting_keywords").delete().eq("id", id);
    fetchKeywords();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Palavras-Chave ({keywords.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Palavra-chave</TableHead>
              <TableHead className="w-32">Volume</TableHead>
              <TableHead className="w-32">CPC (BRL)</TableHead>
              {!readOnly && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={readOnly ? 4 : 5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : keywords.length === 0 && readOnly ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma palavra-chave cadastrada</TableCell></TableRow>
            ) : (
              <>
                {keywords.map((kw, idx) => (
                  <TableRow key={kw.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{kw.keyword}</TableCell>
                    <TableCell>{kw.volume.toLocaleString("pt-BR")}</TableCell>
                    <TableCell>R$ {Number(kw.cpc).toFixed(2)}</TableCell>
                    {!readOnly && (
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(kw.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!readOnly && (
                  <TableRow>
                    <TableCell className="text-muted-foreground">{keywords.length + 1}</TableCell>
                    <TableCell>
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Nova palavra-chave"
                        className="h-8"
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newVolume}
                        onChange={(e) => setNewVolume(e.target.value)}
                        placeholder="0"
                        className="h-8"
                        type="number"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newCpc}
                        onChange={(e) => setNewCpc(e.target.value)}
                        placeholder="0.00"
                        className="h-8"
                        type="number"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={handleAdd}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
