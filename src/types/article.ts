/**
 * 文章相关类型定义
 * 与 D1 数据库 Schema 严格一致
 */

/** 文章状态枚举 */
export type ArticleStatus = 'draft' | 'published' | 'archived' | 'rejected';

/** 评论状态枚举 */
export type CommentStatus = 'published' | 'hidden' | 'deleted';

/** 点赞目标类型枚举 */
export type LikeTargetType = 'article' | 'comment';

/** 爬取源类型枚举 */
export type CrawlSourceType = 'rss' | 'api' | 'html';

/** 审核动作枚举 */
export type AuditAction = 'approve' | 'reject' | 'hide' | 'delete' | 'ban' | 'unban';

/** 审核目标类型枚举 */
export type AuditTargetType = 'article' | 'comment' | 'user';

/**
 * 文章类型
 * 对应数据库 articles 表
 */
export interface Article {
  /** 主键 ID */
  id: string;
  /** 中文标题 */
  title: string;
  /** 英文标题 */
  titleEn: string | null;
  /** 中文摘要 */
  summary: string;
  /** 英文摘要 */
  summaryEn: string | null;
  /** 原文链接 */
  originalUrl: string;
  /** 原文来源 */
  originalSource: string;
  /** 所属版块 ID */
  categoryId: string;
  /** 语言标识 */
  language: 'zh' | 'en';
  /** 封面图 URL */
  coverImage: string | null;
  /** 文章状态 */
  status: ArticleStatus;
  /** 浏览量 */
  viewCount: number;
  /** 点赞数 */
  likeCount: number;
  /** 评论数 */
  commentCount: number;
  /** 发布时间（ISO 8601 UTC） */
  publishedAt: string | null;
  /** 创建时间（ISO 8601 UTC） */
  createdAt: string;
  /** 更新时间（ISO 8601 UTC） */
  updatedAt: string;
}

/**
 * 版块类型
 * 对应数据库 categories 表
 */
export interface Category {
  /** 主键 ID */
  id: string;
  /** 中文名称 */
  name: string;
  /** 英文名称 */
  nameEn: string;
  /** URL 友好标识 */
  slug: string;
  /** 图标名称（Lucide 图标名） */
  icon: string | null;
  /** 排序权重 */
  sortOrder: number;
  /** 是否为成人版块 */
  isAdult: boolean;
  /** 是否可见 */
  isVisible: boolean;
  /** 创建时间（ISO 8601 UTC） */
  createdAt: string;
}

/**
 * 评论类型
 * 对应数据库 comments 表
 */
export interface Comment {
  /** 主键 ID */
  id: string;
  /** 所属文章 ID */
  articleId: string;
  /** 评论者用户 ID */
  userId: string;
  /** 父评论 ID（楼中楼） */
  parentId: string | null;
  /** 评论内容 */
  content: string;
  /** 评论状态 */
  status: CommentStatus;
  /** 创建时间（ISO 8601 UTC） */
  createdAt: string;
  /** 更新时间（ISO 8601 UTC） */
  updatedAt: string;
}

/**
 * 点赞类型
 * 对应数据库 likes 表
 */
export interface Like {
  /** 主键 ID */
  id: string;
  /** 点赞用户 ID */
  userId: string;
  /** 点赞目标类型 */
  targetType: LikeTargetType;
  /** 点赞目标 ID */
  targetId: string;
  /** 创建时间（ISO 8601 UTC） */
  createdAt: string;
}

/**
 * 收藏类型
 * 对应数据库 favorites 表
 */
export interface Favorite {
  /** 主键 ID */
  id: string;
  /** 收藏用户 ID */
  userId: string;
  /** 收藏文章 ID */
  articleId: string;
  /** 创建时间（ISO 8601 UTC） */
  createdAt: string;
}

/**
 * 关注类型
 * 对应数据库 follows 表
 */
export interface Follow {
  /** 主键 ID */
  id: string;
  /** 关注者用户 ID */
  followerId: string;
  /** 被关注者用户 ID */
  followingId: string;
  /** 创建时间（ISO 8601 UTC） */
  createdAt: string;
}

/**
 * 爬取源配置类型
 * 对应数据库 crawl_sources 表
 */
export interface CrawlSource {
  /** 主键 ID */
  id: string;
  /** 源名称 */
  name: string;
  /** 源 URL */
  url: string;
  /** 语言标识 */
  language: 'zh' | 'en';
  /** 源类型 */
  type: CrawlSourceType;
  /** 关联版块 ID */
  categoryId: string | null;
  /** 爬取间隔（秒） */
  crawlInterval: number;
  /** 最后爬取时间（ISO 8601 UTC） */
  lastCrawledAt: string | null;
  /** 是否激活 */
  isActive: boolean;
  /** 创建时间（ISO 8601 UTC） */
  createdAt: string;
}

/**
 * 审核日志类型
 * 对应数据库 audit_logs 表
 */
export interface AuditLog {
  /** 主键 ID */
  id: string;
  /** 审核目标类型 */
  targetType: AuditTargetType;
  /** 审核目标 ID */
  targetId: string;
  /** 审核动作 */
  action: AuditAction;
  /** 操作者用户 ID */
  operatorId: string | null;
  /** 操作原因 */
  reason: string | null;
  /** 创建时间（ISO 8601 UTC） */
  createdAt: string;
}
