import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Helper to format BRL
const brl = (v: number) =>
  (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface BacklinkFiltersProps {
  daRange: string;
  setDaRange: (v: string) => void;
  trafficRange: string;
  setTrafficRange: (v: string) => void;
  maxPrice: number | "";
  setMaxPrice: (v: number | "") => void;
  closeMobileMenu?: () => void;
}

const daOptions = [
  { v: "todos", label: "Todos" },
  { v: "10-20", label: "10 a 20" },
  { v: "20-30", label: "20 a 30" },
  { v: "30-40", label: "30 a 40" },
  { v: "40-50", label: "40 a 50" },
  { v: "50-60", label: "50 a 60" },
  { v: "60-70", label: "60 a 70" },
  { v: "70-80", label: "70 a 80" },
  { v: "80-90", label: "80 a 90" },
  { v: "90-99", label: "90 a 99" },
];

const trafficOptions = [
  { v: "todos", label: "Todos" },
  { v: "0-100", label: "0 a 100" },
  { v: "100-1000", label: "100 a 1.000" },
  { v: "1000-10000", label: "1.000 a 10.000" },
  { v: "10000-100000", label: "10.000 a 100.000" },
  { v: "gt-100000", label: "mais de 100.000" },
];

const priceOptions = [5000, 10000, 20000, 50000, 100000, 500000, 1000000, 10000000];

function FilterContent({
  daRange,
  setDaRange,
  trafficRange,
  setTrafficRange,
  maxPrice,
  setMaxPrice,
  closeMobileMenu,
}: BacklinkFiltersProps) {
  return (
    <section>
      <h2 className="text-base font-semibold mb-2">Filtros</h2>

      <div className="mb-4">
        <h3 className="text-base font-semibold mb-1">DA</h3>
        <ul className="text-sm leading-none">
          {daOptions.map(({ v, label }) => (
            <li key={v}>
              <button
                className={`block text-left w-full py-0.5 ${
                  daRange === v ? "font-semibold text-primary" : ""
                }`}
                onClick={() => {
                  setDaRange(v);
                  closeMobileMenu?.();
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="text-base font-semibold mb-1">Tráfego</h3>
        <ul className="text-sm leading-none">
          {trafficOptions.map(({ v, label }) => (
            <li key={v}>
              <button
                className={`block text-left w-full py-0.5 ${
                  trafficRange === v ? "font-semibold text-primary" : ""
                }`}
                onClick={() => {
                  setTrafficRange(v);
                  closeMobileMenu?.();
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-1">Preço máximo</h3>
        <ul className="text-sm leading-none">
          <li>
            <button
              className="block text-left w-full py-0.5"
              onClick={() => {
                setMaxPrice("");
                closeMobileMenu?.();
              }}
            >
              Todos
            </button>
          </li>
          {priceOptions.map((v) => (
            <li key={v}>
              <button
                className={`block text-left w-full py-0.5 ${
                  maxPrice === v ? "font-semibold" : ""
                }`}
                onClick={() => {
                  setMaxPrice(v);
                  closeMobileMenu?.();
                }}
              >
                Até {brl(v)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface BacklinkFiltersSidebarProps extends BacklinkFiltersProps {
  isMobile: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function BacklinkFiltersSidebar({
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen,
  ...filterProps
}: BacklinkFiltersSidebarProps) {
  if (isMobile) {
    return (
      <div className="mb-4">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Menu className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-8">
              <FilterContent
                {...filterProps}
                closeMobileMenu={() => setMobileMenuOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <aside className="md:col-span-2 space-y-8 md:sticky md:top-24 self-start h-max">
      <FilterContent {...filterProps} />
    </aside>
  );
}

export default BacklinkFiltersSidebar;
