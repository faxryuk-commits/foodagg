import { io, Socket } from 'socket.io-client';
import { getStoredTokens } from '../auth/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const tokens = getStoredTokens();
    
    socket = io(API_URL, {
      auth: { token: tokens?.accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });
    
    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });
    
    socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });
  }
  
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function reconnectSocket(): void {
  disconnectSocket();
  getSocket();
}

// Event types
export interface OrderEvent {
  orderId: string;
  order?: any;
  status?: string;
  timestamp: string;
}

export interface SLAWarningEvent {
  orderId: string;
  orderNumber: string;
  deadlineType: 'accept' | 'ready';
  remainingSeconds: number;
}

export interface MessageEvent {
  orderId: string;
  message: {
    id: string;
    senderId: string;
    senderType: 'user' | 'merchant';
    message: string;
    createdAt: string;
  };
}

// Socket event handlers
export function onNewOrder(callback: (event: OrderEvent) => void): () => void {
  const socket = getSocket();
  socket.on('order:new', callback);
  return () => socket.off('order:new', callback);
}

export function onOrderUpdate(callback: (event: OrderEvent) => void): () => void {
  const socket = getSocket();
  socket.on('order:updated', callback);
  return () => socket.off('order:updated', callback);
}

export function onSLAWarning(callback: (event: SLAWarningEvent) => void): () => void {
  const socket = getSocket();
  socket.on('order:sla:warning', callback);
  return () => socket.off('order:sla:warning', callback);
}

export function onNewMessage(callback: (event: MessageEvent) => void): () => void {
  const socket = getSocket();
  socket.on('message:new', callback);
  return () => socket.off('message:new', callback);
}

// Subscribe to order updates
export function subscribeToOrder(orderId: string): void {
  const socket = getSocket();
  socket.emit('subscribe:order', orderId);
}

export function unsubscribeFromOrder(orderId: string): void {
  const socket = getSocket();
  socket.emit('unsubscribe:order', orderId);
}

// Send message
export function sendOrderMessage(orderId: string, message: string): void {
  const socket = getSocket();
  socket.emit('order:message', { orderId, message });
}

// Typing indicator
export function sendTypingIndicator(orderId: string, isTyping: boolean): void {
  const socket = getSocket();
  socket.emit('order:typing', { orderId, isTyping });
}

