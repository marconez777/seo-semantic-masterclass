import CategoryGrid from "@/components/marketplace/CategoryGrid";
import { OFFICIAL_CATEGORIES } from "@/lib/categories";

/**
 * As 20 páginas de categoria só recebiam link do dropdown do header. Aqui elas
 * ganham link contextual a partir da página de maior autoridade do domínio:
 * ganho de SEO interno com custo de implementação quase zero, porque o grid já
 * existia para a vitrine.
 */
const NichesSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-center">
            Backlinks por nicho
          </h2>
          <p className="mt-3 mb-10 text-muted-foreground text-center max-w-2xl mx-auto">
            Um link vale mais quando vem de um portal que fala do mesmo assunto
            que o seu site. São {OFFICIAL_CATEGORIES.length} nichos no catálogo.
          </p>

          <CategoryGrid />
        </div>
      </div>
    </section>
  );
};

export default NichesSection;
