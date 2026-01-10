import {Money} from '@shopify/hydrogen';
import type {SubscriptionPriceProps} from './types';

/**
 * SubscriptionPrice - Display price with subscription discount
 *
 * Shows the subscription price when a selling plan is selected,
 * otherwise shows the regular one-time price.
 *
 * @example
 * ```tsx
 * <SubscriptionPrice
 *   price={variant.price}
 *   compareAtPrice={variant.compareAtPrice}
 *   selectedAllocation={selectedAllocation}
 * />
 * ```
 */
export function SubscriptionPrice({
  price,
  compareAtPrice,
  selectedAllocation,
  className = '',
}: SubscriptionPriceProps) {
  // If subscription is selected, show subscription pricing
  if (selectedAllocation) {
    const allocationPrices = selectedAllocation.priceAdjustments[0];

    if (allocationPrices) {
      const subscriptionPrice = allocationPrices.perDeliveryPrice;
      const originalPrice = allocationPrices.compareAtPrice;

      // Calculate savings
      const originalAmount = parseFloat(originalPrice.amount);
      const subscriptionAmount = parseFloat(subscriptionPrice.amount);
      const savingsPercentage = Math.round(
        ((originalAmount - subscriptionAmount) / originalAmount) * 100,
      );

      return (
        <div className={`subscription-price ${className}`}>
          <div className="subscription-price__current">
            <Money data={subscriptionPrice} />
            <span className="subscription-price__frequency">/delivery</span>
          </div>

          {savingsPercentage > 0 && (
            <div className="subscription-price__original">
              <span className="subscription-price__compare">
                <Money data={originalPrice} />
              </span>
              <span className="subscription-price__savings">
                Save {savingsPercentage}%
              </span>
            </div>
          )}
        </div>
      );
    }
  }

  // Regular one-time pricing
  const isOnSale =
    compareAtPrice &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <div
      className={`subscription-price subscription-price--one-time ${className}`}
    >
      <div className="subscription-price__current">
        <Money data={price} />
      </div>

      {isOnSale && compareAtPrice && (
        <div className="subscription-price__original">
          <span className="subscription-price__compare">
            <Money data={compareAtPrice} />
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * SubscriptionBadge - Show subscription info on cart line items
 *
 * @example
 * ```tsx
 * {cartLine.sellingPlanAllocation && (
 *   <SubscriptionBadge allocation={cartLine.sellingPlanAllocation} />
 * )}
 * ```
 */
export function SubscriptionBadge({
  allocation,
  className = '',
}: {
  allocation: SubscriptionPriceProps['selectedAllocation'];
  className?: string;
}) {
  if (!allocation) return null;

  return (
    <span className={`subscription-badge ${className}`}>
      {allocation.sellingPlan.name}
    </span>
  );
}

/**
 * SubscriptionSavings - Display savings callout
 */
export function SubscriptionSavings({
  originalPrice,
  subscriptionPrice,
  className = '',
}: {
  originalPrice: string;
  subscriptionPrice: string;
  className?: string;
}) {
  const original = parseFloat(originalPrice);
  const subscription = parseFloat(subscriptionPrice);
  const savings = original - subscription;
  const percentage = Math.round((savings / original) * 100);

  if (percentage <= 0) return null;

  return (
    <div className={`subscription-savings ${className}`}>
      <span className="subscription-savings__amount">
        Save ${savings.toFixed(2)}
      </span>
      <span className="subscription-savings__percentage">
        ({percentage}% off)
      </span>
    </div>
  );
}
