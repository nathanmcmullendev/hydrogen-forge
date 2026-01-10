import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export interface ProductPriceProps {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'inline' | 'stacked';
}

export function ProductPrice({
  price,
  compareAtPrice,
  size = 'md',
  layout = 'inline',
}: ProductPriceProps) {
  const isOnSale =
    compareAtPrice?.amount &&
    price?.amount &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const containerClasses =
    layout === 'inline' ? 'flex items-center gap-2' : 'flex flex-col gap-1';

  if (!price) {
    return (
      <span className={`${sizeClasses[size]} text-secondary-500`}>&nbsp;</span>
    );
  }

  return (
    <div className={containerClasses}>
      {isOnSale ? (
        <>
          <span className={`${sizeClasses[size]} font-semibold text-red-600`}>
            <Money data={price} />
          </span>
          {compareAtPrice && (
            <span
              className={`${size === 'lg' ? 'text-lg' : 'text-sm'} text-secondary-500 line-through`}
            >
              <Money data={compareAtPrice} />
            </span>
          )}
          <SaleBadge
            price={price}
            compareAtPrice={compareAtPrice}
            size={size}
          />
        </>
      ) : (
        <span
          className={`${sizeClasses[size]} font-semibold text-secondary-900`}
        >
          <Money data={price} />
        </span>
      )}
    </div>
  );
}

function SaleBadge({
  price,
  compareAtPrice,
  size,
}: {
  price: MoneyV2;
  compareAtPrice: MoneyV2;
  size: 'sm' | 'md' | 'lg';
}) {
  const savings = parseFloat(compareAtPrice.amount) - parseFloat(price.amount);
  const percentOff = Math.round(
    (savings / parseFloat(compareAtPrice.amount)) * 100,
  );

  if (percentOff <= 0) return null;

  const badgeSizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2 py-1',
  };

  return (
    <span
      className={`${badgeSizeClasses[size]} rounded bg-red-100 font-medium text-red-700`}
    >
      Save {percentOff}%
    </span>
  );
}
