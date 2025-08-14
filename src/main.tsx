import { createRoot } from 'react-dom/client'
import { HelmetProvider } from "react-helmet-async";
import App from './App.tsx'
import './index.css'

// Configure Helmet for better SEO with priority injection
const helmetContext = {};

// Optimize for SEO - inject meta tags as soon as possible
const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <HelmetProvider context={helmetContext}>
    <App />
  </HelmetProvider>
);
