'use client';

import { useState, useCallback } from 'react';
import { CommentForm } from './CommentForm';
import type { Locale } from '@/lib/i18n/config';
import type { ApiResponse, PaginatedData } from '@/types/api';

/** 评论数据结构 */
interface CommentData {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  parentId: string | null;
  content: string;
  status: string;
  likeCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** 回复数据结构 */
interface ReplyData {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  parentId: string | null;
  content: string;
  createdAt: string;
}

interface CommentItemProps {
  /** 评论数据 */
  comment: CommentData;
  /** 当前语言 */
  locale: Locale;
  /** 当前用户 ID */
  currentUserId?: string | null;
  /** 删除回调 */
  onDeleted?: () => void;
  /** 回复提交回调 */
  onReplySubmitted?: () => void;
}

/**
 * 单条评论组件
 * 展示头像、用户名、内容、时间、回复按钮、点赞数、回复列表
 */
export function CommentItem({
  comment,
  locale,
  currentUserId,
  onDeleted,
  onReplySubmitted,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [likes, setLikes] = useState(comment.likeCount ?? 0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  /** 加载回复列表 */
  const loadReplies = useCallback(async () => {
    if (replies.length > 0) {
      // 已加载过则切换显示
      return;
    }
    setRepliesLoading(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/replies?page=1&pageSize=50`);
      const data = await res.json() as ApiResponse<PaginatedData<ReplyData>>;
      if (data.code === 0) {
        setReplies(data.data?.items ?? []);
      }
    } catch (err) {
      console.error('加载回复失败:', err);
    } finally {
      setRepliesLoading(false);
    }
  }, [comment.id, replies.length]);

  /** 点赞 */
  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      if (liked) {
        await fetch(`/api/likes?targetType=comment&targetId=${comment.id}`, {
          method: 'DELETE',
        });
        setLiked(false);
        setLikes((prev) => Math.max(0, prev - 1));
      } else {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType: 'comment', targetId: comment.id }),
        });
        if (res.ok) {
          setLiked(true);
          setLikes((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error('点赞操作失败:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  /** 删除评论 */
  const handleDelete = async () => {
    if (!confirm(locale === 'en' ? 'Delete this comment?' : '确定删除这条评论？')) return;
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted?.();
      }
    } catch (err) {
      console.error('删除评论失败:', err);
    }
  };

  /** 格式化时间 */
  const formatTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffMin < 1) return locale === 'en' ? 'Just now' : '刚刚';
      if (diffMin < 60) return `${diffMin}${locale === 'en' ? 'm ago' : '分钟前'}`;
      if (diffHour < 24) return `${diffHour}${locale === 'en' ? 'h ago' : '小时前'}`;
      if (diffDay < 30) return `${diffDay}${locale === 'en' ? 'd ago' : '天前'}`;
      return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN');
    } catch {
      return dateStr;
    }
  };

  const isOwner = currentUserId === comment.userId;

  return (
    <div className="glass p-4">
      {/* 评论头部 */}
      <div className="mb-2 flex items-center gap-2">
        {/* 头像 */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-start/20 text-xs font-bold text-accent-start">
          {(comment.userName ?? 'U')[0].toUpperCase()}
        </div>
        {/* 用户名+时间 */}
        <span className="text-sm font-medium text-text-primary">
          {comment.userName || (locale === 'en' ? 'Anonymous' : '匿名用户')}
        </span>
        <span className="text-xs text-text-secondary">
          {formatTime(comment.createdAt)}
        </span>
      </div>

      {/* 评论内容 */}
      <p className="mb-3 text-sm text-text-secondary">{comment.content}</p>

      {/* 操作栏 */}
      <div className="flex items-center gap-4 text-xs text-text-secondary">
        {/* 点赞 */}
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center gap-1 transition-colors ${
            liked ? 'text-accent-start' : 'hover:text-accent-start'
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {likes > 0 && <span>{likes}</span>}
        </button>

        {/* 回复按钮 */}
        <button
          onClick={() => {
            setShowReplyForm(!showReplyForm);
            loadReplies();
          }}
          className="flex items-center gap-1 transition-colors hover:text-accent-start"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 17 4 22 4 12 4 2 20 2 20 12 9 12"/>
          </svg>
          {locale === 'en' ? 'Reply' : '回复'}
        </button>

        {/* 删除按钮（仅评论作者可见） */}
        {isOwner && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 transition-colors hover:text-red-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            {locale === 'en' ? 'Delete' : '删除'}
          </button>
        )}
      </div>

      {/* 回复列表 */}
      {(repliesLoading || replies.length > 0) && (
        <div className="ml-8 mt-3 space-y-3 border-l border-[var(--color-border)] pl-4">
          {repliesLoading && replies.length === 0 && (
            <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
          )}
          {replies.map((reply) => (
            <div key={reply.id} className="py-1">
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-start/10 text-[10px] font-bold text-accent-start">
                  {(reply.userName ?? 'U')[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium text-text-primary">
                  {reply.userName || (locale === 'en' ? 'Anonymous' : '匿名用户')}
                </span>
                <span className="text-[10px] text-text-secondary">
                  {formatTime(reply.createdAt)}
                </span>
              </div>
              <p className="text-xs text-text-secondary">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* 回复输入框 */}
      {showReplyForm && (
        <div className="ml-8 mt-3">
          <CommentForm
            articleId={comment.articleId}
            parentId={comment.id}
            locale={locale}
            onSubmitted={() => {
              setShowReplyForm(false);
              onReplySubmitted?.();
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}
    </div>
  );
}
