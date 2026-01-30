// Official list of 17 categories - single source of truth
export const OFFICIAL_CATEGORIES = [
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
] as const;

export type OfficialCategory = (typeof OFFICIAL_CATEGORIES)[number];

// Convert category name to URL slug
export const categoryToSlug = (cat: string): string =>
  cat
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
