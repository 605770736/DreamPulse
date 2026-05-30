/**
 * API 响应格式化工具
 * 遵循架构文档 7.3 节的 API 约定：{code, data, message} 格式
 */

import type { ApiResponse, PaginatedData, PaginatedResponse } from '@/types/api';

/**
 * 成功响应
 *
 * @param data - 响应数据
 * @param message - 成功消息（默认 'ok'）
 * @returns 格式化的成功响应
 *
 * @example
 * ```ts
 * return Response.json(apiSuccess({ id: '123', title: '标题' }));
 * ```
 */
export function apiSuccess<T>(data: T, message: string = 'ok'): ApiResponse<T> {
  return {
    code: 0,
    data,
    message,
  };
}

/**
 * 错误响应
 *
 * @param message - 错误消息
 * @param code - 错误码（默认 500）
 * @returns 格式化的错误响应
 *
 * @example
 * ```ts
 * return Response.json(apiError('文章不存在', 404), { status: 404 });
 * ```
 */
export function apiError(message: string, code: number = 500): ApiResponse<null> {
  return {
    code,
    data: null,
    message,
  };
}

/**
 * 分页响应
 *
 * @param items - 数据列表
 * @param total - 总条数
 * @param page - 当前页码
 * @param pageSize - 每页条数
 * @param message - 响应消息
 * @returns 格式化的分页响应
 *
 * @example
 * ```ts
 * return Response.json(apiPaginated(articles, 100, 1, 20));
 * ```
 */
export function apiPaginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = 'ok'
): PaginatedResponse<T> {
  const hasMore = page * pageSize < total;
  const paginatedData: PaginatedData<T> = {
    items,
    total,
    page,
    pageSize,
    hasMore,
  };
  return {
    code: 0,
    data: paginatedData,
    message,
  };
}

/**
 * 未认证响应（401）
 *
 * @param message - 错误消息
 * @returns 401 错误响应
 */
export function apiUnauthorized(message: string = '未登录，请先登录'): ApiResponse<null> {
  return apiError(message, 401);
}

/**
 * 无权限响应（403）
 *
 * @param message - 错误消息
 * @returns 403 错误响应
 */
export function apiForbidden(message: string = '无权限访问'): ApiResponse<null> {
  return apiError(message, 403);
}

/**
 * 资源不存在响应（404）
 *
 * @param message - 错误消息
 * @returns 404 错误响应
 */
export function apiNotFound(message: string = '资源不存在'): ApiResponse<null> {
  return apiError(message, 404);
}

/**
 * 参数验证失败响应（400）
 *
 * @param message - 错误消息
 * @returns 400 错误响应
 */
export function apiBadRequest(message: string = '请求参数错误'): ApiResponse<null> {
  return apiError(message, 400);
}

/**
 * 处理 API 路由中的异常
 * 统一捕获并返回格式化的错误响应
 *
 * @param error - 捕获的异常
 * @returns 格式化的错误响应和 HTTP 状态码
 *
 * @example
 * ```ts
 * try {
 *   const user = await requireAuth();
 *   // ... 业务逻辑
 * } catch (error) {
 *   const { body, status } = handleApiError(error);
 *   return Response.json(body, { status });
 * }
 * ```
 */
export function handleApiError(error: unknown): { body: ApiResponse<null>; status: number } {
  if (error instanceof Error) {
    switch (error.message) {
      case 'UNAUTHORIZED':
        return { body: apiUnauthorized(), status: 401 };
      case 'FORBIDDEN':
        return { body: apiForbidden(), status: 403 };
      case 'AGE_VERIFICATION_REQUIRED':
        return { body: apiForbidden('需要年龄认证'), status: 403 };
      default:
        console.error('API 错误:', error);
        return { body: apiError(error.message), status: 500 };
    }
  }

  console.error('未知错误:', error);
  return { body: apiError('服务器内部错误'), status: 500 };
}
