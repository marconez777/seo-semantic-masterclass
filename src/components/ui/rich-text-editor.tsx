import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { EditorToolbar } from "./editor-toolbar";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  onImageUpload?: (editor: Editor) => void;
}

// Simple markdown to HTML converter for legacy content
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  
  // Check if it's already HTML
  if (markdown.includes("<p>") || markdown.includes("<h") || markdown.includes("<ul>") || markdown.includes("<ol") || markdown.includes("<li>") || markdown.includes("<blockquote")) {
    return markdown;
  }
  
  let html = markdown;
  
  // Headers
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  
  // Bold and Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");
  
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  
  // Paragraphs - wrap loose text in <p> tags
  const lines = html.split("\n");
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("<h") || trimmed.startsWith("<ul") || 
        trimmed.startsWith("<ol") || trimmed.startsWith("<li") ||
        trimmed.startsWith("<blockquote") || trimmed.startsWith("<p")) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  });
  
  html = processedLines.filter(Boolean).join("\n");
  
  return html;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Comece a escrever...",
  className,
  minHeight = "300px",
  onImageUpload
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg my-4",
        },
        inline: false,
        allowFullscreen: true,
      }),
    ],
    content: markdownToHtml(value),
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none dark:prose-invert focus:outline-none min-h-[inherit]",
          "prose-headings:font-semibold prose-headings:text-foreground",
          "prose-p:text-foreground prose-p:leading-relaxed",
          "prose-a:text-primary prose-a:underline",
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-ul:list-disc prose-ol:list-decimal",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic",
          "font-sans"
        ),
      },
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      const htmlContent = markdownToHtml(value);
      if (htmlContent !== editor.getHTML()) {
        editor.commands.setContent(htmlContent);
      }
    }
  }, [value, editor]);

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
      <div 
        className="p-4 bg-background"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
