import React, { useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import Button from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  className,
}) => {
  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    },
    [closeOnEsc, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscKey]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        <div
          className={cn(
            'w-full bg-surface rounded-2xl shadow-2xl border border-border/50',
            'animate-bounce-in max-h-[90vh] flex flex-col',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              {title && (
                <h2 id="modal-title" className="text-xl font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-auto p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-border/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

// Preset Modal Actions Component
export const ModalActions: React.FC<{
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger' | 'secondary';
  isLoading?: boolean;
}> = memo(({
  onCancel,
  onConfirm,
  cancelText = '취소',
  confirmText = '확인',
  confirmVariant = 'primary',
  isLoading = false,
}) => (
  <div className="flex gap-3 justify-end">
    {onCancel && (
      <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
        {cancelText}
      </Button>
    )}
    {onConfirm && (
      <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
        {confirmText}
      </Button>
    )}
  </div>
));

ModalActions.displayName = 'ModalActions';

export default memo(Modal);