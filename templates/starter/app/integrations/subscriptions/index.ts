/**
 * Subscription Integration (Recharge / Shopify Selling Plans)
 *
 * Pre-built components for subscription products in Hydrogen stores.
 * Works with Recharge, Bold Subscriptions, or any app using Shopify Selling Plans.
 *
 * @example
 * ```tsx
 * import {
 *   SubscriptionSelector,
 *   SubscriptionPrice,
 *   useSubscription,
 * } from '~/integrations/subscriptions';
 *
 * function ProductPage({product, variant}) {
 *   const {
 *     purchaseType,
 *     setPurchaseType,
 *     selectedSellingPlanId,
 *     setSelectedSellingPlanId,
 *     selectedAllocation,
 *     hasSubscriptionOptions,
 *   } = useSubscription({
 *     sellingPlanGroups: product.sellingPlanGroups,
 *     sellingPlanAllocations: variant.sellingPlanAllocations,
 *   });
 *
 *   return (
 *     <>
 *       <SubscriptionPrice
 *         price={variant.price}
 *         compareAtPrice={variant.compareAtPrice}
 *         selectedAllocation={selectedAllocation}
 *       />
 *
 *       {hasSubscriptionOptions && (
 *         <SubscriptionSelector
 *           sellingPlanGroups={product.sellingPlanGroups}
 *           sellingPlanAllocations={variant.sellingPlanAllocations}
 *           purchaseType={purchaseType}
 *           onPurchaseTypeChange={setPurchaseType}
 *           selectedSellingPlanId={selectedSellingPlanId}
 *           onSellingPlanChange={setSelectedSellingPlanId}
 *         />
 *       )}
 *
 *       <AddToCartButton
 *         lines={[{
 *           merchandiseId: variant.id,
 *           quantity: 1,
 *           ...(selectedSellingPlanId && { sellingPlanId: selectedSellingPlanId }),
 *         }]}
 *       />
 *     </>
 *   );
 * }
 * ```
 */

// Components
export {SubscriptionSelector, SubscriptionToggle} from './SubscriptionSelector';
export {
  SubscriptionPrice,
  SubscriptionBadge,
  SubscriptionSavings,
} from './SubscriptionPrice';

// Hooks
export {
  useSubscription,
  formatSellingPlanName,
  getSellingPlanFrequency,
  calculateSubscriptionSavings,
} from './useSubscription';

// GraphQL Fragments
export {
  SELLING_PLAN_FRAGMENT,
  SELLING_PLAN_GROUPS_FRAGMENT,
  SELLING_PLAN_ALLOCATION_FRAGMENT,
  VARIANT_WITH_SELLING_PLANS_FRAGMENT,
  PRODUCT_SELLING_PLANS_FRAGMENT,
  CART_LINE_SUBSCRIPTION_FRAGMENT,
} from './sellingPlans';

// Types
export type {
  SellingPlan,
  SellingPlanGroup,
  SellingPlanAllocation,
  SellingPlanPriceAdjustment,
  ProductWithSellingPlans,
  VariantWithSellingPlans,
  PurchaseType,
  SubscriptionSelectorProps,
  SubscriptionPriceProps,
  UseSubscriptionReturn,
  CartLineWithSubscription,
} from './types';
