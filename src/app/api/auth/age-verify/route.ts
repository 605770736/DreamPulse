import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiBadRequest, apiUnauthorized, handleApiError } from '@/lib/utils/api';
import { ageVerifyCheckSchema } from '@/lib/utils/validators';

/**
 * POST /api/auth/age-verify — 年龄验证（验证码校验）
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // 参数校验
    const parsed = ageVerifyCheckSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { phone, code } = parsed.data;
    const db = getDB();

    // 查询验证码记录
    const record = await db
      .prepare(
        `SELECT * FROM age_verifications
         WHERE user_id = ? AND phone = ? AND code = ? AND is_verified = 0
         AND expires_at > datetime('now')
         ORDER BY created_at DESC LIMIT 1`
      )
      .bind(user.id, phone, code)
      .first();

    if (!record) {
      return Response.json(apiBadRequest('验证码无效或已过期'), { status: 400 });
    }

    // 标记验证码为已使用
    await db
      .prepare('UPDATE age_verifications SET is_verified = 1 WHERE id = ?')
      .bind(record.id as string)
      .run();

    // 更新用户年龄认证状态
    await db
      .prepare('UPDATE users SET age_verified = 1, phone = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(phone, user.id)
      .run();

    return Response.json(apiSuccess({ verified: true }, '年龄认证成功'));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
