# План реализации Platform OS

## 🎯 Стратегия: Поэтапная разработка

### Этап 0: Подготовка (1-2 дня)
- [x] Архитектура и план
- [ ] Настройка monorepo
- [ ] Выбор и настройка инструментов
- [ ] Создание базовой структуры

### Этап 1: Foundation (Неделя 1-2)

#### 1.1 Инфраструктура проекта
```
✓ Создать monorepo структуру
✓ Настроить TypeScript
✓ Настроить ESLint + Prettier
✓ Настроить Git hooks (Husky)
```

#### 1.2 База данных
```
✓ Prisma schema (все основные модели)
✓ Миграции
✓ Seed данные (тестовые рестораны, пользователи)
```

#### 1.3 Backend API (базовый)
```
✓ Express server setup
✓ Authentication (JWT)
✓ Базовые CRUD endpoints
✓ Error handling middleware
✓ Validation (Zod)
```

#### 1.4 Shared пакеты
```
✓ Общие TypeScript типы
✓ Утилиты (validation, formatting)
✓ Константы (статусы, конфиги)
```

---

### Этап 2: User App MVP (Неделя 3-4)

#### 2.1 Базовая навигация
```
✓ Address Gate экран
✓ Home/Search экран
✓ Results экран
✓ Store Page экран
✓ Cart/Checkout экран
```

#### 2.2 Функционал
```
✓ Поиск ресторанов (по названию, категории)
✓ Просмотр меню
✓ Добавление в корзину
✓ Создание заказа
✓ Базовый статус заказа
```

#### 2.3 Интеграции
```
✓ Maps API (автодетект адреса)
✓ Geocoding (адрес → координаты)
```

---

### Этап 3: Merchant App MVP (Неделя 5-6)

#### 3.1 Orders Queue
```
✓ Список новых заказов
✓ Принятие/отклонение заказа
✓ Таймер SLA (обратный отсчёт)
✓ Цветовая индикация статуса
```

#### 3.2 Menu Management
```
✓ Список позиций меню
✓ Toggle доступности
✓ Редактирование цены
```

#### 3.3 Базовые настройки
```
✓ Профиль ресторана
✓ Часы работы
```

---

### Этап 4: Real-time & Status Tracking (Неделя 7-8)

#### 4.1 WebSocket интеграция
```
✓ Socket.io server setup
✓ Real-time обновления заказов
✓ Уведомления для User и Merchant
```

#### 4.2 Order Status Flow
```
✓ Timeline компонент
✓ Статусы: submitted → in_progress → ready → completed
✓ Чат между User и Merchant
```

#### 4.3 SLA Monitoring
```
✓ Background jobs для таймеров
✓ Уведомления при приближении к SLA
✓ Автоматические действия при breach
```

---

### Этап 5: Admin Panel (Неделя 9-10)

#### 5.1 Merchant Applications
```
✓ Список заявок (pending)
✓ Просмотр данных (2GIS/Яндекс ссылки)
✓ Approve/Reject с причинами
```

#### 5.2 Quality Control
```
✓ Метрики SLA по ресторанам
✓ Топ отмен
✓ Actions: Warning, Downrank, Freeze
```

#### 5.3 Live Market
```
✓ Карта с heatmap заказов
✓ Red zones (SLA breaches)
```

---

### Этап 6: Data Scraping & Automation (Неделя 11-14)

#### 6.1 Apify интеграция
```
✓ API клиент для Apify
✓ Запуск Actors по расписанию
✓ Обработка результатов
```

#### 6.2 n8n Workflows
```
✓ Workflow: Schedule → Apify → Parse → Queue
✓ Workflow: Conflict Detection → Admin Notification
✓ Workflow: Auto-approve для проверенных источников
```

#### 6.3 Собственные скрипты
```
✓ Playwright скрипты для источников без API
✓ Нормализация данных (унифицированный формат)
✓ Валидация и дедупликация
```

#### 6.4 Conflict Resolution
```
✓ Обнаружение дубликатов
✓ UI для ручного разрешения
✓ Audit log
```

---

### Этап 7: Advanced Features (Неделя 15-18)

#### 7.1 Busy Mode
```
✓ Slider для увеличения времени
✓ Причины (опционально)
✓ Отображение пользователю
```

#### 7.2 Cashback System
```
✓ Начисление бонусов
✓ Использование в checkout
✓ История транзакций
```

#### 7.3 Ratings & Reviews
```
✓ Отзывы после заказа
✓ Теги (быстро/вкусно)
✓ Рейтинги для ресторанов
```

#### 7.4 AI Features (опционально)
```
✓ Intent recognition (поисковые запросы)
✓ Рекомендации блюд
✓ Оптимизация меню (советы для ресторанов)
```

---

### Этап 8: Payments & Economics (Неделя 19-20)

#### 8.1 Payment Integration
```
✓ Stripe / ЮKassa setup
✓ Обработка платежей
✓ Webhooks для статусов
```

