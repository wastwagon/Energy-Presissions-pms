import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { catalogLineUnitPrice } from '../utils/catalogPrice';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    base_price: number;
    catalog_unit_price?: number;
    image_url?: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const mergedForUserId = useRef<number | null>(null);

  useEffect(() => {
    let sid = localStorage.getItem('session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', sid);
    }
    setSessionId(sid);
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (!user && sessionId) {
        params.session_id = sessionId;
      }
      const response = await api.get('/ecommerce/cart', { params });
      setCartItems(response.data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    if (!user?.id || !sessionId) return;
    if (mergedForUserId.current === user.id) return;
    let cancelled = false;
    (async () => {
      try {
        await api.post('/ecommerce/cart/merge', { session_id: sessionId });
        if (!cancelled) {
          mergedForUserId.current = user.id;
          await refreshCart();
        }
      } catch (e) {
        console.error('Cart merge failed', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, sessionId, refreshCart]);

  useEffect(() => {
    if (!user) {
      mergedForUserId.current = null;
    }
  }, [user]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      setLoading(true);
      await api.post('/ecommerce/cart/add', {
        product_id: productId,
        quantity,
        session_id: user ? undefined : sessionId,
      });
      await refreshCart();
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setLoading(true);
      await api.delete(`/ecommerce/cart/${itemId}`);
      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    try {
      setLoading(true);
      await api.put(`/ecommerce/cart/${itemId}`, null, {
        params: { quantity },
      });
      await refreshCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    return sum + catalogLineUnitPrice(item.product) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
