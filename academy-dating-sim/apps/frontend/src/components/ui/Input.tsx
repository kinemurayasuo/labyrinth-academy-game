import React, { InputHTMLAttributes, forwardRef, memo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  'w-full transition-all duration-200 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-background border border-border focus:border-primary focus:ring-primary/20',
        filled: 'bg-background-light border border-transparent focus:border-primary focus:ring-primary/20',
        outline: 'bg-transparent border-2 border-border focus:border-primary focus:ring-primary/20',
        ghost: 'bg-transparent border-b border-border focus:border-primary focus:ring-0 rounded-none px-0',
      },
      size: {
        sm: 'text-sm px-3 py-1.5 rounded-md',
        md: 'text-base px-4 py-2 rounded-lg',
        lg: 'text-lg px-5 py-3 rounded-xl',
      },
      error: {
        true: 'border-error focus:border-error focus:ring-error/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      error,
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || !!errorMessage;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, error: hasError }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {(helperText || errorMessage) && (
          <p
            className={cn(
              'text-xs mt-1.5',
              hasError ? 'text-error' : 'text-text-muted'
            )}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default memo(Input);