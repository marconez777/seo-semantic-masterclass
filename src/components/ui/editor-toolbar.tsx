import { type Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    if (editor.isActive("heading", { level: 4 })) return "h4";
    return "paragraph";
  };

  const handleHeadingChange = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL do link:", previousUrl);
    
    if (url === null) return;
    
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/30 rounded-t-md">
      {/* Heading selector */}
      <Select value={getCurrentHeading()} onValueChange={handleHeadingChange}>
        <SelectTrigger className="w-[130px] h-8">
          <SelectValue placeholder="Parágrafo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Parágrafo</SelectItem>
          <SelectItem value="h1">Título 1</SelectItem>
          <SelectItem value="h2">Título 2</SelectItem>
          <SelectItem value="h3">Título 3</SelectItem>
          <SelectItem value="h4">Título 4</SelectItem>
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Negrito (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Itálico (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Sublinhado (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Tachado"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Lista com marcadores"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Citação"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Bloco de código"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Link */}
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive("link")}
        title="Inserir link"
      >
        <Link className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
        title="Remover link"
      >
        <Unlink className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Alinhar à esquerda"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Centralizar"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Alinhar à direita"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Desfazer (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Refazer (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </Button>
  );
}
