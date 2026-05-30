'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Toast, type ToastData } from '@/components/common/Toast';

/** Toast 上下文类型 */
interface ToastContextType {
  /** 显示成功提示 */
  showSuccess: (message: string, duration?: number) => void;
  /** 显示错误提示 */
  showError: (message: string, duration?: number) => void;
  /** 显示信息提示 */
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
});

/**
 * Toast 上下文 Provider
 * 管理 toast 队列，提供 showSuccess/showError/showInfo 方法
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  /** 添加 toast */
  const addToast = useCallback((type: ToastData['type'], message: string, duration?: number) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  /** 移除 toast */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** 显示成功提示 */
  const showSuccess = useCallback((message: string, duration?: number) => {
    addToast('success', message, duration);
  }, [addToast]);

  /** 显示错误提示 */
  const showError = useCallback((message: string, duration?: number) => {
    addToast('error', message, duration);
  }, [addToast]);

  /** 显示信息提示 */
  const showInfo = useCallback((message: string, duration?: number) => {
    addToast('info', message, duration);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}

      {/* Toast 容器 */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 * 在客户端组件中显示 toast 通知
 *
 * @example
 * ```tsx
 * const { showSuccess, showError, showInfo } = useToast();
 * showSuccess('操作成功');
 * showError('网络错误');
 * showInfo('正在处理...');
 * ```
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast 必须在 ToastProvider 内使用');
  }
  return context;
}
