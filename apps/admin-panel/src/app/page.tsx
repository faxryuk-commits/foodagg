'use client';

import { useState, useEffect } from 'react';
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
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('food_platform_token') : null;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }
  return data.data || data;
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} час назад`;
  return `${diffDays} дн назад`;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pendingMerchants, setPendingMerchants] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [slaAlerts, setSlaAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashboardStats, pending, orders] = await Promise.all([
        apiRequest<any>('/api/admin/stats/dashboard'),
        apiRequest<{ items: any[] }>('/api/admin/merchants/pending?page=1&pageSize=5'),
        apiRequest<{ items: any[] }>('/api/admin/orders?page=1&pageSize=5'),
      ]);

      setStats(dashboardStats);
      setPendingMerchants(pending.items || []);
      setRecentOrders(orders.items || []);
      
      // TODO: Implement SLA alerts API endpoint
      setSlaAlerts([]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Активные рестораны',
      value: stats?.merchants?.active?.toLocaleString() || '0',
      change: stats?.merchants?.pending || 0,
      changePercent: stats?.merchants?.total ? `+${((stats.merchants.pending / stats.merchants.total) * 100).toFixed(1)}%` : '0%',
      positive: true,
      icon: Store,
    },
    {
      label: 'Заказов сегодня',
      value: stats?.orders?.today?.toLocaleString() || '0',
      change: stats?.orders?.active || 0,
      changePercent: stats?.orders?.total ? `+${((stats.orders.today / stats.orders.total) * 100).toFixed(1)}%` : '0%',
      positive: true,
      icon: ShoppingBag,
    },
    {
      label: 'Всего заказов',
      value: stats?.orders?.total?.toLocaleString() || '0',
      change: stats?.orders?.active || 0,
      changePercent: '0%',
      positive: true,
      icon: DollarSign,
    },
    {
      label: 'Пользователи',
      value: stats?.users?.total?.toLocaleString() || '0',
      change: 0,
      changePercent: '0%',
      positive: true,
      icon: Users,
    },
  ];
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
        {statsCards.map((stat, index) => (
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
            {pendingMerchants.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет ожидающих проверки</p>
              </div>
            ) : (
              pendingMerchants.map((merchant) => (
                <div key={merchant.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                  <div>
                    <p className="font-medium text-white">{merchant.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {merchant.city || 'Не указан'} • {formatTimeAgo(merchant.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/merchants`} className="btn-danger text-xs px-3 py-1.5">✕</Link>
                    <Link href={`/merchants`} className="btn-success text-xs px-3 py-1.5">✓</Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href="/merchants" className="w-full mt-4 btn-ghost text-brand-400 block text-center">
            Показать все →
          </Link>
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
            {slaAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет SLA алертов</p>
              </div>
            ) : (
              slaAlerts.map((alert, idx) => (
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
              ))
            )}
          </div>

          <Link href="/orders" className="w-full mt-4 btn-ghost text-brand-400 block text-center">
            Все алерты →
          </Link>
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
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет заказов</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                  <div>
                    <p className="font-mono text-sm text-white">{order.orderNumber || order.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.merchant?.name || 'Неизвестно'} • {formatTimeAgo(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{order.total ? (order.total / 1000).toFixed(0) + 'K' : '0'} сум</p>
                    <span className={`badge text-xs ${
                      order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                      order.status === 'PREPARING' ? 'bg-yellow-500/10 text-yellow-400' :
                      order.status === 'READY' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {order.status === 'COMPLETED' ? 'Завершён' :
                       order.status === 'PREPARING' ? 'Готовится' :
                       order.status === 'READY' ? 'Готов' : 'Новый'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href="/orders" className="w-full mt-4 btn-ghost text-brand-400 block text-center">
            Все заказы →
          </Link>
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

