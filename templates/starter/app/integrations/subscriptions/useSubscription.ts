import {useState, useMemo, useCallback} from 'react';
import type {
  PurchaseType,
  UseSubscriptionReturn,
  SellingPlanGroup,
  SellingPlanAllocation,
  SellingPlan,
} from './types';

interface UseSubscriptionOptions {
  /** Selling plan groups from the product */
  sellingPlanGroups?: {nodes: SellingPlanGroup[]} | null;
  /** Selling plan allocations from the selected variant */
  sellingPlanAllocations?: {nodes: SellingPlanAllocation[]} | null;
  /** Initial selling plan ID (optional) */
  initialSellingPlanId?: string | null;
  /** Whether to default to subscription if available */
  defaultToSubscription?: boolean;
}

/**
 * Hook to manage subscription state for a product
 *
 * @example
 * ```tsx
 * const {
 *   purchaseType,
 *   setPurchaseType,
 *   selectedSellingPlanId,
 *   hasSubscriptionOptions,
 * } = useSubscription({
 *   sellingPlanGroups: product.sellingPlanGroups,
 *   sellingPlanAllocations: variant.sellingPlanAllocations,
 * });
 * ```
 */
export function useSubscription({
  sellingPlanGroups,
  sellingPlanAllocations,
  initialSellingPlanId = null,
  defaultToSubscription = false,
}: UseSubscriptionOptions = {}): UseSubscriptionReturn {
  // Check if product has subscription options
  const hasSubscriptionOptions = useMemo(() => {
    const groups = sellingPlanGroups?.nodes ?? [];
    return groups.some((group) => group.sellingPlans.nodes.length > 0);
  }, [sellingPlanGroups]);

  // Get first available selling plan
  const firstSellingPlan = useMemo(() => {
    const groups = sellingPlanGroups?.nodes ?? [];
    for (const group of groups) {
      if (group.sellingPlans.nodes.length > 0) {
        return group.sellingPlans.nodes[0];
      }
    }
    return null;
  }, [sellingPlanGroups]);

  // Determine initial purchase type
  const initialPurchaseType: PurchaseType =
    defaultToSubscription && hasSubscriptionOptions
      ? 'subscription'
      : 'one-time';

  // State management
  const [purchaseType, setPurchaseType] =
    useState<PurchaseType>(initialPurchaseType);
  const [selectedSellingPlanId, setSelectedSellingPlanId] = useState<
    string | null
  >(
    initialSellingPlanId ??
      (defaultToSubscription ? (firstSellingPlan?.id ?? null) : null),
  );

  // Find the selected allocation
  const selectedAllocation = useMemo(() => {
    if (!selectedSellingPlanId || purchaseType === 'one-time') {
      return null;
    }

    const allocations = sellingPlanAllocations?.nodes ?? [];
    return (
      allocations.find(
        (allocation) => allocation.sellingPlan.id === selectedSellingPlanId,
      ) ?? null
    );
  }, [selectedSellingPlanId, sellingPlanAllocations, purchaseType]);

  // Handle purchase type change
  const handlePurchaseTypeChange = useCallback(
    (type: PurchaseType) => {
      setPurchaseType(type);
      if (type === 'one-time') {
        // Clear selling plan when switching to one-time
        setSelectedSellingPlanId(null);
      } else if (type === 'subscription' && !selectedSellingPlanId) {
        // Auto-select first selling plan when switching to subscription
        setSelectedSellingPlanId(firstSellingPlan?.id ?? null);
      }
    },
    [firstSellingPlan, selectedSellingPlanId],
  );

  // Get discount percentage from selling plan price adjustments
  const getDiscountPercentage = useCallback(
    (sellingPlan: SellingPlan): number | null => {
      const adjustment = sellingPlan.priceAdjustments[0];
      if (!adjustment) return null;

      const value = adjustment.adjustmentValue;
      if (value.__typename === 'SellingPlanPercentagePriceAdjustment') {
        return value.percentage;
      }

      return null;
    },
    [],
  );

  return {
    purchaseType,
    setPurchaseType: handlePurchaseTypeChange,
    selectedSellingPlanId,
    setSelectedSellingPlanId,
    hasSubscriptionOptions,
    selectedAllocation,
    getDiscountPercentage,
  };
}

/**
 * Format a selling plan name for display
 * Strips common prefixes and normalizes text
 */
export function formatSellingPlanName(name: string): string {
  // Remove common prefixes
  const cleaned = name
    .replace(/^Deliver\s+/i, '')
    .replace(/^Subscribe\s+&?\s*/i, '')
    .replace(/^Every\s+/i, '');

  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Get a human-readable frequency from a selling plan
 */
export function getSellingPlanFrequency(sellingPlan: SellingPlan): string {
  // Try to extract from delivery policy if available
  const policy = sellingPlan.deliveryPolicy;
  if (policy) {
    const {interval, intervalUnit} = policy;
    const unit = intervalUnit.toLowerCase();
    if (interval === 1) {
      return `Every ${unit}`;
    }
    return `Every ${interval} ${unit}s`;
  }

  // Fall back to name parsing
  return sellingPlan.name;
}

/**
 * Calculate subscription savings compared to one-time price
 */
export function calculateSubscriptionSavings(
  oneTimePrice: string,
  subscriptionPrice: string,
): {
  amount: number;
  percentage: number;
} {
  const oneTime = parseFloat(oneTimePrice);
  const subscription = parseFloat(subscriptionPrice);

  const amount = oneTime - subscription;
  const percentage = Math.round((amount / oneTime) * 100);

  return {amount, percentage};
}
