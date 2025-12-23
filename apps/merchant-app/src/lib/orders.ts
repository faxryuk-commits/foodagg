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

interface MerchantOrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrdersByStatus: (status: Order['status'] | Order['status'][]) => Order[];
}

// Initial demo orders
const demoOrders: Order[] = [
  {
    id: 'demo-1',
    orderNumber: 'ORD-001234',
    status: 'SUBMITTED',
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    customer: { name: 'Алексей М.', phone: '+998901234567' },
    items: [
      { id: '1', name: 'Плов', quantity: 2, price: 45000 },
      { id: '5', name: 'Самса', quantity: 3, price: 18000 },
    ],
    total: 144000,
    type: 'DELIVERY',
    address: 'ул. Навои, 15, кв. 42',
    comment: 'Без лука, пожалуйста',
    slaDeadline: new Date(Date.now() + 3 * 60 * 1000),
  },
  {
    id: 'demo-2',
    orderNumber: 'ORD-001235',
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    acceptedAt: new Date(Date.now() - 12 * 60 * 1000),
    customer: { name: 'Мария К.', phone: '+998907654321' },
    items: [
      { id: '3', name: 'Лагман', quantity: 1, price: 38000 },
      { id: '8', name: 'Чай', quantity: 2, price: 8000 },
    ],
    total: 54000,
    type: 'PICKUP',
    slaDeadline: new Date(Date.now() + 18 * 60 * 1000),
  },
];

export const useMerchantOrderStore = create<MerchantOrderStore>((set, get) => ({
  orders: demoOrders,
  
  addOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
    }));
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
    }));
  },
  
  getOrdersByStatus: (status) => {
    const statuses = Array.isArray(status) ? status : [status];
    return get().orders.filter((o) => statuses.includes(o.status));
  },
}));

// Listen for new orders from user app (cross-tab communication)
if (typeof window !== 'undefined') {
  // Listen for storage events (cross-tab)
  window.addEventListener('storage', (event) => {
    if (event.key === 'food-platform-new-order' && event.newValue) {
      try {
        const orderData = JSON.parse(event.newValue);
        const store = useMerchantOrderStore.getState();
        
        // Create order from user data
        const newOrder: Order = {
          id: orderData.id,
          orderNumber: orderData.orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
          status: 'SUBMITTED',
          customer: orderData.customer || { name: 'Клиент', phone: '+998 90 XXX XXXX' },
          items: orderData.items || [],
          total: orderData.total || 0,
          type: orderData.type || 'DELIVERY',
          address: orderData.address,
          comment: orderData.comment,
          createdAt: new Date(orderData.createdAt || Date.now()),
          slaDeadline: new Date(Date.now() + 5 * 60 * 1000),
        };
        
        store.addOrder(newOrder);
        
        // Play notification sound
        playNotificationSound();
      } catch (e) {
        console.error('Failed to parse order:', e);
      }
    }
  });
  
  // Listen for custom events (same-origin)
  window.addEventListener('newOrder', ((event: CustomEvent) => {
    const store = useMerchantOrderStore.getState();
    const orderData = event.detail;
    
    const newOrder: Order = {
      id: orderData.id,
      orderNumber: orderData.orderNumber,
      status: 'SUBMITTED',
      customer: orderData.customer || { name: 'Клиент', phone: '+998 90 XXX XXXX' },
      items: orderData.items || [],
      total: orderData.total || 0,
      type: 'DELIVERY',
      address: orderData.address,
      createdAt: new Date(),
      slaDeadline: new Date(Date.now() + 5 * 60 * 1000),
    };
    
    store.addOrder(newOrder);
    playNotificationSound();
  }) as EventListener);
}

function playNotificationSound() {
  try {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 200);
  } catch (e) {
    console.log('Could not play sound');
  }
}

