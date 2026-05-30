'use client';

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import { Toast, type ToastData } from '@/components/common/Toast';

/** 认证用户类型（与 useAuth 一致） */
interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  ageVerified?: boolean;
  locale?: string;
}

/** 认证上下文类型 */
interface AuthContextType {
  /** 当前用户（null 表示未登录） */
  user: AuthUser | null;
  /** 是否已登录 */
  isAuthenticated: boolean;
  /** 是否加载中 */
  isLoading: boolean;
  /** 刷新认证状态 */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  refresh: async () => {},
});

/**
 * 认证上下文 Provider
 * 封装 next-auth 的 SessionProvider，提供 user/isAuthenticated 给子树
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** 从服务端获取当前用户 */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/session');
      const session = await res.json() as Record<string, unknown>;
      const sessionUser = session.user as Record<string, unknown> | undefined;
      if (sessionUser) {
        setUser({
          id: (sessionUser.id as string) ?? '',
          name: (sessionUser.name as string) ?? null,
          email: (sessionUser.email as string) ?? null,
          image: (sessionUser.image as string) ?? null,
          role: (sessionUser.role as string) ?? 'user',
          ageVerified: (sessionUser.ageVerified as boolean) ?? false,
          locale: (sessionUser.locale as string) ?? 'zh',
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化加载
  useState(() => {
    refresh();
  });

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * 在客户端组件中获取认证状态
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, isLoading } = useAuth();
 * if (!isAuthenticated) return <LoginForm />;
 * return <div>Hello {user.name}</div>;
 * ```
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext 必须在 AuthProvider 内使用');
  }
  return context;
}
