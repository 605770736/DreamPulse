import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { apiSuccess, apiPaginated, apiBadRequest, handleApiError } from '@/lib/utils/api';
import { articleListQuerySchema } from '@/lib/utils/validators';
import type { ArticleRow, CategoryRow } from '@/lib/db/schema';

/**
 * GET /api/articles — 文章列表（分页、版块筛选、语言筛选）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const rawQuery = {
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      lang: searchParams.get('lang') ?? undefined,
    };

    // 参数校验
    const parsed = articleListQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { page, pageSize, category, lang } = parsed.data;
    const offset = (page - 1) * pageSize;

    // 构建查询条件
    const conditions: string[] = ["a.status = 'published'"];
    const params: unknown[] = [];

    if (category) {
      conditions.push('c.slug = ?');
      params.push(category);
    }

    if (lang) {
      conditions.push('a.language = ?');
      params.push(lang);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM articles a LEFT JOIN categories c ON a.category_id = c.id ${whereClause}`;
    const countResult = await queryOne<{ total: number }>(countSql, ...params);
    const total = countResult?.total ?? 0;

    // 查询文章列表
    const listSql = `SELECT a.*, c.name as category_name, c.name_en as category_name_en, c.slug as category_slug
      FROM articles a LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.published_at DESC LIMIT ? OFFSET ?`;
    const articles = await query<ArticleRow & { category_name: string; category_name_en: string; category_slug: string }>(
      listSql, ...params, pageSize, offset
    );

    // 格式化返回数据
    const items = articles.map((a) => ({
      id: a.id,
      title: a.title,
      titleEn: a.title_en,
      summary: a.summary,
      summaryEn: a.summary_en,
      originalSource: a.original_source,
      categoryId: a.category_id,
      categorySlug: a.category_slug,
      categoryName: a.category_name,
      categoryNameEn: a.category_name_en,
      coverImage: a.cover_image,
      viewCount: a.view_count,
      likeCount: a.like_count,
      commentCount: a.comment_count,
      publishedAt: a.published_at,
      language: a.language,
    }));

    return Response.json(apiPaginated(items, total, page, pageSize));
  } catch (error) {
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}

