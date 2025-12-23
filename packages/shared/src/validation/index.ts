import { z } from 'zod';

// ===========================================
// Validation Schemas (Zod)
// ===========================================

// Auth schemas
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{8,14}$/, 'Invalid phone number format');

export const emailSchema = z.string().email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long');

export const registerSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
});

export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema.optional(),
  otp: z.string().length(6).optional(),
});

export const verifyOTPSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6),
});

// Address schemas
export const addressSchema = z.object({
  label: z.string().max(50).optional(),
  street: z.string().min(1).max(200),
  building: z.string().max(50).optional(),
  apartment: z.string().max(50).optional(),
  entrance: z.string().max(10).optional(),
  floor: z.string().max(10).optional(),
  city: z.string().min(1).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  isDefault: z.boolean().optional(),
});

export const createAddressSchema = addressSchema;
export const updateAddressSchema = addressSchema.partial();

// Search schemas
export const searchMerchantsSchema = z.object({
  query: z.string().max(200).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  radius: z.number().min(0.5).max(50).optional(),
  categories: z.array(z.string()).optional(),
  cuisines: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  minRating: z.number().min(1).max(5).optional(),
  deliveryEnabled: z.boolean().optional(),
  pickupEnabled: z.boolean().optional(),
  isOpen: z.boolean().optional(),
  sortBy: z.enum(['distance', 'rating', 'deliveryTime', 'popular']).optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
});

// Order schemas
export const orderItemSchema = z.object({
  menuItemId: z.string().cuid(),
  quantity: z.number().min(1).max(99),
  options: z.record(z.string()).optional(),
  comment: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  merchantId: z.string().cuid(),
  type: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
  items: z.array(orderItemSchema).min(1),
  addressId: z.string().cuid().optional(),
  paymentMethod: z.enum(['CARD', 'CASH', 'BONUS', 'MIXED']),
  bonusToUse: z.number().min(0).optional(),
  comment: z.string().max(500).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'IN_DELIVERY',
    'COMPLETED',
    'CANCELLED',
  ]),
  note: z.string().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1).max(500),
});

// Menu item schemas
export const menuItemOptionSchema = z.object({
  name: z.string().min(1).max(100),
  values: z.array(z.string().min(1).max(100)).min(1),
  prices: z.array(z.number().min(0)),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().cuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  image: z.string().url().optional(),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  weight: z.string().max(50).optional(),
  calories: z.number().min(0).optional(),
  ingredients: z.array(z.string().max(100)).optional(),
  allergens: z.array(z.string().max(100)).optional(),
  options: z.array(menuItemOptionSchema).optional(),
  isPopular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isHalal: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  position: z.number().min(0).optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

// Menu category schemas
export const createMenuCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  position: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateMenuCategorySchema = createMenuCategorySchema.partial();

// Merchant schemas
export const updateMerchantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  workingHours: z.record(z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/),
    isOpen: z.boolean(),
  })).optional(),
  deliveryEnabled: z.boolean().optional(),
  pickupEnabled: z.boolean().optional(),
  dineInEnabled: z.boolean().optional(),
  minOrderAmount: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  deliveryRadius: z.number().min(0.5).max(50).optional(),
  categories: z.array(z.string()).optional(),
  cuisines: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const setBusyModeSchema = z.object({
  isBusy: z.boolean(),
  busyMinutes: z.number().min(0).max(120).optional(),
  busyReason: z.string().max(200).optional(),
});

// Review schemas
export const createReviewSchema = z.object({
  orderId: z.string().cuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

export const replyReviewSchema = z.object({
  reply: z.string().min(1).max(1000),
});

// Chat schemas
export const sendMessageSchema = z.object({
  message: z.string().min(1).max(1000),
});

// Admin schemas
export const approveMerchantSchema = z.object({
  commissionRate: z.number().min(0).max(100).optional(),
  cashbackRate: z.number().min(0).max(100).optional(),
});

export const rejectMerchantSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const merchantActionSchema = z.object({
  action: z.enum(['warn', 'downrank', 'suspend', 'unsuspend', 'close']),
  reason: z.string().min(1).max(500),
});

export const resolveConflictSchema = z.object({
  resolution: z.enum(['accept', 'reject', 'merge']),
  mergeData: z.record(z.unknown()).optional(),
});

// Scraping schemas
export const createScrapingSourceSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['TWOGIS', 'YANDEX_MAPS', 'GOOGLE_MAPS', 'TRIPADVISOR', 'CUSTOM']),
  config: z.object({
    region: z.string().optional(),
    query: z.string().optional(),
    maxResults: z.number().min(1).max(10000).optional(),
    categories: z.array(z.string()).optional(),
  }),
  apifyActorId: z.string().optional(),
});

export const updateScrapingSourceSchema = createScrapingSourceSchema.partial();

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

// ID param schema
export const idParamSchema = z.object({
  id: z.string().cuid(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type SearchMerchantsInput = z.infer<typeof searchMerchantsSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type CreateMenuCategoryInput = z.infer<typeof createMenuCategorySchema>;
export type UpdateMenuCategoryInput = z.infer<typeof updateMenuCategorySchema>;
export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;
export type SetBusyModeInput = z.infer<typeof setBusyModeSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReplyReviewInput = z.infer<typeof replyReviewSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ApproveMerchantInput = z.infer<typeof approveMerchantSchema>;
export type RejectMerchantInput = z.infer<typeof rejectMerchantSchema>;
export type MerchantActionInput = z.infer<typeof merchantActionSchema>;
export type ResolveConflictInput = z.infer<typeof resolveConflictSchema>;
export type CreateScrapingSourceInput = z.infer<typeof createScrapingSourceSchema>;
export type UpdateScrapingSourceInput = z.infer<typeof updateScrapingSourceSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

