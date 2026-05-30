import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/middleware';
import { apiPaginated, apiBadRequest, apiUnauthorized, handleApiError } from '@/lib/utils/api';
import { paginationSchema } from '@/lib/utils/validators';

/**
 * GET /api/admin/audit — 审核列表（待审核内容，分页）
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
    const db = getDB();

    // 查询待审核的审核日志
    // 这里查询所有审核记录作为审核队列
    const countResult = await db
      .prepare('SELECT COUNT(*) as total FROM audit_logs')
      .first();
    const total = (countResult as Record<string, number>)?.total ?? 0;

    const audits = await db
      .prepare(
        `SELECT al.id, al.target_type, al.target_id, al.action, al.operator_id, al.reason, al.created_at
         FROM audit_logs al
         ORDER BY al.created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(pageSize, offset)
      .all();

    // 为每个审核项补充目标内容预览
    const items = await Promise.all(
      (audits.results ?? []).map(async (row) => {
        const r = row as Record<string, unknown>;
        let targetContent: string | null = null;
        let targetTitle: string | null = null;
        let targetAuthor: string | null = null;

        try {
          const targetType = r.target_type as string;
          const targetId = r.target_id as string;

          if (targetType === 'article') {
            const article = await db
              .prepare('SELECT title, title_en, summary FROM articles WHERE id = ?')
              .bind(targetId)
              .first();
            if (article) {
              const a = article as Record<string, unknown>;
              targetTitle = (a.title as string) ?? null;
              targetContent = (a.summary as string) ?? null;
            }
          } else if (targetType === 'comment') {
            const comment = await db
              .prepare(
                `SELECT c.content, u.name as user_name FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?`
              )
              .bind(targetId)
              .first();
            if (comment) {
              const c = comment as Record<string, unknown>;
              targetContent = (c.content as string) ?? null;
              targetAuthor = (c.user_name as string) ?? null;
            }
          } else if (targetType === 'user') {
            const user = await db
              .prepare('SELECT name, email FROM users WHERE id = ?')
              .bind(targetId)
              .first();
            if (user) {
              const u = user as Record<string, unknown>;
              targetTitle = (u.name as string) ?? null;
              targetContent = (u.email as string) ?? null;
            }
          }
        } catch {
          // 预览信息获取失败不影响主查询
        }

        return {
          id: r.id,
          targetType: r.target_type,
          targetId: r.target_id,
          action: r.action,
          operatorId: r.operator_id,
          reason: r.reason,
          createdAt: r.created_at,
          targetContent,
          targetTitle,
          targetAuthor,
        };
      })
    );

    return Response.json(apiPaginated(items, total, page, pageSize));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
