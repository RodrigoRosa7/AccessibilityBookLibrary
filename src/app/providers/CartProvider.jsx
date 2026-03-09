import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const changeItemQuantity = (bookId, delta) => {
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
          {
            id: crypto.randomUUID(),
            bookId,
            quantity: delta,
          },
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

  const addToCart = (bookId, quantity = 1) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return;
    }

    changeItemQuantity(bookId, quantity);
  };

  const decreaseFromCart = (bookId, quantity = 1) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return;
    }

    changeItemQuantity(bookId, -quantity);
  };

  const removeFromCart = (bookId) => {
    setItems((prevItems) => prevItems.filter((item) => item.bookId !== bookId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo(
    () => ({
      items,
      addToCart,
      decreaseFromCart,
      removeFromCart,
      clearCart,
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
