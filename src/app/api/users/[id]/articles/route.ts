import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { apiPaginated, apiBadRequest, handleApiError } from '@/lib/utils/api';
import { paginationSchema } from '@/lib/utils/validators';

/**
 * GET /api/users/[id]/articles — 获取用户发布的文章（分页）
 * 公开接口，返回指定用户的文章列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
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
    const db = await getDB();

    // 注意：当前 articles 表没有 author_id 字段
    // 爬虫入库的文章无作者关联，此接口预留用户原创文章查询
    // 当前返回空列表，后续迭代增加 author_id 字段后完善
    const total = 0;
    const items: unknown[] = [];

    return Response.json(apiPaginated(items, total, page, pageSize));
  } catch (error) {
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
