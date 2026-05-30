/**
 * API 响应工具函数测试
 * 测试 src/lib/utils/api.ts 中的所有工具函数
 */

import { describe, it, expect } from 'vitest';
import {
  apiSuccess,
  apiError,
  apiPaginated,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
  handleApiError,
} from '@/lib/utils/api';

describe('apiSuccess', () => {
  it('应返回 code=0 的成功响应，默认 message 为 "ok"', () => {
    const result = apiSuccess({ id: '1', title: '测试' });
    expect(result).toEqual({
      code: 0,
      data: { id: '1', title: '测试' },
      message: 'ok',
    });
  });

  it('应支持自定义 message', () => {
    const result = apiSuccess({ id: '1' }, '创建成功');
    expect(result).toEqual({
      code: 0,
      data: { id: '1' },
      message: '创建成功',
    });
  });

  it('应支持 null 数据', () => {
    const result = apiSuccess(null);
    expect(result).toEqual({
      code: 0,
      data: null,
      message: 'ok',
    });
  });

  it('应支持数组数据', () => {
    const result = apiSuccess([1, 2, 3]);
    expect(result).toEqual({
      code: 0,
      data: [1, 2, 3],
      message: 'ok',
    });
  });

  it('应支持空对象数据', () => {
    const result = apiSuccess({});
    expect(result).toEqual({
      code: 0,
      data: {},
      message: 'ok',
    });
  });
});

describe('apiError', () => {
  it('应返回默认 code=500 的错误响应', () => {
    const result = apiError('服务器错误');
    expect(result).toEqual({
      code: 500,
      data: null,
      message: '服务器错误',
    });
  });

  it('应支持自定义错误码', () => {
    const result = apiError('参数错误', 400);
    expect(result).toEqual({
      code: 400,
      data: null,
      message: '参数错误',
    });
  });

  it('应支持 404 错误码', () => {
    const result = apiError('资源不存在', 404);
    expect(result).toEqual({
      code: 404,
      data: null,
      message: '资源不存在',
    });
  });
});

describe('apiPaginated', () => {
  it('应返回正确的分页响应格式', () => {
    const items = [{ id: '1' }, { id: '2' }];
    const result = apiPaginated(items, 100, 1, 20);

    expect(result).toEqual({
      code: 0,
      data: {
        items,
        total: 100,
        page: 1,
        pageSize: 20,
        hasMore: true,
      },
      message: 'ok',
    });
  });

  it('hasMore 应为 true 当 page * pageSize < total', () => {
    const result = apiPaginated(['a'], 50, 2, 20);
    expect(result.data.hasMore).toBe(true);
  });

  it('hasMore 应为 false 当 page * pageSize >= total', () => {
    const result = apiPaginated(['a'], 20, 1, 20);
    expect(result.data.hasMore).toBe(false);
  });

  it('hasMore 应为 false 当刚好是最后一页', () => {
    const result = apiPaginated(['a'], 40, 2, 20);
    expect(result.data.hasMore).toBe(false);
  });

  it('应支持空列表', () => {
    const result = apiPaginated([], 0, 1, 20);
    expect(result).toEqual({
      code: 0,
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasMore: false,
      },
      message: 'ok',
    });
  });

  it('应支持自定义 message', () => {
    const result = apiPaginated([], 0, 1, 20, '查询成功');
    expect(result.message).toBe('查询成功');
  });
});

describe('apiUnauthorized', () => {
  it('应返回 code=401 的未认证响应', () => {
    const result = apiUnauthorized();
    expect(result).toEqual({
      code: 401,
      data: null,
      message: '未登录，请先登录',
    });
  });

  it('应支持自定义消息', () => {
    const result = apiUnauthorized('请重新登录');
    expect(result).toEqual({
      code: 401,
      data: null,
      message: '请重新登录',
    });
  });
});

describe('apiForbidden', () => {
  it('应返回 code=403 的无权限响应', () => {
    const result = apiForbidden();
    expect(result).toEqual({
      code: 403,
      data: null,
      message: '无权限访问',
    });
  });

  it('应支持自定义消息', () => {
    const result = apiForbidden('需要管理员权限');
    expect(result).toEqual({
      code: 403,
      data: null,
      message: '需要管理员权限',
    });
  });
});

describe('apiNotFound', () => {
  it('应返回 code=404 的资源不存在响应', () => {
    const result = apiNotFound();
    expect(result).toEqual({
      code: 404,
      data: null,
      message: '资源不存在',
    });
  });

  it('应支持自定义消息', () => {
    const result = apiNotFound('文章不存在');
    expect(result).toEqual({
      code: 404,
      data: null,
      message: '文章不存在',
    });
  });
});

describe('apiBadRequest', () => {
  it('应返回 code=400 的参数错误响应', () => {
    const result = apiBadRequest();
    expect(result).toEqual({
      code: 400,
      data: null,
      message: '请求参数错误',
    });
  });

  it('应支持自定义消息', () => {
    const result = apiBadRequest('标题不能为空');
    expect(result).toEqual({
      code: 400,
      data: null,
      message: '标题不能为空',
    });
  });
});

describe('handleApiError', () => {
  it('应处理 UNAUTHORIZED 错误', () => {
    const error = new Error('UNAUTHORIZED');
    const result = handleApiError(error);
    expect(result).toEqual({
      body: { code: 401, data: null, message: '未登录，请先登录' },
      status: 401,
    });
  });

  it('应处理 FORBIDDEN 错误', () => {
    const error = new Error('FORBIDDEN');
    const result = handleApiError(error);
    expect(result).toEqual({
      body: { code: 403, data: null, message: '无权限访问' },
      status: 403,
    });
  });

  it('应处理 AGE_VERIFICATION_REQUIRED 错误', () => {
    const error = new Error('AGE_VERIFICATION_REQUIRED');
    const result = handleApiError(error);
    expect(result).toEqual({
      body: { code: 403, data: null, message: '需要年龄认证' },
      status: 403,
    });
  });

  it('应处理未知 Error，返回 500', () => {
    const error = new Error('数据库连接失败');
    const result = handleApiError(error);
    expect(result).toEqual({
      body: { code: 500, data: null, message: '数据库连接失败' },
      status: 500,
    });
  });

  it('应处理非 Error 类型的异常', () => {
    const result = handleApiError('字符串错误');
    expect(result).toEqual({
      body: { code: 500, data: null, message: '服务器内部错误' },
      status: 500,
    });
  });

  it('应处理 null 异常', () => {
    const result = handleApiError(null);
    expect(result).toEqual({
      body: { code: 500, data: null, message: '服务器内部错误' },
      status: 500,
    });
  });

  it('应处理 undefined 异常', () => {
    const result = handleApiError(undefined);
    expect(result).toEqual({
      body: { code: 500, data: null, message: '服务器内部错误' },
      status: 500,
    });
  });
});
