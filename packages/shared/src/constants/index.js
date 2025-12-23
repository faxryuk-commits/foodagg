"use strict";
// ===========================================
// Constants for Food Delivery Platform
// ===========================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = exports.ALLOWED_IMAGE_TYPES = exports.MAX_FILE_SIZE = exports.MAX_SEARCH_RADIUS = exports.DEFAULT_SEARCH_RADIUS = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.BONUS_EXPIRATION_DAYS = exports.DEFAULT_CASHBACK_RATE = exports.DEFAULT_COMMISSION_RATE = exports.DAY_LABELS = exports.DAYS_OF_WEEK = exports.PAYMENT_METHOD_LABELS = exports.SCRAPING_SOURCE_LABELS = exports.TAG_LABELS = exports.MERCHANT_TAGS = exports.CATEGORY_LABELS = exports.MERCHANT_CATEGORIES = exports.CUISINE_LABELS = exports.CUISINE_TYPES = exports.REVIEW_TAGS = exports.MERCHANT_CANCEL_REASONS = exports.USER_CANCEL_REASONS = exports.BUSY_MODE_REASONS = exports.BUSY_MODE_OPTIONS = exports.SLA_WARNING_THRESHOLDS = exports.DEFAULT_SLA = exports.MERCHANT_STATUS_LABELS = exports.ORDER_STATUS_LABELS = exports.STATUS_COLORS = exports.ORDER_STATUS_FLOW = void 0;
// Order status flow
exports.ORDER_STATUS_FLOW = [
    'SUBMITTED',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'IN_DELIVERY',
    'COMPLETED',
];
// Status colors (для UI)
exports.STATUS_COLORS = {
    // Order statuses
    SUBMITTED: 'blue',
    ACCEPTED: 'blue',
    PREPARING: 'yellow',
    READY: 'green',
    IN_DELIVERY: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
    // Merchant statuses
    PENDING: 'yellow',
    ACTIVE: 'green',
    SUSPENDED: 'red',
    CLOSED: 'gray',
    // SLA statuses
    OK: 'green',
    WARNING: 'yellow',
    BREACHED: 'red',
};
// Status labels (для UI, русский)
exports.ORDER_STATUS_LABELS = {
    SUBMITTED: 'Создан',
    ACCEPTED: 'Принят',
    PREPARING: 'Готовится',
    READY: 'Готов',
    IN_DELIVERY: 'В доставке',
    COMPLETED: 'Завершён',
    CANCELLED: 'Отменён',
};
exports.MERCHANT_STATUS_LABELS = {
    PENDING: 'На проверке',
    ACTIVE: 'Активен',
    SUSPENDED: 'Приостановлен',
    CLOSED: 'Закрыт',
};
// Default SLA times (in minutes)
exports.DEFAULT_SLA = {
    ACCEPT_TIME: 5, // Время на принятие заказа
    READY_TIME: 30, // Время на приготовление
    DELIVERY_TIME: 45, // Общее время доставки
};
// SLA warning thresholds (seconds before deadline)
exports.SLA_WARNING_THRESHOLDS = {
    ACCEPT: 60, // 1 минута до дедлайна
    READY: 300, // 5 минут до дедлайна
};
// Busy mode options (minutes)
exports.BUSY_MODE_OPTIONS = [5, 10, 15, 20, 30, 45, 60];
// Busy mode reasons
exports.BUSY_MODE_REASONS = [
    'Много заказов',
    'Нехватка персонала',
    'Технические проблемы',
    'Высокая загрузка',
    'Другое',
];
// Cancel reasons (by user)
exports.USER_CANCEL_REASONS = [
    'Передумал',
    'Долго ждать',
    'Ошибка в заказе',
    'Нашёл дешевле',
    'Другое',
];
// Cancel reasons (by merchant)
exports.MERCHANT_CANCEL_REASONS = [
    'Нет ингредиентов',
    'Закрываемся',
    'Слишком много заказов',
    'Ошибка в меню',
    'Другое',
];
// Review tags
exports.REVIEW_TAGS = {
    positive: ['Быстро', 'Вкусно', 'Большие порции', 'Свежее', 'Хорошая упаковка'],
    negative: ['Долго', 'Холодное', 'Маленькие порции', 'Не свежее', 'Плохая упаковка'],
};
// Cuisine types
exports.CUISINE_TYPES = [
    'uzbek',
    'russian',
    'european',
    'asian',
    'japanese',
    'korean',
    'chinese',
    'indian',
    'italian',
    'american',
    'fast_food',
    'healthy',
    'vegetarian',
    'vegan',
];
// Cuisine labels (Russian)
exports.CUISINE_LABELS = {
    uzbek: 'Узбекская',
    russian: 'Русская',
    european: 'Европейская',
    asian: 'Азиатская',
    japanese: 'Японская',
    korean: 'Корейская',
    chinese: 'Китайская',
    indian: 'Индийская',
    italian: 'Итальянская',
    american: 'Американская',
    fast_food: 'Фастфуд',
    healthy: 'Здоровое питание',
    vegetarian: 'Вегетарианская',
    vegan: 'Веганская',
};
// Merchant categories
exports.MERCHANT_CATEGORIES = [
    'restaurant',
    'cafe',
    'fast_food',
    'coffee_shop',
    'bakery',
    'grocery',
    'pharmacy',
    'flowers',
];
// Category labels (Russian)
exports.CATEGORY_LABELS = {
    restaurant: 'Ресторан',
    cafe: 'Кафе',
    fast_food: 'Фастфуд',
    coffee_shop: 'Кофейня',
    bakery: 'Пекарня',
    grocery: 'Продукты',
    pharmacy: 'Аптека',
    flowers: 'Цветы',
};
// Merchant tags
exports.MERCHANT_TAGS = [
    'halal',
    'vegetarian',
    'vegan',
    'gluten_free',
    '24h',
    'wifi',
    'parking',
    'delivery',
    'pickup',
    'dine_in',
    'outdoor',
    'kids_friendly',
    'pet_friendly',
];
// Tag labels (Russian)
exports.TAG_LABELS = {
    halal: 'Халяль',
    vegetarian: 'Вегетарианское',
    vegan: 'Веганское',
    gluten_free: 'Без глютена',
    '24h': 'Круглосуточно',
    wifi: 'Wi-Fi',
    parking: 'Парковка',
    delivery: 'Доставка',
    pickup: 'Самовывоз',
    dine_in: 'В заведении',
    outdoor: 'Терраса',
    kids_friendly: 'Детское меню',
    pet_friendly: 'Pet-friendly',
};
// Scraping sources
exports.SCRAPING_SOURCE_LABELS = {
    TWOGIS: '2GIS',
    YANDEX_MAPS: 'Яндекс Карты',
    GOOGLE_MAPS: 'Google Maps',
    TRIPADVISOR: 'TripAdvisor',
    CUSTOM: 'Ручной ввод',
};
// Payment method labels
exports.PAYMENT_METHOD_LABELS = {
    CARD: 'Карта',
    CASH: 'Наличные',
    BONUS: 'Бонусы',
    MIXED: 'Смешанный',
};
// Days of week
exports.DAYS_OF_WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
exports.DAY_LABELS = {
    mon: 'Понедельник',
    tue: 'Вторник',
    wed: 'Среда',
    thu: 'Четверг',
    fri: 'Пятница',
    sat: 'Суббота',
    sun: 'Воскресенье',
};
// Commission rates
exports.DEFAULT_COMMISSION_RATE = 15; // %
exports.DEFAULT_CASHBACK_RATE = 5; // %
// Bonus expiration (days)
exports.BONUS_EXPIRATION_DAYS = 90;
// Pagination defaults
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
// Search defaults
exports.DEFAULT_SEARCH_RADIUS = 5; // км
exports.MAX_SEARCH_RADIUS = 50; // км
// File upload limits
exports.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
exports.ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// Rate limiting
exports.RATE_LIMITS = {
    AUTH: { window: 60, max: 5 }, // 5 attempts per minute
    API: { window: 60, max: 100 }, // 100 requests per minute
    SEARCH: { window: 60, max: 30 }, // 30 searches per minute
};
