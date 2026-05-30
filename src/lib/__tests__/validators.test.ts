/**
 * Zod Schema 验证器测试
 * 测试 src/lib/utils/validators.ts 中的所有 Schema
 */

import { describe, it, expect } from 'vitest';
import {
  articleListQuerySchema,
  createArticleSchema,
  updateArticleSchema,
  createCommentSchema,
  updateCommentStatusSchema,
  likeSchema,
  unlikeQuerySchema,
  favoriteSchema,
  unfavoriteQuerySchema,
  followSchema,
  unfollowQuerySchema,
  updateProfileSchema,
  ageVerifySendSchema,
  ageVerifyCheckSchema,
  auditActionSchema,
  adminUpdateUserSchema,
  createCategorySchema,
  updateCategorySchema,
  loginSchema,
  registerSchema,
  paginationSchema,
} from '@/lib/utils/validators';

// ==============================
// 文章列表查询参数
// ==============================
describe('articleListQuerySchema', () => {
  it('应通过空对象，使用默认值', () => {
    const result = articleListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it('应通过合法查询参数', () => {
    const result = articleListQuerySchema.safeParse({
      page: '2',
      pageSize: '10',
      category: 'tech',
      lang: 'zh',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.pageSize).toBe(10);
      expect(result.data.category).toBe('tech');
      expect(result.data.lang).toBe('zh');
    }
  });

  it('应拒绝 page=0', () => {
    const result = articleListQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('应拒绝 pageSize > 50', () => {
    const result = articleListQuerySchema.safeParse({ pageSize: 100 });
    expect(result.success).toBe(false);
  });

  it('应拒绝无效的 lang 值', () => {
    const result = articleListQuerySchema.safeParse({ lang: 'fr' });
    expect(result.success).toBe(false);
  });

  it('应使用 z.coerce 将字符串转为数字', () => {
    const result = articleListQuerySchema.safeParse({ page: '3', pageSize: '15' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.pageSize).toBe(15);
    }
  });
});

// ==============================
// 创建文章
// ==============================
describe('createArticleSchema', () => {
  const validArticle = {
    title: '测试标题',
    summary: '测试摘要内容',
    originalUrl: 'https://example.com/article',
    originalSource: '测试来源',
    categoryId: 'cat_tech',
  };

  it('应通过合法的文章数据', () => {
    const result = createArticleSchema.safeParse(validArticle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe('zh'); // 默认值
      expect(result.data.status).toBe('published'); // 默认值
    }
  });

  it('应拒绝空标题', () => {
    const result = createArticleSchema.safeParse({ ...validArticle, title: '' });
    expect(result.success).toBe(false);
  });

  it('应拒绝超过 200 字的标题', () => {
    const result = createArticleSchema.safeParse({ ...validArticle, title: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('应拒绝无效的 URL', () => {
    const result = createArticleSchema.safeParse({ ...validArticle, originalUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('应拒绝空 summary', () => {
    const result = createArticleSchema.safeParse({ ...validArticle, summary: '' });
    expect(result.success).toBe(false);
  });

  it('应接受可选字段', () => {
    const result = createArticleSchema.safeParse({
      ...validArticle,
      titleEn: 'English Title',
      summaryEn: 'English Summary',
      coverImage: 'https://example.com/image.png',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝无效的 status', () => {
    const result = createArticleSchema.safeParse({ ...validArticle, status: 'invalid' });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 更新文章
// ==============================
describe('updateArticleSchema', () => {
  it('应通过部分更新数据', () => {
    const result = updateArticleSchema.safeParse({ title: '新标题' });
    expect(result.success).toBe(true);
  });

  it('应通过空对象', () => {
    const result = updateArticleSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('应拒绝空标题（如果提供了 title 字段）', () => {
    const result = updateArticleSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 创建评论
// ==============================
describe('createCommentSchema', () => {
  it('应通过合法的评论数据', () => {
    const result = createCommentSchema.safeParse({
      articleId: 'art_123',
      content: '这是一条评论',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝空 articleId', () => {
    const result = createCommentSchema.safeParse({
      articleId: '',
      content: '评论内容',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝空评论内容', () => {
    const result = createCommentSchema.safeParse({
      articleId: 'art_123',
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝超过 2000 字的评论', () => {
    const result = createCommentSchema.safeParse({
      articleId: 'art_123',
      content: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('应接受可选的 parentId', () => {
    const result = createCommentSchema.safeParse({
      articleId: 'art_123',
      content: '回复评论',
      parentId: 'comment_456',
    });
    expect(result.success).toBe(true);
  });

  it('应接受 null parentId', () => {
    const result = createCommentSchema.safeParse({
      articleId: 'art_123',
      content: '顶级评论',
      parentId: null,
    });
    expect(result.success).toBe(true);
  });
});

// ==============================
// 更新评论状态
// ==============================
describe('updateCommentStatusSchema', () => {
  it('应通过合法的状态', () => {
    for (const status of ['published', 'hidden', 'deleted'] as const) {
      const result = updateCommentStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it('应拒绝无效状态', () => {
    const result = updateCommentStatusSchema.safeParse({ status: 'pending' });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 点赞
// ==============================
describe('likeSchema', () => {
  it('应通过合法的点赞数据', () => {
    const result = likeSchema.safeParse({
      targetType: 'article',
      targetId: 'art_123',
    });
    expect(result.success).toBe(true);
  });

  it('应支持 comment 类型', () => {
    const result = likeSchema.safeParse({
      targetType: 'comment',
      targetId: 'comment_456',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝无效的 targetType', () => {
    const result = likeSchema.safeParse({
      targetType: 'user',
      targetId: 'art_123',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝空 targetId', () => {
    const result = likeSchema.safeParse({
      targetType: 'article',
      targetId: '',
    });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 取消点赞查询参数
// ==============================
describe('unlikeQuerySchema', () => {
  it('应通过合法参数', () => {
    const result = unlikeQuerySchema.safeParse({
      targetType: 'article',
      targetId: 'art_123',
    });
    expect(result.success).toBe(true);
  });
});

// ==============================
// 收藏
// ==============================
describe('favoriteSchema', () => {
  it('应通过合法的收藏数据', () => {
    const result = favoriteSchema.safeParse({ articleId: 'art_123' });
    expect(result.success).toBe(true);
  });

  it('应拒绝空 articleId', () => {
    const result = favoriteSchema.safeParse({ articleId: '' });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 取消收藏
// ==============================
describe('unfavoriteQuerySchema', () => {
  it('应通过合法参数', () => {
    const result = unfavoriteQuerySchema.safeParse({ articleId: 'art_123' });
    expect(result.success).toBe(true);
  });

  it('应拒绝空 articleId', () => {
    const result = unfavoriteQuerySchema.safeParse({ articleId: '' });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 关注
// ==============================
describe('followSchema', () => {
  it('应通过合法的关注数据', () => {
    const result = followSchema.safeParse({ userId: 'user_123' });
    expect(result.success).toBe(true);
  });

  it('应拒绝空 userId', () => {
    const result = followSchema.safeParse({ userId: '' });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 取消关注
// ==============================
describe('unfollowQuerySchema', () => {
  it('应通过合法参数', () => {
    const result = unfollowQuerySchema.safeParse({ userId: 'user_123' });
    expect(result.success).toBe(true);
  });
});

// ==============================
// 更新用户资料
// ==============================
describe('updateProfileSchema', () => {
  it('应通过部分更新数据', () => {
    const result = updateProfileSchema.safeParse({ name: '新昵称' });
    expect(result.success).toBe(true);
  });

  it('应通过空对象', () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('应拒绝空昵称（如果提供了 name）', () => {
    const result = updateProfileSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('应拒绝超过 50 字的昵称', () => {
    const result = updateProfileSchema.safeParse({ name: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('应拒绝无效的 avatarUrl', () => {
    const result = updateProfileSchema.safeParse({ avatarUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('应接受 null avatarUrl', () => {
    const result = updateProfileSchema.safeParse({ avatarUrl: null });
    expect(result.success).toBe(true);
  });

  it('应接受合法 locale', () => {
    for (const locale of ['zh', 'en'] as const) {
      const result = updateProfileSchema.safeParse({ locale });
      expect(result.success).toBe(true);
    }
  });

  it('应拒绝无效 locale', () => {
    const result = updateProfileSchema.safeParse({ locale: 'fr' });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 年龄验证 - 发送验证码
// ==============================
describe('ageVerifySendSchema', () => {
  it('应通过国际格式手机号', () => {
    const result = ageVerifySendSchema.safeParse({ phone: '+8613800138000' });
    expect(result.success).toBe(true);
  });

  it('应拒绝空手机号', () => {
    const result = ageVerifySendSchema.safeParse({ phone: '' });
    expect(result.success).toBe(false);
  });

  it('应拒绝不含国际区号的手机号', () => {
    const result = ageVerifySendSchema.safeParse({ phone: '13800138000' });
    expect(result.success).toBe(false);
  });

  it('应拒绝格式不正确的手机号', () => {
    const result = ageVerifySendSchema.safeParse({ phone: '+abc' });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 年龄验证 - 验证
// ==============================
describe('ageVerifyCheckSchema', () => {
  it('应通过合法的验证数据', () => {
    const result = ageVerifyCheckSchema.safeParse({
      phone: '+8613800138000',
      code: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝非 6 位验证码', () => {
    const result = ageVerifyCheckSchema.safeParse({
      phone: '+8613800138000',
      code: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝包含字母的验证码', () => {
    const result = ageVerifyCheckSchema.safeParse({
      phone: '+8613800138000',
      code: '12345a',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝无效手机号', () => {
    const result = ageVerifyCheckSchema.safeParse({
      phone: '13800138000',
      code: '123456',
    });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 审核操作
// ==============================
describe('auditActionSchema', () => {
  it('应通过合法的审核操作', () => {
    for (const action of ['approve', 'reject', 'hide', 'delete', 'ban', 'unban'] as const) {
      for (const targetType of ['article', 'comment', 'user'] as const) {
        const result = auditActionSchema.safeParse({
          targetType,
          targetId: 'target_123',
          action,
        });
        expect(result.success).toBe(true);
      }
    }
  });

  it('应拒绝无效的 targetType', () => {
    const result = auditActionSchema.safeParse({
      targetType: 'post',
      targetId: 'target_123',
      action: 'approve',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝无效的 action', () => {
    const result = auditActionSchema.safeParse({
      targetType: 'article',
      targetId: 'target_123',
      action: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('应接受可选的 reason', () => {
    const result = auditActionSchema.safeParse({
      targetType: 'article',
      targetId: 'target_123',
      action: 'reject',
      reason: '内容违规',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝超过 500 字的 reason', () => {
    const result = auditActionSchema.safeParse({
      targetType: 'article',
      targetId: 'target_123',
      action: 'reject',
      reason: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 管理员更新用户
// ==============================
describe('adminUpdateUserSchema', () => {
  it('应通过修改角色', () => {
    for (const role of ['user', 'moderator', 'admin', 'banned'] as const) {
      const result = adminUpdateUserSchema.safeParse({ role });
      expect(result.success).toBe(true);
    }
  });

  it('应通过封禁操作', () => {
    const result = adminUpdateUserSchema.safeParse({ action: 'ban' });
    expect(result.success).toBe(true);
  });

  it('应通过解封操作', () => {
    const result = adminUpdateUserSchema.safeParse({ action: 'unban' });
    expect(result.success).toBe(true);
  });

  it('应拒绝无效的角色', () => {
    const result = adminUpdateUserSchema.safeParse({ role: 'superadmin' });
    expect(result.success).toBe(false);
  });

  it('应拒绝无效的操作', () => {
    const result = adminUpdateUserSchema.safeParse({ action: 'kick' });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 创建版块
// ==============================
describe('createCategorySchema', () => {
  const validCategory = {
    name: '科技',
    nameEn: 'Technology',
    slug: 'tech',
  };

  it('应通过合法的版块数据', () => {
    const result = createCategorySchema.safeParse(validCategory);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortOrder).toBe(0); // 默认值
      expect(result.data.isAdult).toBe(false); // 默认值
      expect(result.data.isVisible).toBe(true); // 默认值
    }
  });

  it('应拒绝空名称', () => {
    const result = createCategorySchema.safeParse({ ...validCategory, name: '' });
    expect(result.success).toBe(false);
  });

  it('应拒绝无效的 slug（含大写字母）', () => {
    const result = createCategorySchema.safeParse({ ...validCategory, slug: 'Tech' });
    expect(result.success).toBe(false);
  });

  it('应拒绝无效的 slug（含空格）', () => {
    const result = createCategorySchema.safeParse({ ...validCategory, slug: 'tech news' });
    expect(result.success).toBe(false);
  });

  it('应接受含连字符的 slug', () => {
    const result = createCategorySchema.safeParse({ ...validCategory, slug: 'tech-news' });
    expect(result.success).toBe(true);
  });

  it('应接受含数字的 slug', () => {
    const result = createCategorySchema.safeParse({ ...validCategory, slug: 'tech-2024' });
    expect(result.success).toBe(true);
  });
});

// ==============================
// 更新版块
// ==============================
describe('updateCategorySchema', () => {
  it('应通过部分更新', () => {
    const result = updateCategorySchema.safeParse({ name: '新名称' });
    expect(result.success).toBe(true);
  });
});

// ==============================
// 登录
// ==============================
describe('loginSchema', () => {
  it('应通过合法的登录数据', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝无效邮箱', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: '123456',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝少于 6 位的密码', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 注册
// ==============================
describe('registerSchema', () => {
  it('应通过合法的注册数据', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
      name: '测试用户',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝空昵称', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝超过 100 位的密码', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'a'.repeat(101),
      name: '测试用户',
    });
    expect(result.success).toBe(false);
  });
});

// ==============================
// 分页通用
// ==============================
describe('paginationSchema', () => {
  it('应通过空对象，使用默认值', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it('应使用 z.coerce 将字符串转为数字', () => {
    const result = paginationSchema.safeParse({ page: '3', pageSize: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.pageSize).toBe(10);
    }
  });

  it('应拒绝 page < 1', () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('应拒绝 pageSize > 50', () => {
    const result = paginationSchema.safeParse({ pageSize: 51 });
    expect(result.success).toBe(false);
  });

  it('应接受 pageSize = 50（上限）', () => {
    const result = paginationSchema.safeParse({ pageSize: 50 });
    expect(result.success).toBe(true);
  });
});
