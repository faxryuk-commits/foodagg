'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';

const stats = [
  { label: 'Выручка', value: '45.2M', change: 12.5, icon: DollarSign, color: 'emerald' },
  { label: 'Заказы', value: '2,456', change: 8.3, icon: ShoppingBag, color: 'blue' },
  { label: 'Пользователи', value: '12,890', change: 15.2, icon: Users, color: 'purple' },
  { label: 'Рестораны', value: '156', change: 5.0, icon: Store, color: 'orange' },
];

const revenueByDay = [
  { day: 'Пн', value: 5200000 },
  { day: 'Вт', value: 6100000 },
  { day: 'Ср', value: 5800000 },
  { day: 'Чт', value: 7200000 },
  { day: 'Пт', value: 8900000 },
  { day: 'Сб', value: 9500000 },
  { day: 'Вс', value: 8400000 },
];

const topRestaurants = [
  { name: 'Плов Центр Ахмад', orders: 456, revenue: 18500000, rating: 4.8 },
  { name: 'Sushi Time', orders: 378, revenue: 15200000, rating: 4.7 },
  { name: 'Burger House', orders: 345, revenue: 12800000, rating: 4.5 },
  { name: 'Pizza Italia', orders: 289, revenue: 11500000, rating: 4.2 },
  { name: 'Лагман Хаус', orders: 234, revenue: 9800000, rating: 4.6 },
];

const ordersByCategory = [
  { name: 'Узбекская', percent: 35, color: 'orange' },
  { name: 'Фастфуд', percent: 25, color: 'red' },
  { name: 'Японская', percent: 18, color: 'pink' },
  { name: 'Итальянская', percent: 12, color: 'green' },
  { name: 'Другое', percent: 10, color: 'gray' },
];

const maxRevenue = Math.max(...revenueByDay.map(d => d.value));

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Аналитика
          </h1>
          <p className="text-gray-400 mt-1">Общая статистика платформы</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          {[
            { value: 'week', label: 'Неделя' },
            { value: 'month', label: 'Месяц' },
            { value: 'year', label: 'Год' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setPeriod(item.value as typeof period)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === item.value ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                stat.color === 'emerald' ? 'bg-emerald-500/20' :
                stat.color === 'blue' ? 'bg-blue-500/20' :
                stat.color === 'purple' ? 'bg-purple-500/20' :
                'bg-orange-500/20'
              }`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'emerald' ? 'text-emerald-400' :
                  stat.color === 'blue' ? 'text-blue-400' :
                  stat.color === 'purple' ? 'text-purple-400' :
                  'text-orange-400'
                }`} />
              </div>
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className={`flex items-center gap-1 text-sm mt-1 ${
              stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(stat.change)}% vs прошлая неделя
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-lg font-semibold mb-6">Выручка по дням</h3>
          <div className="flex items-end gap-3 h-64">
            {revenueByDay.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-sm text-gray-400">{(day.value / 1000000).toFixed(1)}M</div>
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all hover:from-blue-400 hover:to-purple-400"
                  style={{ height: `${(day.value / maxRevenue) * 100}%` }}
                />
                <span className="text-sm text-gray-400">{day.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-lg font-semibold mb-6">Заказы по категориям</h3>
          <div className="space-y-4">
            {ordersByCategory.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">{cat.name}</span>
                  <span className="text-gray-400">{cat.percent}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cat.color === 'orange' ? 'bg-orange-500' :
                      cat.color === 'red' ? 'bg-red-500' :
                      cat.color === 'pink' ? 'bg-pink-500' :
                      cat.color === 'green' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Restaurants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-6 border border-white/5"
      >
        <h3 className="text-lg font-semibold mb-6">Топ рестораны</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 text-sm font-medium pb-4">#</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-4">Ресторан</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-4">Заказы</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-4">Выручка</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-4">Рейтинг</th>
              </tr>
            </thead>
            <tbody>
              {topRestaurants.map((restaurant, index) => (
                <tr key={restaurant.name} className="border-b border-white/5 last:border-b-0">
                  <td className="py-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-amber-500/20 text-amber-400' :
                      index === 1 ? 'bg-gray-500/20 text-gray-400' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/5 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="font-medium">{restaurant.name}</span>
                  </td>
                  <td className="py-4 text-gray-300">{restaurant.orders}</td>
                  <td className="py-4 text-emerald-400 font-medium">
                    {(restaurant.revenue / 1000000).toFixed(1)}M сум
                  </td>
                  <td className="py-4">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      {restaurant.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

