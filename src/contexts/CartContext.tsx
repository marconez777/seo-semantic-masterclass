import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  backlink_id: string;
  domain: string;
  url: string;
  dr: number | null;
  da: number | null;
  traffic: number | null;
  category: string;
  price: number;
  anchor_text: string;
  target_url: string;
}

interface CartContextType {
  items: CartItem[];
  mkWillChoose: boolean;
  setMkWillChoose: (value: boolean) => void;
  customerSite: string;
  setCustomerSite: (value: string) => void;
  addItem: (backlink: Omit<CartItem, "anchor_text" | "target_url">) => void;
  removeItem: (backlink_id: string) => void;
  updateItem: (backlink_id: string, data: Partial<CartItem>) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  total: number;
  itemCount: number;
  isInCart: (backlink_id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "mkart_cart";
const MK_WILL_CHOOSE_KEY = "mkart_mk_will_choose";
const CUSTOMER_SITE_KEY = "mkart_customer_site";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mkWillChoose, setMkWillChooseState] = useState(false);
  const [customerSite, setCustomerSiteState] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
      const storedMkChoice = localStorage.getItem(MK_WILL_CHOOSE_KEY);
      if (storedMkChoice === "true") {
        setMkWillChooseState(true);
      }
      const storedCustomerSite = localStorage.getItem(CUSTOMER_SITE_KEY);
      if (storedCustomerSite) {
        setCustomerSiteState(storedCustomerSite);
      }
    } catch (e) {
      console.error("Error loading cart from localStorage:", e);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Error saving cart to localStorage:", e);
    }
  }, [items]);

  // Save mkWillChoose to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MK_WILL_CHOOSE_KEY, mkWillChoose ? "true" : "false");
      localStorage.setItem(CUSTOMER_SITE_KEY, customerSite);
    } catch (e) {
      console.error("Error saving mkWillChoose to localStorage:", e);
    }
  }, [mkWillChoose, customerSite]);

  const addItem = (backlink: Omit<CartItem, "anchor_text" | "target_url">) => {
    setItems((prev) => {
      if (prev.some((item) => item.backlink_id === backlink.backlink_id)) {
        return prev;
      }
      return [
        ...prev,
        {
          ...backlink,
          anchor_text: "",
          target_url: "",
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (backlink_id: string) => {
    setItems((prev) => prev.filter((item) => item.backlink_id !== backlink_id));
  };

  const updateItem = (backlink_id: string, data: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.backlink_id === backlink_id ? { ...item, ...data } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setMkWillChooseState(false);
    setCustomerSiteState("");
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const itemCount = items.length;

  const isInCart = (backlink_id: string) =>
    items.some((item) => item.backlink_id === backlink_id);

  const setMkWillChoose = (value: boolean) => {
    setMkWillChooseState(value);
  };

  const setCustomerSite = (value: string) => {
    setCustomerSiteState(value);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        mkWillChoose,
        setMkWillChoose,
        customerSite,
        setCustomerSite,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        isOpen,
        openCart,
        closeCart,
        total,
        itemCount,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
