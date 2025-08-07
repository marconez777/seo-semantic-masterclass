import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import BacklinkTable from "@/components/marketplace/BacklinkTable";
import SEOBacklinkFilters from "@/components/marketplace/SEOBacklinkFilters";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

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

interface Filters {
  selectedDRRanges: string[];
}

const ComprarBacklinks = () => {
  const navigate = useNavigate();
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [filteredBacklinks, setFilteredBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    selectedDRRanges: []
  });

  // Mapeamento de categorias para criar cards de categoria
  const categoryCards = [
    {
      name: 'Saúde',
      slug: 'saude',
      description: 'Sites médicos, clínicas e profissionais da saúde',
      icon: '🏥',
      count: 0
    },
    {
      name: 'Direito',
      slug: 'direito',
      description: 'Sites jurídicos, advocacia e escritórios de direito',
      icon: '⚖️',
      count: 0
    },
    {
      name: 'Marketing',
      slug: 'marketing',
      description: 'Agências e blogs de marketing digital',
      icon: '📈',
      count: 0
    },
    {
      name: 'Finanças',
      slug: 'financas',
      description: 'Bancos, fintechs e consultoria financeira',
      icon: '💰',
      count: 0
    },
    {
      name: 'Tecnologia',
      slug: 'tecnologia',
      description: 'Sites tech, startups e inovação',
      icon: '💻',
      count: 0
    },
    {
      name: 'Educação',
      slug: 'educacao',
      description: 'Instituições de ensino e cursos online',
      icon: '🎓',
      count: 0
    },
    {
      name: 'Varejo',
      slug: 'varejo',
      description: 'E-commerce e lojas virtuais',
      icon: '🛒',
      count: 0
    },
    {
      name: 'Imobiliário',
      slug: 'imobiliario',
      description: 'Imobiliárias e mercado imobiliário',
      icon: '🏠',
      count: 0
    },
    {
      name: 'Turismo',
      slug: 'turismo',
      description: 'Agências de viagem e turismo',
      icon: '✈️',
      count: 0
    },
    {
      name: 'Alimentação',
      slug: 'alimentacao',
      description: 'Restaurantes, food techs e gastronomia',
      icon: '🍽️',
      count: 0
    },
    {
      name: 'Esportes',
      slug: 'esportes',
      description: 'Sites esportivos e academias',
      icon: '⚽',
      count: 0
    },
    {
      name: 'Entretenimento',
      slug: 'entretenimento',
      description: 'Mídia, cultura e entretenimento',
      icon: '🎬',
      count: 0
    },
    {
      name: 'Notícias',
      slug: 'noticias',
      description: 'Portais de notícias e jornalismo',
      icon: '📰',
      count: 0
    }
  ];

  const [categoriesWithCount, setCategoriesWithCount] = useState(categoryCards);

  useEffect(() => {
    fetchBacklinks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [backlinks, filters]);

  const fetchBacklinks = async () => {
    try {
      const { data, error } = await supabase
        .from('backlinks')
        .select('*')
        .order('dr', { ascending: false });

      if (error) throw error;
      
      setBacklinks(data || []);
      
      // Calcular contagem por categoria
      const categoryCounts = (data || []).reduce((acc: Record<string, number>, backlink) => {
        acc[backlink.categoria] = (acc[backlink.categoria] || 0) + 1;
        return acc;
      }, {});

      // Atualizar os cards com as contagens reais
      const updatedCategories = categoryCards.map(category => ({
        ...category,
        count: categoryCounts[category.name] || 0
      }));

      setCategoriesWithCount(updatedCategories);
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

    setFilteredBacklinks(filtered);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const breadcrumbItems = [
    { name: "Início", url: "/" },
    { name: "Comprar Backlinks", url: "/comprar-backlinks" }
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
        title="Comprar Backlinks de Alta Qualidade | Marketplace de Link Building"
        description="Encontre os melhores backlinks para o seu site. Sites com alta autoridade, DR alto e tráfego orgânico real. Aumente seu ranqueamento no Google."
        canonicalUrl="https://mkart.com.br/comprar-backlinks"
        keywords="comprar backlinks, link building, SEO, backlinks de qualidade, DR alto, autoridade"
        ogType="website"
      />
      
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs items={breadcrumbItems} />
            
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-6">
                Comprar Backlinks de Alta Qualidade
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Encontre os melhores backlinks para o seu site em todas as categorias. 
                Sites verificados com alta autoridade, DR comprovado e tráfego orgânico real.
              </p>
              
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span>✓ {backlinks.length} sites disponíveis</span>
                <span>✓ Métricas verificadas</span>
                <span>✓ Tráfego orgânico real</span>
                <span>✓ Publicação em até 7 dias</span>
              </div>
            </div>

            {/* Cards de Categorias para SEO */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Navegue por Categoria
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoriesWithCount.map((category) => (
                  <div
                    key={category.slug}
                    onClick={() => navigate(`/comprar-backlinks-${category.slug}`)}
                    className="bg-card border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {category.description}
                    </p>
                    <div className="text-xs text-primary font-medium">
                      {category.count} sites disponíveis
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Seção principal com filtros e listagem */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <SEOBacklinkFilters 
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                />
              </div>
              
              <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Todos os Backlinks ({filteredBacklinks.length})
                  </h2>
                </div>
                
                {filteredBacklinks.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Nenhum site encontrado
                    </h3>
                    <p className="text-muted-foreground">
                      Tente ajustar os filtros para encontrar mais opções.
                    </p>
                  </div>
                ) : (
                  <BacklinkTable backlinks={filteredBacklinks} />
                )}
              </div>
            </div>

            {/* Conteúdo SEO adicional */}
            <section className="mt-16 prose prose-lg max-w-none text-muted-foreground">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Por que comprar backlinks de qualidade?
              </h2>
              <p>
                Os backlinks continuam sendo um dos fatores de ranqueamento mais importantes 
                do Google. Nosso marketplace oferece apenas sites verificados com métricas 
                reais e tráfego orgânico comprovado.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-8">
                Benefícios dos nossos backlinks:
              </h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Sites com Domain Rating (DR) alto e verificado</li>
                <li>Tráfego orgânico real e mensal comprovado</li>
                <li>Diversidade de categorias para relevância temática</li>
                <li>Publicação rápida em até 7 dias úteis</li>
                <li>Acompanhamento completo do processo</li>
                <li>Suporte especializado em SEO</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ComprarBacklinks;