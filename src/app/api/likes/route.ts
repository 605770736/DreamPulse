import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiBadRequest, apiUnauthorized, handleApiError } from '@/lib/utils/api';
import { likeSchema, unlikeQuerySchema } from '@/lib/utils/validators';

/**
 * POST /api/likes — 点赞
 * DELETE /api/likes — 取消点赞
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = likeSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { targetType, targetId } = parsed.data;
    const db = getDB();

    // 检查是否已点赞
    const existing = await db
      .prepare('SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?')
      .bind(user.id, targetType, targetId)
      .first();

    if (existing) {
      return Response.json(apiBadRequest('已点赞'), { status: 400 });
    }

    // 插入点赞记录
    const id = crypto.randomUUID();
    await db
      .prepare('INSERT INTO likes (id, user_id, target_type, target_id) VALUES (?, ?, ?, ?)')
      .bind(id, user.id, targetType, targetId)
      .run();

    // 更新目标计数
    if (targetType === 'article') {
      await db
        .prepare('UPDATE articles SET like_count = like_count + 1 WHERE id = ?')
        .bind(targetId)
        .run();
    }

    return Response.json(apiSuccess({ id }, '点赞成功'), { status: 201 });
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

    // 使用 unlikeQuerySchema 校验查询参数
    const parsed = unlikeQuerySchema.safeParse({
      targetType: searchParams.get('targetType') ?? undefined,
      targetId: searchParams.get('targetId') ?? undefined,
    });
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { targetType, targetId } = parsed.data;
    const db = getDB();

    // 删除点赞记录
    await db
      .prepare('DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?')
      .bind(user.id, targetType, targetId)
      .run();

    // 更新目标计数
    if (targetType === 'article') {
      await db
        .prepare('UPDATE articles SET like_count = like_count - 1 WHERE id = ? AND like_count > 0')
        .bind(targetId)
        .run();
    }

    return Response.json(apiSuccess(null, '取消点赞成功'));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
