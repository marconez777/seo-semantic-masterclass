import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Filters {
  categoria: string;
  minDR: number;
  maxPrice: number;
  minTraffic: number;
}

interface BacklinkFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const BacklinkFilters = ({ filters, onFiltersChange }: BacklinkFiltersProps) => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('backlinks')
        .select('categoria')
        .order('categoria');

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data?.map(item => item.categoria) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      categoria: value === 'all' ? '' : value
    });
  };

  const handleDRChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      minDR: value[0]
    });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      maxPrice: value[0]
    });
  };

  const handleTrafficChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      minTraffic: value[0]
    });
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Categoria</Label>
          <Select value={filters.categoria || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">
            DR mínimo: {filters.minDR}
          </Label>
          <Slider
            value={[filters.minDR]}
            onValueChange={handleDRChange}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">
            Preço máximo: R$ {filters.maxPrice}
          </Label>
          <Slider
            value={[filters.maxPrice]}
            onValueChange={handlePriceChange}
            max={1000}
            step={50}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">
            Tráfego mínimo: {filters.minTraffic.toLocaleString()}
          </Label>
          <Slider
            value={[filters.minTraffic]}
            onValueChange={handleTrafficChange}
            max={100000}
            step={1000}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BacklinkFilters;