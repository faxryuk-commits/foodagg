import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '+998901234567' },
    update: {},
    create: {
      phone: '+998901234567',
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.phone);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const testUser = await prisma.user.upsert({
    where: { phone: '+998901111111' },
    update: {},
    create: {
      phone: '+998901111111',
      email: 'user@example.com',
      name: 'Test User',
      passwordHash: userPassword,
      role: 'USER',
      bonusBalance: 50000,
    },
  });
  console.log('✅ Test user created:', testUser.phone);

  // Create user address
  const address = await prisma.address.create({
    data: {
      userId: testUser.id,
      label: 'Дом',
      street: 'ул. Навои',
      building: '15',
      apartment: '42',
      city: 'Ташкент',
      country: 'Uzbekistan',
      lat: 41.311081,
      lng: 69.240562,
      isDefault: true,
    },
  });
  console.log('✅ User address created');

  // Create merchant owner
  const merchantOwner = await prisma.user.upsert({
    where: { phone: '+998902222222' },
    update: {},
    create: {
      phone: '+998902222222',
      email: 'merchant@example.com',
      name: 'Merchant Owner',
      passwordHash: await bcrypt.hash('merchant123', 10),
      role: 'MERCHANT_OWNER',
    },
  });
  console.log('✅ Merchant owner created:', merchantOwner.phone);

  // Create merchants
  const merchants = [
    {
      name: 'Плов Центр',
      slug: 'plov-center',
      description: 'Лучший плов в городе. Традиционные узбекские блюда.',
      phone: '+998712345678',
      address: 'ул. Амира Темура, 45',
      city: 'Ташкент',
      lat: 41.315,
      lng: 69.285,
      categories: ['restaurant'],
      cuisines: ['uzbek'],
      tags: ['halal', 'popular'],
      rating: 4.8,
      reviewCount: 156,
      orderCount: 1250,
      cashbackRate: 7,
    },
    {
      name: 'Burger King',
      slug: 'burger-king',
      description: 'Бургеры, картошка фри и напитки.',
      phone: '+998712345679',
      address: 'пр. Шахрисабз, 12',
      city: 'Ташкент',
      lat: 41.32,
      lng: 69.27,
      categories: ['fast_food'],
      cuisines: ['american', 'fast_food'],
      tags: ['fast_food'],
      rating: 4.2,
      reviewCount: 89,
      orderCount: 567,
      cashbackRate: 5,
    },
    {
      name: 'Pizza House',
      slug: 'pizza-house',
      description: 'Итальянская пицца на тонком тесте.',
      phone: '+998712345680',
      address: 'ул. Бабура, 78',
      city: 'Ташкент',
      lat: 41.308,
      lng: 69.258,
      categories: ['restaurant', 'cafe'],
      cuisines: ['italian', 'european'],
      tags: ['pizza', 'delivery'],
      rating: 4.5,
      reviewCount: 203,
      orderCount: 890,
      cashbackRate: 6,
    },
    {
      name: 'Sushi Master',
      slug: 'sushi-master',
      description: 'Свежие суши и роллы с доставкой.',
      phone: '+998712345681',
      address: 'ул. Мукими, 23',
      city: 'Ташкент',
      lat: 41.305,
      lng: 69.275,
      categories: ['restaurant'],
      cuisines: ['japanese', 'asian'],
      tags: ['sushi', 'delivery'],
      rating: 4.6,
      reviewCount: 178,
      orderCount: 720,
      cashbackRate: 5,
    },
    {
      name: 'Чайхана Навруз',
      slug: 'chayhana-navruz',
      description: 'Национальная кухня в уютной атмосфере.',
      phone: '+998712345682',
      address: 'ул. Навои, 100',
      city: 'Ташкент',
      lat: 41.312,
      lng: 69.265,
      categories: ['restaurant', 'cafe'],
      cuisines: ['uzbek', 'asian'],
      tags: ['halal', 'traditional', 'outdoor'],
      rating: 4.7,
      reviewCount: 245,
      orderCount: 1100,
      cashbackRate: 8,
    },
  ];

  for (const merchantData of merchants) {
    const merchant = await prisma.merchant.upsert({
      where: { slug: merchantData.slug },
      update: {},
      create: {
        ...merchantData,
        status: 'ACTIVE',
        isVerified: true,
        deliveryEnabled: true,
        pickupEnabled: true,
        minOrderAmount: 30000,
        deliveryFee: 10000,
        deliveryRadius: 10,
        slaAcceptTime: 5,
        slaReadyTime: 30,
        workingHours: {
          mon: { open: '09:00', close: '23:00', isOpen: true },
          tue: { open: '09:00', close: '23:00', isOpen: true },
          wed: { open: '09:00', close: '23:00', isOpen: true },
          thu: { open: '09:00', close: '23:00', isOpen: true },
          fri: { open: '09:00', close: '00:00', isOpen: true },
          sat: { open: '10:00', close: '00:00', isOpen: true },
          sun: { open: '10:00', close: '22:00', isOpen: true },
        },
      },
    });
    console.log(`✅ Merchant created: ${merchant.name}`);

    // Link merchant owner
    await prisma.merchantStaff.upsert({
      where: {
        merchantId_userId: {
          merchantId: merchant.id,
          userId: merchantOwner.id,
        },
      },
      update: {},
      create: {
        merchantId: merchant.id,
        userId: merchantOwner.id,
        role: 'owner',
      },
    });

    // Create menu categories
    const categories = [
      { name: 'Популярное', position: 0 },
      { name: 'Основные блюда', position: 1 },
      { name: 'Салаты', position: 2 },
      { name: 'Напитки', position: 3 },
      { name: 'Десерты', position: 4 },
    ];

    for (const catData of categories) {
      const category = await prisma.menuCategory.create({
        data: {
          merchantId: merchant.id,
          name: catData.name,
          position: catData.position,
          isActive: true,
        },
      });

      // Create menu items based on merchant type
      let items: Array<{
        name: string;
        description: string;
        price: number;
        isPopular?: boolean;
      }> = [];

      if (merchantData.cuisines.includes('uzbek')) {
        if (catData.name === 'Основные блюда') {
          items = [
            { name: 'Плов', description: 'Традиционный узбекский плов с бараниной', price: 45000, isPopular: true },
            { name: 'Лагман', description: 'Домашняя лапша с овощами и мясом', price: 38000 },
            { name: 'Шашлык', description: 'Шашлык из баранины, 200г', price: 55000, isPopular: true },
            { name: 'Манты', description: '5 шт., с бараниной', price: 35000 },
            { name: 'Самса', description: 'С мясом, 2 шт.', price: 18000 },
          ];
        } else if (catData.name === 'Салаты') {
          items = [
            { name: 'Ачик-чучук', description: 'Салат из помидоров и лука', price: 15000 },
            { name: 'Шакароп', description: 'Салат из помидоров', price: 12000 },
          ];
        }
      } else if (merchantData.cuisines.includes('italian')) {
        if (catData.name === 'Основные блюда') {
          items = [
            { name: 'Пицца Маргарита', description: 'Томаты, моцарелла, базилик', price: 65000, isPopular: true },
            { name: 'Пицца Пепперони', description: 'Пепперони, сыр, томатный соус', price: 75000, isPopular: true },
            { name: 'Паста Карбонара', description: 'Спагетти с беконом и сливками', price: 52000 },
            { name: 'Лазанья', description: 'Классическая итальянская лазанья', price: 58000 },
          ];
        }
      } else if (merchantData.cuisines.includes('japanese')) {
        if (catData.name === 'Основные блюда') {
          items = [
            { name: 'Сет Филадельфия', description: '8 роллов с лососем и сыром', price: 85000, isPopular: true },
            { name: 'Сет Калифорния', description: '8 роллов с крабом', price: 75000 },
            { name: 'Сашими лосось', description: '6 кусочков свежего лосося', price: 65000 },
            { name: 'Рамен', description: 'Японский суп с лапшой и свининой', price: 48000 },
          ];
        }
      } else if (merchantData.cuisines.includes('american')) {
        if (catData.name === 'Основные блюда') {
          items = [
            { name: 'Чизбургер', description: 'Котлета, сыр, овощи', price: 42000, isPopular: true },
            { name: 'Воппер', description: 'Большой бургер с двойной котлетой', price: 55000, isPopular: true },
            { name: 'Наггетсы', description: '9 шт. с соусом', price: 32000 },
            { name: 'Картофель фри', description: 'Большая порция', price: 18000 },
          ];
        }
      }

      // Default items for empty categories
      if (catData.name === 'Напитки' && items.length === 0) {
        items = [
          { name: 'Кока-Кола', description: '0.5л', price: 8000 },
          { name: 'Чай', description: 'Чёрный/зелёный', price: 5000 },
          { name: 'Морс', description: 'Домашний ягодный', price: 12000 },
        ];
      }

      if (catData.name === 'Десерты' && items.length === 0) {
        items = [
          { name: 'Чак-чак', description: 'Традиционный десерт', price: 15000 },
          { name: 'Мороженое', description: '2 шарика', price: 18000 },
        ];
      }

      // Create items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await prisma.menuItem.create({
          data: {
            merchantId: merchant.id,
            categoryId: category.id,
            name: item.name,
            description: item.description,
            price: item.price,
            isAvailable: true,
            isPopular: item.isPopular || false,
            isHalal: true,
            position: i,
          },
        });
      }
    }
  }

  // Create a test order
  const firstMerchant = await prisma.merchant.findFirst({
    where: { slug: 'plov-center' },
    include: { menuItems: { take: 2 } },
  });

  if (firstMerchant && firstMerchant.menuItems.length > 0) {
    const order = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-000001',
        userId: testUser.id,
        merchantId: firstMerchant.id,
        addressId: address.id,
        type: 'DELIVERY',
        status: 'COMPLETED',
        subtotal: 83000,
        deliveryFee: 10000,
        serviceFee: 0,
        discount: 0,
        bonusUsed: 0,
        bonusEarned: 5810,
        total: 93000,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        deliveryAddress: {
          street: address.street,
          building: address.building,
          apartment: address.apartment,
          city: address.city,
          lat: address.lat,
          lng: address.lng,
        },
        estimatedTime: 45,
        acceptedAt: new Date(Date.now() - 3600000),
        readyAt: new Date(Date.now() - 2700000),
        deliveredAt: new Date(Date.now() - 1800000),
        items: {
          create: firstMerchant.menuItems.map((item) => ({
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            subtotal: item.price,
          })),
        },
        timeline: {
          create: [
            { status: 'SUBMITTED', actor: 'user' },
            { status: 'ACCEPTED', actor: 'merchant' },
            { status: 'PREPARING', actor: 'merchant' },
            { status: 'READY', actor: 'merchant' },
            { status: 'COMPLETED', actor: 'merchant' },
          ],
        },
      },
    });

    // Create review for the order
    await prisma.review.create({
      data: {
        orderId: order.id,
        userId: testUser.id,
        merchantId: firstMerchant.id,
        rating: 5,
        comment: 'Отличный плов! Доставили быстро, ещё горячий. Рекомендую!',
        tags: ['Быстро', 'Вкусно', 'Большие порции'],
      },
    });

    console.log('✅ Test order and review created');
  }

  // Create scraping source
  await prisma.scrapingSource.upsert({
    where: { id: 'default-2gis' },
    update: {},
    create: {
      id: 'default-2gis',
      name: '2GIS Tashkent Restaurants',
      type: 'TWOGIS',
      config: {
        region: 'tashkent',
        query: 'restaurants',
        maxResults: 1000,
      },
      status: 'ACTIVE',
    },
  });
  console.log('✅ Scraping source created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Test accounts:');
  console.log('   Admin: +998901234567 / admin123');
  console.log('   User: +998901111111 / user123');
  console.log('   Merchant: +998902222222 / merchant123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

