'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: CartItem[];
  merchantId: string;
  merchantName: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStore {
  // Cart
  cart: CartItem[];
  merchantId: string | null;
  merchantName: string | null;
  
  // Actions
  addToCart: (item: Omit<CartItem, 'quantity'>, merchantId: string, merchantName: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  
  // Recent orders
  recentOrders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      cart: [],
      merchantId: null,
      merchantName: null,
      recentOrders: [],
      
      addToCart: (item, merchantId, merchantName) => {
        const { cart, merchantId: currentMerchantId } = get();
        
        // If switching merchants, clear cart
        if (currentMerchantId && currentMerchantId !== merchantId) {
          set({ cart: [], merchantId, merchantName });
        }
        
        // Check if item exists
        const existingItem = cart.find(i => i.menuItemId === item.menuItemId);
        
        if (existingItem) {
          set({
            cart: cart.map(i =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            merchantId,
            merchantName,
          });
        } else {
          set({
            cart: [...cart, { ...item, id: item.menuItemId, quantity: 1 }],
            merchantId,
            merchantName,
          });
        }
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }
        
        set({
          cart: get().cart.map(i =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        });
      },
      
      removeFromCart: (itemId) => {
        const newCart = get().cart.filter(i => i.id !== itemId);
        set({
          cart: newCart,
          merchantId: newCart.length === 0 ? null : get().merchantId,
          merchantName: newCart.length === 0 ? null : get().merchantName,
        });
      },
      
      clearCart: () => {
        set({ cart: [], merchantId: null, merchantName: null });
      },
      
      addOrder: (order) => {
        set({
          recentOrders: [order, ...get().recentOrders].slice(0, 20),
        });
      },
      
      updateOrderStatus: (orderId, status) => {
        set({
          recentOrders: get().recentOrders.map(o =>
            o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
          ),
        });
      },
    }),
    {
      name: 'food-platform-orders',
      partialize: (state) => ({
        cart: state.cart,
        merchantId: state.merchantId,
        merchantName: state.merchantName,
        recentOrders: state.recentOrders,
      }),
    }
  )
);

