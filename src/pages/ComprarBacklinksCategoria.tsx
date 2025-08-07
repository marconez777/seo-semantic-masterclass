import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import BacklinkTable from "@/components/marketplace/BacklinkTable";
import SEOBacklinkFilters from "@/components/marketplace/SEOBacklinkFilters";

interface Backlink {
  id: string;
  site_url: string;
  categoria: string;
  valor: number;
  dr: number;
  da: number;
  trafego_mensal: number;
  criado_em: string;
}

interface CategoryMeta {
  title: string;
  description: string;
  keywords: string;
}

const categoryMeta: Record<string, CategoryMeta> = {
  'saude': {
    title: 'Comprar Backlinks de Saúde | Sites com Alta Autoridade e Tráfego',
    description: 'Encontre sites de saúde com DR alto e tráfego orgânico para publicar backlinks. Aumente sua autoridade e ranqueamento no Google.',
    keywords: 'backlinks saude, link building saude, SEO clinicas, sites medicos, autoridade saude'
  },
  'direito': {
    title: 'Comprar Backlinks de Direito | Sites Jurídicos com DR Alto',
    description: 'Backlinks de qualidade em sites jurídicos e advocacia. Sites com alta autoridade para fortalecer seu SEO jurídico.',
    keywords: 'backlinks direito, SEO juridico, sites advocacia, link building juridico, autoridade direito'
  },
  'marketing': {
    title: 'Comprar Backlinks de Marketing | Sites de Marketing Digital',
    description: 'Sites de marketing digital com alta autoridade para seus backlinks. Aumente sua visibilidade no nicho de marketing.',
    keywords: 'backlinks marketing, SEO marketing digital, sites marketing, link building digital'
  },
  'financas': {
    title: 'Comprar Backlinks de Finanças | Sites Financeiros com DR Alto',
    description: 'Backlinks de qualidade em sites do setor financeiro. Alta autoridade e tráfego para fortalecer seu SEO financeiro.',
    keywords: 'backlinks financas, SEO financeiro, sites bancarios, link building financeiro'
  },
  'tecnologia': {
    title: 'Comprar Backlinks de Tecnologia | Sites Tech com Alta Autoridade',
    description: 'Sites de tecnologia e inovação com DR alto para seus backlinks. Fortaleça sua presença no setor tech.',
    keywords: 'backlinks tecnologia, SEO tech, sites tecnologia, link building tech'
  },
  'educacao': {
    title: 'Comprar Backlinks de Educação | Sites Educacionais com DR Alto',
    description: 'Backlinks em sites educacionais e acadêmicos com alta autoridade. Ideal para instituições de ensino.',
    keywords: 'backlinks educacao, SEO educacional, sites ensino, link building educacao'
  },
  'varejo': {
    title: 'Comprar Backlinks de Varejo | Sites de E-commerce com DR Alto',
    description: 'Sites de varejo e e-commerce com alta autoridade para seus backlinks. Aumente suas vendas online.',
    keywords: 'backlinks varejo, SEO ecommerce, sites loja, link building varejo'
  },
  'imobiliario': {
    title: 'Comprar Backlinks Imobiliário | Sites Imóveis com DR Alto',
    description: 'Backlinks de qualidade em sites do setor imobiliário. Alta autoridade para fortalecer seu SEO imobiliário.',
    keywords: 'backlinks imobiliario, SEO imoveis, sites imobiliaria, link building imobiliario'
  },
  'turismo': {
    title: 'Comprar Backlinks de Turismo | Sites de Viagem com DR Alto',
    description: 'Sites de turismo e viagem com alta autoridade para seus backlinks. Aumente sua visibilidade no setor.',
    keywords: 'backlinks turismo, SEO viagem, sites turismo, link building turismo'
  },
  'alimentacao': {
    title: 'Comprar Backlinks de Alimentação | Sites Gastronômicos DR Alto',
    description: 'Backlinks em sites de alimentação e gastronomia com alta autoridade. Ideal para restaurantes e food techs.',
    keywords: 'backlinks alimentacao, SEO gastronomia, sites restaurante, link building food'
  },
  'esportes': {
    title: 'Comprar Backlinks de Esportes | Sites Esportivos com DR Alto',
    description: 'Sites esportivos com alta autoridade para seus backlinks. Fortaleça sua presença no mundo dos esportes.',
    keywords: 'backlinks esportes, SEO esportivo, sites esporte, link building esportes'
  },
  'entretenimento': {
    title: 'Comprar Backlinks de Entretenimento | Sites DR Alto',
    description: 'Sites de entretenimento e cultura com alta autoridade. Ideal para o setor de mídia e entretenimento.',
    keywords: 'backlinks entretenimento, SEO entretenimento, sites cultura, link building midia'
  }
};

