'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  ChevronRight,
  ChefHat,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type AuthChannel = 'sms' | 'email' | 'telegram';
type AuthStep = 'select' | 'input' | 'otp';

export default function MerchantLoginPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<AuthStep>('select');
  const [channel, setChannel] = useState<AuthChannel>('sms');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/telegram/link`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTelegramLink(data.data.link);
        }
      })
      .catch(() => {});
  }, []);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 7) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7, 9)}`;
  };

  const handleSendOTP = async () => {
    setError(null);
    setIsLoading(true);
    
    let fullIdentifier = identifier;
    if (channel === 'sms') {
      fullIdentifier = '+998' + identifier.replace(/\s/g, '');
    }
    
    try {
      const response = await fetch(`${API_URL}/api/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: fullIdentifier, channel }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Не удалось отправить код');
      }
      
      setIdentifier(fullIdentifier);
      setStep('otp');
      setCountdown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel, code: otp }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Неверный код');
      }
      
      // Check role
      const user = data.data.user;
      if (user.role !== 'MERCHANT_OWNER' && user.role !== 'MERCHANT_STAFF') {
        throw new Error('Доступ только для владельцев ресторанов');
      }
      
      // Save tokens
      localStorage.setItem('food_platform_token', data.data.accessToken);
      localStorage.setItem('food_platform_refresh_token', data.data.refreshToken);
      localStorage.setItem('food_platform_user', JSON.stringify(user));
      
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      await fetch(`${API_URL}/api/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel }),
      });
      setCountdown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4 shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <ChefHat className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">Merchant Portal</h1>
          <p className="text-gray-500 mt-1">Панель управления рестораном</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <AnimatePresence mode="wait">
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Выберите способ входа
                </h2>

                <button
                  onClick={() => { setChannel('sms'); setStep('input'); }}
                  className="w-full p-4 border border-gray-200 rounded-xl flex items-center gap-4 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">SMS</p>
                    <p className="text-sm text-gray-500">Получить код на телефон</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => { setChannel('email'); setStep('input'); }}
                  className="w-full p-4 border border-gray-200 rounded-xl flex items-center gap-4 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">Получить код на почту</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => telegramLink && window.open(telegramLink, '_blank')}
                  className="w-full p-4 border border-gray-200 rounded-xl flex items-center gap-4 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                    <Send className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Telegram</p>
                    <p className="text-sm text-gray-500">Войти через бота</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </motion.div>
            )}

            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setStep('select')}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </button>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {channel === 'sms' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Номер телефона
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                        <span>🇺🇿</span>
                        <span className="text-gray-600">+998</span>
                      </div>
                      <input
                        type="tel"
                        value={identifier}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          if (formatted.replace(/\s/g, '').length <= 9) {
                            setIdentifier(formatted);
                          }
                        }}
                        placeholder="90 123 45 67"
                        className="w-full border border-gray-300 rounded-xl pl-28 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {channel === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email адрес
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={
                    isLoading ||
                    (channel === 'sms' && identifier.replace(/\s/g, '').length !== 9) ||
                    (channel === 'email' && !identifier.includes('@'))
                  }
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Получить код'}
                </button>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setStep('input')}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </button>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Введите код</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Код отправлен на {channel === 'sms' ? 'номер' : 'почту'}
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  className="w-full text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoFocus
                />

                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Подтвердить'}
                </button>

                <div className="text-center">
                  <button
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isLoading}
                    className="text-sm text-orange-500 hover:text-orange-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `Отправить снова через ${countdown}с` : 'Отправить код снова'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          © 2024 Food Platform. Все права защищены.
        </p>
      </motion.div>
    </div>
  );
}
