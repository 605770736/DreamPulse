'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

/** Toast 类型 */
type ToastType = 'success' | 'error' | 'info';

/** Toast 数据 */
export interface ToastData {
  /** 唯一标识 */
  id: string;
  /** Toast 类型 */
  type: ToastType;
  /** 消息内容 */
  message: string;
  /** 自动消失时间（毫秒），默认 3000 */
  duration?: number;
}

interface ToastProps {
  /** Toast 数据 */
  toast: ToastData;
  /** 关闭回调 */
  onClose: (id: string) => void;
}

/** 类型样式映射 */
const typeStyles: Record<ToastType, string> = {
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
};

/** 类型图标 */
const typeIcons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

/**
 * 单个 Toast 通知组件
 */
export function Toast({ toast, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 入场动画
    requestAnimationFrame(() => setVisible(true));

    // 自动消失
    const duration = toast.duration ?? 3000;
    const timer = setTimeout(() => {
      setVisible(false);
      // 等待退场动画完成
      setTimeout(() => onClose(toast.id), 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-dream border px-4 py-3 text-sm shadow-lg transition-all duration-200',
        typeStyles[toast.type],
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      {typeIcons[toast.type]}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose(toast.id), 200);
        }}
        className="shrink-0 text-current opacity-50 transition-opacity hover:opacity-100"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}
