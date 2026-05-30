/**
 * R2 存储工具函数
 * 封装 Cloudflare R2 操作，提供上传、获取 URL 等功能
 */

import { getR2 } from '@/lib/db/client';

/**
 * 上传文件到 R2 存储桶
 *
 * @param key - 存储键名（路径），如 "images/cover/xxx.jpg"
 * @param data - 文件数据（Buffer、ArrayBuffer、ReadableStream 或字符串）
 * @param contentType - MIME 类型
 * @returns 上传后的存储键名
 *
 * @example
 * ```ts
 * const key = await uploadToR2(
 *   `images/cover/${articleId}.jpg`,
 *   imageBuffer,
 *   'image/jpeg'
 * );
 * ```
 */
export async function uploadToR2(
  key: string,
  data: ArrayBuffer | ReadableStream | string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  const r2 = getR2();

  await r2.put(key, data, {
    httpMetadata: {
      contentType,
    },
    customMetadata: {
      uploadedAt: new Date().toISOString(),
    },
  });

  return key;
}

/**
 * 从 R2 获取文件
 *
 * @param key - 存储键名
 * @returns R2ObjectBody 或 null（文件不存在）
 */
export async function getFromR2(key: string): Promise<R2ObjectBody | null> {
  const r2 = getR2();
  return r2.get(key);
}

/**
 * 删除 R2 中的文件
 *
 * @param key - 存储键名
 */
export async function deleteFromR2(key: string): Promise<void> {
  const r2 = getR2();
  await r2.delete(key);
}

/**
 * 获取 R2 文件的公开访问 URL
 * 假设 R2 存储桶已配置自定义域名或使用 Cloudflare 公开访问
 *
 * @param key - 存储键名
 * @returns 公开访问 URL
 *
 * @example
 * ```ts
 * const imageUrl = getR2PublicUrl('images/cover/abc123.jpg');
 * // 返回 "https://assets.dreampulse.pages.dev/images/cover/abc123.jpg"
 * ```
 */
export function getR2PublicUrl(key: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dreampulse.pages.dev';
  // 如果配置了自定义 R2 域名，使用自定义域名
  // 否则使用 Cloudflare Pages 提供的公开 URL
  const r2PublicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
  if (r2PublicDomain) {
    return `https://${r2PublicDomain}/${key}`;
  }
  return `${baseUrl}/cdn/assets/${key}`;
}

/**
 * 生成唯一的 R2 存储键名
 * 基于时间戳和随机字符串，避免命名冲突
 *
 * @param prefix - 路径前缀（如 "images/cover"）
 * @param extension - 文件扩展名（如 ".jpg"）
 * @returns 唯一的存储键名
 *
 * @example
 * ```ts
 * const key = generateR2Key('images/cover', '.jpg');
 * // 返回 "images/cover/2026-05-30/abc123.jpg"
 * ```
 */
export function generateR2Key(prefix: string, extension: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}/${date}/${random}${extension}`;
}

/**
 * 上传封面图到 R2
 * 便捷方法，自动生成键名并返回公开 URL
 *
 * @param imageData - 图片数据
 * @param contentType - 图片 MIME 类型
 * @returns 公开访问 URL
 */
export async function uploadCoverImage(
  imageData: ArrayBuffer,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const ext = contentType.split('/')[1] ?? 'jpg';
  const key = generateR2Key('images/cover', `.${ext}`);
  await uploadToR2(key, imageData, contentType);
  return getR2PublicUrl(key);
}

/**
 * 上传用户头像到 R2
 *
 * @param userId - 用户 ID
 * @param imageData - 图片数据
 * @param contentType - 图片 MIME 类型
 * @returns 公开访问 URL
 */
export async function uploadAvatar(
  userId: string,
  imageData: ArrayBuffer,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const ext = contentType.split('/')[1] ?? 'jpg';
  const key = `images/avatar/${userId}.${ext}`;
  await uploadToR2(key, imageData, contentType);
  return getR2PublicUrl(key);
}
