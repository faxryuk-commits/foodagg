'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';

// Mock data
const stats = [
  {
    label: 'Активные рестораны',
    value: '247',
    change: '+12',
    changePercent: '+5.1%',
    positive: true,
    icon: Store,
  },
  {
    label: 'Заказов сегодня',
    value: '1,847',
    change: '+234',
    changePercent: '+14.5%',
    positive: true,
    icon: ShoppingBag,
  },
  {
    label: 'Выручка сегодня',
    value: '₸ 12.4M',
    change: '+2.1M',
    changePercent: '+20.4%',
    positive: true,
    icon: DollarSign,
  },
  {
    label: 'Активные пользователи',
    value: '8,924',
    change: '+567',
    changePercent: '+6.8%',
    positive: true,
    icon: Users,
  },
];

const pendingMerchants = [
  { id: '1', name: 'Ресторан Узбечка', city: 'Ташкент', createdAt: '2 часа назад', source: '2GIS' },
  { id: '2', name: 'Pizza Time', city: 'Ташкент', createdAt: '3 часа назад', source: 'Yandex' },
  { id: '3', name: 'Кафе Самарканд', city: 'Самарканд', createdAt: '5 часов назад', source: '2GIS' },
];

const slaAlerts = [
  { merchant: 'Burger House', orders: 3, avgDelay: '12 мин', status: 'critical' },
  { merchant: 'Sushi Master', orders: 2, avgDelay: '8 мин', status: 'warning' },
  { merchant: 'Чайхана Навруз', orders: 1, avgDelay: '5 мин', status: 'warning' },
];

const recentOrders = [
  { id: 'ORD-001234', merchant: 'Плов Центр', amount: 145000, status: 'completed', time: '2 мин назад' },
  { id: 'ORD-001235', merchant: 'Pizza House', amount: 89000, status: 'preparing', time: '5 мин назад' },
  { id: 'ORD-001236', merchant: 'Sushi Master', amount: 234000, status: 'new', time: '7 мин назад' },
  { id: 'ORD-001237', merchant: 'Burger King', amount: 67000, status: 'ready', time: '10 мин назад' },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Дашборд</h1>
          <p className="text-gray-400 text-sm mt-1">
            Обзор платформы • {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button className="btn-primary">
          <ArrowUpRight className="w-4 h-4" />
          Экспорт отчёта
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value mt-2">{stat.value}</p>
                <div className={stat.positive ? 'stat-change-positive' : 'stat-change-negative'}>
                  {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{stat.change}</span>
                  <span className="text-gray-500">({stat.changePercent})</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-brand-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Merchants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Ожидают проверки
            </h2>
            <span className="badge badge-pending">{pendingMerchants.length}</span>
          </div>
          
          <div className="space-y-3">
            {pendingMerchants.map((merchant) => (
              <div key={merchant.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <div>
                  <p className="font-medium text-white">{merchant.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {merchant.city} • {merchant.source} • {merchant.createdAt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-danger text-xs px-3 py-1.5">✕</button>
                  <button className="btn-success text-xs px-3 py-1.5">✓</button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 btn-ghost text-brand-400">
            Показать все →
          </button>
        </motion.div>

        {/* SLA Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              SLA Алерты
            </h2>
            <span className="badge bg-red-500/10 text-red-400">{slaAlerts.length}</span>
          </div>
          
          <div className="space-y-3">
            {slaAlerts.map((alert, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  alert.status === 'critical' ? 'bg-red-500/10 border border-red-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
                }`}
              >
                <div>
                  <p className="font-medium text-white">{alert.merchant}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {alert.orders} заказов • Среднее ожидание: {alert.avgDelay}
                  </p>
                </div>
                <span className={`badge ${alert.status === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {alert.status === 'critical' ? 'Критично' : 'Внимание'}
                </span>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 btn-ghost text-brand-400">
            Все алерты →
          </button>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-400" />
              Последние заказы
            </h2>
          </div>
          
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div>
                  <p className="font-mono text-sm text-white">{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.merchant} • {order.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{(order.amount / 1000).toFixed(0)}K сум</p>
                  <span className={`badge text-xs ${
                    order.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    order.status === 'preparing' ? 'bg-yellow-500/10 text-yellow-400' :
                    order.status === 'ready' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {order.status === 'completed' ? 'Завершён' :
                     order.status === 'preparing' ? 'Готовится' :
                     order.status === 'ready' ? 'Готов' : 'Новый'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 btn-ghost text-brand-400">
            Все заказы →
          </button>
        </motion.div>
      </div>

      {/* Live Map Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-400" />
            Live Map — Активность по городу
          </h2>
          <div className="flex gap-2">
            <span className="badge badge-active">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
        
        <div className="h-80 rounded-lg bg-gray-800/50 flex items-center justify-center border border-dashed border-gray-700">
          <div className="text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Карта с heatmap заказов</p>
            <p className="text-sm">Подключите Яндекс Карты или Mapbox</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

