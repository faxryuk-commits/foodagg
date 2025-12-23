'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Ban,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  MoreVertical,
  ChevronDown,
  FileText,
  MessageSquare,
} from 'lucide-react';

// Mock data
const merchants = [
  {
    id: '1',
    name: 'Плов Центр Ахмад',
    slug: 'plov-centr-ahmad',
    logo: null,
    status: 'PENDING',
    address: 'ул. Навои, 45, Ташкент',
    phone: '+998 71 123 4567',
    email: 'ahmad@plovcentr.uz',
    owner: 'Ахмад Каримов',
    category: 'Узбекская кухня',
    rating: 0,
    reviewCount: 0,
    orderCount: 0,
    createdAt: '2024-12-22T10:00:00',
    documents: ['license.pdf', 'certificate.pdf'],
  },
  {
    id: '2',
    name: 'Burger House',
    slug: 'burger-house',
    logo: null,
    status: 'PENDING',
    address: 'пр. Амира Темура, 88',
    phone: '+998 90 111 2233',
    email: 'info@burgerhouse.uz',
    owner: 'Тимур Алиев',
    category: 'Фастфуд',
    rating: 0,
    reviewCount: 0,
    orderCount: 0,
    createdAt: '2024-12-23T08:30:00',
    documents: ['license.pdf'],
  },
  {
    id: '3',
    name: 'Sushi Time',
    slug: 'sushi-time',
    logo: null,
    status: 'ACTIVE',
    address: 'ул. Мирабад, 22',
    phone: '+998 71 234 5678',
    email: 'order@sushitime.uz',
    owner: 'Алишер Рахимов',
    category: 'Японская кухня',
    rating: 4.7,
    reviewCount: 156,
    orderCount: 892,
    createdAt: '2024-11-15T12:00:00',
    approvedAt: '2024-11-16T09:00:00',
    documents: [],
  },
  {
    id: '4',
    name: 'Pizza Italia',
    slug: 'pizza-italia',
    logo: null,
    status: 'SUSPENDED',
    address: 'ул. Шота Руставели, 15',
    phone: '+998 71 345 6789',
    email: 'hello@pizzaitalia.uz',
    owner: 'Марко Росси',
    category: 'Итальянская кухня',
    rating: 4.2,
    reviewCount: 89,
    orderCount: 445,
    createdAt: '2024-10-01T10:00:00',
    suspendedAt: '2024-12-20T14:00:00',
    suspendReason: 'Жалобы на качество',
    documents: [],
  },
];

const statusConfig = {
  PENDING: { label: 'На модерации', color: 'amber', icon: Clock },
  ACTIVE: { label: 'Активен', color: 'emerald', icon: CheckCircle },
  SUSPENDED: { label: 'Приостановлен', color: 'red', icon: Ban },
  CLOSED: { label: 'Закрыт', color: 'gray', icon: XCircle },
};

export default function MerchantsPage() {
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<typeof merchants[0] | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const filteredMerchants = merchants.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pendingCount = merchants.filter(m => m.status === 'PENDING').length;
  const activeCount = merchants.filter(m => m.status === 'ACTIVE').length;
  const suspendedCount = merchants.filter(m => m.status === 'SUSPENDED').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Модерация ресторанов
          </h1>
          <p className="text-gray-400 mt-1">
            Управление и проверка заведений на платформе
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Store className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Всего</span>
          </div>
          <div className="text-3xl font-bold">{merchants.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-amber-500/20 cursor-pointer hover:border-amber-500/40 transition-colors"
          onClick={() => setFilter('PENDING')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-gray-400 text-sm">На модерации</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">{pendingCount}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-gray-400 text-sm">Активные</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{activeCount}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Ban className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-gray-400 text-sm">Приостановлены</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{suspendedCount}</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск ресторанов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
          />
        </div>
        
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Все' },
            { value: 'PENDING', label: 'На модерации' },
            { value: 'ACTIVE', label: 'Активные' },
            { value: 'SUSPENDED', label: 'Приостановлены' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as typeof filter)}
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

      {/* Merchants List */}
      <div className="space-y-4">
        {filteredMerchants.map((merchant, index) => {
          const status = statusConfig[merchant.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;
          
          return (
            <motion.div
              key={merchant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border ${
                merchant.status === 'PENDING' ? 'border-amber-500/30' : 'border-white/5'
              } hover:border-white/10 transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl font-bold">
                    {merchant.name.charAt(0)}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{merchant.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        status.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                        status.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                        status.color === 'red' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {merchant.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {merchant.phone}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-gray-400">Владелец: <span className="text-white">{merchant.owner}</span></span>
                      <span className="text-gray-400">Категория: <span className="text-white">{merchant.category}</span></span>
                    </div>

                    {merchant.status === 'ACTIVE' && (
                      <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="w-4 h-4 fill-current" />
                          {merchant.rating}
                          <span className="text-gray-400">({merchant.reviewCount})</span>
                        </span>
                        <span className="text-gray-400">
                          {merchant.orderCount} заказов
                        </span>
                      </div>
                    )}

                    {merchant.status === 'SUSPENDED' && merchant.suspendReason && (
                      <div className="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        Причина: {merchant.suspendReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {merchant.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedMerchant(merchant);
                          setShowApproveModal(true);
                        }}
                        className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Одобрить
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMerchant(merchant);
                          setShowRejectModal(true);
                        }}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Отклонить
                      </button>
                    </>
                  )}
                  
                  {merchant.status === 'ACTIVE' && (
                    <button className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors flex items-center gap-2">
                      <Ban className="w-4 h-4" />
                      Приостановить
                    </button>
                  )}
                  
                  {merchant.status === 'SUSPENDED' && (
                    <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Восстановить
                    </button>
                  )}
                  
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Documents */}
              {merchant.documents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FileText className="w-4 h-4" />
                    Документы:
                    {merchant.documents.map((doc, i) => (
                      <a
                        key={i}
                        href="#"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {doc}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && selectedMerchant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-md border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold">Одобрить ресторан</h2>
                <p className="text-gray-400 mt-2">{selectedMerchant.name}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Комиссия платформы (%)</label>
                  <input
                    type="number"
                    defaultValue={15}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Кэшбэк для клиентов (%)</label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg hover:from-emerald-500 hover:to-emerald-400 transition-all"
                >
                  Одобрить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedMerchant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-md border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold">Отклонить ресторан</h2>
                <p className="text-gray-400 mt-2">{selectedMerchant.name}</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Причина отклонения</label>
                <textarea
                  rows={4}
                  placeholder="Укажите причину..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-500 hover:to-red-400 transition-all"
                >
                  Отклонить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

