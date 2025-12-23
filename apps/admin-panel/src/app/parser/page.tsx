'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Play,
  Pause,
  Plus,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  ChevronRight,
  Zap,
  Database,
  BarChart3,
} from 'lucide-react';

// Mock data for scraping sources
const scrapingSources = [
  {
    id: '1',
    name: '2GIS Ташкент',
    type: '2gis',
    status: 'active',
    lastRun: '2024-12-23T10:30:00',
    nextRun: '2024-12-24T10:30:00',
    totalScraped: 1247,
    newFound: 23,
    conflicts: 5,
    config: {
      city: 'Ташкент',
      category: 'restaurants',
      radius: 50,
    },
  },
  {
    id: '2',
    name: 'Yandex Maps Ташкент',
    type: 'yandex',
    status: 'active',
    lastRun: '2024-12-23T08:00:00',
    nextRun: '2024-12-24T08:00:00',
    totalScraped: 892,
    newFound: 12,
    conflicts: 3,
    config: {
      city: 'Ташкент',
      category: 'кафе рестораны',
      radius: 30,
    },
  },
  {
    id: '3',
    name: 'Google Maps Самарканд',
    type: 'google',
    status: 'paused',
    lastRun: '2024-12-22T14:00:00',
    nextRun: null,
    totalScraped: 456,
    newFound: 0,
    conflicts: 8,
    config: {
      city: 'Samarkand',
      category: 'restaurant',
      radius: 20,
    },
  },
];

// Mock data for recent scraping results
const recentResults = [
  {
    id: '1',
    name: 'Плов центр Ахмад',
    source: '2gis',
    address: 'ул. Навои, 45',
    status: 'new',
    confidence: 95,
    scrapedAt: '2024-12-23T10:30:00',
  },
  {
    id: '2',
    name: 'Кафе Самарканд',
    source: 'yandex',
    address: 'пр. Амира Темура, 12',
    status: 'conflict',
    confidence: 72,
    scrapedAt: '2024-12-23T08:15:00',
    conflict: 'Найдено похожее: "Ресторан Самарканд"',
  },
  {
    id: '3',
    name: 'Burger House',
    source: '2gis',
    address: 'ул. Шота Руставели, 8',
    status: 'approved',
    confidence: 98,
    scrapedAt: '2024-12-23T07:00:00',
  },
  {
    id: '4',
    name: 'Sushi Time',
    source: 'google',
    address: 'ул. Мирабад, 22',
    status: 'rejected',
    confidence: 45,
    scrapedAt: '2024-12-22T16:00:00',
    reason: 'Дубликат существующего заведения',
  },
];

// Conflicts data
const conflicts = [
  {
    id: '1',
    scraped: {
      name: 'Кафе Самарканд',
      address: 'пр. Амира Темура, 12',
      phone: '+998 71 123 4567',
      source: 'yandex',
    },
    existing: {
      name: 'Ресторан Самарканд',
      address: 'проспект Амира Темура, 12А',
      phone: '+998 71 123 4568',
    },
    similarity: 85,
  },
  {
    id: '2',
    scraped: {
      name: 'Pizza House',
      address: 'ул. Навои, 100',
      phone: '+998 90 111 2233',
      source: '2gis',
    },
    existing: {
      name: 'Пицца Хаус',
      address: 'ул. Навои, 100',
      phone: '+998 90 111 2234',
    },
    similarity: 92,
  },
];

const sourceIcons: Record<string, string> = {
  '2gis': '🗺️',
  'yandex': '🔴',
  'google': '🌐',
};

