import React, { HTMLAttributes, forwardRef, memo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-surface border border-border/50 shadow-card backdrop-blur-sm',
        glass: 'bg-white/5 backdrop-blur-md border border-white/10',
        gradient: 'bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20',
        outlined: 'bg-transparent border-2 border-border',
        elevated: 'bg-surface shadow-xl border border-border/30',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-card-hover hover:border-border-light hover:scale-[1.02] active:scale-[0.98]',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, header, footer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, interactive }), className)}
        {...props}
      >
        {header && (
          <div className="border-b border-border/50 pb-3 mb-3">
            {header}
          </div>
        )}
        {children}
        {footer && (
          <div className="border-t border-border/50 pt-3 mt-3">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Sub-components for better composition
const CardHeader = memo<HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }) => (
    <div className={cn('px-4 py-3 border-b border-border/50', className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

const CardContent = memo<HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }) => (
    <div className={cn('px-4 py-3', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = memo<HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }) => (
    <div className={cn('px-4 py-3 border-t border-border/50', className)} {...props}>
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

const CardTitle = memo<HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }) => (
    <h3 className={cn('text-lg font-semibold text-text-primary', className)} {...props}>
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = memo<HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }) => (
    <p className={cn('text-sm text-text-secondary', className)} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export default memo(Card);
export { CardHeader, CardContent, CardFooter, CardTitle, CardDescription };