const ComprarBacklinksCategoria = () => {
  const { categoria } = useParams<{ categoria: string }>();
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [filteredBacklinks, setFilteredBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    selectedDRRanges: [],
    selectedTrafficRanges: [],
    selectedPriceRanges: []
  });

  // Extract category from URL (remove "comprar-backlinks-" prefix)
  const categorySlug = categoria?.replace('comprar-backlinks-', '') || '';
  const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  
  // Check if category exists
  if (!categorySlug || !categoryMeta[categorySlug]) {
    return <Navigate to="/comprar-backlinks" replace />;
  }

  const meta = categoryMeta[categorySlug];
  const canonicalUrl = `https://mkart.com.br/comprar-backlinks-${categorySlug}`;

  useEffect(() => {
    fetchBacklinks();
  }, [categorySlug]);

  useEffect(() => {
    applyFilters();
  }, [backlinks, filters]);

  const fetchBacklinks = async () => {
    try {
      const { data, error } = await supabase
        .from('backlinks')
        .select('*')
        .eq('categoria', categoryName)
        .order('dr', { ascending: false });

      if (error) throw error;
      setBacklinks(data || []);
    } catch (error) {
      console.error('Error fetching backlinks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...backlinks];

    // Aplicar filtro de DR
    if (filters.selectedDRRanges.length > 0) {
      filtered = filtered.filter(backlink => {
        return filters.selectedDRRanges.some(range => {
          const [min, max] = range.split(' a ').map(Number);
          return backlink.dr >= min && backlink.dr <= max;
        });
      });
    }

    // Aplicar filtro de Tráfego
    if (filters.selectedTrafficRanges.length > 0) {
      filtered = filtered.filter(backlink => {
        return filters.selectedTrafficRanges.some(range => {
          if (range === "0–1.000") {
            return backlink.trafego_mensal >= 0 && backlink.trafego_mensal <= 1000;
          } else if (range === "1.000–10.000") {
            return backlink.trafego_mensal >= 1000 && backlink.trafego_mensal <= 10000;
          } else if (range === "10.000+") {
            return backlink.trafego_mensal >= 10000;
          }
          return false;
        });
      });
    }

    // Aplicar filtro de Preço
    if (filters.selectedPriceRanges.length > 0) {
      filtered = filtered.filter(backlink => {
        return filters.selectedPriceRanges.some(range => {
          if (range === "Gratuito") {
            return backlink.valor === 0;
          } else if (range === "Até R$100") {
            return backlink.valor > 0 && backlink.valor <= 100;
          } else if (range === "R$101 a R$300") {
            return backlink.valor >= 101 && backlink.valor <= 300;
          } else if (range === "R$301 a R$500") {
            return backlink.valor >= 301 && backlink.valor <= 500;
          } else if (range === "R$501 a R$1.000") {
            return backlink.valor >= 501 && backlink.valor <= 1000;
          } else if (range === "Acima de R$1.000") {
            return backlink.valor > 1000;
          }
          return false;
        });
      });
    }

    setFilteredBacklinks(filtered);
  };

  const handleFilterChange = (newFilters: { selectedDRRanges: string[]; selectedTrafficRanges: string[]; selectedPriceRanges: string[] }) => {
    setFilters(newFilters);
  };

  const breadcrumbItems = [
    { name: "Início", url: "/" },
    { name: "Comprar Backlinks", url: "/comprar-backlinks" },
    { name: categoryName, url: canonicalUrl }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={meta.title}
        description={meta.description}
        canonicalUrl={canonicalUrl}
        keywords={meta.keywords}
        ogType="website"
      />
      
      <CategoryStructuredData
        categoryName={`Backlinks de ${categoryName}`}
        categoryUrl={canonicalUrl}
        backlinks={backlinks}
        description={meta.description}
      />
      
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-28 pb-8">
          <div className="max-w-6xl mx-auto">
            <Breadcrumbs items={breadcrumbItems} />
            
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-6">
                Comprar Backlinks de {categoryName}
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {meta.description}
              </p>
              
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span>✓ {backlinks.length} sites disponíveis</span>
                <span>✓ Métricas verificadas</span>
                <span>✓ Tráfego orgânico real</span>
                <span>✓ Publicação em até 7 dias</span>
              </div>
            </div>

            {backlinks.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <SEOBacklinkFilters 
                    filters={filters}
                    onFiltersChange={handleFilterChange}
                  />
                </div>
                <div className="lg:col-span-3">
                  <BacklinkTable backlinks={filteredBacklinks} />
                </div>
              </div>
            )}

            {filteredBacklinks.length === 0 && backlinks.length > 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nenhum site encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros para encontrar mais opções.
                </p>
              </div>
            ) : null}

            {backlinks.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nenhum site encontrado
                </h3>
                <p className="text-muted-foreground">
                  Ainda não temos sites cadastrados nesta categoria.
                </p>
              </div>
            ) : null}

            <section className="mt-16 prose prose-lg max-w-none text-muted-foreground">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Por que escolher backlinks de {categoryName}?
              </h2>
              <p>
                Os backlinks de sites da categoria {categoryName} oferecem relevância temática 
                e autoridade específica do setor. Isso significa que os links terão mais valor 
                para o Google, já que vêm de fontes contextualmente relacionadas ao seu negócio.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-8">
                Benefícios dos backlinks de {categoryName}:
              </h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Relevância temática aumenta o valor do link</li>
                <li>Audiência qualificada e interessada no seu nicho</li>
                <li>Maior probabilidade de tráfego de referência</li>
                <li>Fortalece sua autoridade no setor de {categoryName.toLowerCase()}</li>
                <li>Links contextualizados e naturais</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ComprarBacklinksCategoria;