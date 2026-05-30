/**
 * 认证中间件工具
 * 提供获取当前用户、检查角色、检查年龄认证的工具函数
 */

import { auth } from './config';
import type { UserRole } from '@/types/user';

/**
 * 获取当前登录用户
 * 在 Server Component 和 API Route 中使用
 *
 * @returns 用户对象，未登录返回 null
 *
 * @example
 * ```ts
 * const user = await getCurrentUser();
 * if (!user) {
 *   return Response.json({ code: 401, data: null, message: '未登录' });
 * }
 * ```
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session.user;
}

/**
 * 要求用户已登录，否则抛出错误
 * 适用于需要认证的 API 路由
 *
 * @returns 用户对象
 * @throws 如果用户未登录
 *
 * @example
 * ```ts
 * const user = await requireAuth();
 * // 确保之后的代码用户一定已登录
 * ```
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * 检查用户是否拥有指定角色
 *
 * @param user - 用户对象
 * @param roles - 允许的角色列表
 * @returns 是否拥有权限
 *
 * @example
 * ```ts
 * const user = await requireAuth();
 * if (!hasRole(user, 'admin', 'moderator')) {
 *   return Response.json({ code: 403, data: null, message: '无权限' });
 * }
 * ```
 */
export function hasRole(
  user: object,
  ...roles: UserRole[]
): boolean {
  const userRole = (user as Record<string, unknown>).role as UserRole | undefined;
  if (!userRole) {
    return false;
  }
  return roles.includes(userRole);
}

/**
 * 要求用户拥有管理员角色
 * 适用于后台管理 API 路由
 *
 * @returns 用户对象
 * @throws 如果用户未登录或非管理员
 *
 * @example
 * ```ts
 * const admin = await requireAdmin();
 * ```
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (!hasRole(user, 'admin')) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

/**
 * 检查用户是否已通过年龄认证
 *
 * @param user - 用户对象
 * @returns 是否已通过年龄认证
 *
 * @example
 * ```ts
 * const user = await requireAuth();
 * if (!isAgeVerified(user)) {
 *   return Response.json({ code: 403, data: null, message: '需要年龄认证' });
 * }
 * ```
 */
export function isAgeVerified(user: object): boolean {
  return (user as Record<string, unknown>).ageVerified === true;
}

/**
 * 要求用户已通过年龄认证
 * 适用于成人版块内容的访问控制
 *
 * @returns 用户对象
 * @throws 如果用户未登录或未通过年龄认证
 */
export async function requireAgeVerified() {
  const user = await requireAuth();
  if (!isAgeVerified(user)) {
    throw new Error('AGE_VERIFICATION_REQUIRED');
  }
  return user;
}
