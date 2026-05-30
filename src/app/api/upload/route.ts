import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { uploadToR2, generateR2Key, getR2PublicUrl } from '@/lib/r2/client';
import { apiSuccess, apiBadRequest, apiUnauthorized, handleApiError } from '@/lib/utils/api';

/** 允许的文件类型 */
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/** 最大文件大小：5MB */
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * POST /api/upload — 文件上传到 R2
 * 支持图片上传（封面图、头像等）
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json(apiBadRequest('请选择文件'), { status: 400 });
    }

    // 文件类型校验
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(apiBadRequest('不支持的文件类型，仅支持 JPG/PNG/WebP/GIF'), { status: 400 });
    }

    // 文件大小校验
    if (file.size > MAX_SIZE) {
      return Response.json(apiBadRequest('文件大小不能超过 5MB'), { status: 400 });
    }

    // 生成存储键名
    const ext = file.type.split('/')[1] ?? 'jpg';
    const prefix = formData.get('prefix') as string ?? 'images/upload';
    const key = generateR2Key(prefix, `.${ext}`);

    // 上传到 R2
    const buffer = await file.arrayBuffer();
    await uploadToR2(key, buffer, file.type);

    // 返回公开 URL
    const url = getR2PublicUrl(key);

    return Response.json(apiSuccess({ url, key }, '上传成功'), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
