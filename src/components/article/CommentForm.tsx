'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Locale } from '@/lib/i18n/config';
import type { ApiResponse } from '@/types/api';

interface CommentFormProps {
  /** 文章 ID */
  articleId: string;
  /** 父评论 ID（回复时传入） */
  parentId?: string | null;
  /** 当前语言 */
  locale: Locale;
  /** 提交成功回调 */
  onSubmitted?: () => void;
  /** 取消回调 */
  onCancel?: () => void;
}

/**
 * 评论/回复输入框组件
 * 包含 textarea 和提交按钮，需登录
 */
export function CommentForm({
  articleId,
  parentId = null,
  locale,
  onSubmitted,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 提交评论 */
  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError(locale === 'en' ? 'Comment cannot be empty' : '评论内容不能为空');
      return;
    }
    if (trimmed.length > 2000) {
      setError(locale === 'en' ? 'Comment too long (max 2000 chars)' : '评论不能超过2000字');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content: trimmed,
          parentId: parentId ?? undefined,
        }),
      });

      const data = await res.json() as ApiResponse<{ id: string }>;

      if (res.ok && data.code === 0) {
        setContent('');
        onSubmitted?.();
      } else if (res.status === 401) {
        setError(locale === 'en' ? 'Please login first' : '请先登录');
      } else {
        setError(data.message ?? (locale === 'en' ? 'Failed to post' : '发表失败'));
      }
    } catch (err) {
      console.error('提交评论失败:', err);
      setError(locale === 'en' ? 'Network error' : '网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const placeholder = parentId
    ? (locale === 'en' ? 'Write a reply...' : '写下你的回复...')
    : (locale === 'en' ? 'Share your thoughts...' : '分享你的想法...');

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError(null);
        }}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        maxLength={2000}
        className="w-full resize-none rounded-dream border border-[var(--color-border)] bg-dream-darker px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent-start"
      />

      {/* 错误提示 */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          {content.length}/2000
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              {locale === 'en' ? 'Cancel' : '取消'}
            </Button>
          )}
          <Button
            size="sm"
            loading={submitting}
            disabled={!content.trim()}
            onClick={handleSubmit}
          >
            {parentId
              ? (locale === 'en' ? 'Reply' : '回复')
              : (locale === 'en' ? 'Post Comment' : '发表评论')
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
