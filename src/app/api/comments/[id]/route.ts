import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAuth, hasRole } from '@/lib/auth/middleware';
import { apiSuccess, apiNotFound, apiForbidden, apiUnauthorized, handleApiError } from '@/lib/utils/api';

/**
 * DELETE /api/comments/[id] — 删除评论
 * 仅评论作者或管理员可删除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const db = await getDB();

    // 查询评论
    const comment = await db
      .prepare('SELECT * FROM comments WHERE id = ?')
      .bind(id)
      .first();

    if (!comment) {
      return Response.json(apiNotFound('评论不存在'), { status: 404 });
    }

    // 权限检查：评论作者或管理员
    const isOwner = (comment as unknown as Record<string, unknown>).user_id === user.id;
    const isAdmin = hasRole(user, 'admin', 'moderator');
    if (!isOwner && !isAdmin) {
      return Response.json(apiForbidden('无权删除此评论'), { status: 403 });
    }

    // 软删除：更新状态
    await db
      .prepare("UPDATE comments SET status = 'deleted', updated_at = datetime('now') WHERE id = ?")
      .bind(id)
      .run();

    // 更新文章评论数
    const articleId = (comment as unknown as Record<string, unknown>).article_id as string;
    await db
      .prepare('UPDATE articles SET comment_count = comment_count - 1 WHERE id = ?')
      .bind(articleId)
      .run();

    return Response.json(apiSuccess(null, '评论已删除'));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
