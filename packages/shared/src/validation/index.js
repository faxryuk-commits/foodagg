"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.paginationSchema = exports.updateScrapingSourceSchema = exports.createScrapingSourceSchema = exports.resolveConflictSchema = exports.merchantActionSchema = exports.rejectMerchantSchema = exports.approveMerchantSchema = exports.sendMessageSchema = exports.replyReviewSchema = exports.createReviewSchema = exports.setBusyModeSchema = exports.updateMerchantSchema = exports.updateMenuCategorySchema = exports.createMenuCategorySchema = exports.updateMenuItemSchema = exports.createMenuItemSchema = exports.menuItemOptionSchema = exports.cancelOrderSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = exports.orderItemSchema = exports.searchMerchantsSchema = exports.updateAddressSchema = exports.createAddressSchema = exports.addressSchema = exports.verifyOTPSchema = exports.loginSchema = exports.registerSchema = exports.passwordSchema = exports.emailSchema = exports.phoneSchema = void 0;
const zod_1 = require("zod");
// ===========================================
// Validation Schemas (Zod)
// ===========================================
// Auth schemas
exports.phoneSchema = zod_1.z
    .string()
    .regex(/^\+?[1-9]\d{8,14}$/, 'Invalid phone number format');
exports.emailSchema = zod_1.z.string().email('Invalid email format');
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long');
exports.registerSchema = zod_1.z.object({
    phone: exports.phoneSchema,
    name: zod_1.z.string().min(2).max(100).optional(),
    email: exports.emailSchema.optional(),
    password: exports.passwordSchema.optional(),
});
exports.loginSchema = zod_1.z.object({
    phone: exports.phoneSchema,
    password: exports.passwordSchema.optional(),
    otp: zod_1.z.string().length(6).optional(),
});
exports.verifyOTPSchema = zod_1.z.object({
    phone: exports.phoneSchema,
    otp: zod_1.z.string().length(6),
});
// Address schemas
exports.addressSchema = zod_1.z.object({
    label: zod_1.z.string().max(50).optional(),
    street: zod_1.z.string().min(1).max(200),
    building: zod_1.z.string().max(50).optional(),
    apartment: zod_1.z.string().max(50).optional(),
    entrance: zod_1.z.string().max(10).optional(),
    floor: zod_1.z.string().max(10).optional(),
    city: zod_1.z.string().min(1).max(100),
    lat: zod_1.z.number().min(-90).max(90),
    lng: zod_1.z.number().min(-180).max(180),
    isDefault: zod_1.z.boolean().optional(),
});
exports.createAddressSchema = exports.addressSchema;
exports.updateAddressSchema = exports.addressSchema.partial();
// Search schemas
exports.searchMerchantsSchema = zod_1.z.object({
    query: zod_1.z.string().max(200).optional(),
    lat: zod_1.z.number().min(-90).max(90).optional(),
    lng: zod_1.z.number().min(-180).max(180).optional(),
    radius: zod_1.z.number().min(0.5).max(50).optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    cuisines: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    minRating: zod_1.z.number().min(1).max(5).optional(),
    deliveryEnabled: zod_1.z.boolean().optional(),
    pickupEnabled: zod_1.z.boolean().optional(),
    isOpen: zod_1.z.boolean().optional(),
    sortBy: zod_1.z.enum(['distance', 'rating', 'deliveryTime', 'popular']).optional(),
    page: zod_1.z.number().min(1).optional(),
    pageSize: zod_1.z.number().min(1).max(100).optional(),
});
// Order schemas
exports.orderItemSchema = zod_1.z.object({
    menuItemId: zod_1.z.string().cuid(),
    quantity: zod_1.z.number().min(1).max(99),
    options: zod_1.z.record(zod_1.z.string()).optional(),
    comment: zod_1.z.string().max(500).optional(),
});
exports.createOrderSchema = zod_1.z.object({
    merchantId: zod_1.z.string().cuid(),
    type: zod_1.z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
    items: zod_1.z.array(exports.orderItemSchema).min(1),
    addressId: zod_1.z.string().cuid().optional(),
    paymentMethod: zod_1.z.enum(['CARD', 'CASH', 'BONUS', 'MIXED']),
    bonusToUse: zod_1.z.number().min(0).optional(),
    comment: zod_1.z.string().max(500).optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'SUBMITTED',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'IN_DELIVERY',
        'COMPLETED',
        'CANCELLED',
    ]),
    note: zod_1.z.string().max(500).optional(),
});
exports.cancelOrderSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1).max(500),
});
// Menu item schemas
exports.menuItemOptionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    values: zod_1.z.array(zod_1.z.string().min(1).max(100)).min(1),
    prices: zod_1.z.array(zod_1.z.number().min(0)),
});
exports.createMenuItemSchema = zod_1.z.object({
    categoryId: zod_1.z.string().cuid().optional(),
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(1000).optional(),
    image: zod_1.z.string().url().optional(),
    price: zod_1.z.number().min(0),
    discountPrice: zod_1.z.number().min(0).optional(),
    weight: zod_1.z.string().max(50).optional(),
    calories: zod_1.z.number().min(0).optional(),
    ingredients: zod_1.z.array(zod_1.z.string().max(100)).optional(),
    allergens: zod_1.z.array(zod_1.z.string().max(100)).optional(),
    options: zod_1.z.array(exports.menuItemOptionSchema).optional(),
    isPopular: zod_1.z.boolean().optional(),
    isNew: zod_1.z.boolean().optional(),
    isSpicy: zod_1.z.boolean().optional(),
    isVegetarian: zod_1.z.boolean().optional(),
    isVegan: zod_1.z.boolean().optional(),
    isHalal: zod_1.z.boolean().optional(),
    isAvailable: zod_1.z.boolean().optional(),
    position: zod_1.z.number().min(0).optional(),
});
exports.updateMenuItemSchema = exports.createMenuItemSchema.partial();
// Menu category schemas
exports.createMenuCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    image: zod_1.z.string().url().optional(),
    position: zod_1.z.number().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateMenuCategorySchema = exports.createMenuCategorySchema.partial();
