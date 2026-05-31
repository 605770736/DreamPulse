import { NextRequest } from 'next/server';
import { query, queryOne, getDB } from '@/lib/db/client';
import { requireAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiPaginated, apiBadRequest, apiUnauthorized, handleApiError } from '@/lib/utils/api';
import { createCommentSchema, paginationSchema } from '@/lib/utils/validators';
import type { CommentRow } from '@/lib/db/schema';

/**
 * GET /api/comments — 评论列表
 * POST /api/comments — 发表评论
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const articleId = searchParams.get('articleId');
    if (!articleId) {
      return Response.json(apiBadRequest('articleId 参数必填'), { status: 400 });
    }

    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { page, pageSize } = parsed.data;
    const offset = (page - 1) * pageSize;

    const countResult = await queryOne(
      "SELECT COUNT(*) as total FROM comments WHERE article_id = ? AND status = 'published'",
      articleId
    );
    const total = (countResult as Record<string, number>)?.total ?? 0;

    const comments = await query<CommentRow>(
      `SELECT c.*, u.name as user_name FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.article_id = ? AND c.status = 'published'
       ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      articleId, pageSize, offset
    );

    const items = comments.map((c) => ({
      id: c.id,
      articleId: c.article_id,
      userId: c.user_id,
      userName: (c as unknown as Record<string, unknown>).user_name as string ?? '匿名',
      parentId: c.parent_id,
      content: c.content,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    return Response.json(apiPaginated(items, total, page, pageSize));
  } catch (error) {
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { articleId, content, parentId } = parsed.data;
    const db = await getDB();

    const id = crypto.randomUUID();
    await db
      .prepare(
        'INSERT INTO comments (id, article_id, user_id, parent_id, content, status) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(id, articleId, user.id, parentId ?? null, content, 'published')
      .run();

    // 更新文章评论数
    await db
      .prepare('UPDATE articles SET comment_count = comment_count + 1 WHERE id = ?')
      .bind(articleId)
      .run();

    return Response.json(apiSuccess({ id, articleId, content }, '评论发表成功'), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
