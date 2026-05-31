import { getDB } from '@/lib/db/client';
import { apiSuccess, apiNotFound, handleApiError } from '@/lib/utils/api';

/**
 * GET /api/share/[id] — 获取文章分享 OG 数据
 * 用于社交平台预览卡片（标题、描述、图片）
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDB();

    // 查询文章
    const article = await db
      .prepare(
        `SELECT a.id, a.title, a.title_en, a.summary, a.summary_en,
                a.cover_image, a.original_source, a.published_at,
                c.name as category_name, c.name_en as category_name_en
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         WHERE a.id = ? AND a.status = 'published'`
      )
      .bind(id)
      .first();

    if (!article) {
      return Response.json(apiNotFound('文章不存在'), { status: 404 });
    }

    const row = article as Record<string, unknown>;

    const shareData = {
      id: row.id as string,
      title: row.title as string,
      titleEn: row.title_en as string | null,
      description: row.summary as string,
      descriptionEn: row.summary_en as string | null,
      image: row.cover_image as string | null,
      source: row.original_source as string,
      category: row.category_name as string | null,
      categoryEn: row.category_name_en as string | null,
      publishedAt: row.published_at as string | null,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dreampulse.app'}/article/${id}`,
    };

    return Response.json(apiSuccess(shareData));
  } catch (error) {
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
