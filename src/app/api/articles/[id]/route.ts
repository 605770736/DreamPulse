import { NextRequest } from 'next/server';
import { queryOne, execute } from '@/lib/db/client';
import { apiSuccess, apiNotFound, handleApiError } from '@/lib/utils/api';
import type { ArticleRow, CategoryRow } from '@/lib/db/schema';

/**
 * GET /api/articles/[id] — 文章详情（含浏览量+1）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 查询文章
    const article = await queryOne<ArticleRow>(
      'SELECT * FROM articles WHERE id = ?',
      id
    );

    if (!article || article.status !== 'published') {
      return Response.json(apiNotFound('文章不存在'), { status: 404 });
    }

    // 查询版块
    const category = await queryOne<CategoryRow>(
      'SELECT * FROM categories WHERE id = ?',
      article.category_id
    );

    // 异步增加浏览量
    execute('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', id).catch(() => {});

    // 格式化返回
    const data = {
      id: article.id,
      title: article.title,
      titleEn: article.title_en,
      summary: article.summary,
      summaryEn: article.summary_en,
      originalUrl: article.original_url,
      originalSource: article.original_source,
      categoryId: article.category_id,
      language: article.language,
      coverImage: article.cover_image,
      status: article.status,
      viewCount: article.view_count + 1, // 返回增加后的值
      likeCount: article.like_count,
      commentCount: article.comment_count,
      publishedAt: article.published_at,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      category: category ? {
        id: category.id,
        name: category.name,
        nameEn: category.name_en,
        slug: category.slug,
        icon: category.icon,
        isAdult: category.is_adult === 1,
      } : null,
    };

    return Response.json(apiSuccess(data));
  } catch (error) {
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
