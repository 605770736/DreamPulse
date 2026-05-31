import { query } from '@/lib/db/client';
import { apiSuccess, handleApiError } from '@/lib/utils/api';
import type { CategoryRow } from '@/lib/db/schema';

/**
 * GET /api/categories — 版块列表
 */
export async function GET() {
  try {
    const categories = await query<CategoryRow>(
      'SELECT * FROM categories WHERE is_visible = 1 ORDER BY sort_order ASC'
    );

    const data = categories.map((c) => ({
      id: c.id,
      name: c.name,
      nameEn: c.name_en,
      slug: c.slug,
      icon: c.icon,
      sortOrder: c.sort_order,
      isAdult: c.is_adult === 1,
      isVisible: c.is_visible === 1,
      createdAt: c.created_at,
    }));

    return Response.json(apiSuccess(data));
  } catch (error) {
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
