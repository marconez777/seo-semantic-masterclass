import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

interface CategoryBacklinkFiltersProps {
  backlinks: Backlink[];
  onFilterChange: (filtered: Backlink[]) => void;
}

const CategoryBacklinkFilters = ({ backlinks, onFilterChange }: CategoryBacklinkFiltersProps) => {
  const [drRange, setDrRange] = useState([0, 100]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [trafficRange, setTrafficRange] = useState([0, 100000]);
  const [searchTerm, setSearchTerm] = useState("");

  const applyFilters = () => {
    let filtered = backlinks.filter(backlink => {
      const matchesDR = backlink.dr >= drRange[0] && backlink.dr <= drRange[1];
      const matchesPrice = backlink.valor >= priceRange[0] && backlink.valor <= priceRange[1];
      const matchesTraffic = backlink.trafego_mensal >= trafficRange[0] && backlink.trafego_mensal <= trafficRange[1];
      const matchesSearch = searchTerm === "" || backlink.site_url.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDR && matchesPrice && matchesTraffic && matchesSearch;
    });

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setDrRange([0, 100]);
    setPriceRange([0, 2000]);
    setTrafficRange([0, 100000]);
    setSearchTerm("");
    onFilterChange(backlinks);
  };

  const hasActiveFilters = 
    drRange[0] > 0 || drRange[1] < 100 ||
    priceRange[0] > 0 || priceRange[1] < 2000 ||
    trafficRange[0] > 0 || trafficRange[1] < 100000 ||
    searchTerm !== "";

  return (
    <div className="bg-card rounded-lg border p-6 mb-8">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold">Filtros</h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div>
          <Label htmlFor="search">Buscar site</Label>
          <Input
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome do site..."
            className="mt-2"
          />
        </div>

        {/* DR Range */}
        <div>
          <Label>Domain Rating (DR)</Label>
          <div className="mt-2">
            <Slider
              value={drRange}
              onValueChange={setDrRange}
              max={100}
              min={0}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>DR {drRange[0]}</span>
              <span>DR {drRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label>Preço (R$)</Label>
          <div className="mt-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={2000}
              min={0}
              step={10}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>R$ {priceRange[0]}</span>
              <span>R$ {priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Traffic Range */}
        <div>
          <Label>Tráfego mensal</Label>
          <div className="mt-2">
            <Slider
              value={trafficRange}
              onValueChange={setTrafficRange}
              max={100000}
              min={0}
              step={1000}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{trafficRange[0].toLocaleString()}</span>
              <span>{trafficRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-2 flex-wrap">
          {hasActiveFilters && (
            <>
              {(drRange[0] > 0 || drRange[1] < 100) && (
                <Badge variant="secondary">
                  DR: {drRange[0]} - {drRange[1]}
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                <Badge variant="secondary">
                  Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
                </Badge>
              )}
              {(trafficRange[0] > 0 || trafficRange[1] < 100000) && (
                <Badge variant="secondary">
                  Tráfego: {trafficRange[0].toLocaleString()} - {trafficRange[1].toLocaleString()}
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary">
                  Busca: "{searchTerm}"
                </Badge>
              )}
            </>
          )}
        </div>
        
        <Button onClick={applyFilters}>
          Aplicar filtros
        </Button>
      </div>
    </div>
  );
};

export default CategoryBacklinkFilters;