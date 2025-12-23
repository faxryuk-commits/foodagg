# Инструкция по деплою на Vercel

## Структура проекта

Монorepo с тремя Next.js приложениями:
- `apps/user-app` - Пользовательское приложение
- `apps/merchant-app` - Приложение для мерчантов
- `apps/admin-panel` - Админ панель

## Как задеплоить

### Вариант 1: Отдельные проекты (Рекомендуется)

Создай **3 отдельных проекта** в Vercel:

#### 1. User App
- **Root Directory**: `apps/user-app`
- **Framework Preset**: Next.js
- **Build Command**: `cd ../.. && npx turbo run build --filter=@food-platform/user-app`
- **Install Command**: `cd ../.. && npm install`
- **Output Directory**: `.next`

#### 2. Merchant App
- **Root Directory**: `apps/merchant-app`
- **Framework Preset**: Next.js
- **Build Command**: `cd ../.. && npx turbo run build --filter=@food-platform/merchant-app`
- **Install Command**: `cd ../.. && npm install`
- **Output Directory**: `.next`

#### 3. Admin Panel
- **Root Directory**: `apps/admin-panel`
- **Framework Preset**: Next.js
- **Build Command**: `cd ../.. && npx turbo run build --filter=@food-platform/admin-panel`
- **Install Command**: `cd ../.. && npm install`
- **Output Directory**: `.next`

### Вариант 2: Vercel Monorepo

Если используешь Vercel Monorepo:
1. Подключи репозиторий один раз
2. Vercel автоматически обнаружит все `vercel.json` файлы
3. Создаст отдельные проекты для каждого приложения

## Environment Variables

Добавь в каждый проект:

```
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

## Важно

- ✅ Используется `npm` (не pnpm)
- ✅ Все `vercel.json` файлы уже настроены
- ✅ `packageManager` указан в корневом `package.json`
- ✅ Turbo используется для сборки

