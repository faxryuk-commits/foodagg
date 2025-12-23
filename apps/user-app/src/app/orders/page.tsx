'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Check,
  ChefHat,
  Package,
  Truck,
  Home,
  X,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';

// Mock orders data
const orders = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001234',
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    merchant: { name: 'Плов Центр', logo: null },
    items: [{ name: 'Плов', quantity: 2 }, { name: 'Шашлык', quantity: 1 }],
    total: 209000,
    estimatedTime: 25,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-001230',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    merchant: { name: 'Pizza House', logo: null },
    items: [{ name: 'Пицца Маргарита', quantity: 1 }],
    total: 75000,
    hasReview: false,
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-001225',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
    merchant: { name: 'Sushi Master', logo: null },
    items: [{ name: 'Сет Филадельфия', quantity: 1 }, { name: 'Рамен', quantity: 1 }],
    total: 133000,
    hasReview: true,
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-001220',
    status: 'CANCELLED',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    cancelledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
    cancelReason: 'Отменён рестораном',
    merchant: { name: 'Burger King', logo: null },
    items: [{ name: 'Воппер', quantity: 2 }],
    total: 110000,
  },
];

type OrderStatus = 'SUBMITTED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'COMPLETED' | 'CANCELLED';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' сум';
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дней назад`;
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function getStatusInfo(status: OrderStatus) {
  switch (status) {
    case 'SUBMITTED':
      return { label: 'Ожидает', icon: Clock, color: 'blue' };
    case 'ACCEPTED':
      return { label: 'Принят', icon: Check, color: 'green' };
    case 'PREPARING':
      return { label: 'Готовится', icon: ChefHat, color: 'yellow' };
    case 'READY':
      return { label: 'Готов', icon: Package, color: 'green' };
    case 'IN_DELIVERY':
      return { label: 'В пути', icon: Truck, color: 'blue' };
    case 'COMPLETED':
      return { label: 'Доставлен', icon: Home, color: 'gray' };
    case 'CANCELLED':
      return { label: 'Отменён', icon: X, color: 'red' };
    default:
      return { label: 'Неизвестно', icon: Clock, color: 'gray' };
  }
}

export default function OrdersPage() {
  const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
  const pastOrders = orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-bold text-gray-900">Мои заказы</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Активные
            </h2>
            <div className="space-y-3">
              {activeOrders.map((order, index) => {
                const statusInfo = getStatusInfo(order.status as OrderStatus);
                const Icon = statusInfo.icon;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/orders/${order.id}`}>
                      <div className="card p-4 border-l-4 border-l-brand-500">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{order.merchant.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                            </p>
                          </div>
                          <span className={`chip bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                            <Icon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>~{order.estimatedTime} мин</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Past Orders */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            История
          </h2>
          <div className="space-y-3">
            {pastOrders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status as OrderStatus);
              const Icon = statusInfo.icon;
              const isCompleted = order.status === 'COMPLETED';
              const isCancelled = order.status === 'CANCELLED';

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (activeOrders.length + index) * 0.1 }}
                >
                  <Link href={`/orders/${order.id}`}>
                    <div className={`card p-4 ${isCancelled ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{order.merchant.name}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className={`chip ${isCancelled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          <Icon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                          {isCompleted && !order.hasReview && (
                            <button className="text-sm text-brand-600 font-medium">
                              Оценить
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
            <Link href="/">
              <button className="btn-primary">
                Выбрать ресторан
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

