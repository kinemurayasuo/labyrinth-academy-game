import React, { memo } from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = memo(({
  className,
  variant = 'text',
  width,
  height,
  count = 1,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gradient-to-r from-background-light via-surface to-background-light';

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-[length:200%_100%]',
    none: '',
  };

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const style = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : variant === 'card' ? '200px' : '20px'),
  };

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn(
        baseClasses,
        animationClasses[animation],
        variantClasses[variant],
        className
      )}
      style={style}
    />
  ));

  return count > 1 ? (
    <div className="space-y-2">{skeletons}</div>
  ) : (
    skeletons[0]
  );
});

Skeleton.displayName = 'Skeleton';

// Loading Spinner Component
export const Spinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = memo(({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <svg
        className={cn('animate-spin text-primary', sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
});

Spinner.displayName = 'Spinner';

// Full Page Loader
export const PageLoader: React.FC<{
  message?: string;
}> = memo(({ message = '로딩중...' }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
    <Spinner size="lg" />
    <p className="mt-4 text-text-primary text-lg">{message}</p>
  </div>
));

PageLoader.displayName = 'PageLoader';

export default Skeleton;