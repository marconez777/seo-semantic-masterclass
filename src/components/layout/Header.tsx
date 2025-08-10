
const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/LOGOMK.png" alt="Logo MK Art" className="w-12 h-12" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-foreground hover:text-primary font-medium transition-colors">Home</a>

          <div className="relative group">
            <button className="inline-flex items-center text-foreground hover:text-primary transition-colors">
              Serviços
            </button>
            <div className="absolute left-0 top-full mt-2 hidden group-hover:block">
              <div className="w-72 rounded-md border bg-popover text-popover-foreground shadow-lg p-2">
                <a href="/consultoria-de-seo-backlinks" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">Consultoria SEO com IA</a>
                <a href="/agencia-de-backlinks" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">Backlinks de Autoridade</a>
                <a href="#" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">IA de SEO</a>
                <a href="#" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">Agentes de IA</a>
                <a href="#" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">Trafego Pago com IA</a>
                <a href="#" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">Sites Profissionais com IA</a>
                <a href="#" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">Funil de Vendas com IA</a>
              </div>
            </div>
          </div>

          <a href="#blog" className="text-foreground hover:text-primary transition-colors">Blog</a>
          <a href="/contato" className="text-foreground hover:text-primary transition-colors">Contato</a>
        </div>
      </nav>
    </header>
  );
};

export default Header;
