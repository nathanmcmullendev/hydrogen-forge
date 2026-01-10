/**
 * Recharge/Subscription Integration Types
 *
 * These types model Shopify Selling Plans which power subscription functionality.
 * Recharge (and similar apps) create Selling Plans in Shopify Admin.
 * Products with subscriptions have `sellingPlanGroups` with frequency options.
 */

import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';

/**
 * Price adjustment types for selling plans
 */
export type PriceAdjustmentType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'PRICE';

/**
 * Value of a price adjustment
 */
export interface SellingPlanPriceAdjustmentValue {
  /** For PERCENTAGE type: the discount percentage (e.g., 10 for 10% off) */
  percentage?: number;
  /** For FIXED_AMOUNT or PRICE type: the amount and currency */
  fixedValue?: {
    amount: string;
    currencyCode: CurrencyCode;
  };
}

/**
 * Price adjustment configuration for a selling plan
 */
export interface SellingPlanPriceAdjustment {
  /** Type of adjustment */
  adjustmentValue: {
    __typename: string;
  } & (
    | {__typename: 'SellingPlanPercentagePriceAdjustment'; percentage: number}
    | {
        __typename: 'SellingPlanFixedAmountPriceAdjustment';
        amount: {amount: string; currencyCode: CurrencyCode};
      }
    | {
        __typename: 'SellingPlanFixedPriceAdjustment';
        price: {amount: string; currencyCode: CurrencyCode};
      }
  );
  /** Order count this adjustment applies to */
  orderCount?: number | null;
}

/**
 * Delivery policy for a selling plan
 */
export interface SellingPlanDeliveryPolicy {
  /** Interval (e.g., 1, 2, 3) */
  interval: number;
  /** Interval unit (e.g., WEEK, MONTH) */
  intervalUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}

/**
 * A single selling plan (subscription option)
 */
export interface SellingPlan {
  /** Unique identifier (gid://shopify/SellingPlan/...) */
  id: string;
  /** Display name (e.g., "Deliver every month") */
  name: string;
  /** Description of the plan */
  description?: string | null;
  /** Price adjustments for this plan */
  priceAdjustments: SellingPlanPriceAdjustment[];
  /** Delivery policy details */
  deliveryPolicy?: SellingPlanDeliveryPolicy;
  /** Recurring delivery policy */
  recurringDeliveries: boolean;
}

/**
 * A group of selling plans (e.g., "Subscribe & Save")
 */
export interface SellingPlanGroup {
  /** Display name for the group */
  name: string;
  /** Optional app that created these plans */
  appName?: string | null;
  /** Available selling plans in this group */
  sellingPlans: {
    nodes: SellingPlan[];
  };
  /** Options available in this group */
  options: Array<{
    name: string;
    values: string[];
  }>;
}

/**
 * Product with selling plan groups
 */
export interface ProductWithSellingPlans {
  /** Product ID */
  id: string;
  /** Product title */
  title: string;
  /** Selling plan groups available for this product */
  sellingPlanGroups: {
    nodes: SellingPlanGroup[];
  };
}

/**
 * Variant with selling plan allocations
 */
export interface VariantWithSellingPlans {
  /** Variant ID */
  id: string;
  /** Selling plan allocations for this variant */
  sellingPlanAllocations?: {
    nodes: SellingPlanAllocation[];
  };
}

/**
 * Allocation of a selling plan to a specific variant
 */
export interface SellingPlanAllocation {
  /** The selling plan */
  sellingPlan: SellingPlan;
  /** Price adjustments specific to this allocation */
  priceAdjustments: Array<{
    /** Compare at price (original) */
    compareAtPrice: {
      amount: string;
      currencyCode: CurrencyCode;
    };
    /** Per delivery price */
    perDeliveryPrice: {
      amount: string;
      currencyCode: CurrencyCode;
    };
    /** Price after adjustment */
    price: {
      amount: string;
      currencyCode: CurrencyCode;
    };
    /** Unit price */
    unitPrice?: {
      amount: string;
      currencyCode: CurrencyCode;
    } | null;
  }>;
}

/**
 * Purchase type selection
 */
export type PurchaseType = 'one-time' | 'subscription';

/**
 * Props for the SubscriptionSelector component
 */
export interface SubscriptionSelectorProps {
  /** Selling plan groups from the product */
  sellingPlanGroups: {nodes: SellingPlanGroup[]};
  /** Selling plan allocations from the selected variant */
  sellingPlanAllocations?: {nodes: SellingPlanAllocation[]};
  /** Currently selected selling plan ID */
  selectedSellingPlanId?: string | null;
  /** Callback when a selling plan is selected */
  onSellingPlanChange: (sellingPlanId: string | null) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the SubscriptionPrice component
 */
export interface SubscriptionPriceProps {
  /** Original variant price */
  price: {
    amount: string;
    currencyCode: CurrencyCode;
  };
  /** Compare at price (if on sale) */
  compareAtPrice?: {
    amount: string;
    currencyCode: CurrencyCode;
  } | null;
  /** Selected selling plan allocation */
  selectedAllocation?: SellingPlanAllocation | null;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Return type for useSubscription hook
 */
export interface UseSubscriptionReturn {
  /** Current purchase type selection */
  purchaseType: PurchaseType;
  /** Set the purchase type */
  setPurchaseType: (type: PurchaseType) => void;
  /** Currently selected selling plan ID */
  selectedSellingPlanId: string | null;
  /** Set the selected selling plan */
  setSelectedSellingPlanId: (id: string | null) => void;
  /** Whether product has subscription options */
  hasSubscriptionOptions: boolean;
  /** The selected selling plan allocation (with prices) */
  selectedAllocation: SellingPlanAllocation | null;
  /** Get the discount percentage for a selling plan */
  getDiscountPercentage: (sellingPlan: SellingPlan) => number | null;
}

/**
 * Cart line item with subscription info
 */
export interface CartLineWithSubscription {
  /** Cart line ID */
  id: string;
  /** Quantity */
  quantity: number;
  /** Merchandise */
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
    };
  };
  /** Selling plan allocation if subscription */
  sellingPlanAllocation?: SellingPlanAllocation | null;
}
