'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Store,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  Save,
  ToggleLeft,
  ToggleRight,
  Bell,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

export default function MerchantSettingsPage() {
  const [settings, setSettings] = useState({
    name: 'Плов Центр',
    description: 'Лучший плов в городе. Готовим по традиционным рецептам.',
    phone: '+998 71 123 4567',
    email: 'plovcentr@example.com',
    address: 'ул. Навои, 45, Ташкент',
    workingHours: {
      open: '09:00',
      close: '23:00',
    },
    minOrder: 30000,
    deliveryTime: 30,
    isOpen: true,
    autoAccept: false,
    soundNotifications: true,
    emailNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{settings.name}</h1>
              <p className={`text-xs ${settings.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {settings.isOpen ? '● Открыто' : '● Закрыто'}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link href="/" className="sidebar-item w-full flex items-center gap-2">
            <Store className="w-5 h-5" />
            Заказы
          </Link>
          <Link href="/menu" className="sidebar-item w-full flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Меню
          </Link>
          <Link href="/analytics" className="sidebar-item w-full flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Аналитика
          </Link>
          <Link href="/settings" className="sidebar-item-active w-full flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Настройки
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
              <p className="text-gray-500">Управление вашим заведением</p>
            </div>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? 'Сохранено!' : 'Сохранить'}
            </button>
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm mb-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4">Логотип</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-4xl">
                🍲
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Camera className="w-4 h-4" />
                Загрузить фото
              </button>
            </div>
          </motion.div>

          {/* General Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm mb-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4">Основная информация</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Название</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Описание</label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Телефон</label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Адрес</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Working Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm mb-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4">Режим работы</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Заведение открыто</span>
              <button
                onClick={() => setSettings({ ...settings, isOpen: !settings.isOpen })}
                className="text-3xl"
              >
                {settings.isOpen ? (
                  <ToggleRight className="w-12 h-12 text-green-500" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-gray-400" />
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Открытие</label>
                <input
                  type="time"
                  value={settings.workingHours.open}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workingHours: { ...settings.workingHours, open: e.target.value },
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Закрытие</label>
                <input
                  type="time"
                  value={settings.workingHours.close}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workingHours: { ...settings.workingHours, close: e.target.value },
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Order Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm mb-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4">Заказы</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Минимальный заказ (сум)</label>
                  <input
                    type="number"
                    value={settings.minOrder}
                    onChange={(e) => setSettings({ ...settings, minOrder: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Время готовки (мин)</label>
                  <input
                    type="number"
                    value={settings.deliveryTime}
                    onChange={(e) => setSettings({ ...settings, deliveryTime: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-gray-700">Автоприём заказов</span>
                  <p className="text-sm text-gray-500">Заказы будут автоматически приниматься</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoAccept: !settings.autoAccept })}
                  className="text-3xl"
                >
                  {settings.autoAccept ? (
                    <ToggleRight className="w-12 h-12 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900 mb-4">Уведомления</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Звуковые уведомления</span>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, soundNotifications: !settings.soundNotifications })
                  }
                >
                  {settings.soundNotifications ? (
                    <ToggleRight className="w-12 h-12 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Email уведомления</span>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, emailNotifications: !settings.emailNotifications })
                  }
                >
                  {settings.emailNotifications ? (
                    <ToggleRight className="w-12 h-12 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

