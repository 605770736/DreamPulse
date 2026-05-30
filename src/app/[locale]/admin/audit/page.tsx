'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { ApiResponse, PaginatedData } from '@/types/api';

/** 审核项数据 */
interface AuditItem {
  id: string;
  targetType: 'article' | 'comment' | 'user';
  targetId: string;
  action: string;
  reason: string | null;
  createdAt: string;
  /** 关联目标内容（预览用） */
  targetContent?: string;
  targetTitle?: string;
  targetAuthor?: string;
}

interface AdminAuditPageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * 内容审核队列页
 * 待审核列表 + 通过/拒绝操作 + 预览面板
 */
export default function AdminAuditPage({ params }: AdminAuditPageProps) {
  const [locale, setLocale] = useState<Locale>('zh');
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const pageSize = 20;

  // 解析 locale
  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  /** 加载审核列表 */
  const loadAuditItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit?page=${page}&pageSize=${pageSize}`);
      const data = await res.json() as ApiResponse<PaginatedData<AuditItem>>;
      if (data.code === 0) {
        setAuditItems(data.data?.items ?? []);
        setTotal(data.data?.total ?? 0);
      }
    } catch (err) {
      console.error('加载审核列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadAuditItems();
  }, [loadAuditItems]);

  /** 审核操作 */
  const handleAuditAction = async (
    targetId: string,
    targetType: string,
    action: 'approve' | 'reject',
    reason?: string
  ) => {
    setActionLoading(targetId);
    try {
      const res = await fetch(`/api/admin/audit/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, action, reason }),
      });

      if (res.ok) {
        loadAuditItems();
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('审核操作失败:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  /** 目标类型标签 */
  const targetTypeLabel = (type: string): string => {
    switch (type) {
      case 'article': return locale === 'en' ? 'Article' : '文章';
      case 'comment': return locale === 'en' ? 'Comment' : '评论';
      case 'user': return locale === 'en' ? 'User' : '用户';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <h1 className="text-2xl font-bold text-text-primary">
        {locale === 'en' ? 'Content Review' : '内容审核'}
      </h1>

      <div className="flex gap-6">
        {/* 审核列表 */}
        <div className="flex-1">
          {loading && auditItems.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass animate-pulse p-4">
                  <div className="mb-2 h-4 w-48 rounded bg-white/5" />
                  <div className="h-3 w-full rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : auditItems.length === 0 ? (
            <div className="glass rounded-dream py-12 text-center">
              <p className="text-text-secondary">
                {locale === 'en' ? 'No pending reviews' : '暂无待审核内容'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditItems.map((item) => (
                <div
                  key={item.id}
                  className={`glass cursor-pointer rounded-dream p-4 transition-all hover:border-accent-start/30 ${
                    selectedItem?.id === item.id ? 'border-accent-start/50' : ''
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                      {targetTypeLabel(item.targetType)}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {item.createdAt.slice(0, 16)}
                    </span>
                  </div>
                  {item.targetTitle && (
                    <p className="mb-1 text-sm font-medium text-text-primary">
                      {item.targetTitle}
                    </p>
                  )}
                  {item.targetContent && (
                    <p className="line-clamp-2 text-sm text-text-secondary">
                      {item.targetContent}
                    </p>
                  )}

                  {/* 操作按钮 */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAuditAction(item.targetId, item.targetType, 'approve');
                      }}
                      disabled={actionLoading === item.targetId}
                      className="rounded-lg bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/30 disabled:opacity-50"
                    >
                      {locale === 'en' ? 'Approve' : '通过'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const reason = prompt(locale === 'en' ? 'Reason for rejection:' : '拒绝原因：');
                        if (reason !== null) {
                          handleAuditAction(item.targetId, item.targetType, 'reject', reason || undefined);
                        }
                      }}
                      disabled={actionLoading === item.targetId}
                      className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                    >
                      {locale === 'en' ? 'Reject' : '拒绝'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-text-secondary hover:bg-white/5"
                >
                  ‹
                </button>
              )}
              <span className="flex items-center text-xs text-text-secondary">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-text-secondary hover:bg-white/5"
                >
                  ›
                </button>
              )}
            </div>
          )}
        </div>

        {/* 预览面板 */}
        {selectedItem && (
          <div className="hidden w-80 shrink-0 lg:block">
            <div className="glass sticky top-6 rounded-dream p-5">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                {locale === 'en' ? 'Preview' : '预览'}
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-text-secondary">
                    {locale === 'en' ? 'Type' : '类型'}
                  </span>
                  <p className="text-text-primary">{targetTypeLabel(selectedItem.targetType)}</p>
                </div>
                <div>
                  <span className="text-xs text-text-secondary">
                    {locale === 'en' ? 'Target ID' : '目标 ID'}
                  </span>
                  <p className="font-mono text-xs text-text-primary">{selectedItem.targetId}</p>
                </div>
                {selectedItem.targetTitle && (
                  <div>
                    <span className="text-xs text-text-secondary">
                      {locale === 'en' ? 'Title' : '标题'}
                    </span>
                    <p className="text-text-primary">{selectedItem.targetTitle}</p>
                  </div>
                )}
                {selectedItem.targetContent && (
                  <div>
                    <span className="text-xs text-text-secondary">
                      {locale === 'en' ? 'Content' : '内容'}
                    </span>
                    <p className="text-text-secondary">{selectedItem.targetContent}</p>
                  </div>
                )}
                {selectedItem.reason && (
                  <div>
                    <span className="text-xs text-text-secondary">
                      {locale === 'en' ? 'Reason' : '原因'}
                    </span>
                    <p className="text-text-secondary">{selectedItem.reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
