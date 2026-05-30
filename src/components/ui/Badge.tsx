import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

/** 徽章变体 */
type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/** 变体样式映射 */
const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-text-secondary',
  accent: 'bg-accent-start/20 text-accent-start',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  danger: 'bg-red-500/20 text-red-400',
};

/**
 * 标签/徽章组件
 */
export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