// Merchant schemas
exports.updateMerchantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().max(2000).optional(),
    phone: exports.phoneSchema.optional(),
    email: exports.emailSchema.optional(),
    website: zod_1.z.string().url().optional(),
    logo: zod_1.z.string().url().optional(),
    coverImage: zod_1.z.string().url().optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
    workingHours: zod_1.z.record(zod_1.z.object({
        open: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
        close: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
        isOpen: zod_1.z.boolean(),
    })).optional(),
    deliveryEnabled: zod_1.z.boolean().optional(),
    pickupEnabled: zod_1.z.boolean().optional(),
    dineInEnabled: zod_1.z.boolean().optional(),
    minOrderAmount: zod_1.z.number().min(0).optional(),
    deliveryFee: zod_1.z.number().min(0).optional(),
    deliveryRadius: zod_1.z.number().min(0.5).max(50).optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    cuisines: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.setBusyModeSchema = zod_1.z.object({
    isBusy: zod_1.z.boolean(),
    busyMinutes: zod_1.z.number().min(0).max(120).optional(),
    busyReason: zod_1.z.string().max(200).optional(),
});
// Review schemas
exports.createReviewSchema = zod_1.z.object({
    orderId: zod_1.z.string().cuid(),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().max(1000).optional(),
    tags: zod_1.z.array(zod_1.z.string().max(50)).optional(),
});
exports.replyReviewSchema = zod_1.z.object({
    reply: zod_1.z.string().min(1).max(1000),
});
// Chat schemas
exports.sendMessageSchema = zod_1.z.object({
    message: zod_1.z.string().min(1).max(1000),
});
// Admin schemas
exports.approveMerchantSchema = zod_1.z.object({
    commissionRate: zod_1.z.number().min(0).max(100).optional(),
    cashbackRate: zod_1.z.number().min(0).max(100).optional(),
});
exports.rejectMerchantSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1).max(500),
});
exports.merchantActionSchema = zod_1.z.object({
    action: zod_1.z.enum(['warn', 'downrank', 'suspend', 'unsuspend', 'close']),
    reason: zod_1.z.string().min(1).max(500),
});
exports.resolveConflictSchema = zod_1.z.object({
    resolution: zod_1.z.enum(['accept', 'reject', 'merge']),
    mergeData: zod_1.z.record(zod_1.z.unknown()).optional(),
});
// Scraping schemas
exports.createScrapingSourceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    type: zod_1.z.enum(['TWOGIS', 'YANDEX_MAPS', 'GOOGLE_MAPS', 'TRIPADVISOR', 'CUSTOM']),
    config: zod_1.z.object({
        region: zod_1.z.string().optional(),
        query: zod_1.z.string().optional(),
        maxResults: zod_1.z.number().min(1).max(10000).optional(),
        categories: zod_1.z.array(zod_1.z.string()).optional(),
    }),
    apifyActorId: zod_1.z.string().optional(),
});
exports.updateScrapingSourceSchema = exports.createScrapingSourceSchema.partial();
// Pagination schema
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    pageSize: zod_1.z.coerce.number().min(1).max(100).default(20),
});
// ID param schema
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
