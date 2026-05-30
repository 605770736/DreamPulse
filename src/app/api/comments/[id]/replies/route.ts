import { NextRequest } from 'next/server';
import { query, getDB } from '@/lib/db/client';
import { requireAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiPaginated, apiBadRequest, apiUnauthorized, handleApiError } from '@/lib/utils/api';
import { createCommentSchema, paginationSchema } from '@/lib/utils/validators';
import type { CommentRow } from '@/lib/db/schema';

/**
 * GET /api/comments/[id]/replies — 获取评论的回复列表
 * POST /api/comments/[id]/replies — 回复评论
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { page, pageSize } = parsed.data;
    const offset = (page - 1) * pageSize;

    const db = getDB();
    const countResult = await db
      .prepare("SELECT COUNT(*) as total FROM comments WHERE parent_id = ? AND status = 'published'")
      .bind(id)
      .first();
    const total = (countResult as Record<string, number>)?.total ?? 0;

    const replies = await query<CommentRow>(
      `SELECT c.*, u.name as user_name FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.parent_id = ? AND c.status = 'published'
       ORDER BY c.created_at ASC LIMIT ? OFFSET ?`,
      id, pageSize, offset
    );

    const items = replies.map((r) => ({
      id: r.id,
      articleId: r.article_id,
      userId: r.user_id,
      userName: (r as unknown as Record<string, unknown>).user_name as string ?? '匿名',
      parentId: r.parent_id,
      content: r.content,
      createdAt: r.created_at,
    }));

    return Response.json(apiPaginated(items, total, page, pageSize));
  } catch (error) {
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: parentId } = await params;
    const body = await request.json();

    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { articleId, content } = parsed.data;
    const db = getDB();

    const commentId = crypto.randomUUID();
    await db
      .prepare(
        'INSERT INTO comments (id, article_id, user_id, parent_id, content, status) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(commentId, articleId, user.id, parentId, content, 'published')
      .run();

    await db
      .prepare('UPDATE articles SET comment_count = comment_count + 1 WHERE id = ?')
      .bind(articleId)
      .run();

    return Response.json(apiSuccess({ id: commentId, content }, '回复发表成功'), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
