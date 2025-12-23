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
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  customer: {
    name: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  type: 'DELIVERY' | 'PICKUP';
  address?: string;
  comment?: string;
  createdAt: Date;
  acceptedAt?: Date;
  readyAt?: Date;
  slaDeadline: Date;
}

interface SLAWarning {
  orderId: string;
  orderNumber: string;
  deadlineType: 'accept' | 'ready';
  remainingSeconds: number;
}

interface MerchantOrderStore {
  orders: Order[];
  slaWarnings: SLAWarning[];
  isConnected: boolean;
  
  // Actions
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addSLAWarning: (warning: SLAWarning) => void;
  clearSLAWarning: (orderId: string) => void;
  setConnected: (connected: boolean) => void;
  getOrdersByStatus: (status: Order['status'] | Order['status'][]) => Order[];
  
  // API actions
  acceptOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string, reason: string) => Promise<void>;
  markPreparing: (orderId: string) => Promise<void>;
  markReady: (orderId: string) => Promise<void>;
  markCompleted: (orderId: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiRequest(endpoint: string, method: string = 'POST'): Promise<any> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('food_platform_token') : null;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }
  return data;
}

export const useMerchantOrderStore = create<MerchantOrderStore>((set, get) => ({
  orders: [],
  slaWarnings: [],
  isConnected: false,
  
  addOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
    }));
    
    // Play notification sound
    playNotificationSound();
  },
  
  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              ...(status === 'ACCEPTED' ? { acceptedAt: new Date() } : {}),
              ...(status === 'READY' ? { readyAt: new Date() } : {}),
            }
          : o
      ),
      // Clear SLA warning when status changes
      slaWarnings: state.slaWarnings.filter(w => w.orderId !== orderId),
    }));
  },
  
  addSLAWarning: (warning) => {
    set((state) => ({
      slaWarnings: [...state.slaWarnings.filter(w => w.orderId !== warning.orderId), warning],
    }));
    
    // Play urgent sound for SLA warning
    playUrgentSound();
  },
  
  clearSLAWarning: (orderId) => {
    set((state) => ({
      slaWarnings: state.slaWarnings.filter(w => w.orderId !== orderId),
    }));
  },
  
  setConnected: (connected) => {
    set({ isConnected: connected });
  },
  
  getOrdersByStatus: (status) => {
    const statuses = Array.isArray(status) ? status : [status];
    return get().orders.filter((o) => statuses.includes(o.status));
  },
  
  // API actions
  acceptOrder: async (orderId) => {
    try {
      await apiRequest(`/api/merchant/orders/${orderId}/accept`);
      get().updateOrderStatus(orderId, 'ACCEPTED');
    } catch (error) {
      console.error('Failed to accept order:', error);
      throw error;
    }
  },
  
  rejectOrder: async (orderId, reason) => {
    try {
      await apiRequest(`/api/merchant/orders/${orderId}/reject`);
      get().updateOrderStatus(orderId, 'CANCELLED');
    } catch (error) {
      console.error('Failed to reject order:', error);
      throw error;
    }
  },
  
  markPreparing: async (orderId) => {
    try {
      await apiRequest(`/api/merchant/orders/${orderId}/preparing`);
      get().updateOrderStatus(orderId, 'PREPARING');
    } catch (error) {
      console.error('Failed to mark preparing:', error);
      throw error;
    }
  },
  
  markReady: async (orderId) => {
    try {
      await apiRequest(`/api/merchant/orders/${orderId}/ready`);
      get().updateOrderStatus(orderId, 'READY');
    } catch (error) {
      console.error('Failed to mark ready:', error);
      throw error;
    }
  },
  
  markCompleted: async (orderId) => {
    try {
      await apiRequest(`/api/merchant/orders/${orderId}/complete`);
      get().updateOrderStatus(orderId, 'COMPLETED');
    } catch (error) {
      console.error('Failed to complete order:', error);
      throw error;
    }
  },
}));

// Initialize WebSocket connection
export function initializeOrderSocket(): () => void {
  const store = useMerchantOrderStore.getState();
  const socket = getSocket();
  
  socket.on('connect', () => {
    store.setConnected(true);
  });
  
  socket.on('disconnect', () => {
    store.setConnected(false);
  });
  
  // Listen for new orders
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
        items: event.order.items?.map((i: any) => ({
          id: i.id,
          name: i.menuItem?.name || i.name,
          quantity: i.quantity,
          price: i.price,
          notes: i.notes,
        })) || [],
        total: event.order.total,
        type: event.order.type,
        address: event.order.deliveryAddress?.street,
        comment: event.order.comment,
        createdAt: new Date(event.order.createdAt),
        slaDeadline: new Date(Date.now() + 5 * 60 * 1000),
      };
      
      store.addOrder(order);
    }
  });
  
  // Listen for order updates
  const unsubOrderUpdate = onOrderUpdate((event: OrderEvent) => {
    if (event.status) {
      store.updateOrderStatus(event.orderId, event.status as Order['status']);
    }
  });
  
  // Listen for SLA warnings
  const unsubSLAWarning = onSLAWarning((event: SLAWarningEvent) => {
    store.addSLAWarning(event);
  });
  
  // Cleanup function
  return () => {
    unsubNewOrder();
    unsubOrderUpdate();
    unsubSLAWarning();
  };
}

// Sound effects
function playNotificationSound() {
  if (typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 200);
  } catch (e) {
    console.log('Could not play notification sound');
  }
}

function playUrgentSound() {
  if (typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Urgent beeping pattern
    oscillator.frequency.value = 1200;
    oscillator.type = 'square';
    gainNode.gain.value = 0.4;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 100);
    
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      osc2.connect(gainNode);
      osc2.frequency.value = 1200;
      osc2.type = 'square';
      osc2.start();
      setTimeout(() => {
        osc2.stop();
        audioContext.close();
      }, 100);
    }, 150);
  } catch (e) {
    console.log('Could not play urgent sound');
  }
}
