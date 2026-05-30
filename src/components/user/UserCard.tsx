'use client';

import { useState } from 'react';
import { FollowButton } from './FollowButton';
import type { Locale } from '@/lib/i18n/config';

interface UserCardProps {
  /** 用户 ID */
  userId: string;
  /** 用户名 */
  name: string;
  /** 头像 URL */
  avatarUrl?: string | null;
  /** 简介 */
  bio?: string | null;
  /** 关注者数量 */
  followerCount?: number;
  /** 正在关注数量 */
  followingCount?: number;
  /** 文章数量 */
  articleCount?: number;
  /** 当前用户是否已关注 */
  isFollowing?: boolean;
  /** 当前语言 */
  locale: Locale;
  /** 当前用户 ID（未登录为 null） */
  currentUserId?: string | null;
}

/**
 * 用户信息卡片组件
 * 展示头像、用户名、简介、关注数、文章数、关注按钮
 */
export function UserCard({
  userId,
  name,
  avatarUrl,
  bio,
  followerCount = 0,
  followingCount = 0,
  articleCount = 0,
  isFollowing = false,
  locale,
  currentUserId,
}: UserCardProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [followers, setFollowers] = useState(followerCount);

  const handleFollowChange = (nowFollowing: boolean) => {
    setFollowing(nowFollowing);
    setFollowers((prev) => (nowFollowing ? prev + 1 : Math.max(0, prev - 1)));
  };

  // 不对自己显示关注按钮
  const isSelf = currentUserId === userId;

  return (
    <div className="glass card-hover p-5">
      <div className="flex items-start gap-4">
        {/* 头像 */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-start to-accent-end text-lg font-bold text-white">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            name[0]?.toUpperCase() ?? 'U'
          )}
        </div>

        {/* 用户信息 */}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-text-primary">{name}</h3>
          {bio && (
            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{bio}</p>
          )}

          {/* 数据统计 */}
          <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary">
            <span>
              <strong className="text-text-primary">{followers}</strong>{' '}
              {locale === 'en' ? 'followers' : '关注者'}
            </span>
            <span>
              <strong className="text-text-primary">{followingCount}</strong>{' '}
              {locale === 'en' ? 'following' : '关注'}
            </span>
            <span>
              <strong className="text-text-primary">{articleCount}</strong>{' '}
              {locale === 'en' ? 'articles' : '文章'}
            </span>
          </div>
        </div>

        {/* 关注按钮 */}
        {!isSelf && (
          <FollowButton
            userId={userId}
            isFollowing={following}
            locale={locale}
            onFollowChange={handleFollowChange}
          />
        )}
      </div>
    </div>
  );
}