const sourceColors: Record<string, string> = {
  '2gis': 'bg-green-500/20 text-green-400 border-green-500/30',
  'yandex': 'bg-red-500/20 text-red-400 border-red-500/30',
  'google': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function ParserPage() {
  const [activeTab, setActiveTab] = useState<'sources' | 'results' | 'conflicts'>('sources');
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);

  const stats = {
    totalSources: scrapingSources.length,
    activeSources: scrapingSources.filter(s => s.status === 'active').length,
    totalScraped: scrapingSources.reduce((acc, s) => acc + s.totalScraped, 0),
    pendingConflicts: conflicts.length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Парсер заведений
          </h1>
          <p className="text-gray-400 mt-1">
            Автоматический сбор данных из 2GIS, Yandex Maps, Google Maps
          </p>
        </div>
        <button
          onClick={() => setShowAddSource(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg hover:from-emerald-500 hover:to-emerald-400 transition-all"
        >
          <Plus className="w-5 h-5" />
          Добавить источник
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Источники</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalSources}</div>
          <div className="text-sm text-emerald-400 mt-1">
            {stats.activeSources} активных
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-gray-400 text-sm">Собрано</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalScraped.toLocaleString()}</div>
          <div className="text-sm text-gray-400 mt-1">заведений</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Новых сегодня</span>
          </div>
          <div className="text-3xl font-bold">
            {scrapingSources.reduce((acc, s) => acc + s.newFound, 0)}
          </div>
          <div className="text-sm text-purple-400 mt-1">+12% к вчера</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-gray-400 text-sm">Конфликты</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">{stats.pendingConflicts}</div>
          <div className="text-sm text-gray-400 mt-1">требуют решения</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'sources', label: 'Источники', icon: Globe },
          { id: 'results', label: 'Результаты', icon: BarChart3 },
          { id: 'conflicts', label: 'Конфликты', icon: AlertTriangle, badge: conflicts.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'sources' && (
          <motion.div
            key="sources"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {scrapingSources.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl p-3 rounded-xl ${sourceColors[source.type]}`}>
                      {sourceIcons[source.type]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{source.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {source.config.city}
                        </span>
                        <span>•</span>
                        <span>{source.config.category}</span>
                        <span>•</span>
                        <span>Радиус: {source.config.radius} км</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Stats */}
                    <div className="flex gap-6 text-center">
                      <div>
                        <div className="text-xl font-bold">{source.totalScraped}</div>
                        <div className="text-xs text-gray-400">собрано</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-emerald-400">+{source.newFound}</div>
                        <div className="text-xs text-gray-400">новых</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-amber-400">{source.conflicts}</div>
                        <div className="text-xs text-gray-400">конфликт</div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        source.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {source.status === 'active' ? 'Активен' : 'Пауза'}
                      </span>
                      
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        {source.status === 'active' ? (
                          <Pause className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Play className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Settings className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Последний запуск: {new Date(source.lastRun).toLocaleString('ru')}
                    </span>
                    {source.nextRun && (
                      <span className="flex items-center gap-1">
                        <ChevronRight className="w-4 h-4" />
                        Следующий: {new Date(source.nextRun).toLocaleString('ru')}
                      </span>
                    )}
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    Запустить сейчас
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск заведений..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                />
              </div>
              <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none">
                <option value="">Все источники</option>
                <option value="2gis">2GIS</option>
                <option value="yandex">Yandex Maps</option>
                <option value="google">Google Maps</option>
              </select>
              <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none">
                <option value="">Все статусы</option>
                <option value="new">Новые</option>
                <option value="approved">Одобренные</option>
                <option value="rejected">Отклонённые</option>
                <option value="conflict">Конфликты</option>
              </select>
            </div>

            {/* Results Table */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-gray-400 font-medium">Заведение</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Источник</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Адрес</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Точность</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Статус</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResults.map((result) => (
                    <tr key={result.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(result.scrapedAt).toLocaleString('ru')}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${sourceColors[result.source]}`}>
                          {sourceIcons[result.source]} {result.source.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">{result.address}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                result.confidence >= 80 ? 'bg-emerald-500' :
                                result.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${result.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm">{result.confidence}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          result.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                          result.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          result.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {result.status === 'new' && <Clock className="w-3 h-3" />}
                          {result.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {result.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {result.status === 'conflict' && <AlertTriangle className="w-3 h-3" />}
                          {result.status === 'new' ? 'Новый' :
                           result.status === 'approved' ? 'Одобрен' :
                           result.status === 'rejected' ? 'Отклонён' : 'Конфликт'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          {result.status === 'new' && (
                            <>
                              <button className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              </button>
                              <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                                <XCircle className="w-4 h-4 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'conflicts' && (
          <motion.div
            key="conflicts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {conflicts.map((conflict, index) => (
              <motion.div
                key={conflict.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-amber-500/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400 font-medium">
                      Совпадение: {conflict.similarity}%
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-sm ${sourceColors[conflict.scraped.source]}`}>
                    {sourceIcons[conflict.scraped.source]} {conflict.scraped.source.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Scraped Data */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      Новые данные (из парсера)
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-400 text-sm">Название:</span>
                        <div className="font-medium">{conflict.scraped.name}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Адрес:</span>
                        <div>{conflict.scraped.address}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Телефон:</span>
                        <div>{conflict.scraped.phone}</div>
                      </div>
                    </div>
                  </div>

                  {/* Existing Data */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      Существующее заведение
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-400 text-sm">Название:</span>
                        <div className="font-medium">{conflict.existing.name}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Адрес:</span>
                        <div>{conflict.existing.address}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Телефон:</span>
                        <div>{conflict.existing.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                  <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Объединить
                  </button>
                  <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Создать новое
                  </button>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Отклонить
                  </button>
                </div>
              </motion.div>
            ))}

            {conflicts.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                <div className="text-xl font-medium text-white mb-2">Нет конфликтов</div>
                <div>Все данные из парсера обработаны</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Source Modal */}
      <AnimatePresence>
        {showAddSource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowAddSource(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-lg border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-6">Добавить источник</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Тип источника</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '2gis', label: '2GIS', icon: '🗺️' },
                      { id: 'yandex', label: 'Yandex Maps', icon: '🔴' },
                      { id: 'google', label: 'Google Maps', icon: '🌐' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        className={`p-4 rounded-lg border border-white/10 hover:border-white/30 transition-colors text-center ${sourceColors[type.id]}`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-sm">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Название</label>
                  <input
                    type="text"
                    placeholder="2GIS Ташкент"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Город</label>
                  <input
                    type="text"
                    placeholder="Ташкент"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Категория поиска</label>
                  <input
                    type="text"
                    placeholder="рестораны, кафе, доставка еды"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Радиус (км)</label>
                  <input
                    type="number"
                    placeholder="50"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Apify Actor ID</label>
                  <input
                    type="text"
                    placeholder="apify/google-maps-scraper"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddSource(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg hover:from-emerald-500 hover:to-emerald-400 transition-all">
                  Создать
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

