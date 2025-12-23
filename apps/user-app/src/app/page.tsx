'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Mic, ArrowRight, Sparkles, Clock, Star, Percent } from 'lucide-react';
import Link from 'next/link';

// Mock data for demo
const popularMerchants = [
  {
    id: '1',
    name: 'Плов Центр',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    rating: 4.8,
    reviewCount: 156,
    deliveryTime: '25-35',
    deliveryFee: 10000,
    cashback: 7,
    tags: ['Узбекская', 'Плов'],
  },
  {
    id: '2',
    name: 'Pizza House',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    rating: 4.5,
    reviewCount: 203,
    deliveryTime: '30-40',
    deliveryFee: 15000,
    cashback: 6,
    tags: ['Пицца', 'Итальянская'],
  },
  {
    id: '3',
    name: 'Sushi Master',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    rating: 4.6,
    reviewCount: 178,
    deliveryTime: '35-45',
    deliveryFee: 12000,
    cashback: 5,
    tags: ['Суши', 'Японская'],
  },
  {
    id: '4',
    name: 'Burger King',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    rating: 4.2,
    reviewCount: 89,
    deliveryTime: '20-30',
    deliveryFee: 8000,
    cashback: 5,
    tags: ['Бургеры', 'Фастфуд'],
  },
];

const quickFilters = [
  { icon: '🔥', label: 'Популярное' },
  { icon: '⚡', label: 'Быстро' },
  { icon: '💰', label: 'Выгодно' },
  { icon: '🥗', label: 'Здоровое' },
  { icon: '🍕', label: 'Пицца' },
  { icon: '🍔', label: 'Бургеры' },
  { icon: '🍜', label: 'Азиатская' },
  { icon: '🥘', label: 'Узбекская' },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' сум';
}

export default function HomePage() {
  const [address, setAddress] = useState('ул. Навои, 15');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Популярное');

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          {/* Address */}
          <button className="flex items-center gap-2 text-left w-full group">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Доставка</p>
              <p className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                {address}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Что хотите заказать?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12 pr-12"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center hover:bg-brand-200 transition-colors">
              <Mic className="w-4 h-4 text-brand-600" />
            </button>
          </div>
        </motion.div>

        {/* AI Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-r from-brand-500 to-orange-400 text-white"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Рекомендуем сегодня</p>
              <p className="text-sm text-white/80 mt-0.5">
                Плов из «Плов Центр» — доставка за 25 мин, кешбэк 7%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setActiveFilter(filter.label)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeFilter === filter.label
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                <span>{filter.icon}</span>
                <span className="font-medium text-sm">{filter.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Merchants Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Рестораны рядом</h2>
            <Link href="/restaurants" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Все →
            </Link>
          </div>

          <div className="grid gap-4">
            {popularMerchants.map((merchant, index) => (
              <motion.div
                key={merchant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link href={`/restaurant/${merchant.id}`}>
                  <div className="card-hover flex gap-4">
                    {/* Image */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={merchant.image}
                        alt={merchant.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Cashback Badge */}
                      <div className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Percent className="w-2.5 h-2.5" />
                        {merchant.cashback}%
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {merchant.name}
                      </h3>
                      
                      {/* Rating & Time */}
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {merchant.rating}
                          <span className="text-gray-400">({merchant.reviewCount})</span>
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {merchant.deliveryTime} мин
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-2 mt-2">
                        {merchant.tags.map((tag) => (
                          <span key={tag} className="chip text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Delivery */}
                      <p className="text-xs text-gray-500 mt-2">
                        Доставка {formatPrice(merchant.deliveryFee)}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          <NavItem icon="🏠" label="Главная" href="/" active />
          <NavItem icon="🔍" label="Поиск" href="/search" />
          <NavItem icon="🛒" label="Корзина" href="/checkout" badge={2} />
          <NavItem icon="📋" label="Заказы" href="/orders" />
          <NavItem icon="👤" label="Профиль" href="/profile" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  href,
  active,
  badge,
}: {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 px-4 py-1 relative ${
        active ? 'text-brand-600' : 'text-gray-500'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
      {badge && badge > 0 && (
        <span className="absolute -top-0.5 right-2 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}

