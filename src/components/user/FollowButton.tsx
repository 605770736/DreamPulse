'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n/config';

interface FollowButtonProps {
  /** 目标用户 ID */
  userId: string;
  /** 当前是否已关注 */
  isFollowing: boolean;
  /** 当前语言 */
  locale: Locale;
  /** 关注状态变更回调 */
  onFollowChange?: (following: boolean) => void;
  /** 按钮尺寸 */
  size?: 'sm' | 'md';
}

/**
 * 关注/取关按钮组件
 * 点击切换关注状态
 */
export function FollowButton({
  userId,
  isFollowing: initialFollowing,
  locale,
  onFollowChange,
  size = 'md',
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (following) {
        // 取消关注
        const res = await fetch(`/api/follows?userId=${userId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        // 关注
        const res = await fetch('/api/follows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (res.ok) {
          setFollowing(true);
          onFollowChange?.(true);
        }
      }
    } catch (err) {
      console.error('关注操作失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg font-medium transition-all disabled:opacity-50 ${sizeStyles[size]} ${
        following
          ? 'border border-[var(--color-border)] text-text-secondary hover:border-red-400 hover:text-red-400'
          : 'bg-gradient-to-r from-accent-start to-accent-end text-white hover:opacity-90'
      }`}
    >
      {loading
        ? (locale === 'en' ? '...' : '...')
        : following
          ? (locale === 'en' ? 'Following' : '已关注')
          : (locale === 'en' ? 'Follow' : '关注')
      }
    </button>
  );
}
