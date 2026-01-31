import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface FAQ {
  question: string;
  answer: string;
}

export interface PageSEOContent {
  id: string;
  page_slug: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  h1_title: string | null;
  h2_subtitle: string | null;
  intro_text: string | null;
  main_content: string | null;
  faqs: FAQ[];
  canonical_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Helper to parse FAQs from Json type
function parseFaqs(faqs: Json | null): FAQ[] {
  if (!faqs || !Array.isArray(faqs)) return [];
  return faqs.filter(
    (f): f is { question: string; answer: string } =>
      typeof f === "object" &&
      f !== null &&
      "question" in f &&
      "answer" in f &&
      typeof f.question === "string" &&
      typeof f.answer === "string"
  );
}

export function usePageSEOContent(pageSlug: string) {
  return useQuery({
    queryKey: ["page-seo-content", pageSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_seo_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        faqs: parseFaqs(data.faqs),
      } as PageSEOContent;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    enabled: !!pageSlug,
  });
}

export function useAllPageSEOContent() {
  return useQuery({
    queryKey: ["page-seo-content-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_seo_content")
        .select("*")
        .order("page_slug");
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        faqs: parseFaqs(item.faqs),
      })) as PageSEOContent[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useSavePageSEOContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: Omit<PageSEOContent, "id" | "created_at" | "updated_at"> & { id?: string }) => {
      const faqsJson = content.faqs as unknown as Json;
      
      if (content.id) {
        // Update existing
        const { data, error } = await supabase
          .from("page_seo_content")
          .update({
            meta_title: content.meta_title,
            meta_description: content.meta_description,
            meta_keywords: content.meta_keywords,
            h1_title: content.h1_title,
            h2_subtitle: content.h2_subtitle,
            intro_text: content.intro_text,
            main_content: content.main_content,
            faqs: faqsJson,
            canonical_url: content.canonical_url,
          })
          .eq("id", content.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("page_seo_content")
          .insert({
            page_slug: content.page_slug,
            meta_title: content.meta_title,
            meta_description: content.meta_description,
            meta_keywords: content.meta_keywords,
            h1_title: content.h1_title,
            h2_subtitle: content.h2_subtitle,
            intro_text: content.intro_text,
            main_content: content.main_content,
            faqs: faqsJson,
            canonical_url: content.canonical_url,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["page-seo-content-all"] });
      queryClient.invalidateQueries({ queryKey: ["page-seo-content", variables.page_slug] });
    },
  });
}

export function useDeletePageSEOContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("page_seo_content")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-seo-content-all"] });
    },
  });
}

// List of all supported page slugs
export const PAGE_SLUGS = [
  { slug: "comprar-backlinks", label: "Comprar Backlinks (Principal)" },
  { slug: "comprar-backlinks-noticias", label: "Notícias" },
  { slug: "comprar-backlinks-negocios", label: "Negócios" },
  { slug: "comprar-backlinks-saude", label: "Saúde" },
  { slug: "comprar-backlinks-educacao", label: "Educação" },
  { slug: "comprar-backlinks-tecnologia", label: "Tecnologia" },
  { slug: "comprar-backlinks-financas", label: "Finanças" },
  { slug: "comprar-backlinks-imoveis", label: "Imóveis" },
  { slug: "comprar-backlinks-moda", label: "Moda" },
  { slug: "comprar-backlinks-turismo", label: "Turismo" },
  { slug: "comprar-backlinks-alimentacao", label: "Alimentação" },
  { slug: "comprar-backlinks-pets", label: "Pets" },
  { slug: "comprar-backlinks-automoveis", label: "Automóveis" },
  { slug: "comprar-backlinks-esportes", label: "Esportes" },
  { slug: "comprar-backlinks-entretenimento", label: "Entretenimento" },
  { slug: "comprar-backlinks-marketing", label: "Marketing" },
  { slug: "comprar-backlinks-direito", label: "Direito" },
  { slug: "comprar-backlinks-maternidade", label: "Maternidade" },
] as const;
