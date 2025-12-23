'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Star,
  MapPin,
  Filter,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

// Mock data
const popularSearches = ['Плов', 'Суши', 'Бургер', 'Пицца', 'Лагман', 'Шашлык'];

const categories = [
  { id: 'uzbek', name: 'Узбекская', emoji: '🍲', count: 45 },
  { id: 'fast-food', name: 'Фастфуд', emoji: '🍔', count: 32 },
  { id: 'japanese', name: 'Японская', emoji: '🍣', count: 18 },
  { id: 'italian', name: 'Итальянская', emoji: '🍕', count: 24 },
  { id: 'korean', name: 'Корейская', emoji: '🍜', count: 12 },
  { id: 'turkish', name: 'Турецкая', emoji: '🥙', count: 15 },
  { id: 'indian', name: 'Индийская', emoji: '🍛', count: 8 },
  { id: 'desserts', name: 'Десерты', emoji: '🍰', count: 28 },
];

const filters = {
  sortBy: [
    { value: 'popular', label: 'По популярности' },
    { value: 'rating', label: 'По рейтингу' },
    { value: 'delivery', label: 'По времени доставки' },
    { value: 'price_low', label: 'Сначала дешевые' },
    { value: 'price_high', label: 'Сначала дорогие' },
  ],
  features: [
    { value: 'delivery', label: 'Доставка' },
    { value: 'pickup', label: 'Самовывоз' },
    { value: 'open_now', label: 'Открыто сейчас' },
    { value: 'cashback', label: 'С кэшбэком' },
  ],
  priceRange: ['$', '$$', '$$$', '$$$$'],
};

const searchResults = [
  {
    id: '1',
    name: 'Плов Центр Ахмад',
    category: 'Узбекская кухня',
    rating: 4.8,
    reviewCount: 234,
    deliveryTime: '25-35',
    deliveryFee: 0,
    minOrder: 50000,
    address: 'ул. Навои, 45',
    distance: 1.2,
    isOpen: true,
    cashback: 5,
    tags: ['Плов', 'Самса', 'Лагман'],
  },
  {
    id: '2',
    name: 'Sushi Time',
    category: 'Японская кухня',
    rating: 4.7,
    reviewCount: 156,
    deliveryTime: '30-45',
    deliveryFee: 10000,
    minOrder: 80000,
    address: 'ул. Мирабад, 22',
    distance: 2.5,
    isOpen: true,
    cashback: 3,
    tags: ['Суши', 'Роллы', 'Сашими'],
  },
  {
    id: '3',
    name: 'Burger House',
    category: 'Фастфуд',
    rating: 4.5,
    reviewCount: 89,
    deliveryTime: '20-30',
    deliveryFee: 5000,
    minOrder: 30000,
    address: 'пр. Амира Темура, 88',
    distance: 0.8,
    isOpen: true,
    cashback: 0,
    tags: ['Бургеры', 'Картофель', 'Напитки'],
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['delivery']);

  const hasResults = query.length > 0 || selectedCategory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-lg border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти ресторан или блюдо"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 text-lg"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors shrink-0 ${
                showFilters
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Фильтры
            </button>
            
            {selectedFeatures.map((feature) => (
              <span
                key={feature}
                className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm shrink-0"
              >
                {filters.features.find(f => f.value === feature)?.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-800/50 border-b border-white/5 overflow-hidden"
          >
            <div className="max-w-2xl mx-auto p-4 space-y-4">
              {/* Sort */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Сортировка</label>
                <div className="flex flex-wrap gap-2">
                  {filters.sortBy.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        sortBy === option.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Параметры</label>
                <div className="flex flex-wrap gap-2">
                  {filters.features.map((feature) => (
                    <button
                      key={feature.value}
                      onClick={() => {
                        setSelectedFeatures(prev =>
                          prev.includes(feature.value)
                            ? prev.filter(f => f !== feature.value)
                            : [...prev, feature.value]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedFeatures.includes(feature.value)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {feature.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!hasResults ? (
          <>
            {/* Popular Searches */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Популярные запросы</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setQuery(search)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Категории</h2>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-left"
                  >
                    <span className="text-3xl">{category.emoji}</span>
                    <div>
                      <div className="font-medium text-white">{category.name}</div>
                      <div className="text-sm text-gray-400">{category.count} мест</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {query ? `Результаты для "${query}"` : 'Все рестораны'}
              </h2>
              <span className="text-gray-400">{searchResults.length} мест</span>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {searchResults.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/restaurant/${restaurant.id}`}>
                    <div className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition-colors">
                      <div className="flex gap-4">
                        {/* Image placeholder */}
                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center text-4xl shrink-0">
                          🍽️
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-white truncate">{restaurant.name}</h3>
                            {restaurant.cashback > 0 && (
                              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full shrink-0">
                                {restaurant.cashback}% кэшбэк
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-400 mt-1">{restaurant.category}</div>
                          
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-amber-400">
                              <Star className="w-4 h-4 fill-current" />
                              {restaurant.rating}
                            </span>
                            <span className="text-gray-400">({restaurant.reviewCount})</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400">{restaurant.deliveryTime} мин</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {restaurant.distance} км
                            {restaurant.deliveryFee > 0 && (
                              <>
                                <span>•</span>
                                <span>Доставка {restaurant.deliveryFee.toLocaleString()} сум</span>
                              </>
                            )}
                            {restaurant.deliveryFee === 0 && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400">Бесплатная доставка</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {restaurant.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

