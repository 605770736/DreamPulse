'use client';

import { useState } from 'react';
import { ShareModal } from '@/components/common/ShareModal';
import type { Locale } from '@/lib/i18n/config';

interface ActionBarProps {
  /** 文章 ID */
  articleId: string;
  /** 当前语言 */
  locale: Locale;
  /** 文章点赞数 */
  likeCount: number;
  /** 文章评论数 */
  commentCount?: number;
  /** 文章浏览量 */
  viewCount?: number;
  /** 当前用户是否已点赞 */
  isLiked?: boolean;
  /** 当前用户是否已收藏 */
  isFavorited?: boolean;
  /** 作者用户 ID */
  authorId?: string | null;
  /** 当前用户是否已关注作者 */
  isFollowingAuthor?: boolean;
  /** 当前用户 ID（未登录为 null） */
  currentUserId?: string | null;
  /** 点赞状态变更回调 */
  onLikeChange?: (liked: boolean, count: number) => void;
  /** 收藏状态变更回调 */
  onFavoriteChange?: (favorited: boolean) => void;
  /** 关注状态变更回调 */
  onFollowChange?: (following: boolean) => void;
}

/**
 * 文章互动栏组件
 * 悬浮在文章底部，包含点赞/收藏/分享/关注作者按钮
 */
export function ActionBar({
  articleId,
  locale,
  likeCount,
  isLiked: initialLiked = false,
  isFavorited: initialFavorited = false,
  authorId,
  isFollowingAuthor: initialFollowing,
  currentUserId,
  onLikeChange,
  onFavoriteChange,
  onFollowChange,
}: ActionBarProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(likeCount);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  /** 点赞/取消点赞 */
  const handleLike = async () => {
    if (loadingAction) return;
    setLoadingAction('like');
    try {
      if (liked) {
        const res = await fetch(`/api/likes?targetType=article&targetId=${articleId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          const newLiked = false;
          const newCount = Math.max(0, likes - 1);
          setLiked(newLiked);
          setLikes(newCount);
          onLikeChange?.(newLiked, newCount);
        }
      } else {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType: 'article', targetId: articleId }),
        });
        if (res.ok) {
          const newLiked = true;
          const newCount = likes + 1;
          setLiked(newLiked);
          setLikes(newCount);
          onLikeChange?.(newLiked, newCount);
        }
      }
    } catch (err) {
      console.error('点赞操作失败:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  /** 收藏/取消收藏 */
  const handleFavorite = async () => {
    if (loadingAction) return;
    setLoadingAction('favorite');
    try {
      if (favorited) {
        const res = await fetch(`/api/favorites?articleId=${articleId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setFavorited(false);
          onFavoriteChange?.(false);
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        });
        if (res.ok) {
          setFavorited(true);
          onFavoriteChange?.(true);
        }
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  /** 关注/取消关注作者 */
  const handleFollow = async () => {
    if (loadingAction || !authorId) return;
    setLoadingAction('follow');
    try {
      if (following) {
        const res = await fetch(`/api/follows?userId=${authorId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        const res = await fetch('/api/follows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authorId }),
        });
        if (res.ok) {
          setFollowing(true);
          onFollowChange?.(true);
        }
      }
    } catch (err) {
      console.error('关注操作失败:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  // 不显示关注自己的按钮
  const showFollow = authorId && currentUserId && authorId !== currentUserId;

  return (
    <>
      <div className="sticky bottom-0 z-40 border-t border-[var(--color-border)] bg-dream-dark/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          {/* 左侧：点赞 + 收藏 */}
          <div className="flex items-center gap-4">
            {/* 点赞 */}
            <button
              onClick={handleLike}
              disabled={loadingAction === 'like'}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all ${
                liked
                  ? 'bg-accent-start/20 text-accent-start'
                  : 'text-text-secondary hover:bg-white/5 hover:text-accent-start'
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{likes}</span>
            </button>

            {/* 收藏 */}
            <button
              onClick={handleFavorite}
              disabled={loadingAction === 'favorite'}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all ${
                favorited
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'text-text-secondary hover:bg-white/5 hover:text-yellow-400'
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={favorited ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>{favorited ? (locale === 'en' ? 'Saved' : '已收藏') : (locale === 'en' ? 'Save' : '收藏')}</span>
            </button>
          </div>

          {/* 右侧：关注作者 + 分享 */}
          <div className="flex items-center gap-3">
            {/* 关注作者 */}
            {showFollow && (
              <button
                onClick={handleFollow}
                disabled={loadingAction === 'follow'}
                className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                  following
                    ? 'border border-[var(--color-border)] text-text-secondary hover:border-red-400 hover:text-red-400'
                    : 'bg-gradient-to-r from-accent-start to-accent-end text-white hover:opacity-90'
                }`}
              >
                {following
                  ? (locale === 'en' ? 'Unfollow' : '已关注')
                  : (locale === 'en' ? 'Follow' : '关注')
                }
              </button>
            )}

            {/* 分享 */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              {locale === 'en' ? 'Share' : '分享'}
            </button>
          </div>
        </div>
      </div>

      {/* 分享弹窗 */}
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        articleId={articleId}
        locale={locale}
      />
    </>
  );
}
