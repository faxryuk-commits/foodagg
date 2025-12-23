export declare const ORDER_STATUS_FLOW: readonly ["SUBMITTED", "ACCEPTED", "PREPARING", "READY", "IN_DELIVERY", "COMPLETED"];
export declare const STATUS_COLORS: {
    readonly SUBMITTED: "blue";
    readonly ACCEPTED: "blue";
    readonly PREPARING: "yellow";
    readonly READY: "green";
    readonly IN_DELIVERY: "blue";
    readonly COMPLETED: "green";
    readonly CANCELLED: "red";
    readonly PENDING: "yellow";
    readonly ACTIVE: "green";
    readonly SUSPENDED: "red";
    readonly CLOSED: "gray";
    readonly OK: "green";
    readonly WARNING: "yellow";
    readonly BREACHED: "red";
};
export declare const ORDER_STATUS_LABELS: {
    readonly SUBMITTED: "Создан";
    readonly ACCEPTED: "Принят";
    readonly PREPARING: "Готовится";
    readonly READY: "Готов";
    readonly IN_DELIVERY: "В доставке";
    readonly COMPLETED: "Завершён";
    readonly CANCELLED: "Отменён";
};
export declare const MERCHANT_STATUS_LABELS: {
    readonly PENDING: "На проверке";
    readonly ACTIVE: "Активен";
    readonly SUSPENDED: "Приостановлен";
    readonly CLOSED: "Закрыт";
};
export declare const DEFAULT_SLA: {
    readonly ACCEPT_TIME: 5;
    readonly READY_TIME: 30;
    readonly DELIVERY_TIME: 45;
};
export declare const SLA_WARNING_THRESHOLDS: {
    readonly ACCEPT: 60;
    readonly READY: 300;
};
export declare const BUSY_MODE_OPTIONS: readonly [5, 10, 15, 20, 30, 45, 60];
export declare const BUSY_MODE_REASONS: readonly ["Много заказов", "Нехватка персонала", "Технические проблемы", "Высокая загрузка", "Другое"];
export declare const USER_CANCEL_REASONS: readonly ["Передумал", "Долго ждать", "Ошибка в заказе", "Нашёл дешевле", "Другое"];
export declare const MERCHANT_CANCEL_REASONS: readonly ["Нет ингредиентов", "Закрываемся", "Слишком много заказов", "Ошибка в меню", "Другое"];
export declare const REVIEW_TAGS: {
    readonly positive: readonly ["Быстро", "Вкусно", "Большие порции", "Свежее", "Хорошая упаковка"];
    readonly negative: readonly ["Долго", "Холодное", "Маленькие порции", "Не свежее", "Плохая упаковка"];
};
export declare const CUISINE_TYPES: readonly ["uzbek", "russian", "european", "asian", "japanese", "korean", "chinese", "indian", "italian", "american", "fast_food", "healthy", "vegetarian", "vegan"];
export declare const CUISINE_LABELS: Record<string, string>;
export declare const MERCHANT_CATEGORIES: readonly ["restaurant", "cafe", "fast_food", "coffee_shop", "bakery", "grocery", "pharmacy", "flowers"];
export declare const CATEGORY_LABELS: Record<string, string>;
export declare const MERCHANT_TAGS: readonly ["halal", "vegetarian", "vegan", "gluten_free", "24h", "wifi", "parking", "delivery", "pickup", "dine_in", "outdoor", "kids_friendly", "pet_friendly"];
export declare const TAG_LABELS: Record<string, string>;
export declare const SCRAPING_SOURCE_LABELS: Record<string, string>;
export declare const PAYMENT_METHOD_LABELS: Record<string, string>;
export declare const DAYS_OF_WEEK: readonly ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export declare const DAY_LABELS: Record<string, string>;
export declare const DEFAULT_COMMISSION_RATE = 15;
export declare const DEFAULT_CASHBACK_RATE = 5;
export declare const BONUS_EXPIRATION_DAYS = 90;
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare const DEFAULT_SEARCH_RADIUS = 5;
export declare const MAX_SEARCH_RADIUS = 50;
export declare const MAX_FILE_SIZE: number;
export declare const ALLOWED_IMAGE_TYPES: string[];
export declare const RATE_LIMITS: {
    readonly AUTH: {
        readonly window: 60;
        readonly max: 5;
    };
    readonly API: {
        readonly window: 60;
        readonly max: 100;
    };
    readonly SEARCH: {
        readonly window: 60;
        readonly max: 30;
    };
};
//# sourceMappingURL=index.d.ts.map