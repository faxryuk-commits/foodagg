// ===========================================
// Utility Functions
// ===========================================

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency = 'UZS'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format distance in km or m
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} м`;
  }
  return `${(meters / 1000).toFixed(1)} км`;
}

/**
 * Format time duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} ч`;
  }
  return `${hours} ч ${mins} мин`;
}

/**
 * Format date/time
 */
export function formatDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(d);
}

/**
 * Format relative time (e.g., "5 минут назад")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ч назад`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} дн назад`;

  return formatDateTime(d, { day: 'numeric', month: 'short' });
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as +998 XX XXX XX XX (Uzbekistan format)
  if (digits.startsWith('998') && digits.length === 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  
  // Return as-is if not Uzbekistan format
  return phone;
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `ORD-${year}-${random}`;
}

/**
 * Generate slug from string
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Check if merchant is currently open
 */
export function isMerchantOpen(
  workingHours: Record<string, { open: string; close: string; isOpen: boolean }> | null
): boolean {
  if (!workingHours) return true; // Assume open if no working hours specified

  const now = new Date();
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayKey = days[now.getDay()];
  const todayHours = workingHours[dayKey];

  if (!todayHours || !todayHours.isOpen) return false;

  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

/**
 * Calculate estimated delivery time
 */
export function calculateEstimatedTime(
  distance: number, // km
  preparationTime: number, // minutes
  isBusy: boolean,
  busyMinutes: number
): number {
  // Base delivery time: 2 min per km
  const deliveryTime = Math.ceil(distance * 2);
  
  // Total time
  let total = preparationTime + deliveryTime;
  
  // Add busy time if applicable
  if (isBusy && busyMinutes > 0) {
    total += busyMinutes;
  }
  
  // Round to nearest 5 minutes
  return Math.ceil(total / 5) * 5;
}

/**
 * Calculate order totals
 */
export function calculateOrderTotals(
  items: { price: number; quantity: number }[],
  deliveryFee: number,
  serviceFeePercent: number,
  bonusToUse: number,
  cashbackPercent: number
): {
  subtotal: number;
  serviceFee: number;
  discount: number;
  bonusUsed: number;
  bonusEarned: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = Math.round(subtotal * (serviceFeePercent / 100));
  const discount = 0; // Implement promo codes logic here
  
  // Bonus can't exceed subtotal
  const bonusUsed = Math.min(bonusToUse, subtotal);
  
  const total = Math.max(0, subtotal + deliveryFee + serviceFee - discount - bonusUsed);
  
  // Cashback earned (only on subtotal, not fees)
  const bonusEarned = Math.round(subtotal * (cashbackPercent / 100));
  
  return {
    subtotal,
    serviceFee,
    discount,
    bonusUsed,
    bonusEarned,
    total,
  };
}

/**
 * Calculate SLA deadlines
 */
export function calculateSLADeadlines(
  orderCreatedAt: Date,
  slaAcceptTime: number, // minutes
  slaReadyTime: number // minutes
): {
  acceptDeadline: Date;
  readyDeadline: Date;
} {
  const acceptDeadline = new Date(orderCreatedAt.getTime() + slaAcceptTime * 60 * 1000);
  const readyDeadline = new Date(orderCreatedAt.getTime() + (slaAcceptTime + slaReadyTime) * 60 * 1000);
  
  return { acceptDeadline, readyDeadline };
}

/**
 * Get SLA status
 */
export function getSLAStatus(
  deadline: Date,
  warningSeconds: number = 60
): 'ok' | 'warning' | 'breached' {
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();
  
  if (remaining < 0) return 'breached';
  if (remaining < warningSeconds * 1000) return 'warning';
  return 'ok';
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Pluralize Russian words
 */
export function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 19) {
    return many;
  }
  if (mod10 === 1) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return few;
  }
  return many;
}

/**
 * Get rating text
 */
export function getRatingText(rating: number): string {
  if (rating >= 4.5) return 'Отлично';
  if (rating >= 4.0) return 'Очень хорошо';
  if (rating >= 3.5) return 'Хорошо';
  if (rating >= 3.0) return 'Нормально';
  return 'Ниже среднего';
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random ID
 */
export function generateId(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

