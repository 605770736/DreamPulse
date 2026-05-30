import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiPaginated, apiBadRequest, apiUnauthorized, apiNotFound, handleApiError } from '@/lib/utils/api';
import { favoriteSchema, unfavoriteQuerySchema, paginationSchema } from '@/lib/utils/validators';

/**
 * GET /api/favorites — 我的收藏列表（需认证，分页）
 * POST /api/favorites — 收藏文章（需认证）
 * DELETE /api/favorites — 取消收藏（需认证，查询参数：articleId）
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
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

    // 查询收藏总数
    const countResult = await db
      .prepare('SELECT COUNT(*) as total FROM favorites WHERE user_id = ?')
      .bind(user.id)
      .first();
    const total = (countResult as Record<string, number>)?.total ?? 0;

    // 查询收藏列表（联表文章信息）
    const favorites = await db
      .prepare(
        `SELECT f.id as favorite_id, f.created_at as favorited_at,
                a.id, a.title, a.title_en, a.summary, a.summary_en,
                a.cover_image, a.view_count, a.like_count, a.comment_count,
                a.published_at, a.category_id, a.original_source
         FROM favorites f
         JOIN articles a ON f.article_id = a.id
         WHERE f.user_id = ? AND a.status = 'published'
         ORDER BY f.created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(user.id, pageSize, offset)
      .all();

    const items = (favorites.results ?? []).map((row) => ({
      id: (row as Record<string, unknown>).id as string,
      title: (row as Record<string, unknown>).title as string,
      titleEn: (row as Record<string, unknown>).title_en as string | null,
      summary: (row as Record<string, unknown>).summary as string,
      summaryEn: (row as Record<string, unknown>).summary_en as string | null,
      coverImage: (row as Record<string, unknown>).cover_image as string | null,
      viewCount: (row as Record<string, unknown>).view_count as number,
      likeCount: (row as Record<string, unknown>).like_count as number,
      commentCount: (row as Record<string, unknown>).comment_count as number,
      publishedAt: (row as Record<string, unknown>).published_at as string | null,
      originalSource: (row as Record<string, unknown>).original_source as string,
      categoryId: (row as Record<string, unknown>).category_id as string,
      favoritedAt: (row as Record<string, unknown>).favorited_at as string,
    }));

    return Response.json(apiPaginated(items, total, page, pageSize));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = favoriteSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { articleId } = parsed.data;
    const db = getDB();

    // 检查文章是否存在
    const article = await db
      .prepare("SELECT id FROM articles WHERE id = ? AND status = 'published'")
      .bind(articleId)
      .first();
    if (!article) {
      return Response.json(apiNotFound('文章不存在'), { status: 404 });
    }

    // 检查是否已收藏
    const existing = await db
      .prepare('SELECT id FROM favorites WHERE user_id = ? AND article_id = ?')
      .bind(user.id, articleId)
      .first();
    if (existing) {
      return Response.json(apiBadRequest('已收藏该文章'), { status: 400 });
    }

    // 插入收藏记录
    const id = crypto.randomUUID();
    await db
      .prepare('INSERT INTO favorites (id, user_id, article_id) VALUES (?, ?, ?)')
      .bind(id, user.id, articleId)
      .run();

    return Response.json(apiSuccess({ id, articleId }, '收藏成功'), { status: 201 });
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

    const parsed = unfavoriteQuerySchema.safeParse({
      articleId: searchParams.get('articleId') ?? undefined,
    });
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { articleId } = parsed.data;
    const db = getDB();

    // 删除收藏记录
    const result = await db
      .prepare('DELETE FROM favorites WHERE user_id = ? AND article_id = ?')
      .bind(user.id, articleId)
      .run();

    if (result.meta.changes === 0) {
      return Response.json(apiNotFound('未找到收藏记录'), { status: 404 });
    }

    return Response.json(apiSuccess(null, '取消收藏成功'));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
