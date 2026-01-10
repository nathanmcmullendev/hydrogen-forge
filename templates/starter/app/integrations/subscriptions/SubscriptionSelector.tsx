import {useMemo} from 'react';
import type {
  SubscriptionSelectorProps,
  PurchaseType,
  SellingPlan,
  SellingPlanAllocation,
} from './types';

interface SubscriptionSelectorFullProps extends SubscriptionSelectorProps {
  /** Current purchase type */
  purchaseType: PurchaseType;
  /** Callback when purchase type changes */
  onPurchaseTypeChange: (type: PurchaseType) => void;
}

/**
 * SubscriptionSelector - Toggle between one-time and subscription purchase
 *
 * Displays a radio group for purchase type selection and a dropdown
 * for subscription frequency when subscription is selected.
 *
 * @example
 * ```tsx
 * <SubscriptionSelector
 *   sellingPlanGroups={product.sellingPlanGroups}
 *   sellingPlanAllocations={variant.sellingPlanAllocations}
 *   purchaseType={purchaseType}
 *   onPurchaseTypeChange={setPurchaseType}
 *   selectedSellingPlanId={selectedSellingPlanId}
 *   onSellingPlanChange={setSelectedSellingPlanId}
 * />
 * ```
 */
export function SubscriptionSelector({
  sellingPlanGroups,
  sellingPlanAllocations,
  purchaseType,
  onPurchaseTypeChange,
  selectedSellingPlanId,
  onSellingPlanChange,
  className = '',
}: SubscriptionSelectorFullProps) {
  // Flatten all selling plans from all groups
  const allSellingPlans = useMemo(() => {
    const plans: Array<{plan: SellingPlan; groupName: string}> = [];
    for (const group of sellingPlanGroups.nodes) {
      for (const plan of group.sellingPlans.nodes) {
        plans.push({plan, groupName: group.name});
      }
    }
    return plans;
  }, [sellingPlanGroups]);

  // Find the allocation for the selected selling plan
  const selectedAllocation = useMemo(() => {
    if (!selectedSellingPlanId) return null;
    return (
      sellingPlanAllocations?.nodes.find(
        (a) => a.sellingPlan.id === selectedSellingPlanId,
      ) ?? null
    );
  }, [selectedSellingPlanId, sellingPlanAllocations]);

  // Get discount percentage for display
  const discountPercentage = useMemo(() => {
    const selectedPlan = allSellingPlans.find(
      (p) => p.plan.id === selectedSellingPlanId,
    )?.plan;
    if (!selectedPlan) return null;

    const adjustment = selectedPlan.priceAdjustments[0];
    if (
      adjustment?.adjustmentValue.__typename ===
      'SellingPlanPercentagePriceAdjustment'
    ) {
      return adjustment.adjustmentValue.percentage;
    }
    return null;
  }, [selectedSellingPlanId, allSellingPlans]);

  // No subscription options available
  if (allSellingPlans.length === 0) {
    return null;
  }

  return (
    <div className={`subscription-selector ${className}`}>
      {/* Purchase Type Toggle */}
      <div className="subscription-selector__options">
        {/* One-time Purchase Option */}
        <label
          className="subscription-selector__option"
          aria-label="One-time purchase"
        >
          <input
            type="radio"
            name="purchase-type"
            value="one-time"
            checked={purchaseType === 'one-time'}
            onChange={() => onPurchaseTypeChange('one-time')}
            className="subscription-selector__radio"
          />
          <span className="subscription-selector__option-content">
            <span className="subscription-selector__option-title">
              One-time purchase
            </span>
          </span>
        </label>

        {/* Subscription Option */}
        <label
          className="subscription-selector__option subscription-selector__option--subscription"
          aria-label="Subscribe and save"
        >
          <input
            type="radio"
            name="purchase-type"
            value="subscription"
            checked={purchaseType === 'subscription'}
            onChange={() => onPurchaseTypeChange('subscription')}
            className="subscription-selector__radio"
          />
          <span className="subscription-selector__option-content">
            <span className="subscription-selector__option-title">
              Subscribe & Save
              {discountPercentage && purchaseType === 'subscription' && (
                <span className="subscription-selector__discount">
                  {discountPercentage}% off
                </span>
              )}
            </span>
            {purchaseType === 'subscription' && (
              <span className="subscription-selector__option-description">
                Free shipping on all subscription orders
              </span>
            )}
          </span>
        </label>
      </div>

      {/* Frequency Selector (shown when subscription is selected) */}
      {purchaseType === 'subscription' && allSellingPlans.length > 0 && (
        <div className="subscription-selector__frequency">
          <label
            htmlFor="selling-plan-select"
            className="subscription-selector__frequency-label"
          >
            Delivery frequency
          </label>
          <select
            id="selling-plan-select"
            value={selectedSellingPlanId ?? ''}
            onChange={(e) => onSellingPlanChange(e.target.value || null)}
            className="subscription-selector__frequency-select"
          >
            {allSellingPlans.map(({plan, groupName}) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
                {getDiscountText(plan)}
              </option>
            ))}
          </select>

          {/* Show per-delivery price */}
          {selectedAllocation && (
            <div className="subscription-selector__per-delivery">
              {formatMoney(
                selectedAllocation.priceAdjustments[0]?.perDeliveryPrice,
              )}{' '}
              per delivery
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Get discount text for a selling plan option
 */
function getDiscountText(plan: SellingPlan): string {
  const adjustment = plan.priceAdjustments[0];
  if (!adjustment) return '';

  if (
    adjustment.adjustmentValue.__typename ===
    'SellingPlanPercentagePriceAdjustment'
  ) {
    return ` (${adjustment.adjustmentValue.percentage}% off)`;
  }

  return '';
}

/**
 * Format money for display
 */
function formatMoney(
  price?: {amount: string; currencyCode: string} | null,
): string {
  if (!price) return '';

  const amount = parseFloat(price.amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currencyCode,
  }).format(amount);
}

/**
 * Simple subscription toggle for products with single subscription option
 */
export function SubscriptionToggle({
  isSubscription,
  onChange,
  discountPercentage,
  className = '',
}: {
  isSubscription: boolean;
  onChange: (value: boolean) => void;
  discountPercentage?: number | null;
  className?: string;
}) {
  return (
    <label className={`subscription-toggle ${className}`}>
      <input
        type="checkbox"
        checked={isSubscription}
        onChange={(e) => onChange(e.target.checked)}
        className="subscription-toggle__input"
      />
      <span className="subscription-toggle__label">
        Subscribe & Save
        {discountPercentage && (
          <span className="subscription-toggle__discount">
            {discountPercentage}% off
          </span>
        )}
      </span>
    </label>
  );
}
