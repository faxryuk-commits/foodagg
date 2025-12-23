'use client';

import { create } from 'zustand';

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
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

// Initial demo orders
const demoOrders: Order[] = [
  {
    id: 'ORD-001',
    orderNumber: '240001',
    customer: { name: 'Алишер Каримов', phone: '+998 90 123 4567' },
    merchant: 'Sushi Time',
    items: [{ id: '1', name: 'Филадельфия x2', quantity: 2, price: 75000 }],
    total: 185000,
    status: 'PREPARING',
    type: 'DELIVERY',
    address: 'ул. Навои, 45, кв. 12',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    slaAcceptDeadline: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    slaReadyDeadline: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    estimatedTime: 30,
  },
  {
    id: 'ORD-002',
    orderNumber: '240002',
    customer: { name: 'Мария Иванова', phone: '+998 91 234 5678' },
    merchant: 'Burger House',
    items: [{ id: '2', name: 'Чизбургер x3', quantity: 3, price: 28000 }],
    total: 98000,
    status: 'SUBMITTED',
    type: 'PICKUP',
    createdAt: new Date().toISOString(),
    slaAcceptDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    slaReadyDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    estimatedTime: 25,
  },
];

export const useAdminOrderStore = create<AdminOrderStore>((set) => ({
  orders: demoOrders,
  
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
    }));
  },
}));

// Listen for new orders from user app
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'food-platform-new-order' && event.newValue) {
      try {
        const orderData = JSON.parse(event.newValue);
        const store = useAdminOrderStore.getState();
        
        const newOrder: Order = {
          id: orderData.id,
          orderNumber: orderData.orderNumber,
          customer: orderData.customer || { name: 'Клиент', phone: '+998 90 XXX XXXX' },
          merchant: orderData.merchantName || 'Ресторан',
          items: orderData.items || [],
          total: orderData.total || 0,
          status: 'SUBMITTED',
          type: orderData.type || 'DELIVERY',
          address: orderData.address,
          comment: orderData.comment,
          createdAt: orderData.createdAt || new Date().toISOString(),
          slaAcceptDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          slaReadyDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          estimatedTime: 30,
        };
        
        store.addOrder(newOrder);
      } catch (e) {
        console.error('Failed to parse order:', e);
      }
    }
  });
}

