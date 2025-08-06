import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface Filters {
  categoria: string;
  minDR: number;
  maxPrice: number;
  minTraffic: number;
  selectedDRRanges: string[];
  selectedCategories: string[];
}

interface BacklinkFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

interface CategoryCount {
  categoria: string;
  count: number;
}

interface DRCount {
  range: string;
  count: number;
}

const BacklinkFilters = ({ filters, onFiltersChange }: BacklinkFiltersProps) => {
  const [categoryStats, setCategoryStats] = useState<CategoryCount[]>([]);
  const [drStats, setDrStats] = useState<DRCount[]>([]);

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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('backlinks')
        .select('categoria, dr');

      if (error) throw error;

      // Calculate category counts
      const categoryCounts = data?.reduce((acc: Record<string, number>, item) => {
        acc[item.categoria] = (acc[item.categoria] || 0) + 1;
        return acc;
      }, {}) || {};

      const categoryStatsArray = Object.entries(categoryCounts).map(([categoria, count]) => ({
        categoria,
        count: count as number
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

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newSelectedCategories = checked 
      ? [...(filters.selectedCategories || []), category]
      : (filters.selectedCategories || []).filter(c => c !== category);
    
    onFiltersChange({
      ...filters,
      selectedCategories: newSelectedCategories
    });
  };

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4 space-y-6">
        {/* DR Filter */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3">DR</h3>
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
                    {range.label} <span className="text-muted-foreground">({count})</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Filter */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3">Categorias</h3>
          <div className="space-y-2">
            {categoryStats.map((stat) => {
              const isChecked = (filters.selectedCategories || []).includes(stat.categoria);
              
              return (
                <div key={stat.categoria} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${stat.categoria}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(stat.categoria, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={`cat-${stat.categoria}`}
                    className="text-sm text-muted-foreground cursor-pointer flex-1"
                  >
                    {stat.categoria} <span className="text-muted-foreground">({stat.count})</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BacklinkFilters;