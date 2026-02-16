import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OFFICIAL_CATEGORIES } from "@/lib/categories";
import { ExternalLink } from "lucide-react";
import type { Backlink, EditData } from "./AdminBacklinksManager";

interface Props {
  backlink: Backlink;
  isEditing: boolean;
  editData: EditData | null;
  setEditData: (d: EditData | null) => void;
  saving: boolean;
  deletingId: string | null;
  onStartEditing: (b: Backlink) => void;
  onCancelEditing: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
}

export default function AdminBacklinksTableRow({
  backlink: b,
  isEditing,
  editData,
  setEditData,
  saving,
  deletingId,
  onStartEditing,
  onCancelEditing,
  onSave,
  onDelete,
}: Props) {
  if (isEditing && editData) {
    return (
      <tr className="border-t align-top bg-muted/30">
        <td className="p-2">
          <Input
            value={editData.domain}
            onChange={(e) => setEditData({ ...editData, domain: e.target.value })}
            placeholder="Domínio"
            className="h-8 text-xs"
          />
        </td>
        <td className="p-2">
          <select
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="">— Sem categoria —</option>
            {OFFICIAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </td>
        <td className="p-2">
          <div className="flex gap-1">
            <Input type="number" value={editData.dr} onChange={(e) => setEditData({ ...editData, dr: e.target.value })} placeholder="DR" className="w-16 h-8 text-xs" />
            <Input type="number" value={editData.da} onChange={(e) => setEditData({ ...editData, da: e.target.value })} placeholder="DA" className="w-16 h-8 text-xs" />
          </div>
        </td>
        <td className="p-2">
          <Input type="number" value={editData.traffic} onChange={(e) => setEditData({ ...editData, traffic: e.target.value })} placeholder="Tráfego" className="w-24 h-8 text-xs" />
        </td>
        <td className="p-2">
          <Input type="number" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} placeholder="Preço (R$)" className="w-24 h-8 text-xs" />
        </td>
        <td className="p-2">
          <select
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </td>
        <td className="p-2">
          <div className="flex items-center gap-1">
            <Button size="sm" onClick={onSave} disabled={saving} className="h-8 text-xs">
              {saving ? "Salvando…" : "Salvar"}
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEditing} disabled={saving} className="h-8 text-xs">
              Cancelar
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t align-top">
      <td className="p-3">
        <div className="flex items-center gap-1">
          <span className="font-medium">{b.domain ?? "—"}</span>
          <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
            <ExternalLink size={14} />
          </a>
        </div>
      </td>
      <td className="p-3">{b.category ?? "—"}</td>
      <td className="p-3">{b.da ?? "—"}</td>
      <td className="p-3">{b.traffic?.toLocaleString("pt-BR") ?? "—"}</td>
      <td className="p-3">
        {b.price != null
          ? b.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "—"}
      </td>
      <td className="p-3">
        {b.status === "ativo" ? (
          <Badge className="bg-green-600 text-white hover:bg-green-600">Ativo</Badge>
        ) : (
          <Badge variant="outline">{b.status ?? "Inativo"}</Badge>
        )}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onStartEditing(b)}>Editar</Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(b.id)} disabled={deletingId === b.id}>
            {deletingId === b.id ? "Excluindo…" : "Excluir"}
          </Button>
        </div>
      </td>
    </tr>
  );
}
