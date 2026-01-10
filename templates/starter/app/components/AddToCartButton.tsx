import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

export interface AddToCartButtonProps {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
}: AddToCartButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-secondary-300 disabled:text-secondary-500',
    secondary:
      'bg-secondary-900 text-white hover:bg-secondary-800 focus:ring-secondary-500 disabled:bg-secondary-300 disabled:text-secondary-500',
    outline:
      'border-2 border-secondary-900 bg-transparent text-secondary-900 hover:bg-secondary-900 hover:text-white focus:ring-secondary-500 disabled:border-secondary-300 disabled:text-secondary-400 disabled:hover:bg-transparent',
  };

  const sizeClasses = {
    sm: 'rounded px-3 py-1.5 text-sm',
    md: 'rounded-md px-4 py-2 text-base',
    lg: 'rounded-md px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<unknown>) => {
        const isLoading = fetcher.state !== 'idle';

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"
              onClick={onClick}
              disabled={disabled || isLoading}
              className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  Adding...
                </span>
              ) : (
                children
              )}
            </button>
          </>
        );
      }}
    </CartForm>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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
  );
}
