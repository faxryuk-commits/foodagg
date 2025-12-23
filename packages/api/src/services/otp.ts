import { prisma } from '@food-platform/database';
import crypto from 'crypto';

// OTP Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

export type OTPChannel = 'sms' | 'email' | 'telegram';

interface SendOTPResult {
  success: boolean;
  message: string;
  expiresAt: Date;
  channel: OTPChannel;
}

// Generate random OTP code
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Store OTP in database
async function storeOTP(
  identifier: string,
  channel: OTPChannel,
  code: string
): Promise<Date> {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  
  // Delete any existing OTP for this identifier
  await prisma.oTPCode.deleteMany({
    where: { identifier, channel },
  });
  
  // Create new OTP
  await prisma.oTPCode.create({
    data: {
      identifier,
      channel,
      code,
      expiresAt,
    },
  });
  
  return expiresAt;
}

// Verify OTP
export async function verifyOTP(
  identifier: string,
  channel: OTPChannel,
  code: string
): Promise<{ valid: boolean; message: string }> {
  const otpRecord = await prisma.oTPCode.findFirst({
    where: {
      identifier,
      channel,
      code,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
  });
  
  if (!otpRecord) {
    return { valid: false, message: 'Неверный или просроченный код' };
  }
  
  // Mark as used
  await prisma.oTPCode.update({
    where: { id: otpRecord.id },
    data: { usedAt: new Date() },
  });
  
  return { valid: true, message: 'Код подтверждён' };
}

// Check cooldown
async function checkCooldown(identifier: string, channel: OTPChannel): Promise<boolean> {
  const recentOTP = await prisma.oTPCode.findFirst({
    where: {
      identifier,
      channel,
      createdAt: {
        gt: new Date(Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000),
      },
    },
  });
  
  return !recentOTP;
}

// ============================================
// SMS Provider
// ============================================
async function sendSMS(phone: string, message: string): Promise<boolean> {
  const provider = process.env.SMS_PROVIDER || 'playmobile';
  
  try {
    switch (provider) {
      case 'playmobile':
        return await sendPlayMobileSMS(phone, message);
      case 'eskiz':
        return await sendEskizSMS(phone, message);
      case 'twilio':
        return await sendTwilioSMS(phone, message);
      default:
        console.log(`[SMS] Would send to ${phone}: ${message}`);
        return true; // Dev mode
    }
  } catch (error) {
    console.error('[SMS] Failed to send:', error);
    return false;
  }
}

// PlayMobile (Uzbekistan)
async function sendPlayMobileSMS(phone: string, message: string): Promise<boolean> {
  const response = await fetch('https://api.playmobile.uz/v1/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.PLAYMOBILE_LOGIN}:${process.env.PLAYMOBILE_PASSWORD}`
      ).toString('base64')}`,
    },
    body: JSON.stringify({
      messages: [{
        recipient: phone.replace('+', ''),
        'message-id': crypto.randomUUID(),
        sms: {
          originator: process.env.PLAYMOBILE_ORIGINATOR || 'FoodPlatform',
          content: { text: message },
        },
      }],
    }),
  });
  
  return response.ok;
}

// Eskiz (Uzbekistan)
async function sendEskizSMS(phone: string, message: string): Promise<boolean> {
  // Get token first
  const tokenResponse = await fetch('https://notify.eskiz.uz/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ESKIZ_EMAIL,
      password: process.env.ESKIZ_PASSWORD,
    }),
  });
  
  const tokenData = await tokenResponse.json();
  if (!tokenData.data?.token) return false;
  
  const response = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenData.data.token}`,
    },
    body: JSON.stringify({
      mobile_phone: phone.replace('+', ''),
      message,
      from: process.env.ESKIZ_SENDER || 'FoodPlatform',
    }),
  });
  
  return response.ok;
}

// Twilio (International)
async function sendTwilioSMS(phone: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        To: phone,
        From: fromNumber!,
        Body: message,
      }),
    }
  );
  
  return response.ok;
}

// ============================================
// Email Provider
// ============================================
async function sendEmail(email: string, subject: string, html: string): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || 'smtp';
  
  try {
    switch (provider) {
      case 'resend':
        return await sendResendEmail(email, subject, html);
      case 'sendgrid':
        return await sendSendGridEmail(email, subject, html);
      case 'smtp':
      default:
        return await sendSMTPEmail(email, subject, html);
    }
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

// Resend
async function sendResendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'noreply@foodplatform.uz',
      to,
      subject,
      html,
    }),
  });
  
  return response.ok;
}

// SendGrid
async function sendSendGridEmail(to: string, subject: string, html: string): Promise<boolean> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.EMAIL_FROM || 'noreply@foodplatform.uz' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  
  return response.ok;
}

