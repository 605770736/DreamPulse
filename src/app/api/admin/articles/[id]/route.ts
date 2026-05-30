import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/middleware';
import { apiSuccess, apiNotFound, apiBadRequest, apiUnauthorized, handleApiError } from '@/lib/utils/api';
import { updateArticleSchema } from '@/lib/utils/validators';

/**
 * GET /api/admin/articles/[id] — 获取单个文章详情（管理）
 * PATCH /api/admin/articles/[id] — 更新文章信息
 * DELETE /api/admin/articles/[id] — 删除文章
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = getDB();

    const article = await db
      .prepare(
        `SELECT a.*, c.name as category_name, c.name_en as category_name_en, c.slug as category_slug
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         WHERE a.id = ?`
      )
      .bind(id)
      .first();

    if (!article) {
      return Response.json(apiNotFound('文章不存在'), { status: 404 });
    }

    return Response.json(apiSuccess(article));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const parsed = updateArticleSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const db = getDB();

    // 检查文章是否存在
    const existing = await db
      .prepare('SELECT id FROM articles WHERE id = ?')
      .bind(id)
      .first();
    if (!existing) {
      return Response.json(apiNotFound('文章不存在'), { status: 404 });
    }

    // 构建动态 UPDATE 语句
    const updates: string[] = [];
    const values: unknown[] = [];
    const data = parsed.data;

    if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
    if (data.titleEn !== undefined) { updates.push('title_en = ?'); values.push(data.titleEn); }
    if (data.summary !== undefined) { updates.push('summary = ?'); values.push(data.summary); }
    if (data.summaryEn !== undefined) { updates.push('summary_en = ?'); values.push(data.summaryEn); }
    if (data.coverImage !== undefined) { updates.push('cover_image = ?'); values.push(data.coverImage); }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
      // 如果状态改为已发布，设置 published_at
      if (data.status === 'published') {
        updates.push("published_at = datetime('now')");
      }
    }

    if (updates.length === 0) {
      return Response.json(apiBadRequest('无更新内容'), { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(id);

    await db
      .prepare(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return Response.json(apiSuccess(null, '文章更新成功'));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = getDB();

    const result = await db
      .prepare('DELETE FROM articles WHERE id = ?')
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return Response.json(apiNotFound('文章不存在'), { status: 404 });
    }

    return Response.json(apiSuccess(null, '文章删除成功'));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
