import { Folder } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { OFFICIAL_CATEGORIES, categoryToSlug } from "@/lib/categories";

interface CategoryGridProps {
  /** Current category slug for highlighting, optional */
  currentCategory?: string;
}

export default function CategoryGrid({ currentCategory }: CategoryGridProps) {
  return (
    <section className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* First item: "Todas Categorias" */}
        <a
          href="/comprar-backlinks"
          className="group flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors"
        >
          <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shadow-sm">
            <Folder className="size-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">
              Ver Todas
            </span>
            <span className="text-sm font-semibold leading-none mt-1">
              Categorias
            </span>
          </span>
        </a>

        {/* 17 official categories */}
        {OFFICIAL_CATEGORIES.map((cat) => {
          const slug = categoryToSlug(cat);
          const IconComp = getCategoryIcon(cat);
          const isActive = currentCategory === slug;

          return (
            <a
              key={cat}
              href={`/comprar-backlinks-${slug}`}
              className={`group flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors ${
                isActive ? "bg-muted" : ""
              }`}
            >
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shadow-sm">
                <IconComp className="size-4" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">
                  Backlinks de
                </span>
                <span className="text-sm font-semibold leading-none mt-1">
                  {cat}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
