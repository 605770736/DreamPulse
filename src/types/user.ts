/**
 * 用户相关类型定义
 * 与 D1 数据库 Schema 严格一致
 */

/** 用户角色枚举 */
export type UserRole = 'user' | 'moderator' | 'admin' | 'banned';

/**
 * 用户类型
 * 对应数据库 users 表
 */
export interface User {
  /** 主键 ID */
  id: string;
  /** 邮箱（唯一） */
  email: string;
  /** 用户名 */
  name: string;
  /** 头像 URL */
  avatarUrl: string | null;
  /** 用户角色 */
  role: UserRole;
  /** 语言偏好 */
  locale: 'zh' | 'en';
  /** 是否已通过年龄认证 */
  ageVerified: boolean;
  /** 手机号码（用于年龄验证） */
  phone: string | null;
  /** 创建时间（ISO 8601 UTC） */
  createdAt: string;
  /** 更新时间（ISO 8601 UTC） */
  updatedAt: string;
}

/**
 * OAuth 账户类型
 * 对应数据库 accounts 表（Auth.js 标准）
 */
export interface Account {
  /** 主键 ID */
  id: string;
  /** 关联用户 ID */
  userId: string;
  /** 账户类型（oauth/email 等） */
  type: string;
  /** OAuth 提供商（google/github 等） */
  provider: string;
  /** 提供商账户 ID */
  providerAccountId: string;
  /** 刷新令牌 */
  refreshToken: string | null;
  /** 访问令牌 */
  accessToken: string | null;
  /** 令牌过期时间（Unix 时间戳） */
  expiresAt: number | null;
  /** 令牌类型 */
  tokenType: string | null;
  /** 令牌作用域 */
  scope: string | null;
  /** OpenID Connect ID Token */
  idToken: string | null;
  /** 会话状态（OAuth state） */
  sessionState: string | null;
}

/**
 * 会话类型
 * 对应数据库 sessions 表（Auth.js 标准）
 */
export interface Session {
  /** 主键 ID */
  id: string;
  /** 关联用户 ID */
  userId: string;
  /** 会话令牌 */
  sessionToken: string;
  /** 过期时间（ISO 8601 UTC） */
  expires: string;
}

/**
 * 年龄验证类型
 * 对应数据库 age_verifications 表
 */
export interface AgeVerification {
  /** 主键 ID */
  id: string;
  /** 关联用户 ID */
  userId: string;
  /** 验证手机号（国际格式 +8613800138000） */
  phone: string;
  /** 验证码（6 位数字） */
  code: string;
  /** 是否已验证通过 */
  isVerified: boolean;
  /** 验证码过期时间（ISO 8601 UTC） */
  expiresAt: string;
  /** 创建时间（ISO 8601 UTC） */
  createdAt: string;
}
