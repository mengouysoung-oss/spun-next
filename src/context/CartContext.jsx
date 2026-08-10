'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const { items } = await api.get('/cart');
      setItems(items);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async (payload) => {
    const { item } = await api.post('/cart', payload);
    setItems((prev) => [item, ...prev]);
  }, []);

  const updateQuantity = useCallback(async (id, quantity) => {
    const { item } = await api.put(`/cart/${id}`, { quantity });
    setItems((prev) => prev.map((i) => (i.id === id ? item : i)));
  }, []);

  const removeItem = useCallback(async (id) => {
    await api.del(`/cart/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, count, total, addItem, updateQuantity, removeItem, refresh, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
