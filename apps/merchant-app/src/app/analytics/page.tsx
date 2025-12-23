'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Users,
  Star,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

// Mock data
const stats = {
  revenue: { value: 12500000, change: 12.5, period: 'vs прошлая неделя' },
  orders: { value: 156, change: 8.3, period: 'vs прошлая неделя' },
  avgOrder: { value: 80000, change: -2.1, period: 'vs прошлая неделя' },
  rating: { value: 4.7, change: 0.2, period: 'vs прошлый месяц' },
};

const dailyRevenue = [
  { day: 'Пн', value: 1800000 },
  { day: 'Вт', value: 2100000 },
  { day: 'Ср', value: 1950000 },
  { day: 'Чт', value: 2300000 },
  { day: 'Пт', value: 2800000 },
  { day: 'Сб', value: 3200000 },
  { day: 'Вс', value: 2850000 },
];

const topItems = [
  { name: 'Плов с говядиной', orders: 45, revenue: 1575000 },
  { name: 'Самса с мясом', orders: 38, revenue: 456000 },
  { name: 'Плов свадебный', orders: 28, revenue: 1064000 },
  { name: 'Лагман', orders: 25, revenue: 750000 },
  { name: 'Шашлык', orders: 22, revenue: 880000 },
];

const recentReviews = [
  {
    id: '1',
    customer: 'Алишер К.',
    rating: 5,
    comment: 'Отличный плов! Как в детстве у бабушки.',
    date: '2024-12-23',
    reply: null,
  },
  {
    id: '2',
    customer: 'Мария И.',
    rating: 4,
    comment: 'Вкусно, но доставка немного задержалась.',
    date: '2024-12-22',
    reply: 'Приносим извинения за задержку! В качестве компенсации дарим скидку 10% на следующий заказ.',
  },
  {
    id: '3',
    customer: 'Тимур Р.',
    rating: 5,
    comment: 'Лучшая самса в городе! Рекомендую всем.',
    date: '2024-12-21',
    reply: null,
  },
];

const maxRevenue = Math.max(...dailyRevenue.map(d => d.value));

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Аналитика</h1>
          <p className="text-gray-400 mt-1">Статистика и отзывы вашего заведения</p>
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
                period === item.value
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-gray-400 text-sm">Выручка</span>
          </div>
          <div className="text-2xl font-bold">{(stats.revenue.value / 1000000).toFixed(1)}M сум</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${
            stats.revenue.change >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {stats.revenue.change >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(stats.revenue.change)}% {stats.revenue.period}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Заказы</span>
          </div>
          <div className="text-2xl font-bold">{stats.orders.value}</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${
            stats.orders.change >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {stats.orders.change >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(stats.orders.change)}% {stats.orders.period}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Средний чек</span>
          </div>
          <div className="text-2xl font-bold">{(stats.avgOrder.value / 1000).toFixed(0)}K сум</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${
            stats.avgOrder.change >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {stats.avgOrder.change >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(stats.avgOrder.change)}% {stats.avgOrder.period}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-gray-400 text-sm">Рейтинг</span>
          </div>
          <div className="text-2xl font-bold flex items-center gap-1">
            {stats.rating.value}
            <Star className="w-5 h-5 text-amber-400 fill-current" />
          </div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${
            stats.rating.change >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {stats.rating.change >= 0 ? '+' : ''}{stats.rating.change} {stats.rating.period}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-lg font-semibold mb-6">Выручка по дням</h3>
          <div className="flex items-end gap-2 h-48">
            {dailyRevenue.map((day, index) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-pink-500 rounded-t-lg transition-all hover:from-orange-400 hover:to-pink-400"
                  style={{ height: `${(day.value / maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{day.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-lg font-semibold mb-6">Топ позиций</h3>
          <div className="space-y-4">
            {topItems.map((item, index) => (
              <div key={item.name} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.orders} заказов</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald-400">
                    {(item.revenue / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-400">сум</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-6 border border-white/5"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Последние отзывы</h3>
          <button className="text-orange-400 text-sm hover:text-orange-300">
            Все отзывы →
          </button>
        </div>
        
        <div className="space-y-4">
          {recentReviews.map((review) => (
            <div key={review.id} className="p-4 bg-white/5 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.customer}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 mt-2">{review.comment}</p>
                  
                  {review.reply && (
                    <div className="mt-3 pl-4 border-l-2 border-orange-500/50">
                      <div className="text-sm text-gray-400">Ваш ответ:</div>
                      <p className="text-gray-300 text-sm mt-1">{review.reply}</p>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-500">{review.date}</div>
              </div>
              
              {!review.reply && (
                <button className="mt-3 text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  Ответить
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

