'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, Loader2, Shield, Gift, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 7) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 9) {
      setPhone(formatted);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePhoneSubmit = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep('otp');
    setCountdown(60);
    
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleOtpSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    // Check if new user
    setStep('name'); // or redirect if existing user
  };

  const handleNameSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    // Redirect to home
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">🍕</span>
            </motion.div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Food Platform</h1>
          <p className="text-gray-400 mt-1">Доставка еды за 30 минут</p>
        </div>

        {/* Card */}
        <motion.div
          layout
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
        >
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-white mb-2">Войти или создать аккаунт</h2>
                <p className="text-gray-400 mb-6">Введите номер телефона для входа</p>
                
                <div className="relative mb-6">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                    <span className="text-lg">🇺🇿</span>
                    <span>+998</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="90 123 45 67"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-28 pr-4 py-4 text-white text-lg placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>

                <button
                  onClick={handlePhoneSubmit}
                  disabled={phone.replace(/\s/g, '').length !== 9 || loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-pink-600 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Продолжить
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Benefits */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <Gift className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-xs text-gray-400">Бонусы за заказы</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-xs text-gray-400">Быстрая доставка</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <Shield className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-xs text-gray-400">Безопасно</div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-white mb-2">Введите код</h2>
                <p className="text-gray-400 mb-6">
                  Отправили SMS на +998 {phone}
                </p>
                
                <div className="flex gap-2 mb-6 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          const prevInput = document.getElementById(`otp-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-white text-xl font-bold focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  ))}
                </div>

                <button
                  onClick={handleOtpSubmit}
                  disabled={otp.some(d => !d) || loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-pink-600 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Подтвердить'
                  )}
                </button>

                <div className="mt-4 text-center">
                  {countdown > 0 ? (
                    <span className="text-gray-400">
                      Отправить повторно через {countdown} сек
                    </span>
                  ) : (
                    <button className="text-orange-400 hover:text-orange-300">
                      Отправить код повторно
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setStep('phone')}
                  className="mt-4 w-full text-gray-400 hover:text-white transition-colors"
                >
                  ← Изменить номер
                </button>
              </motion.div>
            )}

            {step === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-white mb-2">Как вас зовут?</h2>
                <p className="text-gray-400 mb-6">
                  Введите ваше имя для персонализации
                </p>
                
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors mb-6"
                />

                <button
                  onClick={handleNameSubmit}
                  disabled={!name.trim() || loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-pink-600 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Начать
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Terms */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Продолжая, вы соглашаетесь с{' '}
          <a href="#" className="text-orange-400 hover:underline">условиями использования</a>
          {' '}и{' '}
          <a href="#" className="text-orange-400 hover:underline">политикой конфиденциальности</a>
        </p>
      </motion.div>
    </div>
  );
}

