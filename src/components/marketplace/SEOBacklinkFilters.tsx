import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Filters {
  categoria?: string;
  minDR?: number;
  maxPrice?: number;
  minTraffic?: number;
  selectedDRRanges: string[];
}

interface SEOBacklinkFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

interface CategoryCount {
  categoria: string;
  count: number;
  slug: string;
}

interface DRCount {
  range: string;
  count: number;
}

const SEOBacklinkFilters = ({ filters, onFiltersChange }: SEOBacklinkFiltersProps) => {
  const [categoryStats, setCategoryStats] = useState<CategoryCount[]>([]);
  const [drStats, setDrStats] = useState<DRCount[]>([]);
  const navigate = useNavigate();
  const { categoria: currentCategory } = useParams();

  const drRanges = [
    { label: "10 a 20", min: 10, max: 20 },
    { label: "20 a 30", min: 20, max: 30 },
    { label: "30 a 40", min: 30, max: 40 },
    { label: "40 a 50", min: 40, max: 50 },
    { label: "50 a 60", min: 50, max: 60 },
    { label: "60 a 70", min: 60, max: 70 },
    { label: "70 a 80", min: 70, max: 80 },
    { label: "80 a 90", min: 80, max: 90 },
    { label: "90 a 100", min: 90, max: 100 },
  ];

  // Mapeamento de categorias para URLs SEO-friendly
  const categoryToSlug = {
    'Saúde': 'saude',
    'Direito': 'direito', 
    'Marketing': 'marketing',
    'Finanças': 'financas',
    'Tecnologia': 'tecnologia',
    'Educação': 'educacao',
    'Varejo': 'varejo',
    'Imobiliário': 'imobiliario',
    'Turismo': 'turismo',
    'Alimentação': 'alimentacao',
    'Esportes': 'esportes',
    'Entretenimento': 'entretenimento',
    'Notícias': 'noticias'
  };

  const slugToCategory = Object.fromEntries(
    Object.entries(categoryToSlug).map(([category, slug]) => [slug, category])
  );

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('backlinks')
        .select('categoria, dr');

      if (error) throw error;

      // Calculate category counts with SEO slugs
      const categoryCounts = data?.reduce((acc: Record<string, number>, item) => {
        acc[item.categoria] = (acc[item.categoria] || 0) + 1;
        return acc;
      }, {}) || {};

      const categoryStatsArray = Object.entries(categoryCounts).map(([categoria, count]) => ({
        categoria,
        count: count as number,
        slug: categoryToSlug[categoria as keyof typeof categoryToSlug] || categoria.toLowerCase()
      }));

      // Calculate DR range counts
      const drCounts = drRanges.map(range => {
        const count = data?.filter(item => 
          item.dr >= range.min && item.dr <= range.max
        ).length || 0;
        return {
          range: range.label,
          count
        };
      });

      setCategoryStats(categoryStatsArray);
      setDrStats(drCounts);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDRRangeChange = (range: string, checked: boolean) => {
    const newSelectedRanges = checked 
      ? [...(filters.selectedDRRanges || []), range]
      : (filters.selectedDRRanges || []).filter(r => r !== range);
    
    onFiltersChange({
      ...filters,
      selectedDRRanges: newSelectedRanges
    });
  };

  // Para categorias, navegamos para a URL específica
  const handleCategoryClick = (slug: string) => {
    navigate(`/comprar-backlinks-${slug}`);
  };

  const getCurrentCategoryName = () => {
    if (!currentCategory) return null;
    const categorySlug = currentCategory.replace('comprar-backlinks-', '');
    return slugToCategory[categorySlug] || null;
  };

  const isCurrentCategory = (slug: string) => {
    if (!currentCategory) return false;
    const categorySlug = currentCategory.replace('comprar-backlinks-', '');
    return categorySlug === slug;
  };

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4 space-y-6">
        {/* DR Filter - Continua funcionando como filtro sem URL */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3">Domain Rating (DR)</h3>
          <div className="space-y-2">
            {drRanges.map((range) => {
              const stat = drStats.find(s => s.range === range.label);
              const count = stat?.count || 0;
              const isChecked = (filters.selectedDRRanges || []).includes(range.label);
              
              return (
                <div key={range.label} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dr-${range.label}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => 
                      handleDRRangeChange(range.label, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={`dr-${range.label}`}
                    className="text-sm text-muted-foreground cursor-pointer flex-1"
                  >
                    {range.label} <span className="text-xs">({count})</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories - Agora com navegação para URLs específicas */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3">Categorias</h3>
          <div className="space-y-2">
            {categoryStats.map((stat) => {
              const isCurrent = isCurrentCategory(stat.slug);
              
              return (
                <div key={stat.categoria} className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCategoryClick(stat.slug)}
                    className={cn(
                      "text-sm cursor-pointer flex-1 text-left hover:text-primary transition-colors",
                      isCurrent 
                        ? "text-primary font-semibold" 
                        : "text-muted-foreground"
                    )}
                  >
                    {stat.categoria} <span className="text-xs">({stat.count})</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Adicionar link para ver todas as categorias */}
        <div className="pt-2 border-t">
          <button
            onClick={() => navigate('/comprar-backlinks')}
            className={cn(
              "text-sm cursor-pointer hover:text-primary transition-colors w-full text-left",
              !currentCategory
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            )}
          >
            📂 Todas as categorias
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOBacklinkFilters;