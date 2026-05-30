import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/middleware';
import { apiSuccess, apiPaginated, apiBadRequest, apiForbidden, apiUnauthorized, handleApiError } from '@/lib/utils/api';
import { createArticleSchema, paginationSchema } from '@/lib/utils/validators';

/**
 * GET /api/admin/articles — 管理文章列表（分页、筛选、搜索）
 * POST /api/admin/articles — 新增文章
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // 构建 WHERE 条件
    const conditions: string[] = [];
    const bindParams: unknown[] = [];

    if (status) {
      conditions.push('a.status = ?');
      bindParams.push(status);
    }
    if (category) {
      conditions.push('a.category_id = ?');
      bindParams.push(category);
    }
    if (search) {
      conditions.push('(a.title LIKE ? OR a.title_en LIKE ? OR a.summary LIKE ?)');
      bindParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const db = getDB();

    // 查询总数
    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM articles a ${whereClause}`)
      .bind(...bindParams)
      .first();
    const total = (countResult as Record<string, number>)?.total ?? 0;

    // 查询列表
    const articles = await db
      .prepare(
        `SELECT a.*, c.name as category_name, c.name_en as category_name_en, c.slug as category_slug
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         ${whereClause}
         ORDER BY a.created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...bindParams, pageSize, offset)
      .all();

    const items = (articles.results ?? []).map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: r.id,
        title: r.title,
        titleEn: r.title_en,
        summary: r.summary,
        summaryEn: r.summary_en,
        originalUrl: r.original_url,
        originalSource: r.original_source,
        categoryId: r.category_id,
        categoryName: r.category_name,
        categoryNameEn: r.category_name_en,
        categorySlug: r.category_slug,
        language: r.language,
        coverImage: r.cover_image,
        status: r.status,
        viewCount: r.view_count,
        likeCount: r.like_count,
        commentCount: r.comment_count,
        publishedAt: r.published_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    return Response.json(apiPaginated(items, total, page, pageSize));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return Response.json(apiForbidden('需要管理员权限'), { status: 403 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const parsed = createArticleSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const data = parsed.data;
    const db = getDB();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO articles (id, title, title_en, summary, summary_en, original_url, original_source, category_id, language, cover_image, status, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.title,
        data.titleEn ?? null,
        data.summary,
        data.summaryEn ?? null,
        data.originalUrl,
        data.originalSource,
        data.categoryId,
        data.language,
        data.coverImage ?? null,
        data.status,
        data.status === 'published' ? now : null,
        now,
        now
      )
      .run();

    return Response.json(apiSuccess({ id }, '文章创建成功'), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
