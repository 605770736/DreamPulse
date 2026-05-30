/**
 * Zod 验证 Schema
 * 用于 API 路由入参校验，确保类型安全
 */

import { z } from 'zod';

/**
 * 文章列表查询参数验证
 */
export const articleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().optional(),
  lang: z.enum(['zh', 'en']).optional(),
});

/**
 * 创建文章请求体验证
 */
export const createArticleSchema = z.object({
  title: z.string().min(1).max(200, '标题不能超过200字'),
  titleEn: z.string().max(200).optional(),
  summary: z.string().min(1).max(1000, '摘要不能超过1000字'),
  summaryEn: z.string().max(1000).optional(),
  originalUrl: z.string().url('请输入有效的URL'),
  originalSource: z.string().min(1).max(100),
  categoryId: z.string().min(1),
  language: z.enum(['zh', 'en']).default('zh'),
  coverImage: z.string().url().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived', 'rejected']).default('published'),
});

/**
 * 更新文章请求体验证
 */
export const updateArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleEn: z.string().max(200).optional(),
  summary: z.string().min(1).max(1000).optional(),
  summaryEn: z.string().max(1000).optional(),
  coverImage: z.string().url().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived', 'rejected']).optional(),
});

/**
 * 创建评论请求体验证
 */
export const createCommentSchema = z.object({
  articleId: z.string().min(1, '文章 ID 不能为空'),
  content: z.string().min(1, '评论内容不能为空').max(2000, '评论不能超过2000字'),
  parentId: z.string().optional().nullable(),
});

/**
 * 更新评论状态验证（管理员）
 */
export const updateCommentStatusSchema = z.object({
  status: z.enum(['published', 'hidden', 'deleted']),
});

/**
 * 点赞请求体验证
 */
export const likeSchema = z.object({
  targetType: z.enum(['article', 'comment']),
  targetId: z.string().min(1, '目标 ID 不能为空'),
});

/**
 * 取消点赞查询参数验证
 */
export const unlikeQuerySchema = z.object({
  targetType: z.enum(['article', 'comment']),
  targetId: z.string().min(1),
});

/**
 * 收藏文章请求体验证
 */
export const favoriteSchema = z.object({
  articleId: z.string().min(1, '文章 ID 不能为空'),
});

/**
 * 取消收藏查询参数验证
 */
export const unfavoriteQuerySchema = z.object({
  articleId: z.string().min(1),
});

/**
 * 关注用户请求体验证
 */
export const followSchema = z.object({
  userId: z.string().min(1, '用户 ID 不能为空'),
});

/**
 * 取消关注查询参数验证
 */
export const unfollowQuerySchema = z.object({
  userId: z.string().min(1),
});

/**
 * 更新用户资料请求体验证
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1, '昵称不能为空').max(50, '昵称不能超过50字').optional(),
  avatarUrl: z.string().url('请输入有效的URL').optional().nullable(),
  locale: z.enum(['zh', 'en']).optional(),
});

/**
 * 年龄验证——发送验证码请求体验证
 */
export const ageVerifySendSchema = z.object({
  phone: z
    .string()
    .min(1, '手机号不能为空')
    .regex(/^\+\d{10,15}$/, '请输入国际格式手机号（如 +8613800138000）'),
});

/**
 * 年龄验证——验证请求体验证
 */
export const ageVerifyCheckSchema = z.object({
  phone: z
    .string()
    .min(1, '手机号不能为空')
    .regex(/^\+\d{10,15}$/, '请输入国际格式手机号'),
  code: z
    .string()
    .length(6, '验证码必须为6位数字')
    .regex(/^\d{6}$/, '验证码必须为6位数字'),
});

/**
 * 审核操作请求体验证
 */
export const auditActionSchema = z.object({
  targetType: z.enum(['article', 'comment', 'user']),
  targetId: z.string().min(1, '目标 ID 不能为空'),
  action: z.enum(['approve', 'reject', 'hide', 'delete', 'ban', 'unban']),
  reason: z.string().max(500).optional(),
});

/**
 * 管理员更新用户状态验证
 */
export const adminUpdateUserSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin', 'banned']).optional(),
  action: z.enum(['ban', 'unban']).optional(),
  reason: z.string().max(500).optional(),
});

/**
 * 创建版块请求体验证
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, '中文名称不能为空').max(50),
  nameEn: z.string().min(1, '英文名称不能为空').max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug 只能包含小写字母、数字和连字符'),
  icon: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isAdult: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

/**
 * 更新版块请求体验证
 */
export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  nameEn: z.string().min(1).max(50).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  icon: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isAdult: z.boolean().optional(),
  isVisible: z.boolean().optional(),
});

/**
 * 登录请求体验证
 */
export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
});

/**
 * 注册请求体验证
 */
export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位').max(100),
  name: z.string().min(1, '昵称不能为空').max(50),
});

/**
 * 分页查询通用验证
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
