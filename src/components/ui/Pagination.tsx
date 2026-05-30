'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

/**
 * 分页组件
 */
export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  // 生成页码数组（显示前后2页）
  const pages: (number | string)[] = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  function getPageUrl(page: number): string {
    const separator = basePath.includes('?') ? '&' : '?';
    return `${basePath}${separator}page=${page}`;
  }

  return (
    <nav className="flex items-center gap-1" aria-label="分页导航">
      {/* 上一页 */}
      {currentPage > 1 ? (
        <a
          href={getPageUrl(currentPage - 1)}
          className="flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          ‹
        </a>
      ) : (
        <span className="flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm text-text-secondary/50">
          ‹
        </span>
      )}

      {/* 页码 */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-text-secondary">
            …
          </span>
        ) : (
          <a
            key={page}
            href={getPageUrl(page as number)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors ${
              page === currentPage
                ? 'bg-gradient-to-r from-accent-start to-accent-end text-white'
                : 'border border-[var(--color-border)] text-text-secondary hover:bg-white/5 hover:text-text-primary'
            }`}
          >
            {page}
          </a>
        )
      )}

      {/* 下一页 */}
      {currentPage < totalPages ? (
        <a
          href={getPageUrl(currentPage + 1)}
          className="flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          ›
        </a>
      ) : (
        <span className="flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm text-text-secondary/50">
          ›
        </span>
      )}
    </nav>
  );
}
