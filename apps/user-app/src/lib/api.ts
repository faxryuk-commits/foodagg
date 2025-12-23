const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Get auth token from localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// API request helper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }
  
  return data;
}

// Auth API
export const authAPI = {
  sendOTP: (phone: string) =>
    request<{ success: boolean; message: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
    
  verifyOTP: (phone: string, code: string) =>
    request<{ success: boolean; token: string; user: any }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),
    
  register: (data: { phone: string; name: string; email?: string }) =>
    request<{ success: boolean; token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  me: () => request<{ success: boolean; user: any }>('/api/auth/me'),
};

// Orders API
export const ordersAPI = {
  create: (data: {
    merchantId: string;
    items: Array<{ menuItemId: string; quantity: number; notes?: string }>;
    type: 'DELIVERY' | 'PICKUP';
    addressId?: string;
    deliveryAddress?: {
      street: string;
      building?: string;
      apartment?: string;
      entrance?: string;
      floor?: string;
      comment?: string;
      latitude?: number;
      longitude?: number;
    };
    paymentMethod: 'CASH' | 'CARD' | 'ONLINE';
    comment?: string;
    bonusToUse?: number;
  }) =>
    request<{ success: boolean; order: any }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  getAll: () =>
    request<{ success: boolean; orders: any[] }>('/api/orders'),
    
  getById: (id: string) =>
    request<{ success: boolean; order: any }>(`/api/orders/${id}`),
    
  cancel: (id: string, reason: string) =>
    request<{ success: boolean; order: any }>(`/api/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Merchants API
export const merchantsAPI = {
  getAll: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ success: boolean; merchants: any[] }>(`/api/merchants${query ? `?${query}` : ''}`);
  },
    
  getById: (id: string) =>
    request<{ success: boolean; merchant: any }>(`/api/merchants/${id}`),
    
  getMenu: (id: string) =>
    request<{ success: boolean; menu: any[] }>(`/api/merchants/${id}/menu`),
};

export { API_URL };

