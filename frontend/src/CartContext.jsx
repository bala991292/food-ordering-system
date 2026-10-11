import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart")) || []; } catch { return []; }
  });
  useEffect(() => localStorage.setItem("cart", JSON.stringify(items)), [items]);

  const add = (food) =>
    setItems((cur) => {
      const found = cur.find((i) => i.food.id === food.id);
      return found
        ? cur.map((i) => (i.food.id === food.id ? { ...i, qty: i.qty + 1 } : i))
        : [...cur, { food, qty: 1 }];
    });
  const setQty = (id, qty) =>
    setItems((cur) =>
      qty < 1 ? cur.filter((i) => i.food.id !== id) : cur.map((i) => (i.food.id === id ? { ...i, qty } : i))
    );
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * Number(i.food.price), 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, clear, count, total }}>{children}</CartContext.Provider>
  );
}
