'use client';

import type { Locale } from '@/lib/i18n/config';

interface NewsletterCTAProps {
  locale: Locale;
}

export function NewsletterCTA({ locale }: NewsletterCTAProps) {
  return (
    <div className="relative overflow-hidden rounded-[24px] py-14 px-11 text-center mx-auto max-w-[780px] mt-8 reveal"
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.13), rgba(236,72,153,0.09))',
        border: '1px solid rgba(124,58,237,0.18)',
      }}
    >
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 30% 50%, rgba(124,58,237,0.07) 0%, transparent 50%),
            radial-gradient(circle at 70% 50%, rgba(236,72,153,0.05) 0%, transparent 50%)
          `,
          animation: 'ctaFloat 8s ease-in-out infinite alternate',
        }}
      />
      <div className="relative">
        <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-bold mb-2.5">
          {locale === 'en' ? "Don't Miss Any Dream Story" : '不要错过任何一个梦想故事'}
        </h2>
        <p className="text-text-secondary mb-7 leading-relaxed">
          {locale === 'en'
            ? 'Subscribe to DreamPulse and receive a carefully curated newsletter every morning. 5 minutes to understand the world.'
            : '订阅 DreamPulse，每天早晨收到一封精心编辑的新闻信，用 5 分钟了解这个世界的温度。'}
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex gap-2.5 max-w-[470px] mx-auto flex-col sm:flex-row"
        >
          <input
            type="email"
            placeholder={locale === 'en' ? 'Enter your email' : '输入你的邮箱地址'}
            className="flex-1 px-[18px] py-3.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-text-primary text-[0.93rem] outline-none backdrop-blur-md transition-all placeholder-[rgba(245,243,255,0.32)] focus:border-purple-light focus:shadow-[0_0_0_3px_rgba(167,139,250,0.12)]"
          />
          <button
            type="submit"
            className="px-[26px] py-3.5 rounded-full bg-gradient-to-r from-purple-mid to-pink-warm text-white font-semibold text-[0.93rem] transition-all shadow-[0_4px_20px_rgba(124,58,237,0.32)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(124,58,237,0.52)] whitespace-nowrap"
          >
            {locale === 'en' ? 'Free Subscribe' : '免费订阅'}
          </button>
        </form>
      </div>
    </div>
  );
}
