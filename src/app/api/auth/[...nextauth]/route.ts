/**
 * Auth.js 路由处理器
 * 处理所有 /api/auth/* 路径的请求
 */

import { handlers } from '@/lib/auth/config';

export const { GET, POST } = handlers;
