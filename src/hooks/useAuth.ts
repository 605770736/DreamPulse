'use client';

/**
 * 认证状态 Hook
 * 在客户端组件中获取当前用户的认证状态
 */

import { useSession } from 'next-auth/react';

/**
 * 认证状态 Hook
 * 封装 next-auth 的 useSession，提供项目所需的用户信息
 *
 * @returns 认证状态和用户信息
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, isLoading, role, isAgeVerified } = useAuth();
 *
 * if (isLoading) return <Skeleton />;
 * if (!isAuthenticated) return <LoginForm />;
 * ```
 */
export function useAuth() {
  const { data: session, status, update } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // 从 session 中提取用户信息
  const user = session?.user ?? null;
  const role = (user as Record<string, unknown>)?.role as string | undefined;
  const locale = (user as Record<string, unknown>)?.locale as string | undefined;
  const ageVerified = (user as Record<string, unknown>)?.ageVerified as boolean | undefined;

  // 角色判断
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator' || role === 'admin';

  return {
    /** 当前用户对象 */
    user,
    /** 是否已认证 */
    isAuthenticated,
    /** 是否加载中 */
    isLoading,
    /** 用户角色 */
    role: role ?? 'user',
    /** 用户语言偏好 */
    locale: locale ?? 'zh',
    /** 是否已通过年龄认证 */
    isAgeVerified: ageVerified ?? false,
    /** 是否为管理员 */
    isAdmin,
    /** 是否为管理员或版主 */
    isModerator,
    /** 刷新 session 数据 */
    update,
  };
}
