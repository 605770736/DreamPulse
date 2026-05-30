'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentItem } from './CommentItem';
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
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CommentSectionProps {
  /** 文章 ID */
  articleId: string;
  /** 当前语言 */
  locale: Locale;
  /** 当前用户 ID（未登录为 null） */
  currentUserId?: string | null;
}

/**
 * 评论区容器组件
 * 包含评论列表、分页、评论输入框
 */
export function CommentSection({ articleId, locale, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  /** 加载评论列表 */
  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/comments?articleId=${articleId}&page=${page}&pageSize=${pageSize}`
      );
      const data = await res.json() as ApiResponse<PaginatedData<CommentData>>;
      if (data.code === 0) {
        setComments(data.data?.items ?? []);
        setTotal(data.data?.total ?? 0);
      }
    } catch (err) {
      console.error('加载评论失败:', err);
    } finally {
      setLoading(false);
    }
  }, [articleId, page]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  /** 评论发表成功回调 */
  const handleCommentSubmitted = () => {
    // 跳回第一页并刷新
    setPage(1);
    loadComments();
  };

  /** 评论删除成功回调 */
  const handleCommentDeleted = () => {
    loadComments();
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && comments.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {locale === 'en' ? 'Comments' : '评论'}
        </h2>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass animate-pulse p-4">
              <div className="mb-2 h-4 w-24 rounded bg-white/5" />
              <div className="h-3 w-full rounded bg-white/5" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      {/* 标题 */}
      <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-text-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {locale === 'en' ? 'Comments' : '评论'}
        <span className="text-sm font-normal text-text-secondary">({total})</span>
      </h2>

      {/* 评论输入框 */}
      <div className="mb-6">
        <CommentForm
          articleId={articleId}
          locale={locale}
          onSubmitted={handleCommentSubmitted}
        />
      </div>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <p className="py-8 text-center text-text-secondary">
          {locale === 'en' ? 'No comments yet. Be the first!' : '暂无评论，快来抢沙发！'}
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              locale={locale}
              currentUserId={currentUserId}
              onDeleted={handleCommentDeleted}
              onReplySubmitted={handleCommentSubmitted}
            />
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-1">
            {page > 1 && (
              <button
                onClick={() => setPage(page - 1)}
                className="flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                ‹
              </button>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-accent-start to-accent-end text-white'
                      : 'border border-[var(--color-border)] text-text-secondary hover:bg-white/5 hover:text-text-primary'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {page < totalPages && (
              <button
                onClick={() => setPage(page + 1)}
                className="flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
