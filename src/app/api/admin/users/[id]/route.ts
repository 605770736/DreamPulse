import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/middleware';
import { apiSuccess, apiNotFound, apiBadRequest, apiForbidden, apiUnauthorized, handleApiError } from '@/lib/utils/api';
import { adminUpdateUserSchema } from '@/lib/utils/validators';

/**
 * PATCH /api/admin/users/[id] — 管理用户（封禁/解封/修改角色）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const parsed = adminUpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const data = parsed.data;
    const db = await getDB();

    // 检查用户是否存在
    const user = await db
      .prepare('SELECT id, role FROM users WHERE id = ?')
      .bind(id)
      .first();

    if (!user) {
      return Response.json(apiNotFound('用户不存在'), { status: 404 });
    }

    // 不能修改自己的角色或封禁自己
    if (id === admin.id) {
      return Response.json(apiBadRequest('不能修改自己的状态'), { status: 400 });
    }

    // 不能修改其他管理员
    if ((user as Record<string, unknown>).role === 'admin' && admin.id !== id) {
      return Response.json(apiForbidden('不能修改其他管理员'), { status: 403 });
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    // 修改角色
    if (data.role) {
      updates.push('role = ?');
      values.push(data.role);
    }

    // 封禁/解封（通过修改角色实现，此处记录审核日志）
    if (data.action === 'ban') {
      updates.push('role = ?');
      values.push('banned');
    } else if (data.action === 'unban') {
      updates.push('role = ?');
      values.push('user');
    }

    if (updates.length === 0) {
      return Response.json(apiBadRequest('无更新内容'), { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(id);

    await db
      .prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    // 记录审核日志
    if (data.action) {
      const logId = crypto.randomUUID();
      await db
        .prepare(
          'INSERT INTO audit_logs (id, target_type, target_id, action, operator_id, reason) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .bind(logId, 'user', id, data.action, admin.id, data.reason ?? null)
        .run();
    }

    return Response.json(apiSuccess(null, '用户状态更新成功'));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
