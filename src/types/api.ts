/**
 * API 响应类型定义
 * 遵循架构文档 3.3 节的通用响应格式
 */

import type { Category } from './article';

/**
 * 通用 API 响应格式
 * code=0 表示成功，非0 为错误码
 */
export interface ApiResponse<T> {
  /** 状态码：0=成功，非0=错误码 */
  code: number;
  /** 响应数据 */
  data: T | null;
  /** 响应消息 */
  message: string;
}

/**
 * 分页数据结构
 */
export interface PaginatedData<T> {
  /** 数据列表 */
  items: T[];
  /** 总条数 */
  total: number;
  /** 当前页码（从 1 开始） */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 是否还有更多数据 */
  hasMore: boolean;
}

/**
 * 分页 API 响应格式
 */
export interface PaginatedResponse<T> {
  /** 状态码：0=成功，非0=错误码 */
  code: number;
  /** 分页数据 */
  data: PaginatedData<T>;
  /** 响应消息 */
  message: string;
}

/**
 * 文章列表查询参数
 */
export interface ArticleListQuery {
  /** 页码（从 1 开始，默认 1） */
  page?: number;
  /** 每页条数（默认 20，最大 50） */
  pageSize?: number;
  /** 版块 slug 筛选 */
  category?: string;
  /** 语言筛选 */
  lang?: 'zh' | 'en';
}

/**
 * 文章列表项（精简字段，用于列表展示）
 */
export interface ArticleItem {
  /** 文章 ID */
  id: string;
  /** 文章标题（根据用户语言返回对应字段） */
  title: string;
  /** 文章摘要（根据用户语言返回对应字段） */
  summary: string;
  /** 原文来源 */
  originalSource: string;
  /** 所属版块 ID */
  categoryId: string;
  /** 版块 slug */
  categorySlug: string;
  /** 版块名称 */
  categoryName: string;
  /** 封面图 URL */
  coverImage: string | null;
  /** 浏览量 */
  viewCount: number;
  /** 点赞数 */
  likeCount: number;
  /** 评论数 */
  commentCount: number;
  /** 发布时间（ISO 8601 UTC） */
  publishedAt: string;
}

/**
 * 文章详情（完整字段，包含用户交互状态）
 */
export interface ArticleDetail {
  /** 文章 ID */
  id: string;
  /** 中文标题 */
  title: string;
  /** 英文标题 */
  titleEn: string;
  /** 中文摘要 */
  summary: string;
  /** 英文摘要 */
  summaryEn: string;
  /** 原文链接 */
  originalUrl: string;
  /** 原文来源 */
  originalSource: string;
  /** 所属版块 */
  category: Category;
  /** 封面图 URL */
  coverImage: string | null;
  /** 浏览量 */
  viewCount: number;
  /** 点赞数 */
  likeCount: number;
  /** 评论数 */
  commentCount: number;
  /** 当前用户是否已点赞 */
  isLiked: boolean;
  /** 当前用户是否已收藏 */
  isFavorited: boolean;
  /** 发布时间（ISO 8601 UTC） */
  publishedAt: string;
}
