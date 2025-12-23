'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Star,
  MoreVertical,
  Ban,
  Gift,
} from 'lucide-react';

const users = [
  {
    id: '1',
    name: 'Алишер Каримов',
    phone: '+998 90 123 4567',
    email: 'alisher@example.com',
    status: 'active',
    totalOrders: 47,
    totalSpent: 2450000,
    bonusBalance: 15000,
    createdAt: '2024-08-15',
    lastOrderAt: '2024-12-22',
  },
  {
    id: '2',
    name: 'Мария Иванова',
    phone: '+998 91 234 5678',
    email: 'maria@example.com',
    status: 'active',
    totalOrders: 23,
    totalSpent: 890000,
    bonusBalance: 5600,
    createdAt: '2024-10-01',
    lastOrderAt: '2024-12-23',
  },
  {
    id: '3',
    name: 'Тимур Рахимов',
    phone: '+998 93 345 6789',
    email: 'timur@example.com',
    status: 'blocked',
    totalOrders: 3,
    totalSpent: 120000,
    bonusBalance: 0,
    createdAt: '2024-11-20',
    lastOrderAt: '2024-11-25',
    blockReason: 'Мошенничество',
  },
  {
    id: '4',
    name: 'Диана Ким',
    phone: '+998 94 456 7890',
    email: 'diana@example.com',
    status: 'active',
    totalOrders: 89,
    totalSpent: 4560000,
    bonusBalance: 34500,
    createdAt: '2024-03-10',
    lastOrderAt: '2024-12-23',
  },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');

  const filteredUsers = users.filter(u => {
    if (filter !== 'all' && u.status !== filter) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    blocked: users.filter(u => u.status === 'blocked').length,
    totalRevenue: users.reduce((acc, u) => acc + u.totalSpent, 0),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Пользователи
          </h1>
          <p className="text-gray-400 mt-1">Управление клиентской базой</p>
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
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Всего</span>
          </div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-gray-400 text-sm">Активные</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{stats.active}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-red-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <UserX className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-gray-400 text-sm">Заблокированы</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.blocked}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Общая выручка</span>
          </div>
          <div className="text-2xl font-bold">{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'blocked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : 'Заблокированные'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-gray-400 text-sm font-medium p-4">Пользователь</th>
              <th className="text-left text-gray-400 text-sm font-medium p-4">Контакты</th>
              <th className="text-left text-gray-400 text-sm font-medium p-4">Заказы</th>
              <th className="text-left text-gray-400 text-sm font-medium p-4">Потрачено</th>
              <th className="text-left text-gray-400 text-sm font-medium p-4">Бонусы</th>
              <th className="text-left text-gray-400 text-sm font-medium p-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`border-b border-white/5 last:border-b-0 ${
                  user.status === 'blocked' ? 'opacity-50' : ''
                }`}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        с {new Date(user.createdAt).toLocaleDateString('ru')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="flex items-center gap-1 text-gray-300">
                      <Phone className="w-3 h-3" /> {user.phone}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Mail className="w-3 h-3" /> {user.email}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium">{user.totalOrders}</div>
                  <div className="text-sm text-gray-500">
                    Последний: {new Date(user.lastOrderAt).toLocaleDateString('ru')}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-emerald-400">
                    {(user.totalSpent / 1000).toFixed(0)}K сум
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-orange-400">
                    <Gift className="w-4 h-4" />
                    {user.bonusBalance.toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {user.status === 'active' ? (
                      <button className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                        <Ban className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="p-2 hover:bg-emerald-500/20 rounded-lg text-gray-400 hover:text-emerald-400 transition-colors">
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

