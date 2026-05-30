import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { apiSuccess, apiBadRequest, apiError, handleApiError } from '@/lib/utils/api';
import { registerSchema } from '@/lib/utils/validators';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/register — 邮箱注册
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 参数校验
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { email, password, name } = parsed.data;
    const db = getDB();

    // 检查邮箱是否已注册
    const existing = await db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existing) {
      return Response.json(apiBadRequest('该邮箱已被注册'), { status: 400 });
    }

    // 创建用户——使用 bcrypt 加密密码
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    await db
      .prepare(
        'INSERT INTO users (id, email, name, password_hash, role, locale, age_verified) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, email, name, passwordHash, 'user', 'zh', 0)
      .run();

    return Response.json(apiSuccess({ id: userId, email, name }, '注册成功'), { status: 201 });
  } catch (error) {
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
