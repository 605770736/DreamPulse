import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/middleware';
import { apiSuccess, apiNotFound, apiBadRequest, apiUnauthorized, handleApiError } from '@/lib/utils/api';
import { auditActionSchema } from '@/lib/utils/validators';

/**
 * PATCH /api/admin/audit/[id] — 审核操作（通过/拒绝）
 * 更新目标内容状态 + 记录审核日志
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const parsed = auditActionSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { targetType, targetId, action, reason } = parsed.data;
    const db = await getDB();

    // 根据目标类型和操作更新对应状态
    if (targetType === 'article') {
      if (action === 'approve') {
        await db
          .prepare("UPDATE articles SET status = 'published', updated_at = datetime('now') WHERE id = ?")
          .bind(targetId)
          .run();
      } else if (action === 'reject') {
        await db
          .prepare("UPDATE articles SET status = 'rejected', updated_at = datetime('now') WHERE id = ?")
          .bind(targetId)
          .run();
      } else if (action === 'hide' || action === 'delete') {
        await db
          .prepare("UPDATE articles SET status = 'archived', updated_at = datetime('now') WHERE id = ?")
          .bind(targetId)
          .run();
      }
    } else if (targetType === 'comment') {
      if (action === 'approve') {
        await db
          .prepare("UPDATE comments SET status = 'published', updated_at = datetime('now') WHERE id = ?")
          .bind(targetId)
          .run();
      } else if (action === 'reject' || action === 'hide') {
        await db
          .prepare("UPDATE comments SET status = 'hidden', updated_at = datetime('now') WHERE id = ?")
          .bind(targetId)
          .run();
      } else if (action === 'delete') {
        await db
          .prepare("UPDATE comments SET status = 'deleted', updated_at = datetime('now') WHERE id = ?")
          .bind(targetId)
          .run();
      }
    } else if (targetType === 'user') {
      if (action === 'ban') {
        await db
          .prepare("UPDATE users SET updated_at = datetime('now') WHERE id = ?")
          .bind(targetId)
          .run();
      } else if (action === 'unban') {
        await db
          .prepare("UPDATE users SET updated_at = datetime('now') WHERE id = ?")
          .bind(targetId)
          .run();
      }
    }

    // 记录审核日志
    const logId = crypto.randomUUID();
    await db
      .prepare(
        'INSERT INTO audit_logs (id, target_type, target_id, action, operator_id, reason) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(logId, targetType, targetId, action, admin.id, reason ?? null)
      .run();

    const actionLabel = action === 'approve' ? '通过' : action === 'reject' ? '拒绝' : action;
    return Response.json(apiSuccess(null, `审核操作成功: ${actionLabel}`));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
