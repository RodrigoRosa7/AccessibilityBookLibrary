import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BookId, CartItem } from "../../types";

interface CartContextValue {
  items: CartItem[];
  addToCart: (bookId: BookId, quantity?: number) => void;
  decreaseFromCart: (bookId: BookId, quantity?: number) => void;
  removeFromCart: (bookId: BookId) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const changeItemQuantity = (bookId: BookId, delta: number) => {
    if (!bookId || !Number.isFinite(delta) || delta === 0) {
      return;
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.bookId === bookId);

      if (!existingItem) {
        if (delta < 0) {
          return prevItems;
        }

        return [
          ...prevItems,
          { id: crypto.randomUUID(), bookId, quantity: delta },
        ];
      }

      const nextQuantity = existingItem.quantity + delta;

      if (nextQuantity <= 0) {
        return prevItems.filter((item) => item.bookId !== bookId);
      }

      return prevItems.map((item) =>
        item.bookId === bookId ? { ...item, quantity: nextQuantity } : item,
      );
    });
  };

  const addToCart = (bookId: BookId, quantity = 1) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return;
    }

    changeItemQuantity(bookId, quantity);
  };

  const decreaseFromCart = (bookId: BookId, quantity = 1) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return;
    }

    changeItemQuantity(bookId, -quantity);
  };

  const removeFromCart = (bookId: BookId) => {
    setItems((prevItems) => prevItems.filter((item) => item.bookId !== bookId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addToCart,
      decreaseFromCart,
      removeFromCart,
      clearCart,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
