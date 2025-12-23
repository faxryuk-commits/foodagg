'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Clock,
  ChefHat,
  Package,
  Truck,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  AlertCircle,
  Home,
} from 'lucide-react';

// Mock order data
const order = {
  id: '1',
  orderNumber: 'ORD-2024-001234',
  status: 'PREPARING',
  createdAt: new Date(Date.now() - 15 * 60 * 1000),
  acceptedAt: new Date(Date.now() - 12 * 60 * 1000),
  estimatedTime: 25,
  merchant: {
    name: 'Плов Центр',
    phone: '+998712345678',
    address: 'ул. Амира Темура, 45',
  },
  items: [
    { name: 'Плов', quantity: 2, price: 45000 },
    { name: 'Шашлык', quantity: 1, price: 55000 },
    { name: 'Самса', quantity: 3, price: 18000 },
  ],
  deliveryAddress: {
    street: 'ул. Навои, 15',
    building: 'кв. 42',
  },
  subtotal: 199000,
  deliveryFee: 10000,
  bonusUsed: 0,
  total: 209000,
  bonusEarned: 13930,
};

type OrderStatus = 'SUBMITTED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'COMPLETED' | 'CANCELLED';

const statusSteps = [
  { status: 'SUBMITTED', label: 'Заказ создан', icon: Clock },
  { status: 'ACCEPTED', label: 'Принят', icon: Check },
  { status: 'PREPARING', label: 'Готовится', icon: ChefHat },
  { status: 'READY', label: 'Готов', icon: Package },
  { status: 'IN_DELIVERY', label: 'В пути', icon: Truck },
  { status: 'COMPLETED', label: 'Доставлен', icon: Home },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' сум';
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function OrderStatusPage() {
  const [timeRemaining, setTimeRemaining] = useState(order.estimatedTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1/60));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);
  const isCompleted = order.status === 'COMPLETED';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="font-bold text-gray-900">Заказ #{order.orderNumber.slice(-4)}</h1>
              <p className="text-sm text-gray-500">{order.merchant.name}</p>
            </div>
          </div>
          <span className="chip bg-yellow-100 text-yellow-700">
            <ChefHat className="w-3 h-3" />
            Готовится
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* ETA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 text-center bg-gradient-to-br from-brand-500 to-orange-500 text-white"
        >
          <p className="text-white/80 text-sm">Ожидаемое время доставки</p>
          <p className="text-5xl font-bold mt-2 font-mono">
            {Math.floor(timeRemaining)}
            <span className="text-2xl text-white/60"> мин</span>
          </p>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((order.estimatedTime - timeRemaining) / order.estimatedTime) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Статус заказа</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200">
              <motion.div
                className="w-full bg-brand-500"
                initial={{ height: '0%' }}
                animate={{ height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="flex items-center gap-4 relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        isActive
                          ? 'bg-brand-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-brand-500/20' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-brand-600 flex items-center gap-1 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                          Сейчас
                        </p>
                      )}
                      {isActive && index < currentStepIndex && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {index === 0 && formatTime(order.createdAt)}
                          {index === 1 && formatTime(order.acceptedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Restaurant Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{order.merchant.name}</p>
                <p className="text-sm text-gray-500">{order.merchant.address}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${order.merchant.phone}`}
                className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors"
              >
                <Phone className="w-5 h-5 text-green-600" />
              </a>
              <button className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center hover:bg-brand-200 transition-colors">
                <MessageSquare className="w-5 h-5 text-brand-600" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Адрес доставки</p>
              <p className="text-sm text-gray-500">
                {order.deliveryAddress.street}, {order.deliveryAddress.building}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Детали заказа</h2>
          </div>
          <div className="p-4 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-gray-700">
                  <span className="font-medium">{item.quantity}×</span> {item.name}
                </span>
                <span className="text-gray-900">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Товары</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Доставка</span>
                <span>{formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Итого</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cashback Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-800">
              +{formatPrice(order.bonusEarned)} бонусов
            </p>
            <p className="text-sm text-green-600">Будут начислены после завершения заказа</p>
          </div>
        </motion.div>

        {/* Problem Button */}
        <button className="w-full btn-ghost text-gray-500 py-3">
          <AlertCircle className="w-5 h-5" />
          Сообщить о проблеме
        </button>
      </main>
    </div>
  );
}

