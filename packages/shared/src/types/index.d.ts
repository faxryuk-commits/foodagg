export interface User {
    id: string;
    email: string | null;
    phone: string;
    name: string | null;
    avatar: string | null;
    role: UserRole;
    bonusBalance: number;
    totalOrders: number;
    createdAt: Date;
}
export type UserRole = 'USER' | 'MERCHANT_OWNER' | 'MERCHANT_STAFF' | 'ADMIN' | 'SUPER_ADMIN';
export interface Address {
    id: string;
    userId: string;
    label: string | null;
    street: string;
    building: string | null;
    apartment: string | null;
    city: string;
    lat: number;
    lng: number;
    isDefault: boolean;
}
export interface Merchant {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    phone: string;
    logo: string | null;
    coverImage: string | null;
    address: string;
    city: string;
    lat: number;
    lng: number;
    status: MerchantStatus;
    isVerified: boolean;
    isBusy: boolean;
    busyMinutes: number;
    rating: number;
    reviewCount: number;
    orderCount: number;
    deliveryEnabled: boolean;
    pickupEnabled: boolean;
    minOrderAmount: number;
    deliveryFee: number;
    deliveryRadius: number;
    categories: string[];
    cuisines: string[];
    tags: string[];
    cashbackRate: number;
    workingHours: WorkingHours | null;
    createdAt: Date;
}
export type MerchantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export interface WorkingHours {
    [day: string]: {
        open: string;
        close: string;
        isOpen: boolean;
    };
}
export interface MenuCategory {
    id: string;
    merchantId: string;
    name: string;
    description: string | null;
    image: string | null;
    position: number;
    isActive: boolean;
    items?: MenuItem[];
}
export interface MenuItem {
    id: string;
    merchantId: string;
    categoryId: string | null;
    name: string;
    description: string | null;
    image: string | null;
    price: number;
    discountPrice: number | null;
    weight: string | null;
    calories: number | null;
    isAvailable: boolean;
    isPopular: boolean;
    isNew: boolean;
    isSpicy: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isHalal: boolean;
    options: MenuItemOption[] | null;
}
export interface MenuItemOption {
    name: string;
    values: string[];
    prices: number[];
}
export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    merchantId: string;
    merchant?: Merchant;
    type: OrderType;
    status: OrderStatus;
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    discount: number;
    bonusUsed: number;
    bonusEarned: number;
    total: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    deliveryAddress: DeliveryAddress | null;
    estimatedTime: number | null;
    scheduledAt: Date | null;
    comment: string | null;
    items: OrderItem[];
    timeline?: OrderTimelineEvent[];
    createdAt: Date;
    acceptedAt: Date | null;
    readyAt: Date | null;
    deliveredAt: Date | null;
    cancelledAt: Date | null;
    cancelReason: string | null;
    slaBreached: boolean;
}
export type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';
export type OrderStatus = 'SUBMITTED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'CARD' | 'CASH' | 'BONUS' | 'MIXED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export interface OrderItem {
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    options: Record<string, string> | null;
    subtotal: number;
    comment: string | null;
}
export interface OrderTimelineEvent {
    id: string;
    status: OrderStatus;
    note: string | null;
    actor: string | null;
    createdAt: Date;
}
export interface DeliveryAddress {
    street: string;
    building: string | null;
    apartment: string | null;
    entrance: string | null;
    floor: string | null;
    city: string;
    lat: number;
    lng: number;
}
export interface Review {
    id: string;
    orderId: string;
    userId: string;
    user?: Pick<User, 'id' | 'name' | 'avatar'>;
    merchantId: string;
    rating: number;
    comment: string | null;
    tags: string[];
    reply: string | null;
    repliedAt: Date | null;
    createdAt: Date;
}
export interface OrderMessage {
    id: string;
    orderId: string;
    senderId: string;
    senderType: 'user' | 'merchant' | 'system';
    message: string;
    createdAt: Date;
    readAt: Date | null;
}
export interface ScrapingSource {
    id: string;
    name: string;
    type: ScrapingSourceType;
    config: Record<string, unknown>;
    status: ScrapingStatus;
    lastRunAt: Date | null;
    lastError: string | null;
    totalItems: number;
    newItems: number;
    conflicts: number;
}
export type ScrapingSourceType = 'TWOGIS' | 'YANDEX_MAPS' | 'GOOGLE_MAPS' | 'TRIPADVISOR' | 'CUSTOM';
export type ScrapingStatus = 'ACTIVE' | 'PAUSED' | 'ERROR';
export interface ScrapingResult {
    id: string;
    sourceId: string;
    merchantId: string | null;
    rawData: Record<string, unknown>;
    normalizedData: NormalizedMerchantData | null;
    matchedMerchantId: string | null;
    matchScore: number | null;
    conflictStatus: ConflictStatus;
    conflictFields: string[];
    createdAt: Date;
}
export type ConflictStatus = 'PENDING' | 'RESOLVED' | 'IGNORED';
export interface NormalizedMerchantData {
    name: string;
    address: string;
    phone: string | null;
    website: string | null;
    rating: number | null;
    reviewCount: number | null;
    lat: number;
    lng: number;
    categories: string[];
    workingHours: WorkingHours | null;
    images: string[];
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface SearchFilters {
    query?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    categories?: string[];
    cuisines?: string[];
    tags?: string[];
    minRating?: number;
    deliveryEnabled?: boolean;
    pickupEnabled?: boolean;
    isOpen?: boolean;
    sortBy?: 'distance' | 'rating' | 'deliveryTime' | 'popular';
}
export interface MerchantSearchResult extends Merchant {
    distance?: number;
    estimatedDeliveryTime?: number;
}
export interface SLAMetrics {
    merchantId: string;
    date: Date;
    totalOrders: number;
    acceptedOnTime: number;
    readyOnTime: number;
    cancelled: number;
    slaBreached: number;
    avgAcceptTime: number | null;
    avgReadyTime: number | null;
    avgRating: number | null;
    reviewCount: number;
}
export interface WSOrderUpdate {
    type: 'order:updated';
    orderId: string;
    status: OrderStatus;
    timestamp: Date;
}
export interface WSNewOrder {
    type: 'order:new';
    order: Order;
}
export interface WSSLAWarning {
    type: 'order:sla:warning';
    orderId: string;
    orderNumber: string;
    deadlineType: 'accept' | 'ready';
    remainingSeconds: number;
}
export interface WSNewMessage {
    type: 'message:new';
    message: OrderMessage;
}
export type WSEvent = WSOrderUpdate | WSNewOrder | WSSLAWarning | WSNewMessage;
//# sourceMappingURL=index.d.ts.map