import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import AgenciaBacklinks from "./pages/AgenciaBacklinks";
import ConsultoriaSeo from "./pages/ConsultoriaSeo";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/contato" element={<Contact />} />
      <Route path="/agencia-de-backlinks" element={<AgenciaBacklinks />} />
      <Route path="/consultoria-de-seo-backlinks" element={<ConsultoriaSeo />} />
    </Routes>
  </BrowserRouter>
);

export default App;
