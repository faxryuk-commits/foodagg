'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Eye,
  EyeOff,
  Save,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Shield,
  Globe,
  Database,
  Zap,
  CreditCard,
  MessageSquare,
  Map,
  RefreshCw,
  Lock,
  Unlock,
  Settings,
  ExternalLink,
} from 'lucide-react';

// API Configuration categories
const apiCategories = [
  {
    id: 'scraping',
    name: 'Парсинг карт',
    icon: Map,
    color: 'emerald',
    description: 'Apify, 2GIS, Yandex Maps, Google Maps',
    variables: [
      { key: 'APIFY_TOKEN', label: 'Apify API Token', required: true, link: 'https://apify.com/account/integrations' },
      { key: 'GOOGLE_MAPS_API_KEY', label: 'Google Maps API Key', required: false, link: 'https://console.cloud.google.com/apis/credentials' },
      { key: 'YANDEX_MAPS_API_KEY', label: 'Yandex Maps API Key', required: false, link: 'https://developer.tech.yandex.ru/' },
    ],
  },
  {
    id: 'payments',
    name: 'Платежи',
    icon: CreditCard,
    color: 'blue',
    description: 'Payme, Click, Stripe',
    variables: [
      { key: 'PAYME_MERCHANT_ID', label: 'Payme Merchant ID', required: false },
      { key: 'PAYME_SECRET_KEY', label: 'Payme Secret Key', required: false, sensitive: true },
      { key: 'CLICK_MERCHANT_ID', label: 'Click Merchant ID', required: false },
      { key: 'CLICK_SERVICE_ID', label: 'Click Service ID', required: false },
      { key: 'CLICK_SECRET_KEY', label: 'Click Secret Key', required: false, sensitive: true },
      { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key', required: false, sensitive: true },
      { key: 'STRIPE_PUBLISHABLE_KEY', label: 'Stripe Publishable Key', required: false },
    ],
  },
  {
    id: 'notifications',
    name: 'Уведомления',
    icon: MessageSquare,
    color: 'purple',
    description: 'SMS, Push, Email',
    variables: [
      { key: 'ESKIZ_EMAIL', label: 'Eskiz Email', required: false },
      { key: 'ESKIZ_PASSWORD', label: 'Eskiz Password', required: false, sensitive: true },
      { key: 'FIREBASE_PROJECT_ID', label: 'Firebase Project ID', required: false },
      { key: 'FIREBASE_PRIVATE_KEY', label: 'Firebase Private Key', required: false, sensitive: true },
      { key: 'SMTP_HOST', label: 'SMTP Host', required: false },
      { key: 'SMTP_USER', label: 'SMTP User', required: false },
      { key: 'SMTP_PASSWORD', label: 'SMTP Password', required: false, sensitive: true },
    ],
  },
  {
    id: 'storage',
    name: 'Хранилище',
    icon: Database,
    color: 'amber',
    description: 'S3, MinIO, Cloudinary',
    variables: [
      { key: 'S3_ENDPOINT', label: 'S3 Endpoint', required: false },
      { key: 'S3_ACCESS_KEY', label: 'S3 Access Key', required: false },
      { key: 'S3_SECRET_KEY', label: 'S3 Secret Key', required: false, sensitive: true },
      { key: 'S3_BUCKET', label: 'S3 Bucket Name', required: false },
      { key: 'CLOUDINARY_URL', label: 'Cloudinary URL', required: false, sensitive: true },
    ],
  },
  {
    id: 'database',
    name: 'База данных',
    icon: Shield,
    color: 'red',
    description: 'PostgreSQL, Redis',
    variables: [
      { key: 'DATABASE_URL', label: 'PostgreSQL URL', required: true, sensitive: true },
      { key: 'REDIS_URL', label: 'Redis URL', required: false, sensitive: true },
    ],
  },
  {
    id: 'auth',
    name: 'Авторизация',
    icon: Lock,
    color: 'cyan',
    description: 'JWT, OAuth',
    variables: [
      { key: 'JWT_SECRET', label: 'JWT Secret', required: true, sensitive: true },
      { key: 'JWT_EXPIRES_IN', label: 'JWT Expires In', required: false, default: '7d' },
      { key: 'GOOGLE_CLIENT_ID', label: 'Google OAuth Client ID', required: false },
      { key: 'GOOGLE_CLIENT_SECRET', label: 'Google OAuth Secret', required: false, sensitive: true },
    ],
  },
];

// Mock stored values
const initialValues: Record<string, string> = {
  'APIFY_TOKEN': 'apify_api_xxx...xxx',
  'DATABASE_URL': 'postgresql://user:pass@host:5432/db',
  'JWT_SECRET': 'super-secret-jwt-key-xxx',
  'JWT_EXPIRES_IN': '7d',
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

export default function ApiSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('scraping');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleVisibility = (key: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setHasChanges(false);
  };

  const generateVercelEnvString = () => {
    const envString = Object.entries(values)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}="${v}"`)
      .join('\n');
    navigator.clipboard.writeText(envString);
    setCopiedKey('vercel');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const configuredCount = Object.values(values).filter(v => v && v.length > 0).length;
  const totalRequired = apiCategories.flatMap(c => c.variables).filter(v => v.required).length;
  const configuredRequired = apiCategories
    .flatMap(c => c.variables)
    .filter(v => v.required && values[v.key])
    .length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            API Настройки
          </h1>
          <p className="text-gray-400 mt-1">
            Управление API ключами и переменными окружения
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateVercelEnvString}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            {copiedKey === 'vercel' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Export для Vercel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              hasChanges
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Сохранить
          </button>
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
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-gray-400 text-sm">Настроено</span>
          </div>
          <div className="text-3xl font-bold">{configuredCount}</div>
          <div className="text-sm text-gray-400 mt-1">переменных</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Обязательные</span>
          </div>
          <div className="text-3xl font-bold">
            {configuredRequired}/{totalRequired}
          </div>
          <div className={`text-sm mt-1 ${configuredRequired === totalRequired ? 'text-emerald-400' : 'text-amber-400'}`}>
            {configuredRequired === totalRequired ? 'Все настроены' : 'Требуется настройка'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Категории</span>
          </div>
          <div className="text-3xl font-bold">{apiCategories.length}</div>
          <div className="text-sm text-gray-400 mt-1">сервисов</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-gray-400 text-sm">Статус</span>
          </div>
          <div className="text-xl font-bold text-emerald-400">Активно</div>
          <div className="text-sm text-gray-400 mt-1">API работает</div>
        </motion.div>
      </div>

      {/* Vercel Integration Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-5 border border-blue-500/20 mb-8"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Settings className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Интеграция с Vercel</h3>
            <p className="text-gray-400 text-sm mb-3">
              Все переменные хранятся в базе данных и загружаются при старте приложения. 
              В Vercel нужно добавить только <code className="bg-white/10 px-2 py-0.5 rounded">CONFIG_API_URL</code> — 
              URL вашего API для загрузки конфига.
            </p>
            <div className="flex items-center gap-3">
              <code className="bg-white/10 px-3 py-1.5 rounded-lg text-sm">
                CONFIG_API_URL=https://your-api.com/api/config
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('CONFIG_API_URL=https://your-api.com/api/config');
                  setCopiedKey('config-url');
                  setTimeout(() => setCopiedKey(null), 2000);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copiedKey === 'config-url' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <div className="space-y-4">
        {apiCategories.map((category, index) => {
          const colors = colorClasses[category.color];
          const isExpanded = expandedCategory === category.id;
          const configuredInCategory = category.variables.filter(v => values[v.key]).length;
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl border border-white/5 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <category.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-400">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    configuredInCategory === category.variables.length
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : configuredInCategory > 0
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {configuredInCategory}/{category.variables.length}
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
              </button>

              {/* Variables */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-5 space-y-4">
                      {category.variables.map((variable) => {
                        const isVisible = visibleKeys.has(variable.key);
                        const value = values[variable.key] || '';
                        const isSensitive = variable.sensitive;
                        
                        return (
                          <div key={variable.key} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 text-sm font-medium">
                                {variable.label}
                                {variable.required && (
                                  <span className="text-red-400 text-xs">*</span>
                                )}
                                {isSensitive && (
                                  <Lock className="w-3 h-3 text-amber-400" />
                                )}
                              </label>
                              {variable.link && (
                                <a
                                  href={variable.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                  Получить ключ
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type={isSensitive && !isVisible ? 'password' : 'text'}
                                  value={value}
                                  onChange={(e) => handleChange(variable.key, e.target.value)}
                                  placeholder={variable.default || `Введите ${variable.label}`}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 font-mono text-sm"
                                />
                                {value && (
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {isSensitive && (
                                      <button
                                        onClick={() => toggleVisibility(variable.key)}
                                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                      >
                                        {isVisible ? (
                                          <EyeOff className="w-4 h-4 text-gray-400" />
                                        ) : (
                                          <Eye className="w-4 h-4 text-gray-400" />
                                        )}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => copyToClipboard(variable.key, value)}
                                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                    >
                                      {copiedKey === variable.key ? (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-4 h-4 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <code className="text-xs text-gray-500 font-mono">{variable.key}</code>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Variables Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Пользовательские переменные</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
        <p className="text-gray-400 text-sm">
          Добавляйте собственные переменные окружения для кастомных интеграций
        </p>
      </motion.div>
    </div>
  );
}

