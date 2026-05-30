import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/middleware';
import { apiPaginated, apiBadRequest, apiUnauthorized, handleApiError } from '@/lib/utils/api';
import { paginationSchema } from '@/lib/utils/validators';

/**
 * GET /api/admin/users — 管理用户列表（分页、搜索、筛选）
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
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // 构建 WHERE 条件
    const conditions: string[] = [];
    const bindParams: unknown[] = [];

    if (role) {
      conditions.push('role = ?');
      bindParams.push(role);
    }
    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      bindParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const db = getDB();

    // 查询总数
    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM users ${whereClause}`)
      .bind(...bindParams)
      .first();
    const total = (countResult as Record<string, number>)?.total ?? 0;

    // 查询用户列表
    const users = await db
      .prepare(
        `SELECT id, name, email, avatar_url, role, locale, age_verified, created_at
         FROM users
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...bindParams, pageSize, offset)
      .all();

    const items = (users.results ?? []).map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        avatarUrl: r.avatar_url,
        role: r.role,
        locale: r.locale,
        ageVerified: r.age_verified === 1,
        createdAt: r.created_at,
      };
    });

    return Response.json(apiPaginated(items, total, page, pageSize));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
