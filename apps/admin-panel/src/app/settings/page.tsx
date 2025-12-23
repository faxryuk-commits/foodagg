'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Globe,
  Shield,
  Database,
  Mail,
  Smartphone,
  Palette,
  Save,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Link from 'next/link';

const settingsSections = [
  {
    id: 'general',
    title: 'Общие',
    icon: Settings,
    settings: [
      { key: 'platform_name', label: 'Название платформы', type: 'text', value: 'Food Platform' },
      { key: 'support_email', label: 'Email поддержки', type: 'email', value: 'support@foodplatform.uz' },
      { key: 'support_phone', label: 'Телефон поддержки', type: 'text', value: '+998 71 123 4567' },
    ],
  },
  {
    id: 'orders',
    title: 'Заказы',
    icon: Database,
    settings: [
      { key: 'min_order', label: 'Минимальный заказ (сум)', type: 'number', value: '30000' },
      { key: 'sla_accept', label: 'SLA на принятие (минуты)', type: 'number', value: '5' },
      { key: 'sla_ready', label: 'SLA на готовность (минуты)', type: 'number', value: '30' },
      { key: 'auto_cancel_timeout', label: 'Авто-отмена (минуты)', type: 'number', value: '10' },
    ],
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    icon: Bell,
    settings: [
      { key: 'email_notifications', label: 'Email уведомления', type: 'toggle', value: true },
      { key: 'sms_notifications', label: 'SMS уведомления', type: 'toggle', value: true },
      { key: 'push_notifications', label: 'Push уведомления', type: 'toggle', value: true },
    ],
  },
  {
    id: 'payments',
    title: 'Платежи',
    icon: Shield,
    settings: [
      { key: 'platform_commission', label: 'Комиссия платформы (%)', type: 'number', value: '15' },
      { key: 'default_cashback', label: 'Кэшбэк по умолчанию (%)', type: 'number', value: '5' },
      { key: 'cash_payment', label: 'Оплата наличными', type: 'toggle', value: true },
      { key: 'card_payment', label: 'Оплата картой', type: 'toggle', value: true },
    ],
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    settingsSections.forEach(section => {
      section.settings.forEach(setting => {
        initial[setting.key] = setting.value;
      });
    });
    return initial;
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // Save to API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Настройки
          </h1>
          <p className="text-gray-400 mt-1">Конфигурация платформы</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Сохранено!' : 'Сохранить'}
        </button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Link href="/settings/api">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="font-medium">API Ключи</div>
                <div className="text-sm text-gray-400">Управление интеграциями</div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl border border-white/5"
          >
            <div className="flex items-center gap-3 p-5 border-b border-white/5">
              <div className="p-2 bg-white/5 rounded-lg">
                <section.icon className="w-5 h-5 text-gray-400" />
              </div>
              <h2 className="font-semibold">{section.title}</h2>
            </div>

            <div className="p-5 space-y-4">
              {section.settings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <label className="text-gray-300">{setting.label}</label>
                  
                  {setting.type === 'toggle' ? (
                    <button
                      onClick={() => handleChange(setting.key, !settings[setting.key])}
                      className="text-2xl"
                    >
                      {settings[setting.key] ? (
                        <ToggleRight className="w-10 h-10 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-500" />
                      )}
                    </button>
                  ) : (
                    <input
                      type={setting.type}
                      value={settings[setting.key]}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/20"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

