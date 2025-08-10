import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import AgenciaBacklinks from "./pages/AgenciaBacklinks";
import ConsultoriaSeo from "./pages/ConsultoriaSeo";
import Auth from "./pages/Auth";
import Painel from "./pages/Painel";
import Carrinho from "./pages/Carrinho";
import { CartProvider } from "./contexts/CartContext";

const App = () => (
  <BrowserRouter>
    <CartProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/agencia-de-backlinks" element={<AgenciaBacklinks />} />
        <Route path="/consultoria-de-seo-backlinks" element={<ConsultoriaSeo />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/carrinho" element={<Carrinho />} />
      </Routes>
    </CartProvider>
  </BrowserRouter>
);

export default App;
