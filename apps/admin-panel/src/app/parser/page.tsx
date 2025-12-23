'use client';

import { useState, useEffect } from 'react';
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

// Removed mock data - using API instead

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('food_platform_token') : null;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }
  return data.data || data;
}

export default function ParserPage() {
  const [activeTab, setActiveTab] = useState<'sources' | 'results' | 'conflicts'>('sources');
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'yandex' as '2gis' | 'yandex' | 'google',
    name: '',
    city: '',
    category: '',
    radius: 30,
    apifyActorId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Sources state
  const [sources, setSources] = useState<any[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  
  // Results state
  const [results, setResults] = useState<any[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  
  // Conflicts state
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isLoadingConflicts, setIsLoadingConflicts] = useState(false);

  // Load data on mount and tab change
  useEffect(() => {
    loadSources();
    if (activeTab === 'results') {
      loadResults();
    } else if (activeTab === 'conflicts') {
      loadConflicts();
    }
  }, [activeTab]);

  const loadSources = async () => {
    try {
      setIsLoadingSources(true);
      const data = await apiRequest<any[]>('/api/admin/scraping/sources');
      setSources(data || []);
    } catch (error: any) {
      console.error('Failed to load sources:', error);
      setSources([]);
    } finally {
      setIsLoadingSources(false);
    }
  };

  const loadResults = async () => {
    try {
      setIsLoadingResults(true);
      const data = await apiRequest<{ items: any[] }>('/api/admin/scraping/results?page=1&pageSize=50');
      setResults(data.items || []);
    } catch (error: any) {
      console.error('Failed to load results:', error);
      setResults([]);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const loadConflicts = async () => {
    try {
      setIsLoadingConflicts(true);
      const data = await apiRequest<{ items: any[] }>('/api/admin/scraping/conflicts?page=1&pageSize=50');
      setConflicts(data.items || []);
    } catch (error: any) {
      console.error('Failed to load conflicts:', error);
      setConflicts([]);
    } finally {
      setIsLoadingConflicts(false);
    }
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const source = await apiRequest<any>('/api/admin/scraping/sources', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name || `${formData.type === '2gis' ? '2GIS' : formData.type === 'yandex' ? 'Yandex Maps' : 'Google Maps'} ${formData.city || ''}`,
          type: formData.type,
          config: {
            city: formData.city,
            category: formData.category,
            radius: formData.radius,
          },
          apifyActorId: formData.apifyActorId,
        }),
      });

      // Reset form
      setFormData({
        type: 'yandex',
        name: '',
        city: '',
        category: '',
        radius: 30,
        apifyActorId: '',
      });
      setShowAddSource(false);
      
      // Reload sources
      await loadSources();
    } catch (error: any) {
      console.error('Failed to create source:', error);
      setSubmitError(error.message || 'Не удалось создать источник');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [pendingConflictsCount, setPendingConflictsCount] = useState(0);

  useEffect(() => {
    if (sources.length > 0) {
      apiRequest<{ items: any[] }>('/api/admin/scraping/conflicts?page=1&pageSize=1')
        .then(data => setPendingConflictsCount(data.total || 0))
        .catch(() => setPendingConflictsCount(0));
    }
  }, [sources]);

  const stats = {
    totalSources: sources.length,
    activeSources: sources.filter((s: any) => s.isActive).length,
    totalScraped: sources.reduce((acc: number, s: any) => acc + (s._count?.results || 0), 0),
    pendingConflicts: pendingConflictsCount,
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
          onClick={() => {
            setFormData({
              type: 'yandex',
              name: 'Yandex maps',
              city: 'Tashkent',
              category: 'рестораны, кафе, чайхана',
              radius: 30,
              apifyActorId: '',
            });
            setShowAddSource(true);
            setSubmitError(null);
          }}
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
          <div className="text-3xl font-bold">0</div>
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
          { id: 'conflicts', label: 'Конфликты', icon: AlertTriangle, badge: conflicts.length || 0 },
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
            {isLoadingSources ? (
              <div className="text-center py-12 text-gray-400">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                <div>Загрузка источников...</div>
              </div>
            ) : sources.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Globe className="w-12 h-12 mx-auto mb-4" />
                <div className="text-xl font-medium text-white mb-2">Нет источников</div>
                <div>Добавьте первый источник для начала парсинга</div>
              </div>
            ) : (
              sources.map((source: any, index: number) => (
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
                          {(source.config as any)?.city || 'Не указан'}
                        </span>
                        <span>•</span>
                        <span>{(source.config as any)?.category || 'Не указана'}</span>
                        <span>•</span>
                        <span>Радиус: {(source.config as any)?.radius || 0} км</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Stats */}
                    <div className="flex gap-6 text-center">
                      <div>
                        <div className="text-xl font-bold">{source._count?.results || 0}</div>
                        <div className="text-xs text-gray-400">собрано</div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        source.isActive
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {source.isActive ? 'Активен' : 'Пауза'}
                      </span>
                      
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        {source.isActive ? (
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
                    {source.lastRunAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Последний запуск: {new Date(source.lastRunAt).toLocaleString('ru')}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        await apiRequest(`/api/admin/scraping/sources/${source.id}/run`, { method: 'POST' });
                        await loadSources();
                      } catch (error: any) {
                        console.error('Failed to run scraping:', error);
                        alert(error.message || 'Не удалось запустить парсинг');
                      }
                    }}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Запустить сейчас
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
              ))
            )}
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
            {isLoadingResults ? (
              <div className="text-center py-12 text-gray-400">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                <div>Загрузка результатов...</div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <div className="text-xl font-medium text-white mb-2">Нет результатов</div>
                <div>Запустите парсинг для получения данных</div>
              </div>
            ) : (
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
                    {results.map((result) => {
                      const normalizedData = result.normalizedData as any;
                      const confidence = result.matchConfidence || 0;
                      return (
                        <tr key={result.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-medium">{normalizedData?.name || 'Не указано'}</div>
                            <div className="text-sm text-gray-400">
                              {new Date(result.createdAt).toLocaleString('ru')}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${sourceColors[result.source?.type || ''] || ''}`}>
                              {sourceIcons[result.source?.type || ''] || '📌'} {(result.source?.type || 'UNKNOWN').toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300">{normalizedData?.address || 'Не указан'}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    confidence >= 80 ? 'bg-emerald-500' :
                                    confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${confidence}%` }}
                                />
                              </div>
                              <span className="text-sm">{confidence}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              result.conflictStatus === 'NONE' ? 'bg-blue-500/20 text-blue-400' :
                              result.conflictStatus === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                              result.conflictStatus === 'IGNORED' ? 'bg-red-500/20 text-red-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {result.conflictStatus === 'NONE' && <Clock className="w-3 h-3" />}
                              {result.conflictStatus === 'RESOLVED' && <CheckCircle className="w-3 h-3" />}
                              {result.conflictStatus === 'IGNORED' && <XCircle className="w-3 h-3" />}
                              {result.conflictStatus === 'PENDING' && <AlertTriangle className="w-3 h-3" />}
                              {result.conflictStatus === 'NONE' ? 'Новый' :
                               result.conflictStatus === 'RESOLVED' ? 'Одобрен' :
                               result.conflictStatus === 'IGNORED' ? 'Отклонён' : 'Конфликт'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <Eye className="w-4 h-4 text-gray-400" />
                              </button>
                              {result.conflictStatus === 'NONE' && (
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
            {isLoadingConflicts ? (
              <div className="text-center py-12 text-gray-400">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                <div>Загрузка конфликтов...</div>
              </div>
            ) : conflicts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                <div className="text-xl font-medium text-white mb-2">Нет конфликтов</div>
                <div>Все данные из парсера обработаны</div>
              </div>
            ) : (
              conflicts.map((conflict, index) => {
                const normalizedData = conflict.normalizedData as any;
                const matchedMerchant = conflict.matchedMerchant;
                return (
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
                          Совпадение: {conflict.matchConfidence || 0}%
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-sm ${sourceColors[conflict.source?.type || ''] || ''}`}>
                        {sourceIcons[conflict.source?.type || ''] || '📌'} {(conflict.source?.type || 'UNKNOWN').toUpperCase()}
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
                            <div className="font-medium">{normalizedData?.name || 'Не указано'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Адрес:</span>
                            <div>{normalizedData?.address || 'Не указан'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Телефон:</span>
                            <div>{normalizedData?.phone || 'Не указан'}</div>
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
                            <div className="font-medium">{matchedMerchant?.name || 'Не найдено'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Адрес:</span>
                            <div>{matchedMerchant?.address || 'Не указан'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Телефон:</span>
                            <div>{matchedMerchant?.phone || 'Не указан'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                      <button 
                        onClick={async () => {
                          try {
                            await apiRequest(`/api/admin/scraping/results/${conflict.id}/resolve`, {
                              method: 'POST',
                              body: JSON.stringify({ action: 'merge' }),
                            });
                            await loadConflicts();
                          } catch (error: any) {
                            console.error('Failed to resolve conflict:', error);
                            alert(error.message || 'Не удалось разрешить конфликт');
                          }
                        }}
                        className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Объединить
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await apiRequest(`/api/admin/scraping/results/${conflict.id}/resolve`, {
                              method: 'POST',
                              body: JSON.stringify({ action: 'create_new' }),
                            });
                            await loadConflicts();
                          } catch (error: any) {
                            console.error('Failed to create new:', error);
                            alert(error.message || 'Не удалось создать новое заведение');
                          }
                        }}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Создать новое
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await apiRequest(`/api/admin/scraping/results/${conflict.id}/resolve`, {
                              method: 'POST',
                              body: JSON.stringify({ action: 'reject' }),
                            });
                            await loadConflicts();
                          } catch (error: any) {
                            console.error('Failed to reject:', error);
                            alert(error.message || 'Не удалось отклонить');
                          }
                        }}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Отклонить
                      </button>
                    </div>
                  </motion.div>
                );
              })
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
              
              {submitError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {submitError}
                </div>
              )}
              
              <form onSubmit={handleCreateSource} className="space-y-4">
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
                        type="button"
                        onClick={() => {
                          const newType = type.id as any;
                          setFormData({ 
                            ...formData, 
                            type: newType,
                            name: formData.name || `${type.label} ${formData.city || ''}`.trim(),
                          });
                        }}
                        className={`p-4 rounded-lg border transition-colors text-center ${
                          formData.type === type.id
                            ? `${sourceColors[type.id]} border-white/30`
                            : 'border-white/10 hover:border-white/30'
                        }`}
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="2GIS Ташкент"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Город</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      const city = e.target.value;
                      const typeLabels: Record<string, string> = {
                        '2gis': '2GIS',
                        'yandex': 'Yandex Maps',
                        'google': 'Google Maps',
                      };
                      setFormData({ 
                        ...formData, 
                        city,
                        name: formData.name || `${typeLabels[formData.type]} ${city}`.trim(),
                      });
                    }}
                    placeholder="Ташкент"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Категория поиска</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="рестораны, кафе, доставка еды"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Радиус (км)</label>
                  <input
                    type="number"
                    value={formData.radius}
                    onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) || 0 })}
                    placeholder="50"
                    min="1"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Apify Actor ID</label>
                  <input
                    type="text"
                    value={formData.apifyActorId}
                    onChange={(e) => setFormData({ ...formData, apifyActorId: e.target.value })}
                    placeholder="apify/google-maps-scraper"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSource(false);
                      setSubmitError(null);
                      setFormData({
                        type: 'yandex',
                        name: '',
                        city: '',
                        category: '',
                        radius: 30,
                        apifyActorId: '',
                      });
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg hover:from-emerald-500 hover:to-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Создание...' : 'Создать'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

