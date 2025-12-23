'use client';

import { create } from 'zustand';
import {
  getSocket,
  onNewOrder,
  onOrderUpdate,
  onSLAWarning,
  OrderEvent,
  SLAWarningEvent,
} from '@food-platform/shared';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'COMPLETED' | 'CANCELLED';
  customer: {
    name: string;
    phone: string;
  };
  merchant: string;
  merchantId: string;
  items: OrderItem[];
  total: number;
  type: 'DELIVERY' | 'PICKUP';
  address?: string;
  comment?: string;
  createdAt: string;
  acceptedAt?: string;
  readyAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  cancelledBy?: 'customer' | 'merchant';
  slaAcceptDeadline: string;
  slaReadyDeadline: string;
  estimatedTime: number;
}

interface AdminOrderStore {
  orders: Order[];
  slaWarnings: SLAWarningEvent[];
  isConnected: boolean;
  
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addSLAWarning: (warning: SLAWarningEvent) => void;
  clearSLAWarning: (orderId: string) => void;
  setConnected: (connected: boolean) => void;
  loadOrders: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiRequest<T>(endpoint: string): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('food_platform_token') : null;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }
  return data.data || data;
}

export const useAdminOrderStore = create<AdminOrderStore>((set, get) => ({
  orders: [],
  slaWarnings: [],
  isConnected: false,
  
  addOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
    }));
  },
  
  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
      slaWarnings: state.slaWarnings.filter(w => w.orderId !== orderId),
    }));
  },
  
  addSLAWarning: (warning) => {
    set((state) => ({
      slaWarnings: [...state.slaWarnings.filter(w => w.orderId !== warning.orderId), warning],
    }));
  },
  
  clearSLAWarning: (orderId) => {
    set((state) => ({
      slaWarnings: state.slaWarnings.filter(w => w.orderId !== orderId),
    }));
  },
  
  setConnected: (connected) => {
    set({ isConnected: connected });
  },
  
  loadOrders: async () => {
    try {
      const data = await apiRequest<{ orders: Order[] }>('/api/admin/orders');
      set({ orders: data.orders || [] });
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  },
}));

// Initialize WebSocket connection for admin
export function initializeAdminSocket(): () => void {
  const store = useAdminOrderStore.getState();
  const socket = getSocket();
  
  socket.on('connect', () => {
    store.setConnected(true);
    // Load initial orders
    store.loadOrders();
  });
  
  socket.on('disconnect', () => {
    store.setConnected(false);
  });
  
  // Admin receives ALL orders
  const unsubNewOrder = onNewOrder((event: OrderEvent) => {
    if (event.order) {
      const order: Order = {
        id: event.order.id,
        orderNumber: event.order.orderNumber,
        status: event.order.status,
        customer: {
          name: event.order.user?.name || 'Клиент',
          phone: event.order.user?.phone || '',
        },
        merchant: event.order.merchant?.name || 'Ресторан',
        merchantId: event.order.merchantId,
        items: event.order.items?.map((i: any) => ({
          id: i.id,
          name: i.menuItem?.name || i.name,
          quantity: i.quantity,
          price: i.price,
        })) || [],
        total: event.order.total,
        type: event.order.type,
        address: event.order.deliveryAddress?.street,
        createdAt: event.order.createdAt,
        slaAcceptDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        slaReadyDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        estimatedTime: 30,
      };
      
      store.addOrder(order);
    }
  });
  
  const unsubOrderUpdate = onOrderUpdate((event: OrderEvent) => {
    if (event.status) {
      store.updateOrderStatus(event.orderId, event.status as Order['status']);
    }
  });
  
  const unsubSLAWarning = onSLAWarning((event: SLAWarningEvent) => {
    store.addSLAWarning(event);
  });
  
  return () => {
    unsubNewOrder();
    unsubOrderUpdate();
    unsubSLAWarning();
  };
}
