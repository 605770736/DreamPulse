'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { ApiResponse, PaginatedData } from '@/types/api';

/** 收藏文章项 */
interface FavoriteArticle {
  id: string;
  title: string;
  titleEn: string | null;
  summary: string;
  summaryEn: string | null;
  coverImage: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  originalSource: string;
  categoryId: string;
  favoritedAt: string;
}

interface FavoriteListProps {
  /** 当前语言 */
  locale: Locale;
}

/**
 * 收藏列表组件
 * 展示用户收藏的文章卡片列表，支持分页
 */
export function FavoriteList({ locale }: FavoriteListProps) {
  const [favorites, setFavorites] = useState<FavoriteArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [unfavoriteId, setUnfavoriteId] = useState<string | null>(null);
  const pageSize = 12;

  /** 加载收藏列表 */
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/favorites?page=${page}&pageSize=${pageSize}`);
      const data = await res.json() as ApiResponse<PaginatedData<FavoriteArticle>>;
      if (data.code === 0) {
        setFavorites(data.data?.items ?? []);
        setTotal(data.data?.total ?? 0);
      }
    } catch (err) {
      console.error('加载收藏列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  /** 取消收藏 */
  const handleUnfavorite = async (articleId: string) => {
    setUnfavoriteId(articleId);
    try {
      const res = await fetch(`/api/favorites?articleId=${articleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadFavorites();
      }
    } catch (err) {
      console.error('取消收藏失败:', err);
    } finally {
      setUnfavoriteId(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && favorites.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass animate-pulse p-4">
            <div className="mb-3 h-32 rounded bg-white/5" />
            <div className="mb-2 h-4 w-3/4 rounded bg-white/5" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-text-secondary/50">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <p className="text-text-secondary">
          {locale === 'en' ? 'No favorites yet' : '暂无收藏'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 收藏列表 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((article) => {
          const title = locale === 'en' && article.titleEn ? article.titleEn : article.title;
          const summary = locale === 'en' && article.summaryEn ? article.summaryEn : article.summary;

          return (
            <div key={article.id} className="group glass card-hover overflow-hidden p-0">
              <Link href={`/${locale}/article/${article.id}`} className="block">
                {/* 封面图 */}
                {article.coverImage && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-start">
                    {title}
                  </h3>
                  <p className="line-clamp-2 text-xs text-text-secondary">{summary}</p>
                </div>
              </Link>
              {/* 底部操作栏 */}
              <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-2">
                <span className="text-xs text-text-secondary">
                  {article.originalSource}
                </span>
                <button
                  onClick={() => handleUnfavorite(article.id)}
                  disabled={unfavoriteId === article.id}
                  className="text-xs text-yellow-400 transition-colors hover:text-red-400 disabled:opacity-50"
                >
                  {unfavoriteId === article.id
                    ? (locale === 'en' ? 'Removing...' : '移除中...')
                    : (locale === 'en' ? 'Unfavorite' : '取消收藏')
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
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
        </div>
      )}
    </div>
  );
}
