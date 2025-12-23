'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Star,
  User,
  Store,
  ChevronRight,
  Flag,
  ThumbsDown,
  ShoppingBag,
} from 'lucide-react';

const complaints = [
  {
    id: '1',
    type: 'order_quality',
    status: 'pending',
    priority: 'high',
    customer: 'Алишер К.',
    merchant: 'Pizza Italia',
    orderId: 'ORD-240001',
    subject: 'Холодная еда',
    description: 'Пицца приехала полностью холодной, хотя ресторан в 2 км. Курьер опоздал на 30 минут.',
    createdAt: '2024-12-23T18:30:00',
    rating: 2,
  },
  {
    id: '2',
    type: 'delivery_delay',
    status: 'pending',
    priority: 'medium',
    customer: 'Мария И.',
    merchant: 'Burger House',
    orderId: 'ORD-240002',
    subject: 'Задержка доставки',
    description: 'Ждала заказ 1.5 часа вместо обещанных 30 минут. Поддержка не отвечала.',
    createdAt: '2024-12-23T17:00:00',
    rating: 1,
  },
  {
    id: '3',
    type: 'wrong_order',
    status: 'resolved',
    priority: 'high',
    customer: 'Тимур Р.',
    merchant: 'Sushi Time',
    orderId: 'ORD-240003',
    subject: 'Неправильный заказ',
    description: 'Вместо роллов с лососем привезли с тунцом. У меня аллергия на тунец!',
    createdAt: '2024-12-22T20:00:00',
    resolvedAt: '2024-12-23T10:00:00',
    resolution: 'Полный возврат + 5000 бонусов',
    rating: 1,
  },
];

const lowRatedRestaurants = [
  { id: '1', name: 'Pizza Italia', rating: 3.2, complaints: 12, ordersLast7Days: 145 },
  { id: '2', name: 'Быстро Шаурма', rating: 3.5, complaints: 8, ordersLast7Days: 89 },
  { id: '3', name: 'Кебаб Хаус', rating: 3.8, complaints: 5, ordersLast7Days: 67 },
];

const priorityConfig = {
  high: { label: 'Высокий', color: 'red' },
  medium: { label: 'Средний', color: 'amber' },
  low: { label: 'Низкий', color: 'gray' },
};

const statusConfig = {
  pending: { label: 'Ожидает', color: 'amber', icon: Clock },
  in_progress: { label: 'В работе', color: 'blue', icon: MessageSquare },
  resolved: { label: 'Решено', color: 'emerald', icon: CheckCircle },
  rejected: { label: 'Отклонено', color: 'red', icon: XCircle },
};

export default function QualityPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(c => filter === 'pending' ? c.status === 'pending' : c.status === 'resolved');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Quality Control
          </h1>
          <p className="text-gray-400 mt-1">Жалобы, отзывы и проблемные рестораны</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-red-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-gray-400 text-sm">Ожидают ответа</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{pendingCount}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <ThumbsDown className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-gray-400 text-sm">Низкие оценки сегодня</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">7</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Store className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Проблемные рестораны</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">{lowRatedRestaurants.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-gray-400 text-sm">Решено за неделю</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">23</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Complaints */}
        <div className="col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Жалобы</h2>
            <div className="flex gap-2">
              {(['pending', 'resolved', 'all'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filter === f ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {f === 'pending' ? 'Ожидают' : f === 'resolved' ? 'Решенные' : 'Все'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredComplaints.map((complaint, index) => {
              const status = statusConfig[complaint.status as keyof typeof statusConfig];
              const priority = priorityConfig[complaint.priority as keyof typeof priorityConfig];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border ${
                    complaint.status === 'pending' ? 'border-amber-500/30' : 'border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        priority.color === 'red' ? 'bg-red-500/20 text-red-400' :
                        priority.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {priority.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        status.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                        status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        status.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${
                          i < complaint.rating ? 'text-amber-400 fill-current' : 'text-gray-600'
                        }`} />
                      ))}
                    </div>
                  </div>

                  <h3 className="font-semibold mb-2">{complaint.subject}</h3>
                  <p className="text-gray-400 text-sm mb-3">{complaint.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {complaint.customer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      {complaint.merchant}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      {complaint.orderId}
                    </span>
                  </div>

                  {complaint.resolution && (
                    <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 mb-3">
                      ✓ {complaint.resolution}
                    </div>
                  )}

                  {complaint.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm">
                        Возврат средств
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm">
                        Ответить
                      </button>
                      <button className="px-3 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors text-sm">
                        Отклонить
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Low Rated Restaurants */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Проблемные рестораны</h2>
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl border border-white/5 overflow-hidden">
            {lowRatedRestaurants.map((restaurant, index) => (
              <div
                key={restaurant.id}
                className="p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{restaurant.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        {restaurant.rating}
                      </span>
                      <span className="text-red-400">{restaurant.complaints} жалоб</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold mt-6 mb-4">Быстрые действия</h2>
          <div className="space-y-2">
            <button className="w-full p-4 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl border border-white/5 hover:border-white/10 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Flag className="w-5 h-5 text-red-400" />
                <span>Отчет за неделю</span>
              </div>
            </button>
            <button className="w-full p-4 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl border border-white/5 hover:border-white/10 transition-colors text-left">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span>Шаблоны ответов</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

