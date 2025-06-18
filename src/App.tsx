
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MKArtHome from "./pages/MKArtHome";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MKArtHome />} />
          
          {/* Serviços Routes */}
          <Route path="/servicos/:subcategory" element={<CategoryPage />} />
          
          {/* Link Building Routes */}
          <Route path="/link-building/:subcategory" element={<CategoryPage />} />
          
          {/* Nichos Routes */}
          <Route path="/nichos/:subcategory" element={<CategoryPage />} />
          
          {/* Autoridade Routes */}
          <Route path="/autoridade/:subcategory" element={<CategoryPage />} />
          
          {/* Tráfego Routes */}
          <Route path="/trafego/:subcategory" element={<CategoryPage />} />
          
          {/* Prazos Routes */}
          <Route path="/prazos/:subcategory" element={<CategoryPage />} />
          
          {/* Pages Routes (to be created later) */}
          <Route path="/sobre" element={<NotFound />} />
          <Route path="/portfolio" element={<NotFound />} />
          <Route path="/contato" element={<NotFound />} />
          <Route path="/blog" element={<NotFound />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
