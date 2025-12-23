/**
 * Format price with currency
 */
export declare function formatPrice(price: number, currency?: string): string;
/**
 * Format distance in km or m
 */
export declare function formatDistance(meters: number): string;
/**
 * Format time duration
 */
export declare function formatDuration(minutes: number): string;
/**
 * Format date/time
 */
export declare function formatDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string;
/**
 * Format relative time (e.g., "5 минут назад")
 */
export declare function formatRelativeTime(date: Date | string): string;
/**
 * Format phone number
 */
export declare function formatPhone(phone: string): string;
/**
 * Generate order number
 */
export declare function generateOrderNumber(): string;
/**
 * Generate slug from string
 */
export declare function generateSlug(str: string): string;
/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export declare function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
/**
 * Check if merchant is currently open
 */
export declare function isMerchantOpen(workingHours: Record<string, {
    open: string;
    close: string;
    isOpen: boolean;
}> | null): boolean;
/**
 * Calculate estimated delivery time
 */
export declare function calculateEstimatedTime(distance: number, // km
preparationTime: number, // minutes
isBusy: boolean, busyMinutes: number): number;
/**
 * Calculate order totals
 */
export declare function calculateOrderTotals(items: {
    price: number;
    quantity: number;
}[], deliveryFee: number, serviceFeePercent: number, bonusToUse: number, cashbackPercent: number): {
    subtotal: number;
    serviceFee: number;
    discount: number;
    bonusUsed: number;
    bonusEarned: number;
    total: number;
};
/**
 * Calculate SLA deadlines
 */
export declare function calculateSLADeadlines(orderCreatedAt: Date, slaAcceptTime: number, // minutes
slaReadyTime: number): {
    acceptDeadline: Date;
    readyDeadline: Date;
};
/**
 * Get SLA status
 */
export declare function getSLAStatus(deadline: Date, warningSeconds?: number): 'ok' | 'warning' | 'breached';
/**
 * Truncate string with ellipsis
 */
export declare function truncate(str: string, maxLength: number): string;
/**
 * Pluralize Russian words
 */
export declare function pluralize(count: number, one: string, few: string, many: string): string;
/**
 * Get rating text
 */
export declare function getRatingText(rating: number): string;
/**
 * Deep clone object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Debounce function
 */
export declare function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Sleep/delay utility
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Generate random ID
 */
export declare function generateId(length?: number): string;
//# sourceMappingURL=index.d.ts.map