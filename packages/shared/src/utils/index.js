"use strict";
// ===========================================
// Utility Functions
// ===========================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = formatPrice;
exports.formatDistance = formatDistance;
exports.formatDuration = formatDuration;
exports.formatDateTime = formatDateTime;
exports.formatRelativeTime = formatRelativeTime;
exports.formatPhone = formatPhone;
exports.generateOrderNumber = generateOrderNumber;
exports.generateSlug = generateSlug;
exports.calculateDistance = calculateDistance;
exports.isMerchantOpen = isMerchantOpen;
exports.calculateEstimatedTime = calculateEstimatedTime;
exports.calculateOrderTotals = calculateOrderTotals;
exports.calculateSLADeadlines = calculateSLADeadlines;
exports.getSLAStatus = getSLAStatus;
exports.truncate = truncate;
exports.pluralize = pluralize;
exports.getRatingText = getRatingText;
exports.deepClone = deepClone;
exports.debounce = debounce;
exports.sleep = sleep;
exports.generateId = generateId;
/**
 * Format price with currency
 */
function formatPrice(price, currency = 'UZS') {
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
function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)} м`;
    }
    return `${(meters / 1000).toFixed(1)} км`;
}
/**
 * Format time duration
 */
function formatDuration(minutes) {
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
function formatDateTime(date, options) {
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
function formatRelativeTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1)
        return 'только что';
    if (diffMins < 60)
        return `${diffMins} мин назад`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
        return `${diffHours} ч назад`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7)
        return `${diffDays} дн назад`;
    return formatDateTime(d, { day: 'numeric', month: 'short' });
}
/**
 * Format phone number
 */
function formatPhone(phone) {
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
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `ORD-${year}-${random}`;
}
/**
 * Generate slug from string
 */
function generateSlug(str) {
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
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}
function toRad(deg) {
    return deg * (Math.PI / 180);
}
/**
 * Check if merchant is currently open
 */
function isMerchantOpen(workingHours) {
    if (!workingHours)
        return true; // Assume open if no working hours specified
    const now = new Date();
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = days[now.getDay()];
    const todayHours = workingHours[dayKey];
    if (!todayHours || !todayHours.isOpen)
        return false;
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
}
/**
 * Calculate estimated delivery time
 */
function calculateEstimatedTime(distance, // km
preparationTime, // minutes
isBusy, busyMinutes) {
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
function calculateOrderTotals(items, deliveryFee, serviceFeePercent, bonusToUse, cashbackPercent) {
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
function calculateSLADeadlines(orderCreatedAt, slaAcceptTime, // minutes
slaReadyTime // minutes
) {
    const acceptDeadline = new Date(orderCreatedAt.getTime() + slaAcceptTime * 60 * 1000);
    const readyDeadline = new Date(orderCreatedAt.getTime() + (slaAcceptTime + slaReadyTime) * 60 * 1000);
    return { acceptDeadline, readyDeadline };
}
/**
 * Get SLA status
 */
function getSLAStatus(deadline, warningSeconds = 60) {
    const now = new Date();
    const remaining = deadline.getTime() - now.getTime();
    if (remaining < 0)
        return 'breached';
    if (remaining < warningSeconds * 1000)
        return 'warning';
    return 'ok';
}
/**
 * Truncate string with ellipsis
 */
function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - 3) + '...';
}
/**
 * Pluralize Russian words
 */
function pluralize(count, one, few, many) {
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
function getRatingText(rating) {
    if (rating >= 4.5)
        return 'Отлично';
    if (rating >= 4.0)
        return 'Очень хорошо';
    if (rating >= 3.5)
        return 'Хорошо';
    if (rating >= 3.0)
        return 'Нормально';
    return 'Ниже среднего';
}
/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Debounce function
 */
function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}
/**
 * Sleep/delay utility
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Generate random ID
 */
function generateId(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
