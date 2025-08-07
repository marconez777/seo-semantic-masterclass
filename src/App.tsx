import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import AgenciaBacklinks from "./pages/AgenciaBacklinks";
import ConsultoriaSeo from "./pages/ConsultoriaSeo";
import ComprarBacklinks from "./pages/ComprarBacklinks";
import ComprarBacklinksCategoria from "./pages/ComprarBacklinksCategoria";
import Auth from "./pages/Auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/agencia-de-backlinks" element={<AgenciaBacklinks />} />
            <Route path="/consultoria-de-seo-backlinks" element={<ConsultoriaSeo />} />
            <Route path="/comprar-backlinks" element={<ComprarBacklinks />} />
            <Route path="/comprar-backlinks-:categoria" element={<ComprarBacklinksCategoria />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/painel" element={<Dashboard />} />
            <Route path="/carrinho" element={<Cart />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
