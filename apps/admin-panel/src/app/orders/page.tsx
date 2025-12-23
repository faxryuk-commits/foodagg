'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  MapPin,
  User,
  Store,
  Timer,
  Zap,
  Activity,
} from 'lucide-react';
import { useAdminOrderStore, Order } from '@/lib/orders';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  SUBMITTED: { label: 'Новый', color: 'blue', icon: Clock },
  ACCEPTED: { label: 'Принят', color: 'purple', icon: CheckCircle },
  PREPARING: { label: 'Готовится', color: 'amber', icon: Timer },
  READY: { label: 'Готов', color: 'emerald', icon: CheckCircle },
  IN_DELIVERY: { label: 'В доставке', color: 'cyan', icon: MapPin },
  COMPLETED: { label: 'Завершён', color: 'gray', icon: CheckCircle },
  CANCELLED: { label: 'Отменён', color: 'red', icon: XCircle },
};

// SLA Widget Component
function SLAWidget({ order }: { order: Order }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [slaStatus, setSlaStatus] = useState<'ok' | 'warning' | 'breached'>('ok');
  
  useEffect(() => {
    const deadline = order.status === 'SUBMITTED' 
      ? order.slaAcceptDeadline 
      : order.slaReadyDeadline;
    
    if (!deadline) return;
    
    const update = () => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);
      
      if (diff === 0) setSlaStatus('breached');
      else if (diff < 60) setSlaStatus('warning');
      else setSlaStatus('ok');
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [order]);
  
  if (order.status === 'COMPLETED' || order.status === 'CANCELLED') return null;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className={`px-3 py-1 rounded-lg text-sm font-mono ${
      slaStatus === 'ok' ? 'bg-emerald-500/20 text-emerald-400' :
      slaStatus === 'warning' ? 'bg-amber-500/20 text-amber-400' :
      'bg-red-500/20 text-red-400 animate-pulse'
    }`}>
      <Timer className="w-3 h-3 inline mr-1" />
      {slaStatus === 'breached' ? 'SLA!' : `${minutes}:${seconds.toString().padStart(2, '0')}`}
    </div>
  );
}

export default function OrdersMonitoringPage() {
  const { orders } = useAdminOrderStore();
  const [filter, setFilter] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [, forceUpdate] = useState(0);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter(o => 
    ['SUBMITTED', 'ACCEPTED', 'PREPARING', 'READY', 'IN_DELIVERY'].includes(o.status)
  );
  
  const filteredOrders = filter === 'active' 
    ? activeOrders 
    : filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  // Stats
  const stats = {
    active: activeOrders.length,
    new: orders.filter(o => o.status === 'SUBMITTED').length,
    preparing: orders.filter(o => o.status === 'PREPARING').length,
    ready: orders.filter(o => o.status === 'READY').length,
    avgTime: 28,
    slaRate: 94.5,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Мониторинг заказов
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time отслеживание и контроль SLA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-white/5 text-gray-400'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-4 border border-white/5"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Активные
          </div>
          <div className="text-2xl font-bold">{stats.active}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-4 border border-blue-500/20"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            Новые
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.new}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-4 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Timer className="w-4 h-4 text-amber-400" />
            Готовятся
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.preparing}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-4 border border-emerald-500/20"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Готовы
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.ready}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-4 border border-white/5"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Clock className="w-4 h-4" />
            Среднее время
          </div>
          <div className="text-2xl font-bold">{stats.avgTime} мин</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-4 border ${
            stats.slaRate >= 95 ? 'border-emerald-500/20' : 'border-amber-500/20'
          }`}
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <TrendingUp className={`w-4 h-4 ${stats.slaRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`} />
            SLA Rate
          </div>
          <div className={`text-2xl font-bold ${stats.slaRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {stats.slaRate}%
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск заказов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
          />
        </div>
        
        <div className="flex gap-2">
          {[
            { value: 'active', label: 'Активные' },
            { value: 'SUBMITTED', label: 'Новые' },
            { value: 'PREPARING', label: 'Готовятся' },
            { value: 'all', label: 'Все' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === item.value
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredOrders.map((order, index) => {
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;
          
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border ${
                order.status === 'SUBMITTED' ? 'border-blue-500/30' :
                order.status === 'CANCELLED' ? 'border-red-500/20' :
                'border-white/5'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">#{order.orderNumber}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    status.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                    status.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                    status.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                    status.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                    status.color === 'red' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    order.type === 'DELIVERY' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {order.type === 'DELIVERY' ? 'Доставка' : 'Самовывоз'}
                  </span>
                </div>
                <SLAWidget order={order} />
              </div>

              {/* Customer & Merchant */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{order.customer.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{order.merchant}</span>
                </div>
              </div>

              {/* Items */}
              <div className="text-sm text-gray-400 mb-3">
                {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
              </div>

              {/* Address */}
              {order.address && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <MapPin className="w-4 h-4" />
                  {order.address}
                </div>
              )}

              {/* Cancel reason */}
              {order.status === 'CANCELLED' && order.cancelReason && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-3">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  {order.cancelReason} ({order.cancelledBy === 'customer' ? 'клиент' : 'ресторан'})
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="text-lg font-bold">
                  {order.total.toLocaleString()} сум
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

