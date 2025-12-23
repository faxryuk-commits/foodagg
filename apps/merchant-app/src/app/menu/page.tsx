'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Tag,
  Clock,
  Percent,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Save,
  X,
} from 'lucide-react';

// Mock data
const initialCategories = [
  {
    id: '1',
    name: 'Плов',
    position: 1,
    isActive: true,
    items: [
      { id: '1-1', name: 'Плов с говядиной', price: 35000, discountPrice: null, isAvailable: true, isPopular: true },
      { id: '1-2', name: 'Плов с бараниной', price: 40000, discountPrice: null, isAvailable: true, isPopular: false },
      { id: '1-3', name: 'Плов свадебный', price: 45000, discountPrice: 38000, isAvailable: true, isPopular: true },
    ],
  },
  {
    id: '2',
    name: 'Самса',
    position: 2,
    isActive: true,
    items: [
      { id: '2-1', name: 'Самса с мясом', price: 12000, discountPrice: null, isAvailable: true, isPopular: true },
      { id: '2-2', name: 'Самса с тыквой', price: 10000, discountPrice: null, isAvailable: true, isPopular: false },
      { id: '2-3', name: 'Самса слоёная', price: 15000, discountPrice: null, isAvailable: false, isPopular: false },
    ],
  },
  {
    id: '3',
    name: 'Напитки',
    position: 3,
    isActive: true,
    items: [
      { id: '3-1', name: 'Чай зелёный', price: 8000, discountPrice: null, isAvailable: true, isPopular: false },
      { id: '3-2', name: 'Кола', price: 10000, discountPrice: null, isAvailable: true, isPopular: false },
      { id: '3-3', name: 'Компот', price: 12000, discountPrice: null, isAvailable: true, isPopular: false },
    ],
  },
];

export default function MenuPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['1', '2']);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleItemAvailability = (categoryId: string, itemId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
              ),
            }
          : cat
      )
    );
  };

  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const activeItems = categories.reduce(
    (acc, cat) => acc + cat.items.filter(i => i.isAvailable).length,
    0
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Управление меню</h1>
          <p className="text-gray-400 mt-1">
            {totalItems} позиций • {activeItems} активных
          </p>
        </div>
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Добавить категорию
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по меню..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category, categoryIndex) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.05 }}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl border border-white/5 overflow-hidden"
          >
            {/* Category Header */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              <GripVertical className="w-5 h-5 text-gray-500 cursor-grab" />
              
              <motion.div
                animate={{ rotate: expandedCategories.includes(category.id) ? 90 : 0 }}
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.div>
              
              <div className="flex-1">
                <h3 className="font-semibold">{category.name}</h3>
                <span className="text-sm text-gray-400">{category.items.length} позиций</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddItem(category.id);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Items */}
            <AnimatePresence>
              {expandedCategories.includes(category.id) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/5">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-b-0 ${
                          !item.isAvailable ? 'opacity-50' : ''
                        }`}
                      >
                        <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                        
                        {/* Image placeholder */}
                        <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-500" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            {item.isPopular && (
                              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                Популярное
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {item.discountPrice ? (
                              <>
                                <span className="text-orange-400 font-semibold">
                                  {item.discountPrice.toLocaleString()} сум
                                </span>
                                <span className="text-gray-500 line-through text-sm">
                                  {item.price.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-300">
                                {item.price.toLocaleString()} сум
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleItemAvailability(category.id, item.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.isAvailable
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {item.isAvailable ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingItem({ ...item, categoryId: category.id })}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {(showAddItem || editingItem) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddItem(null);
              setEditingItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-lg border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingItem ? 'Редактировать позицию' : 'Добавить позицию'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddItem(null);
                    setEditingItem(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Image */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors">
                    <ImageIcon className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-sm text-gray-500">Добавить фото</span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Название</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.name || ''}
                    placeholder="Плов с говядиной"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Описание</label>
                  <textarea
                    rows={2}
                    placeholder="Описание блюда..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 resize-none"
                  />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Цена</label>
                    <input
                      type="number"
                      defaultValue={editingItem?.price || ''}
                      placeholder="35000"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Цена со скидкой</label>
                    <input
                      type="number"
                      defaultValue={editingItem?.discountPrice || ''}
                      placeholder="30000"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={editingItem?.isAvailable ?? true}
                      className="w-4 h-4 rounded bg-white/5 border-white/20"
                    />
                    <span className="text-sm text-gray-300">Доступно</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={editingItem?.isPopular ?? false}
                      className="w-4 h-4 rounded bg-white/5 border-white/20"
                    />
                    <span className="text-sm text-gray-300">Популярное</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddItem(null);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-4 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Сохранить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

