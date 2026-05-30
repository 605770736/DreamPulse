/**
 * Auth.js v5 配置
 * 当前仅支持邮箱密码登录（OAuth 后期按需开启）
 * 使用 D1 适配器存储用户和会话数据
 *
 * 注意：D1Adapter 需要在请求上下文中创建（依赖 getRequestContext），
 * 因此使用惰性初始化模式，在 adapter 函数中动态获取 D1 实例
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { D1Adapter } from '@auth/d1-adapter';
import { getDB } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import type { Adapter } from '@auth/core/adapters';

/**
 * 惰性创建 D1Adapter
 * 在每次请求时获取 D1 数据库实例并创建适配器
 * 这是因为 getDB() 依赖 Cloudflare 的 getRequestContext()，
 * 仅在请求处理期间可用
 */
function createD1Adapter(): Adapter {
  const db = getDB();
  return D1Adapter(db as unknown as Parameters<typeof D1Adapter>[0]);
}

/**
 * Auth.js 配置对象
 * 在 Cloudflare Pages Edge Runtime 下运行
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // 适配器：使用惰性函数返回 D1 适配器
  // NextAuth v5 支持 adapter 为函数类型
  adapter: createD1Adapter(),

  // 认证提供商（当前仅邮箱密码，OAuth 后期按需添加）
  providers: [
    // 邮箱密码登录（Credentials Provider）
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 查询用户——邮箱密码方式
        const db = getDB();
        const user = await db
          .prepare('SELECT * FROM users WHERE email = ?')
          .bind(credentials.email as string)
          .first();

        if (!user) {
          return null;
        }

        // 使用 bcrypt 验证密码
        const passwordHash = user.password_hash as string | null;
        if (!passwordHash) {
          // OAuth 用户无密码，不允许密码登录
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          passwordHash
        );
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id as string,
          email: user.email as string,
          name: user.name as string,
          image: user.avatar_url as string | null,
        };
      },
    }),
  ],

  // 会话策略：使用 JWT（Edge Runtime 不支持数据库会话）
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },

  // 回调函数
  callbacks: {
    /**
     * JWT 回调——在令牌中注入额外字段
     * 将用户角色、语言偏好、年龄认证状态写入 JWT
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as Record<string, unknown>).role ?? 'user';
        token.locale = (user as unknown as Record<string, unknown>).locale ?? 'zh';
        token.ageVerified = (user as unknown as Record<string, unknown>).ageVerified ?? false;
      }
      return token;
    },

    /**
     * Session 回调——将 JWT 中的额外字段暴露给客户端
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).locale = token.locale;
        (session.user as unknown as Record<string, unknown>).ageVerified = token.ageVerified;
      }
      return session;
    },

    /**
     * SignIn 回调——登录时的额外验证逻辑
     */
    async signIn() {
      // 可以在此添加登录限制逻辑，如封禁用户检查
      return true;
    },
  },

  // 页面路由
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
    error: '/auth/login',
  },

  // 安全配置
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});
