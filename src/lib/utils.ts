import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export function normalizeString(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Site URL configuration
export const SITE_URL = "https://mkart.com.br";

export function getCanonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function getBreadcrumbUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
