import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { apiSuccess, apiNotFound, handleApiError } from '@/lib/utils/api';

/**
 * GET /api/users/[id] — 获取用户公开资料
 * 无需认证，返回公开信息
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDB();

    // 查询用户基本信息
    const user = await db
      .prepare('SELECT id, name, avatar_url, role, locale, created_at FROM users WHERE id = ?')
      .bind(id)
      .first();

    if (!user) {
      return Response.json(apiNotFound('用户不存在'), { status: 404 });
    }

    const row = user as Record<string, unknown>;

    // 查询关注者数量
    const followerCount = await db
      .prepare('SELECT COUNT(*) as total FROM follows WHERE following_id = ?')
      .bind(id)
      .first();

    // 查询正在关注数量
    const followingCount = await db
      .prepare('SELECT COUNT(*) as total FROM follows WHERE follower_id = ?')
      .bind(id)
      .first();

    // 查询发布文章数量
    const articleCount = await db
      .prepare("SELECT COUNT(*) as total FROM articles WHERE category_id IN (SELECT id FROM categories) AND original_source = ? AND status = 'published'")
      .bind(row.name as string)
      .first();

    // 注意：由于文章表没有 author_id 字段，这里用 0 作为默认值
    // 爬虫入库的文章没有作者关联，此字段为占位
    const publishedArticleCount = 0;

    const profile = {
      id: row.id as string,
      name: row.name as string,
      avatarUrl: row.avatar_url as string | null,
      role: row.role as string,
      locale: row.locale as string,
      followerCount: (followerCount as Record<string, number>)?.total ?? 0,
      followingCount: (followingCount as Record<string, number>)?.total ?? 0,
      articleCount: publishedArticleCount,
      createdAt: row.created_at as string,
    };

    return Response.json(apiSuccess(profile));
  } catch (error) {
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
