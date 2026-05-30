/**
 * DreamPulse 共享类型汇总导出
 * 所有业务类型统一从此文件导入
 */

// 文章相关类型
export type {
  Article,
  ArticleStatus,
  Category,
  Comment,
  CommentStatus,
  Like,
  LikeTargetType,
  Favorite,
  Follow,
  CrawlSource,
  CrawlSourceType,
  AuditLog,
  AuditAction,
  AuditTargetType,
} from './article';

// 用户相关类型
export type {
  User,
  UserRole,
  Account,
  Session,
  AgeVerification,
} from './user';

// API 响应类型
export type {
  ApiResponse,
  PaginatedResponse,
  PaginatedData,
  ArticleListQuery,
  ArticleItem,
  ArticleDetail,
} from './api';
