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
- **Root Directory** (в Settings → General): `apps/user-app`
- **Framework Preset**: Next.js (автоопределение)
- Build Command и Install Command уже настроены в `vercel.json`

#### 2. Merchant App
- **Root Directory** (в Settings → General): `apps/merchant-app`
- **Framework Preset**: Next.js (автоопределение)
- Build Command и Install Command уже настроены в `vercel.json`

#### 3. Admin Panel
- **Root Directory** (в Settings → General): `apps/admin-panel`
- **Framework Preset**: Next.js (автоопределение)
- Build Command и Install Command уже настроены в `vercel.json`

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

