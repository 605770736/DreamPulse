import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiBadRequest, apiUnauthorized, apiNotFound, handleApiError } from '@/lib/utils/api';
import { followSchema, unfollowQuerySchema } from '@/lib/utils/validators';

/**
 * POST /api/follows — 关注用户（需认证）
 * DELETE /api/follows — 取消关注（需认证，查询参数：userId）
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = followSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { userId } = parsed.data;

    // 不能关注自己
    if (userId === user.id) {
      return Response.json(apiBadRequest('不能关注自己'), { status: 400 });
    }

    const db = await getDB();

    // 检查目标用户是否存在
    const targetUser = await db
      .prepare('SELECT id FROM users WHERE id = ?')
      .bind(userId)
      .first();
    if (!targetUser) {
      return Response.json(apiNotFound('用户不存在'), { status: 404 });
    }

    // 检查是否已关注
    const existing = await db
      .prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?')
      .bind(user.id, userId)
      .first();
    if (existing) {
      return Response.json(apiBadRequest('已关注该用户'), { status: 400 });
    }

    // 插入关注记录
    const id = crypto.randomUUID();
    await db
      .prepare('INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)')
      .bind(id, user.id, userId)
      .run();

    return Response.json(apiSuccess({ id, followingId: userId }, '关注成功'), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = request.nextUrl;

    const parsed = unfollowQuerySchema.safeParse({
      userId: searchParams.get('userId') ?? undefined,
    });
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { userId } = parsed.data;
    const db = await getDB();

    // 删除关注记录
    const result = await db
      .prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?')
      .bind(user.id, userId)
      .run();

    if (result.meta.changes === 0) {
      return Response.json(apiNotFound('未找到关注记录'), { status: 404 });
    }

    return Response.json(apiSuccess(null, '取消关注成功'));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
