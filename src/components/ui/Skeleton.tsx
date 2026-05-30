import { clsx } from 'clsx';

interface SkeletonProps {
  /** 宽度 */
  width?: string;
  /** 高度 */
  height?: string;
  /** 是否圆形 */
  circle?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 骨架屏组件
 * 用于加载状态的占位显示
 */
export function Skeleton({ width, height, circle = false, className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-white/5',
        circle ? 'rounded-full' : 'rounded-dream',
        className
      )}
      style={{ width, height }}
    />
  );
}

/** 文章卡片骨架屏 */
export function ArticleCardSkeleton() {
  return (
    <div className="glass overflow-hidden p-0">
      <Skeleton height="160px" className="w-full" />
      <div className="space-y-3 p-4">
        <Skeleton height="20px" width="80%" />
        <Skeleton height="14px" width="100%" />
        <Skeleton height="14px" width="60%" />
        <div className="flex gap-4">
          <Skeleton height="12px" width="50px" />
          <Skeleton height="12px" width="50px" />
          <Skeleton height="12px" width="50px" />
        </div>
      </div>
    </div>
  );
}

/** 文章列表骨架屏 */
export function ArticleListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
