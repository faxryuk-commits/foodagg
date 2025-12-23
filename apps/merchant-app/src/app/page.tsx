'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Bell,
  Check,
  X,
  Clock,
  ChefHat,
  Package,
  LayoutDashboard,
  UtensilsCrossed,
  BarChart3,
  Settings,
  LogOut,
  Phone,
  MessageSquare,
  AlertTriangle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useMerchantOrderStore, Order } from '@/lib/orders';

type OrderStatus = 'SUBMITTED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
type TabType = 'new' | 'active' | 'ready' | 'history';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' сум';
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function getTimeRemaining(deadline: Date): { minutes: number; seconds: number; status: 'ok' | 'warning' | 'danger' } {
  const diff = deadline.getTime() - Date.now();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  let status: 'ok' | 'warning' | 'danger' = 'ok';
  if (minutes < 1) status = 'danger';
  else if (minutes < 3) status = 'warning';
  
  return { minutes: Math.max(0, minutes), seconds: Math.max(0, seconds), status };
}

export default function MerchantDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const { orders, updateOrderStatus } = useMerchantOrderStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [, forceUpdate] = useState(0);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const newOrders = orders.filter(o => o.status === 'SUBMITTED');
  const activeOrders = orders.filter(o => ['ACCEPTED', 'PREPARING'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'READY');

  const handleAccept = (orderId: string) => {
    updateOrderStatus(orderId, 'ACCEPTED');
  };

  const handleReject = (orderId: string) => {
    updateOrderStatus(orderId, 'CANCELLED');
  };

  const handlePreparing = (orderId: string) => {
    updateOrderStatus(orderId, 'PREPARING');
  };

  const handleReady = (orderId: string) => {
    updateOrderStatus(orderId, 'READY');
  };

  const handleComplete = (orderId: string) => {
    updateOrderStatus(orderId, 'COMPLETED');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Плов Центр</h1>
              <p className="text-xs text-green-600">● Онлайн</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <Link href="/" className="sidebar-item-active w-full flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            Заказы
            {newOrders.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {newOrders.length}
              </span>
            )}
          </Link>
          <Link href="/menu" className="sidebar-item w-full flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            Меню
          </Link>
          <Link href="/analytics" className="sidebar-item w-full flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Аналитика
          </Link>
          <Link href="/settings" className="sidebar-item w-full flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Настройки
          </Link>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="sidebar-item w-full"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            Звук {soundEnabled ? 'вкл' : 'выкл'}
          </button>
          <button className="sidebar-item w-full text-red-600 hover:bg-red-50 hover:text-red-700">
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Управление заказами</h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-6 mr-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{newOrders.length}</p>
                  <p className="text-xs text-gray-500">Новые</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{activeOrders.length}</p>
                  <p className="text-xs text-gray-500">В работе</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{readyOrders.length}</p>
                  <p className="text-xs text-gray-500">Готовы</p>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="w-6 h-6 text-gray-600" />
                {newOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-ring">
                    {newOrders.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex gap-1">
            {[
              { id: 'new' as TabType, label: 'Новые', count: newOrders.length, color: 'blue' },
              { id: 'active' as TabType, label: 'В работе', count: activeOrders.length, color: 'yellow' },
              { id: 'ready' as TabType, label: 'Готовы', count: readyOrders.length, color: 'green' },
              { id: 'history' as TabType, label: 'История', count: 0, color: 'gray' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-${tab.color}-100 text-${tab.color}-700`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {activeTab === 'new' && newOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAccept={() => handleAccept(order.id)}
                  onReject={() => handleReject(order.id)}
                />
              ))}
              {activeTab === 'active' && activeOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPreparing={() => handlePreparing(order.id)}
                  onReady={() => handleReady(order.id)}
                />
              ))}
              {activeTab === 'ready' && readyOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onComplete={() => handleComplete(order.id)}
                />
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {((activeTab === 'new' && newOrders.length === 0) ||
              (activeTab === 'active' && activeOrders.length === 0) ||
              (activeTab === 'ready' && readyOrders.length === 0)) && (
              <div className="col-span-full py-20 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Нет заказов в этой категории</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onAccept?: () => void;
  onReject?: () => void;
  onPreparing?: () => void;
  onReady?: () => void;
  onComplete?: () => void;
}

function OrderCard({ order, onAccept, onReject, onPreparing, onReady, onComplete }: OrderCardProps) {
  const timeRemaining = getTimeRemaining(order.slaDeadline);
  const isNew = order.status === 'SUBMITTED';
  const isPreparing = order.status === 'PREPARING';
  const isReady = order.status === 'READY';

  const cardClass = isNew
    ? 'order-card-new order-pulse'
    : timeRemaining.status === 'danger'
    ? 'order-card-danger'
    : timeRemaining.status === 'warning'
    ? 'order-card-warning'
    : 'order-card';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cardClass}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-gray-900">#{order.orderNumber.slice(-4)}</span>
            <span className={`badge badge-${order.status === 'SUBMITTED' ? 'new' : order.status === 'PREPARING' ? 'preparing' : 'ready'}`}>
              {order.status === 'SUBMITTED' ? 'Новый' : order.status === 'PREPARING' ? 'Готовится' : 'Готов'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {order.type === 'DELIVERY' ? '🚗 Доставка' : '🏃 Самовывоз'} • {formatTime(order.createdAt)}
          </p>
        </div>

        {/* Timer */}
        <div className={`timer-${timeRemaining.status} text-right`}>
          <span>{String(timeRemaining.minutes).padStart(2, '0')}</span>
          <span className="animate-pulse">:</span>
          <span>{String(timeRemaining.seconds).padStart(2, '0')}</span>
          <p className="text-xs font-normal text-gray-500">до SLA</p>
        </div>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
          {order.customer.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{order.customer.name}</p>
          <p className="text-xs text-gray-500">{order.customer.phone}</p>
        </div>
        <div className="flex gap-1">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Phone className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <MessageSquare className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              <span className="font-medium">{item.quantity}×</span> {item.name}
            </span>
            <span className="text-gray-500">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Comment */}
      {order.comment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">{order.comment}</p>
        </div>
      )}

      {/* Address */}
      {order.address && (
        <p className="text-sm text-gray-500 mb-3">
          📍 {order.address}
        </p>
      )}

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-4">
        <span className="font-medium text-gray-700">Итого:</span>
        <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isNew && (
          <>
            <button onClick={onReject} className="btn-secondary flex-1">
              <X className="w-4 h-4" />
              Отклонить
            </button>
            <button onClick={onAccept} className="btn-primary flex-1">
              <Check className="w-4 h-4" />
              Принять
            </button>
          </>
        )}
        {order.status === 'ACCEPTED' && (
          <button onClick={onPreparing} className="btn-primary w-full">
            <ChefHat className="w-4 h-4" />
            Начать готовить
          </button>
        )}
        {isPreparing && (
          <button onClick={onReady} className="btn-primary w-full bg-green-500 hover:bg-green-600">
            <Check className="w-4 h-4" />
            Готово!
          </button>
        )}
        {isReady && (
          <button onClick={onComplete} className="btn-primary w-full">
            <Package className="w-4 h-4" />
            {order.type === 'DELIVERY' ? 'Отдано курьеру' : 'Выдано клиенту'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

