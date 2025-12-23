'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Gift,
  ChevronRight,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Percent,
  ShoppingBag,
} from 'lucide-react';
import { useOrderStore } from '@/store/orders';
import { ordersAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';

const deliveryAddress = {
  label: 'Дом',
  street: 'ул. Навои, 15',
  building: 'кв. 42',
  city: 'Ташкент',
};

const restaurant = {
  deliveryTime: '25-35',
  deliveryFee: 10000,
  cashbackRate: 7,
};

type PaymentMethod = 'card' | 'cash';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' сум';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, merchantId, merchantName, updateQuantity, clearCart, addOrder } = useOrderStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [bonusToUse, setBonusToUse] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userBonus = 50000; // Mock user bonus balance

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = restaurant.deliveryFee;
  const serviceFee = 0;
  const discount = 0;
  const bonusUsed = Math.min(bonusToUse, userBonus, subtotal);
  const total = subtotal + deliveryFee + serviceFee - discount - bonusUsed;
  const cashbackEarned = Math.round(subtotal * (restaurant.cashbackRate / 100));

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = cart.find(i => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + delta);
    }
  };

  const handleSubmit = async () => {
    if (cart.length === 0 || !merchantId) {
      setError('Корзина пуста');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create order via API
      const response = await ordersAPI.create({
        merchantId,
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        type: 'DELIVERY',
        deliveryAddress: {
          street: deliveryAddress.street,
          building: deliveryAddress.building,
        },
        paymentMethod: paymentMethod === 'card' ? 'CARD' : 'CASH',
        comment,
        bonusToUse: bonusUsed,
      });
      
      // Save order to local state
      addOrder({
        id: response.order.id,
        orderNumber: response.order.orderNumber,
        status: response.order.status,
        total,
        items: cart,
        merchantId,
        merchantName: merchantName || 'Ресторан',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Clear cart
      clearCart();
      
      // Notify via socket
      const socket = getSocket();
      socket.emit('order:created', { orderId: response.order.id });
      
      // Redirect to order status page
      router.push(`/orders/${response.order.id}`);
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setError(err.message || 'Не удалось оформить заказ');
      
      // For demo: create mock order and redirect anyway
      const mockOrderId = `demo-${Date.now()}`;
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      const orderData = {
        id: mockOrderId,
        orderNumber,
        status: 'SUBMITTED',
        total,
        items: cart,
        merchantId: merchantId || 'demo',
        merchantName: merchantName || 'Ресторан',
        customer: { name: 'Клиент', phone: '+998 90 123 4567' },
        address: `${deliveryAddress.street}, ${deliveryAddress.building}`,
        comment,
        type: 'DELIVERY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      addOrder(orderData);
      clearCart();
      
      // Broadcast to other tabs (merchant app)
      if (typeof window !== 'undefined') {
        // Use localStorage for cross-tab communication
        localStorage.setItem('food-platform-new-order', JSON.stringify(orderData));
        // Trigger storage event
        localStorage.removeItem('food-platform-new-order');
        localStorage.setItem('food-platform-new-order', JSON.stringify({
          ...orderData,
          _timestamp: Date.now(), // Force change detection
        }));
      }
      
      router.push(`/orders/${mockOrderId}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Корзина пуста</h2>
        <p className="text-gray-500 mb-6">Добавьте что-нибудь вкусное!</p>
        <Link href="/" className="btn-primary px-6 py-3">
          К ресторанам
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900">Оформление заказа</h1>
            <p className="text-sm text-gray-500">{merchantName || 'Ресторан'}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Адрес доставки</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {deliveryAddress.street}, {deliveryAddress.building}
                </p>
                <p className="text-xs text-gray-400">{deliveryAddress.city}</p>
              </div>
            </div>
            <button className="text-sm text-brand-600 font-medium">
              Изменить
            </button>
          </div>
        </motion.div>

        {/* Delivery Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Время доставки</p>
              <p className="text-sm text-gray-600">{restaurant.deliveryTime} минут</p>
            </div>
            <span className="chip bg-green-100 text-green-700 text-xs">
              Как можно скорее
            </span>
          </div>
        </motion.div>

        {/* Cart Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Ваш заказ</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {cart.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4" />}
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-semibold text-gray-900 w-24 text-right">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100">
            <button className="text-sm text-brand-600 font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Добавить ещё
            </button>
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <h2 className="font-semibold text-gray-900 mb-3">Способ оплаты</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                paymentMethod === 'card'
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-brand-600' : 'text-gray-400'}`} />
              <span className={paymentMethod === 'card' ? 'font-semibold text-brand-700' : 'text-gray-700'}>
                Картой
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                paymentMethod === 'cash'
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Banknote className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-brand-600' : 'text-gray-400'}`} />
              <span className={paymentMethod === 'cash' ? 'font-semibold text-brand-700' : 'text-gray-700'}>
                Наличными
              </span>
            </button>
          </div>
        </motion.div>

        {/* Bonus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Использовать бонусы</p>
                <p className="text-sm text-gray-500">Доступно: {formatPrice(userBonus)}</p>
              </div>
            </div>
            <input
              type="number"
              value={bonusToUse}
              onChange={(e) => setBonusToUse(Math.max(0, parseInt(e.target.value) || 0))}
              max={Math.min(userBonus, subtotal)}
              className="w-32 input text-right"
              placeholder="0"
            />
          </div>
        </motion.div>

        {/* Comment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-4"
        >
          <h2 className="font-semibold text-gray-900 mb-3">Комментарий к заказу</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Например: позвоните за 5 минут до доставки"
            className="input resize-none"
            rows={2}
          />
        </motion.div>

        {/* Cashback Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
        >
          <Percent className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">
            Вы получите <span className="font-bold">{formatPrice(cashbackEarned)}</span> бонусами ({restaurant.cashbackRate}% кешбэк)
          </p>
        </motion.div>
      </main>

      {/* Order Summary Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Breakdown */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Товары</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Доставка</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            {bonusUsed > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Бонусы</span>
                <span>-{formatPrice(bonusUsed)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Итого</span>
              <span className="text-lg">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || cart.length === 0}
            className="w-full btn-primary py-4 text-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Оформляем...
              </span>
            ) : (
              'Оформить заказ'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

