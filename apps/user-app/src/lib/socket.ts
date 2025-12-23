'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useState, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  
  return socket;
}

// Hook for subscribing to order updates
export function useOrderUpdates(orderId: string | null, onUpdate: (data: any) => void) {
  useEffect(() => {
    if (!orderId) return;
    
    const socket = getSocket();
    
    socket.emit('subscribe:order', orderId);
    socket.on('order:updated', onUpdate);
    
    return () => {
      socket.emit('unsubscribe:order', orderId);
      socket.off('order:updated', onUpdate);
    };
  }, [orderId, onUpdate]);
}

// Hook for listening to new orders (for merchants/admin)
export function useNewOrders(onNewOrder: (data: any) => void) {
  useEffect(() => {
    const socket = getSocket();
    
    socket.on('order:new', onNewOrder);
    
    return () => {
      socket.off('order:new', onNewOrder);
    };
  }, [onNewOrder]);
}

// Hook for SLA warnings
export function useSLAWarnings(onWarning: (data: any) => void) {
  useEffect(() => {
    const socket = getSocket();
    
    socket.on('order:sla:warning', onWarning);
    
    return () => {
      socket.off('order:sla:warning', onWarning);
    };
  }, [onWarning]);
}

