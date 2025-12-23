import { z } from 'zod';
export declare const phoneSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const registerSchema: z.ZodObject<{
    phone: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    name?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
}, {
    phone: string;
    name?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    phone: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
    otp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    password?: string | undefined;
    otp?: string | undefined;
}, {
    phone: string;
    password?: string | undefined;
    otp?: string | undefined;
}>;
export declare const verifyOTPSchema: z.ZodObject<{
    phone: z.ZodString;
    otp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    otp: string;
}, {
    phone: string;
    otp: string;
}>;
export declare const addressSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    street: z.ZodString;
    building: z.ZodOptional<z.ZodString>;
    apartment: z.ZodOptional<z.ZodString>;
    entrance: z.ZodOptional<z.ZodString>;
    floor: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    street: string;
    city: string;
    lat: number;
    lng: number;
    label?: string | undefined;
    building?: string | undefined;
    apartment?: string | undefined;
    entrance?: string | undefined;
    floor?: string | undefined;
    isDefault?: boolean | undefined;
}, {
    street: string;
    city: string;
    lat: number;
    lng: number;
    label?: string | undefined;
    building?: string | undefined;
    apartment?: string | undefined;
    entrance?: string | undefined;
    floor?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const createAddressSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    street: z.ZodString;
    building: z.ZodOptional<z.ZodString>;
    apartment: z.ZodOptional<z.ZodString>;
    entrance: z.ZodOptional<z.ZodString>;
    floor: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    street: string;
    city: string;
    lat: number;
    lng: number;
    label?: string | undefined;
    building?: string | undefined;
    apartment?: string | undefined;
    entrance?: string | undefined;
    floor?: string | undefined;
    isDefault?: boolean | undefined;
}, {
    street: string;
    city: string;
    lat: number;
    lng: number;
    label?: string | undefined;
    building?: string | undefined;
    apartment?: string | undefined;
    entrance?: string | undefined;
    floor?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const updateAddressSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    street: z.ZodOptional<z.ZodString>;
    building: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    apartment: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    entrance: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    floor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    isDefault: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    label?: string | undefined;
    street?: string | undefined;
    building?: string | undefined;
    apartment?: string | undefined;
    entrance?: string | undefined;
    floor?: string | undefined;
    city?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    isDefault?: boolean | undefined;
}, {
    label?: string | undefined;
    street?: string | undefined;
    building?: string | undefined;
    apartment?: string | undefined;
    entrance?: string | undefined;
    floor?: string | undefined;
    city?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const searchMerchantsSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    radius: z.ZodOptional<z.ZodNumber>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cuisines: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minRating: z.ZodOptional<z.ZodNumber>;
    deliveryEnabled: z.ZodOptional<z.ZodBoolean>;
    pickupEnabled: z.ZodOptional<z.ZodBoolean>;
    isOpen: z.ZodOptional<z.ZodBoolean>;
    sortBy: z.ZodOptional<z.ZodEnum<["distance", "rating", "deliveryTime", "popular"]>>;
    page: z.ZodOptional<z.ZodNumber>;
    pageSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    radius?: number | undefined;
    categories?: string[] | undefined;
    cuisines?: string[] | undefined;
    tags?: string[] | undefined;
    minRating?: number | undefined;
    deliveryEnabled?: boolean | undefined;
    pickupEnabled?: boolean | undefined;
    isOpen?: boolean | undefined;
    sortBy?: "distance" | "rating" | "deliveryTime" | "popular" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}, {
    query?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    radius?: number | undefined;
    categories?: string[] | undefined;
    cuisines?: string[] | undefined;
    tags?: string[] | undefined;
    minRating?: number | undefined;
    deliveryEnabled?: boolean | undefined;
    pickupEnabled?: boolean | undefined;
    isOpen?: boolean | undefined;
    sortBy?: "distance" | "rating" | "deliveryTime" | "popular" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const orderItemSchema: z.ZodObject<{
    menuItemId: z.ZodString;
    quantity: z.ZodNumber;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    menuItemId: string;
    quantity: number;
    options?: Record<string, string> | undefined;
    comment?: string | undefined;
}, {
    menuItemId: string;
    quantity: number;
    options?: Record<string, string> | undefined;
    comment?: string | undefined;
}>;
export declare const createOrderSchema: z.ZodObject<{
    merchantId: z.ZodString;
    type: z.ZodEnum<["DELIVERY", "PICKUP", "DINE_IN"]>;
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        quantity: z.ZodNumber;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        comment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        menuItemId: string;
        quantity: number;
        options?: Record<string, string> | undefined;
        comment?: string | undefined;
    }, {
        menuItemId: string;
        quantity: number;
        options?: Record<string, string> | undefined;
        comment?: string | undefined;
    }>, "many">;
    addressId: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodEnum<["CARD", "CASH", "BONUS", "MIXED"]>;
    bonusToUse: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
    scheduledAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "DELIVERY" | "PICKUP" | "DINE_IN";
    merchantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        options?: Record<string, string> | undefined;
        comment?: string | undefined;
    }[];
    paymentMethod: "CARD" | "CASH" | "BONUS" | "MIXED";
    comment?: string | undefined;
    addressId?: string | undefined;
    bonusToUse?: number | undefined;
    scheduledAt?: string | undefined;
}, {
    type: "DELIVERY" | "PICKUP" | "DINE_IN";
    merchantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        options?: Record<string, string> | undefined;
        comment?: string | undefined;
    }[];
    paymentMethod: "CARD" | "CASH" | "BONUS" | "MIXED";
    comment?: string | undefined;
    addressId?: string | undefined;
    bonusToUse?: number | undefined;
    scheduledAt?: string | undefined;
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["SUBMITTED", "ACCEPTED", "PREPARING", "READY", "IN_DELIVERY", "COMPLETED", "CANCELLED"]>;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "SUBMITTED" | "ACCEPTED" | "PREPARING" | "READY" | "IN_DELIVERY" | "COMPLETED" | "CANCELLED";
    note?: string | undefined;
}, {
    status: "SUBMITTED" | "ACCEPTED" | "PREPARING" | "READY" | "IN_DELIVERY" | "COMPLETED" | "CANCELLED";
    note?: string | undefined;
}>;
export declare const cancelOrderSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export declare const menuItemOptionSchema: z.ZodObject<{
    name: z.ZodString;
    values: z.ZodArray<z.ZodString, "many">;
    prices: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    values: string[];
    prices: number[];
}, {
    name: string;
    values: string[];
    prices: number[];
}>;
export declare const createMenuItemSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    discountPrice: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodString>;
    calories: z.ZodOptional<z.ZodNumber>;
    ingredients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    allergens: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        values: z.ZodArray<z.ZodString, "many">;
        prices: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        values: string[];
        prices: number[];
    }, {
        name: string;
        values: string[];
        prices: number[];
    }>, "many">>;
    isPopular: z.ZodOptional<z.ZodBoolean>;
    isNew: z.ZodOptional<z.ZodBoolean>;
    isSpicy: z.ZodOptional<z.ZodBoolean>;
    isVegetarian: z.ZodOptional<z.ZodBoolean>;
    isVegan: z.ZodOptional<z.ZodBoolean>;
    isHalal: z.ZodOptional<z.ZodBoolean>;
    isAvailable: z.ZodOptional<z.ZodBoolean>;
    position: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    price: number;
    options?: {
        name: string;
        values: string[];
        prices: number[];
    }[] | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
    discountPrice?: number | undefined;
    weight?: string | undefined;
    calories?: number | undefined;
    ingredients?: string[] | undefined;
    allergens?: string[] | undefined;
    isPopular?: boolean | undefined;
    isNew?: boolean | undefined;
    isSpicy?: boolean | undefined;
    isVegetarian?: boolean | undefined;
    isVegan?: boolean | undefined;
    isHalal?: boolean | undefined;
    isAvailable?: boolean | undefined;
    position?: number | undefined;
}, {
    name: string;
    price: number;
    options?: {
        name: string;
        values: string[];
        prices: number[];
    }[] | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
    discountPrice?: number | undefined;
    weight?: string | undefined;
    calories?: number | undefined;
    ingredients?: string[] | undefined;
    allergens?: string[] | undefined;
    isPopular?: boolean | undefined;
    isNew?: boolean | undefined;
    isSpicy?: boolean | undefined;
    isVegetarian?: boolean | undefined;
    isVegan?: boolean | undefined;
    isHalal?: boolean | undefined;
    isAvailable?: boolean | undefined;
    position?: number | undefined;
}>;
export declare const updateMenuItemSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    image: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    discountPrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    weight: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    calories: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    ingredients: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    allergens: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    options: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        values: z.ZodArray<z.ZodString, "many">;
        prices: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        values: string[];
        prices: number[];
    }, {
        name: string;
        values: string[];
        prices: number[];
    }>, "many">>>;
    isPopular: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    isNew: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    isSpicy: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    isVegetarian: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    isVegan: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    isHalal: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    isAvailable: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    position: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    options?: {
        name: string;
        values: string[];
        prices: number[];
    }[] | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
    price?: number | undefined;
    discountPrice?: number | undefined;
    weight?: string | undefined;
    calories?: number | undefined;
    ingredients?: string[] | undefined;
    allergens?: string[] | undefined;
    isPopular?: boolean | undefined;
    isNew?: boolean | undefined;
    isSpicy?: boolean | undefined;
    isVegetarian?: boolean | undefined;
    isVegan?: boolean | undefined;
    isHalal?: boolean | undefined;
    isAvailable?: boolean | undefined;
    position?: number | undefined;
}, {
    name?: string | undefined;
    options?: {
        name: string;
        values: string[];
        prices: number[];
    }[] | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
    price?: number | undefined;
    discountPrice?: number | undefined;
    weight?: string | undefined;
    calories?: number | undefined;
    ingredients?: string[] | undefined;
    allergens?: string[] | undefined;
    isPopular?: boolean | undefined;
    isNew?: boolean | undefined;
    isSpicy?: boolean | undefined;
    isVegetarian?: boolean | undefined;
    isVegan?: boolean | undefined;
    isHalal?: boolean | undefined;
    isAvailable?: boolean | undefined;
    position?: number | undefined;
}>;
export declare const createMenuCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    image?: string | undefined;
    position?: number | undefined;
    isActive?: boolean | undefined;
}, {
    name: string;
    description?: string | undefined;
    image?: string | undefined;
    position?: number | undefined;
    isActive?: boolean | undefined;
}>;
export declare const updateMenuCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    image: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    position: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
    position?: number | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
    position?: number | undefined;
    isActive?: boolean | undefined;
}>;
export declare const updateMerchantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    coverImage: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    workingHours: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        isOpen: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        isOpen: boolean;
        open: string;
        close: string;
    }, {
        isOpen: boolean;
        open: string;
        close: string;
    }>>>;
    deliveryEnabled: z.ZodOptional<z.ZodBoolean>;
    pickupEnabled: z.ZodOptional<z.ZodBoolean>;
    dineInEnabled: z.ZodOptional<z.ZodBoolean>;
    minOrderAmount: z.ZodOptional<z.ZodNumber>;
    deliveryFee: z.ZodOptional<z.ZodNumber>;
    deliveryRadius: z.ZodOptional<z.ZodNumber>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cuisines: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    categories?: string[] | undefined;
    cuisines?: string[] | undefined;
    tags?: string[] | undefined;
    deliveryEnabled?: boolean | undefined;
    pickupEnabled?: boolean | undefined;
    description?: string | undefined;
    website?: string | undefined;
    logo?: string | undefined;
    coverImage?: string | undefined;
    images?: string[] | undefined;
    workingHours?: Record<string, {
        isOpen: boolean;
        open: string;
        close: string;
    }> | undefined;
    dineInEnabled?: boolean | undefined;
    minOrderAmount?: number | undefined;
    deliveryFee?: number | undefined;
    deliveryRadius?: number | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    categories?: string[] | undefined;
    cuisines?: string[] | undefined;
    tags?: string[] | undefined;
    deliveryEnabled?: boolean | undefined;
    pickupEnabled?: boolean | undefined;
    description?: string | undefined;
    website?: string | undefined;
    logo?: string | undefined;
    coverImage?: string | undefined;
    images?: string[] | undefined;
    workingHours?: Record<string, {
        isOpen: boolean;
        open: string;
        close: string;
    }> | undefined;
    dineInEnabled?: boolean | undefined;
    minOrderAmount?: number | undefined;
    deliveryFee?: number | undefined;
    deliveryRadius?: number | undefined;
}>;
export declare const setBusyModeSchema: z.ZodObject<{
    isBusy: z.ZodBoolean;
    busyMinutes: z.ZodOptional<z.ZodNumber>;
    busyReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isBusy: boolean;
    busyMinutes?: number | undefined;
    busyReason?: string | undefined;
}, {
    isBusy: boolean;
    busyMinutes?: number | undefined;
    busyReason?: string | undefined;
}>;
export declare const createReviewSchema: z.ZodObject<{
    orderId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    orderId: string;
    tags?: string[] | undefined;
    comment?: string | undefined;
}, {
    rating: number;
    orderId: string;
    tags?: string[] | undefined;
    comment?: string | undefined;
}>;
export declare const replyReviewSchema: z.ZodObject<{
    reply: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reply: string;
}, {
    reply: string;
}>;
export declare const sendMessageSchema: z.ZodObject<{
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
}, {
    message: string;
}>;
export declare const approveMerchantSchema: z.ZodObject<{
    commissionRate: z.ZodOptional<z.ZodNumber>;
    cashbackRate: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    commissionRate?: number | undefined;
    cashbackRate?: number | undefined;
}, {
    commissionRate?: number | undefined;
    cashbackRate?: number | undefined;
}>;
export declare const rejectMerchantSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export declare const merchantActionSchema: z.ZodObject<{
    action: z.ZodEnum<["warn", "downrank", "suspend", "unsuspend", "close"]>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    action: "warn" | "close" | "downrank" | "suspend" | "unsuspend";
}, {
    reason: string;
    action: "warn" | "close" | "downrank" | "suspend" | "unsuspend";
}>;
export declare const resolveConflictSchema: z.ZodObject<{
    resolution: z.ZodEnum<["accept", "reject", "merge"]>;
    mergeData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    resolution: "accept" | "reject" | "merge";
    mergeData?: Record<string, unknown> | undefined;
}, {
    resolution: "accept" | "reject" | "merge";
    mergeData?: Record<string, unknown> | undefined;
}>;
export declare const createScrapingSourceSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["TWOGIS", "YANDEX_MAPS", "GOOGLE_MAPS", "TRIPADVISOR", "CUSTOM"]>;
    config: z.ZodObject<{
        region: z.ZodOptional<z.ZodString>;
        query: z.ZodOptional<z.ZodString>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        query?: string | undefined;
        categories?: string[] | undefined;
        region?: string | undefined;
        maxResults?: number | undefined;
    }, {
        query?: string | undefined;
        categories?: string[] | undefined;
        region?: string | undefined;
        maxResults?: number | undefined;
    }>;
    apifyActorId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "TWOGIS" | "YANDEX_MAPS" | "GOOGLE_MAPS" | "TRIPADVISOR" | "CUSTOM";
    config: {
        query?: string | undefined;
        categories?: string[] | undefined;
        region?: string | undefined;
        maxResults?: number | undefined;
    };
    apifyActorId?: string | undefined;
}, {
    name: string;
    type: "TWOGIS" | "YANDEX_MAPS" | "GOOGLE_MAPS" | "TRIPADVISOR" | "CUSTOM";
    config: {
        query?: string | undefined;
        categories?: string[] | undefined;
        region?: string | undefined;
        maxResults?: number | undefined;
    };
    apifyActorId?: string | undefined;
}>;
export declare const updateScrapingSourceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["TWOGIS", "YANDEX_MAPS", "GOOGLE_MAPS", "TRIPADVISOR", "CUSTOM"]>>;
    config: z.ZodOptional<z.ZodObject<{
        region: z.ZodOptional<z.ZodString>;
        query: z.ZodOptional<z.ZodString>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        query?: string | undefined;
        categories?: string[] | undefined;
        region?: string | undefined;
        maxResults?: number | undefined;
    }, {
        query?: string | undefined;
        categories?: string[] | undefined;
        region?: string | undefined;
        maxResults?: number | undefined;
    }>>;
    apifyActorId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "TWOGIS" | "YANDEX_MAPS" | "GOOGLE_MAPS" | "TRIPADVISOR" | "CUSTOM" | undefined;
    config?: {
        query?: string | undefined;
        categories?: string[] | undefined;
        region?: string | undefined;
        maxResults?: number | undefined;
    } | undefined;
    apifyActorId?: string | undefined;
}, {
    name?: string | undefined;
    type?: "TWOGIS" | "YANDEX_MAPS" | "GOOGLE_MAPS" | "TRIPADVISOR" | "CUSTOM" | undefined;
    config?: {
        query?: string | undefined;
        categories?: string[] | undefined;
        region?: string | undefined;
        maxResults?: number | undefined;
    } | undefined;
    apifyActorId?: string | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
}, {
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
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
//# sourceMappingURL=index.d.ts.map