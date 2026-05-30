import { NextRequest } from 'next/server';
import { getDB } from '@/lib/db/client';
import { requireAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiBadRequest, apiUnauthorized, apiError, handleApiError } from '@/lib/utils/api';
import { ageVerifySendSchema } from '@/lib/utils/validators';

/**
 * POST /api/auth/age-verify/send — 发送年龄验证短信验证码
 * MVP 阶段：生成验证码并存入数据库，模拟发送
 * 生产阶段：接入 Twilio Verify API
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // 参数校验
    const parsed = ageVerifySendSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(apiBadRequest(parsed.error.issues[0].message), { status: 400 });
    }

    const { phone } = parsed.data;
    const db = getDB();

    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = 300; // 5分钟过期

    // 删除该用户之前的未验证记录
    await db
      .prepare('DELETE FROM age_verifications WHERE user_id = ? AND is_verified = 0')
      .bind(user.id)
      .run();

    // 插入新验证码记录
    await db
      .prepare(
        `INSERT INTO age_verifications (id, user_id, phone, code, is_verified, expires_at)
         VALUES (?, ?, ?, ?, 0, datetime('now', '+5 minutes'))`
      )
      .bind(crypto.randomUUID(), user.id, phone, code)
      .run();

    // MVP 阶段：在控制台输出验证码（生产环境应发送短信）
    console.log(`[年龄验证] 手机号: ${phone}, 验证码: ${code}`);

    // 生产环境：调用 Twilio Verify API
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_VERIFY_SERVICE_SID) {
      try {
        const twilioResponse = await fetch(
          `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/Verifications`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `To=${encodeURIComponent(phone)}&Channel=sms`,
          }
        );

        if (!twilioResponse.ok) {
          console.error('Twilio 发送失败:', await twilioResponse.text());
          // 回退到本地验证码模式
        }
      } catch (twilioError) {
        console.error('Twilio 调用异常:', twilioError);
      }
    }

    return Response.json(apiSuccess({ expiresIn }, '验证码已发送'));
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(apiUnauthorized(), { status: 401 });
    }
    const { body, status } = handleApiError(error);
    return Response.json(body, { status });
  }
}
