import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";

interface MobileMenuProps {
  isLoggedIn: boolean;
  userName: string | null;
  isAdmin: boolean;
  onSignOut: () => void;
}

export function MobileMenu({ isLoggedIn, userName, isAdmin, onSignOut }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [backlinksOpen, setBacklinksOpen] = useState(false);
  const location = useLocation();
  const isPanelRoute = location.pathname.startsWith("/painel");

  const categories = [
    "Notícias",
    "Negócios", 
    "Saúde",
    "Educação",
    "Tecnologia",
    "Finanças",
    "Imóveis",
    "Moda",
    "Turismo",
    "Alimentação",
    "Pets",
    "Automotivo",
    "Esportes",
    "Entretenimento",
    "Marketing",
    "Direito",
    "Maternidade",
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/cf1b72dd-c973-4cdf-a2f6-fd7ce7ed8d4d.png" 
                alt="Logo MK Art" 
                className="w-8 h-8" 
              />
              <span className="font-semibold">MK Art</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              <Link 
                to="/" 
                className="block py-2 px-3 rounded-md hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                Home
              </Link>

              <Link 
                to="/consultoria-seo" 
                className="block py-2 px-3 rounded-md hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                Consultoria SEO
              </Link>

              <Collapsible open={backlinksOpen} onOpenChange={setBacklinksOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-muted transition-colors">
                  <span>Backlinks</span>
                  {backlinksOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 ml-4 mt-2">
                  <Link 
                    to="/comprar-backlinks" 
                    className="block py-2 px-3 rounded-md hover:bg-muted transition-colors text-sm"
                    onClick={closeMenu}
                  >
                    Ver Todos
                  </Link>
                  {categories.map((categoria) => {
                    const slug = categoria
                      .toLowerCase()
                      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                      .replace(/\s+/g, "-");
                    const IconComp = getCategoryIcon(categoria);
                    
                    return (
                      <Link
                        key={categoria}
                        to={`/comprar-backlinks-${slug}`}
                        className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted transition-colors text-sm"
                        onClick={closeMenu}
                      >
                        <span className="inline-flex size-6 items-center justify-center rounded bg-primary/10 text-primary">
                          <IconComp className="size-3" />
                        </span>
                        {categoria}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>

              <Link 
                to="/contato" 
                className="block py-2 px-3 rounded-md hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                Contato
              </Link>

              <Link 
                to="/blog" 
                className="block py-2 px-3 rounded-md hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                Blog
              </Link>
            </nav>
          </div>

          {/* User Actions */}
          <div className="p-4 border-t">
            {isPanelRoute ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Olá, {userName || 'Visitante'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isAdmin ? 'Admin' : 'Cliente'}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    onSignOut();
                    closeMenu();
                  }}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <>
                {isLoggedIn ? (
                  <Button asChild className="w-full">
                    <Link to="/painel" onClick={closeMenu}>
                      Painel
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/auth" onClick={closeMenu}>
                      Login / Cadastro
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}