#### 8.2 Bonus System
```
✓ Начисление при заказе
✓ Использование бонусов
✓ История операций
```

#### 8.3 Admin Economics
```
✓ Комиссии
✓ Cashback spend
✓ Unit economics dashboard
```

---

### Этап 9: Polish & Optimization (Неделя 21-22)

#### 9.1 Performance
```
✓ Оптимизация запросов (индексы БД)
✓ Кэширование (Redis)
✓ Image optimization
✓ Code splitting
```

#### 9.2 UX Improvements
```
✓ Loading states
✓ Error handling
✓ Empty states
✓ Onboarding
```

#### 9.3 Testing
```
✓ Unit tests (критичные функции)
✓ Integration tests (API endpoints)
✓ E2E tests (основные flows)
```

---

### Этап 10: Deployment & Monitoring (Неделя 23-24)

#### 10.1 Production Setup
```
✓ Environment variables
✓ Database migrations
✓ SSL certificates
✓ CDN setup
```

#### 10.2 Monitoring
```
✓ Sentry (error tracking)
✓ LogRocket (session replay)
✓ Analytics (PostHog)
✓ Uptime monitoring
```

#### 10.3 Documentation
```
✓ API documentation (Swagger)
✓ Deployment guide
✓ User guides
```

---

## 🛠️ Технические детали реализации

### Database Schema (Prisma)

```prisma
// Основные модели уже описаны в ARCHITECTURE.md
// Дополнительно нужны:

model Address {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  street    String
  city      String
  lat       Float
  lng       Float
  isDefault Boolean  @default(false)
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  menuItemId  String
  menuItem    MenuItem @relation(fields: [menuItemId], references: [id])
  quantity    Int
  price       Float
  subtotal    Float
}

model SLA {
  id              String   @id @default(cuid())
  merchantId      String
  merchant        Merchant @relation(fields: [merchantId], references: [id])
  acceptTime      Int      // секунды
  readyTime       Int      // секунды
  createdAt       DateTime @default(now())
}
```

### API Endpoints (основные)

```
# Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me

# Users
GET    /api/users/me
PATCH  /api/users/me
GET    /api/users/me/orders
GET    /api/users/me/addresses
POST   /api/users/me/addresses

# Merchants
GET    /api/merchants?lat=&lng=&radius=&query=
GET    /api/merchants/:id
GET    /api/merchants/:id/menu
GET    /api/merchants/:id/reviews

# Orders
POST   /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status
GET    /api/orders/:id/timeline

# Merchant Orders
GET    /api/merchant/orders?status=
POST   /api/merchant/orders/:id/accept
POST   /api/merchant/orders/:id/reject
POST   /api/merchant/orders/:id/ready

# Admin
GET    /api/admin/merchants/pending
POST   /api/admin/merchants/:id/approve
POST   /api/admin/merchants/:id/reject
GET    /api/admin/scraping/sources
POST   /api/admin/scraping/sources/:id/sync
```

### WebSocket Events

```typescript
// Client → Server
'subscribe:order'     // Подписка на обновления заказа
'unsubscribe:order'
'order:message'       // Сообщение в чат

// Server → Client
'order:updated'        // Обновление статуса
'order:sla:warning'   // Предупреждение о SLA
'order:new'           // Новый заказ (для merchant)
'message:new'         // Новое сообщение в чате
```

---

## 📊 Метрики успеха

### MVP (Этап 1-3)
- ✅ Пользователь может найти ресторан и создать заказ
- ✅ Ресторан может принять и обработать заказ
- ✅ Базовый статус-трекинг работает

### Phase 2 (Этап 4-5)
- ✅ Real-time обновления работают
- ✅ Admin может управлять ресторанами
- ✅ SLA мониторинг активен

### Phase 3 (Этап 6-8)
- ✅ Автоматический сбор данных работает
- ✅ Payments интегрированы
- ✅ Cashback система функционирует

---

## 🚨 Риски и митигация

### Риск 1: Сложность интеграции с 40+ источниками
**Митигация**: Начать с 2-3 основных (2GIS, Яндекс), затем добавлять по одному

### Риск 2: SLA система может быть resource-intensive
**Митигация**: Использовать Redis для таймеров, оптимизировать запросы

### Риск 3: Real-time может не масштабироваться
**Митигация**: Использовать Redis adapter для Socket.io, горизонтальное масштабирование

### Риск 4: Стоимость Apify может вырасти
**Митигация**: Кэшировать результаты, использовать собственные скрипты где возможно

---

## ✅ Чеклист перед стартом

- [ ] Выбрать hosting провайдеров
- [ ] Создать аккаунты (Apify, Maps API, Payments)
- [ ] Настроить development environment
- [ ] Создать репозиторий и настроить CI/CD
- [ ] Подготовить дизайн в Figma (по UX SPEC)

---

**Готов начать с Этапа 0?** 🚀

