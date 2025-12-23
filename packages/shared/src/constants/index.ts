// ===========================================
// Constants for Food Delivery Platform
// ===========================================

// Order status flow
export const ORDER_STATUS_FLOW = [
  'SUBMITTED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'IN_DELIVERY',
  'COMPLETED',
] as const;

// Status colors (для UI)
export const STATUS_COLORS = {
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
} as const;

// Status labels (для UI, русский)
export const ORDER_STATUS_LABELS = {
  SUBMITTED: 'Создан',
  ACCEPTED: 'Принят',
  PREPARING: 'Готовится',
  READY: 'Готов',
  IN_DELIVERY: 'В доставке',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
} as const;

export const MERCHANT_STATUS_LABELS = {
  PENDING: 'На проверке',
  ACTIVE: 'Активен',
  SUSPENDED: 'Приостановлен',
  CLOSED: 'Закрыт',
} as const;

// Default SLA times (in minutes)
export const DEFAULT_SLA = {
  ACCEPT_TIME: 5, // Время на принятие заказа
  READY_TIME: 30, // Время на приготовление
  DELIVERY_TIME: 45, // Общее время доставки
} as const;

// SLA warning thresholds (seconds before deadline)
export const SLA_WARNING_THRESHOLDS = {
  ACCEPT: 60, // 1 минута до дедлайна
  READY: 300, // 5 минут до дедлайна
} as const;

// Busy mode options (minutes)
export const BUSY_MODE_OPTIONS = [5, 10, 15, 20, 30, 45, 60] as const;

// Busy mode reasons
export const BUSY_MODE_REASONS = [
  'Много заказов',
  'Нехватка персонала',
  'Технические проблемы',
  'Высокая загрузка',
  'Другое',
] as const;

// Cancel reasons (by user)
export const USER_CANCEL_REASONS = [
  'Передумал',
  'Долго ждать',
  'Ошибка в заказе',
  'Нашёл дешевле',
  'Другое',
] as const;

// Cancel reasons (by merchant)
export const MERCHANT_CANCEL_REASONS = [
  'Нет ингредиентов',
  'Закрываемся',
  'Слишком много заказов',
  'Ошибка в меню',
  'Другое',
] as const;

// Review tags
export const REVIEW_TAGS = {
  positive: ['Быстро', 'Вкусно', 'Большие порции', 'Свежее', 'Хорошая упаковка'],
  negative: ['Долго', 'Холодное', 'Маленькие порции', 'Не свежее', 'Плохая упаковка'],
} as const;

// Cuisine types
export const CUISINE_TYPES = [
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
] as const;

// Cuisine labels (Russian)
export const CUISINE_LABELS: Record<string, string> = {
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
export const MERCHANT_CATEGORIES = [
  'restaurant',
  'cafe',
  'fast_food',
  'coffee_shop',
  'bakery',
  'grocery',
  'pharmacy',
  'flowers',
] as const;

// Category labels (Russian)
export const CATEGORY_LABELS: Record<string, string> = {
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
export const MERCHANT_TAGS = [
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
] as const;

// Tag labels (Russian)
export const TAG_LABELS: Record<string, string> = {
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
export const SCRAPING_SOURCE_LABELS: Record<string, string> = {
  TWOGIS: '2GIS',
  YANDEX_MAPS: 'Яндекс Карты',
  GOOGLE_MAPS: 'Google Maps',
  TRIPADVISOR: 'TripAdvisor',
  CUSTOM: 'Ручной ввод',
};

// Payment method labels
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CARD: 'Карта',
  CASH: 'Наличные',
  BONUS: 'Бонусы',
  MIXED: 'Смешанный',
};

// Days of week
export const DAYS_OF_WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export const DAY_LABELS: Record<string, string> = {
  mon: 'Понедельник',
  tue: 'Вторник',
  wed: 'Среда',
  thu: 'Четверг',
  fri: 'Пятница',
  sat: 'Суббота',
  sun: 'Воскресенье',
};

// Commission rates
export const DEFAULT_COMMISSION_RATE = 15; // %
export const DEFAULT_CASHBACK_RATE = 5; // %

// Bonus expiration (days)
export const BONUS_EXPIRATION_DAYS = 90;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Search defaults
export const DEFAULT_SEARCH_RADIUS = 5; // км
export const MAX_SEARCH_RADIUS = 50; // км

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Rate limiting
export const RATE_LIMITS = {
  AUTH: { window: 60, max: 5 }, // 5 attempts per minute
  API: { window: 60, max: 100 }, // 100 requests per minute
  SEARCH: { window: 60, max: 30 }, // 30 searches per minute
} as const;

