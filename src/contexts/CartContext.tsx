import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  url_destino: string;
  texto_ancora: string;
  // optional extra payload (e.g., backlink object)
  meta?: Record<string, unknown>;
};

export type CartContextValue = {
  items: CartItem[];
  itemsCount: number;
  totalCents: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "mkart_cart_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id && i.texto_ancora === item.texto_ancora && i.url_destino === item.url_destino);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const { itemsCount, totalCents } = useMemo(() => {
    const count = items.reduce((acc, it) => acc + it.quantity, 0);
    const total = items.reduce((acc, it) => acc + it.quantity * it.price_cents, 0);
    return { itemsCount: count, totalCents: total };
  }, [items]);

  const value = useMemo(
    () => ({ items, itemsCount, totalCents, addToCart, removeFromCart, clearCart }),
    [items, itemsCount, totalCents]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
