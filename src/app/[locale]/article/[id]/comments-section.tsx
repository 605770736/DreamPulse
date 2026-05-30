'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { ApiResponse, PaginatedData } from '@/types/api';

interface CommentsSectionProps {
  articleId: string;
  locale: Locale;
}

/**
 * 评论区组件（客户端）
 * 文章详情页的评论列表+回复+分页
 */
export default function CommentsSection({ articleId, locale }: CommentsSectionProps) {
  const [comments, setComments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch(`/api/comments?articleId=${articleId}&page=1&pageSize=20`);
        const data = await res.json() as ApiResponse<PaginatedData<Record<string, unknown>>>;
        if (data.code === 0) {
          setComments(data.data?.items ?? []);
        }
      } catch (err) {
        console.error('加载评论失败:', err);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [articleId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass animate-pulse p-4">
            <div className="mb-2 h-4 w-24 rounded bg-white/5" />
            <div className="h-3 w-full rounded bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-text-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {locale === 'en' ? 'Comments' : '评论'}
        <span className="text-sm font-normal text-text-secondary">({comments.length})</span>
      </h2>

      {comments.length === 0 ? (
        <p className="py-8 text-center text-text-secondary">
          {locale === 'en' ? 'No comments yet. Be the first!' : '暂无评论，快来抢沙发！'}
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: Record<string, unknown>) => (
            <CommentItem key={comment.id as string} comment={comment} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}

/** 单条评论组件 */
function CommentItem({ comment, locale }: { comment: Record<string, unknown>; locale: string }) {
  return (
    <div className="glass p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-start/20 text-xs font-bold text-accent-start">
          {((comment.userName as string) ?? 'U')[0].toUpperCase()}
        </div>
        <span className="text-sm font-medium text-text-primary">
          {comment.userName as string ?? (locale === 'en' ? 'Anonymous' : '匿名用户')}
        </span>
        <span className="text-xs text-text-secondary">
          {comment.createdAt as string}
        </span>
      </div>
      <p className="text-sm text-text-secondary">{comment.content as string}</p>
    </div>
  );
}
