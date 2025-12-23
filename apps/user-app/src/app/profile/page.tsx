'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Heart,
  Gift,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit,
  Plus,
  Star,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';

// Mock user data
const user = {
  name: 'Алишер Каримов',
  phone: '+998 90 123 4567',
  email: 'alisher@example.com',
  avatar: null,
  bonusBalance: 15000,
  totalOrders: 47,
  totalSpent: 2450000,
  favoriteRestaurants: 5,
};

const addresses = [
  { id: '1', name: 'Дом', address: 'ул. Навои, 45, кв. 12', isDefault: true },
  { id: '2', name: 'Работа', address: 'пр. Амира Темура, 88, офис 302', isDefault: false },
];

const menuItems = [
  { icon: MapPin, label: 'Мои адреса', href: '/profile/addresses', badge: addresses.length },
  { icon: Heart, label: 'Избранное', href: '/profile/favorites', badge: user.favoriteRestaurants },
  { icon: Gift, label: 'Бонусы и промокоды', href: '/profile/bonuses' },
  { icon: CreditCard, label: 'Способы оплаты', href: '/profile/payments' },
  { icon: Bell, label: 'Уведомления', href: '/profile/notifications' },
  { icon: Settings, label: 'Настройки', href: '/profile/settings' },
  { icon: HelpCircle, label: 'Помощь', href: '/help' },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 pt-12 pb-24 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-white">Профиль</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-lg mx-auto px-4 -mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
                {user.name.charAt(0)}
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-white/10 rounded-full border border-white/20">
                <Edit className="w-3 h-3 text-white" />
              </button>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400">{user.phone}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{user.totalOrders}</div>
              <div className="text-xs text-gray-400">Заказов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {(user.bonusBalance / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-400">Бонусов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {(user.totalSpent / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-400">Потрачено</div>
            </div>
          </div>
        </motion.div>

        {/* Bonus Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm">Ваши бонусы</div>
              <div className="text-3xl font-bold text-white">
                {user.bonusBalance.toLocaleString()} <span className="text-lg">сум</span>
              </div>
            </div>
            <div className="text-right">
              <Gift className="w-10 h-10 text-white/30" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
            <span className="text-white/80 text-sm">1 сум = 1 бонус при оплате</span>
            <ChevronRight className="w-5 h-5 text-white/50" />
          </div>
        </motion.div>

        {/* Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold text-white">Адреса доставки</h3>
            <button className="text-orange-400 text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          </div>
          {addresses.map((address) => (
            <div
              key={address.id}
              className="p-4 flex items-center gap-3 border-b border-white/5 last:border-b-0"
            >
              <div className="p-2 bg-white/5 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{address.name}</span>
                  {address.isDefault && (
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                      Основной
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">{address.address}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          ))}
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          {menuItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
            >
              <div className="p-2 bg-white/5 rounded-lg">
                <item.icon className="w-5 h-5 text-gray-400" />
              </div>
              <span className="flex-1 text-white">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 bg-white/10 text-gray-400 text-sm rounded-full">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </Link>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 w-full bg-red-500/10 text-red-400 rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </motion.button>

        {/* App Version */}
        <div className="text-center text-gray-500 text-sm py-8">
          Food Platform v1.0.0
        </div>
      </div>
    </div>
  );
}

