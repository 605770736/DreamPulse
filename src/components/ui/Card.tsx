import { clsx } from 'clsx';
import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 是否悬浮效果 */
  hover?: boolean;
  /** 是否玻璃态 */
  glass?: boolean;
}

/**
 * 通用卡片容器组件
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, glass = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-dream p-4',
          glass && 'glass',
          hover && 'card-hover cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
