import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url';
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // dompurify precisa de DOM; no build estático (Node) entra a versão com jsdom.
      ...(isSsrBuild ? { dompurify: "isomorphic-dompurify" } : {}),
    },
  },
  // Build estático (npm run build:ssg): empacota tudo para o Node não tropeçar em
  // pacote CommonJS com import nomeado. isomorphic-dompurify fica de fora porque
  // importa "dompurify" por dentro — empacotado, o alias acima apontaria para ele mesmo.
  ssr: {
    noExternal: true,
    external: ["isomorphic-dompurify"],
  },
  build: {
    // manualChunks não vale no build SSR (react e react-dom ficam empacotados nele).
    rollupOptions: isSsrBuild ? {} : {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
}));