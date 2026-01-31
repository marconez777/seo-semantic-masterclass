import { useMemo, useState, ReactNode } from "react";
import { useBacklinkFilters } from "@/hooks/useBacklinkFilters";
import { useBacklinksQuery, filterBacklinks } from "@/hooks/useBacklinksQuery";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { BacklinkFiltersSidebar } from "./BacklinkFilters";
import BacklinkTable from "./BacklinkTable";
import CategoryGrid from "./CategoryGrid";
import ContactModal from "@/components/ui/ContactModal";
import type { BacklinkItem } from "./BacklinkTableRow";

interface BacklinkMarketplaceProps {
  /** Category to filter by (optional - shows all if not provided) */
  category?: string;
  /** Whether to show the category grid navigation */
  showCategoryGrid?: boolean;
  /** Current category slug for highlighting in the grid */
  currentCategorySlug?: string;
  /** SEO content to render below the table */
  seoContent?: ReactNode;
  /** Children content (rendered before the table) */
  children?: ReactNode;
}

export default function BacklinkMarketplace({
  category,
  showCategoryGrid = true,
  currentCategorySlug,
  seoContent,
  children,
}: BacklinkMarketplaceProps) {
  const { data: backlinks = [], isLoading } = useBacklinksQuery(category);
  const filters = useBacklinkFilters();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal state for buy action
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: string; name: string; price_cents: number } | null>(null);

  // Apply client-side filters
  const filtered = useMemo(() => {
    return filterBacklinks(backlinks, filters);
  }, [backlinks, filters]);

  const onBuy = (b: BacklinkItem) => {
    setSelected({ 
      id: b.id, 
      name: b.site_name ?? b.site_url ?? 'Backlink', 
      price_cents: b.price_cents 
    });
    setOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <BacklinkFiltersSidebar
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          daRange={filters.daRange}
          setDaRange={filters.setDaRange}
          trafficRange={filters.trafficRange}
          setTrafficRange={filters.setTrafficRange}
          maxPrice={filters.maxPrice}
          setMaxPrice={filters.setMaxPrice}
        />

        {/* Main content */}
        <section className={isMobile ? "col-span-1" : "md:col-span-10"}>
          {/* Optional children (breadcrumbs, title, etc.) */}
          {children}

          {/* Category Grid */}
          {showCategoryGrid && (
            <CategoryGrid currentCategory={currentCategorySlug} />
          )}

          {/* Backlinks Table */}
          <BacklinkTable
            data={filtered}
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            onBuy={onBuy}
          />

          {/* SEO Content */}
          {seoContent}
        </section>
      </div>

      {/* Contact Modal */}
      <ContactModal
        open={open}
        onOpenChange={setOpen}
        product={selected ?? undefined}
      />
    </>
  );
}
