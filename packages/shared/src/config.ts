// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_URL;

// Order statuses
export const ORDER_STATUSES = {
  SUBMITTED: 'SUBMITTED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  IN_DELIVERY: 'IN_DELIVERY',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

// SLA timeouts in minutes
export const SLA = {
  ACCEPT_TIMEOUT: 5,
  READY_TIMEOUT: 30,
  DELIVERY_TIMEOUT: 45,
};

