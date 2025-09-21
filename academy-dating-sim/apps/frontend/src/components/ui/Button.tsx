import React, { ButtonHTMLAttributes, forwardRef, memo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
  {
    variants: {
      variant: {
        primary:
          'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl hover:shadow-primary/25 focus:ring-primary',
        secondary:
          'bg-secondary hover:bg-secondary-dark text-white shadow-lg hover:shadow-xl hover:shadow-secondary/25 focus:ring-secondary',
        accent:
          'bg-accent hover:bg-accent-dark text-white shadow-lg hover:shadow-xl hover:shadow-accent/25 focus:ring-accent',
        ghost:
          'hover:bg-white/10 text-text-primary hover:text-white focus:ring-white/50',
        outline:
          'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
        danger:
          'bg-error hover:bg-red-700 text-white shadow-lg hover:shadow-xl hover:shadow-error/25 focus:ring-error',
        glass:
          'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white focus:ring-white/50',
      },
      size: {
        sm: 'text-sm px-3 py-1.5 rounded-md',
        md: 'text-base px-4 py-2 rounded-lg',
        lg: 'text-lg px-6 py-3 rounded-xl',
        xl: 'text-xl px-8 py-4 rounded-2xl',
        icon: 'h-10 w-10 rounded-lg p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            로딩중...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default memo(Button);