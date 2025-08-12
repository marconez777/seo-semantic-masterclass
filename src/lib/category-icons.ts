import type { LucideIcon } from "lucide-react";
import { Folder, Newspaper, Briefcase, HeartPulse, GraduationCap, Cpu, Wallet, Home, Shirt, Plane, Utensils, PawPrint, Car, Dumbbell, Clapperboard, Megaphone, Scale } from "lucide-react";

// Shared icon mapping for all category cards and menus
export const getCategoryIcon = (name: string): LucideIcon => {
  switch (name) {
    case "Noticias":
    case "Notícias":
      return Newspaper;
    case "Negócios":
      return Briefcase;
    case "Saúde":
      return HeartPulse;
    case "Educação":
      return GraduationCap;
    case "Tecnologia":
      return Cpu;
    case "Finanças":
      return Wallet;
    case "Casa":
      return Home;
    case "Moda":
      return Shirt;
    case "Turismo":
      return Plane;
    case "Alimentação":
      return Utensils;
    case "Pets":
      return PawPrint;
    case "Automotivo":
      return Car;
    case "Esportes":
      return Dumbbell;
    case "Entretenimento":
      return Clapperboard;
    case "Marketing":
      return Megaphone;
    case "Direito":
      return Scale;
    default:
      return Folder;
  }
};
