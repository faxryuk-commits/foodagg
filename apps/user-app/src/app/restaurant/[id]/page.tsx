'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Phone,
  Heart,
  Share2,
  Plus,
  Minus,
  ShoppingCart,
  Percent,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useOrderStore } from '@/store/orders';

// Mock data
const restaurant = {
  id: '1',
  name: 'Плов Центр',
  description: 'Лучший плов в городе. Готовим по традиционным узбекским рецептам с 1995 года.',
  coverImage: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
  rating: 4.8,
  reviewCount: 156,
  deliveryTime: '25-35',
  deliveryFee: 10000,
  minOrder: 30000,
  cashback: 7,
  address: 'ул. Амира Темура, 45',
  phone: '+998712345678',
  isOpen: true,
  isBusy: false,
  categories: [
    {
      id: 'popular',
      name: 'Популярное',
      items: [
        { id: '1', name: 'Плов', description: 'Традиционный узбекский плов с бараниной, нутом и изюмом', price: 45000, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', isPopular: true },
        { id: '2', name: 'Шашлык', description: 'Шашлык из молодой баранины, 200г', price: 55000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', isPopular: true },
      ],
    },
    {
      id: 'main',
      name: 'Основные блюда',
      items: [
        { id: '3', name: 'Лагман', description: 'Домашняя лапша с овощами и мясом в ароматном бульоне', price: 38000, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
        { id: '4', name: 'Манты', description: '5 шт., с сочной бараниной и луком', price: 35000, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400' },
        { id: '5', name: 'Самса', description: 'С мясом, хрустящее тесто, 2 шт.', price: 18000, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
      ],
    },
    {
      id: 'salads',
      name: 'Салаты',
      items: [
        { id: '6', name: 'Ачик-чучук', description: 'Свежие помидоры с луком и зеленью', price: 15000, image: null },
        { id: '7', name: 'Шакароп', description: 'Освежающий салат из помидоров', price: 12000, image: null },
      ],
    },
    {
      id: 'drinks',
      name: 'Напитки',
      items: [
        { id: '8', name: 'Чай чёрный', description: 'Чайник 0.5л', price: 8000, image: null },
        { id: '9', name: 'Компот', description: 'Домашний, 0.5л', price: 10000, image: null },
        { id: '10', name: 'Кока-Кола', description: '0.5л', price: 8000, image: null },
      ],
    },
  ],
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' сум';
}

export default function RestaurantPage() {
  const { cart, addToCart: addToStoreCart, updateQuantity } = useOrderStore();
  const [activeCategory, setActiveCategory] = useState('popular');

  const addToCart = (item: { id: string; name: string; price: number }) => {
    addToStoreCart(
      { menuItemId: item.id, name: item.name, price: item.price, id: item.id },
      restaurant.id,
      restaurant.name
    );
  };

  const removeFromCart = (itemId: string) => {
    const existing = cart.find(i => i.menuItemId === itemId);
    if (existing && existing.quantity > 1) {
      updateQuantity(itemId, existing.quantity - 1);
    } else {
      updateQuantity(itemId, 0);
    }
  };

  const getCartQuantity = (itemId: string): number => {
    return cart.find(i => i.menuItemId === itemId)?.quantity || 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Cover Image */}
      <div className="relative h-56 bg-gray-200">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </Link>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="max-w-2xl mx-auto px-4 -mt-16 relative">
        <div className="card p-5">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
              
              <div className="flex items-center gap-3 mt-1.5 text-sm">
                <span className="flex items-center gap-1 text-gray-700">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{restaurant.rating}</span>
                  <span className="text-gray-400">({restaurant.reviewCount})</span>
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  {restaurant.deliveryTime} мин
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="chip bg-green-100 text-green-700 text-xs">
                  <Percent className="w-3 h-3" />
                  Кешбэк {restaurant.cashback}%
                </span>
                {restaurant.isOpen ? (
                  <span className="chip bg-green-100 text-green-700 text-xs">Открыто</span>
                ) : (
                  <span className="chip bg-red-100 text-red-700 text-xs">Закрыто</span>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4">{restaurant.description}</p>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {restaurant.address}
            </span>
            <span className="flex items-center gap-1">
              <Info className="w-4 h-4" />
              Мин. заказ {formatPrice(restaurant.minOrder)}
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="sticky top-0 z-10 bg-gray-50 py-3 mt-4 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {restaurant.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                  activeCategory === cat.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-6 mt-4">
          {restaurant.categories.map((category) => (
            <section key={category.id} id={category.id}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{category.name}</h2>
              <div className="space-y-3">
                {category.items.map((item) => {
                  const quantity = getCartQuantity(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className="card-hover flex gap-4 p-4"
                    >
                      {/* Image */}
                      {item.image && (
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        <p className="font-bold text-gray-900 mt-2">{formatPrice(item.price)}</p>
                      </div>

                      {/* Add to Cart */}
                      <div className="flex items-end">
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2 bg-brand-500 rounded-full p-1">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-bold text-white">{quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Cart Footer */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl safe-bottom"
          >
            <div className="max-w-2xl mx-auto">
              <Link href="/checkout">
                <button className="w-full btn-primary py-4 text-lg justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Корзина • {cartCount} товаров
                  </span>
                  <span className="flex items-center gap-2">
                    {formatPrice(cartTotal)}
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