// SMTP (using nodemailer-compatible approach with fetch)
async function sendSMTPEmail(to: string, subject: string, html: string): Promise<boolean> {
  // For SMTP, we'd typically use nodemailer, but for now just log
  console.log(`[Email] Would send to ${to}: ${subject}`);
  console.log(`[Email] HTML:`, html);
  return true; // Dev mode
}

// ============================================
// Telegram Provider
// ============================================
async function sendTelegram(chatId: string, message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.log(`[Telegram] Would send to ${chatId}: ${message}`);
    return true; // Dev mode
  }
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('[Telegram] Failed to send:', error);
    return false;
  }
}

// ============================================
// Main OTP Functions
// ============================================

// Send OTP via SMS
export async function sendOTPviaSMS(phone: string): Promise<SendOTPResult> {
  const canSend = await checkCooldown(phone, 'sms');
  if (!canSend) {
    return {
      success: false,
      message: `Подождите ${OTP_RESEND_COOLDOWN_SECONDS} секунд перед повторной отправкой`,
      expiresAt: new Date(),
      channel: 'sms',
    };
  }
  
  const code = generateOTP();
  const expiresAt = await storeOTP(phone, 'sms', code);
  
  const message = `Ваш код подтверждения: ${code}\n\nДействителен ${OTP_EXPIRY_MINUTES} минут.\nFood Platform`;
  const sent = await sendSMS(phone, message);
  
  // In development, always return success and include code
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (!sent && !isDev) {
    return {
      success: false,
      message: 'Не удалось отправить SMS. Попробуйте другой способ.',
      expiresAt: new Date(),
      channel: 'sms',
    };
  }
  
  return {
    success: true,
    message: isDev 
      ? `Код отправлен на ${phone.slice(0, 4)}***${phone.slice(-4)}. Код: ${code} (DEV)`
      : `Код отправлен на ${phone.slice(0, 4)}***${phone.slice(-4)}`,
    expiresAt,
    channel: 'sms',
    ...(isDev && { devCode: code }), // Include code in dev mode
  };
}

// Send OTP via Email
export async function sendOTPviaEmail(email: string): Promise<SendOTPResult> {
  const canSend = await checkCooldown(email, 'email');
  if (!canSend) {
    return {
      success: false,
      message: `Подождите ${OTP_RESEND_COOLDOWN_SECONDS} секунд перед повторной отправкой`,
      expiresAt: new Date(),
      channel: 'email',
    };
  }
  
  const code = generateOTP();
  const expiresAt = await storeOTP(email, 'email', code);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #f97316; margin-bottom: 20px;">🍕 Food Platform</h2>
      <p>Ваш код подтверждения:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${code}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Код действителен ${OTP_EXPIRY_MINUTES} минут.<br>
        Если вы не запрашивали код, проигнорируйте это письмо.
      </p>
    </div>
  `;
  
  const sent = await sendEmail(email, `${code} — код подтверждения Food Platform`, html);
  
  // In development, always return success and include code
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (!sent && !isDev) {
    return {
      success: false,
      message: 'Не удалось отправить email. Попробуйте другой способ.',
      expiresAt: new Date(),
      channel: 'email',
    };
  }
  
  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
  return {
    success: true,
    message: isDev 
      ? `Код отправлен на ${maskedEmail}. Код: ${code} (DEV)`
      : `Код отправлен на ${maskedEmail}`,
    expiresAt,
    channel: 'email',
    ...(isDev && { devCode: code }), // Include code in dev mode
  };
}

// Send OTP via Telegram
export async function sendOTPviaTelegram(telegramId: string): Promise<SendOTPResult> {
  const canSend = await checkCooldown(telegramId, 'telegram');
  if (!canSend) {
    return {
      success: false,
      message: `Подождите ${OTP_RESEND_COOLDOWN_SECONDS} секунд перед повторной отправкой`,
      expiresAt: new Date(),
      channel: 'telegram',
    };
  }
  
  const code = generateOTP();
  const expiresAt = await storeOTP(telegramId, 'telegram', code);
  
  const message = `🔐 <b>Код подтверждения</b>\n\n<code>${code}</code>\n\n⏱ Действителен ${OTP_EXPIRY_MINUTES} минут\n\n🍕 Food Platform`;
  const sent = await sendTelegram(telegramId, message);
  
  if (!sent) {
    return {
      success: false,
      message: 'Не удалось отправить сообщение в Telegram. Попробуйте другой способ.',
      expiresAt: new Date(),
      channel: 'telegram',
    };
  }
  
  return {
    success: true,
    message: 'Код отправлен в Telegram',
    expiresAt,
    channel: 'telegram',
  };
}

// Get Telegram auth link
export function getTelegramAuthLink(userId?: string): string {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'FoodPlatformBot';
  const startParam = userId ? `auth_${userId}` : 'auth';
  return `https://t.me/${botUsername}?start=${startParam}`;
}

