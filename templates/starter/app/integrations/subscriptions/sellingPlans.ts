/**
 * GraphQL Fragments for Selling Plans (Subscriptions)
 *
 * These fragments fetch the data needed to display subscription options
 * on product pages and in the cart.
 */

/**
 * Fragment for a single selling plan
 */
export const SELLING_PLAN_FRAGMENT = `#graphql
  fragment SellingPlan on SellingPlan {
    id
    name
    description
    recurringDeliveries
    priceAdjustments {
      adjustmentValue {
        ... on SellingPlanPercentagePriceAdjustment {
          __typename
          percentage: adjustmentPercentage
        }
        ... on SellingPlanFixedAmountPriceAdjustment {
          __typename
          amount: adjustmentAmount {
            amount
            currencyCode
          }
        }
        ... on SellingPlanFixedPriceAdjustment {
          __typename
          price {
            amount
            currencyCode
          }
        }
      }
      orderCount
    }
  }
` as const;

/**
 * Fragment for selling plan groups on a product
 */
export const SELLING_PLAN_GROUPS_FRAGMENT = `#graphql
  fragment SellingPlanGroups on Product {
    sellingPlanGroups(first: 10) {
      nodes {
        name
        appName
        options {
          name
          values
        }
        sellingPlans(first: 10) {
          nodes {
            ...SellingPlan
          }
        }
      }
    }
  }
  ${SELLING_PLAN_FRAGMENT}
` as const;

/**
 * Fragment for selling plan allocations on a variant
 * This provides the actual prices for subscription options
 */
export const SELLING_PLAN_ALLOCATION_FRAGMENT = `#graphql
  fragment SellingPlanAllocation on SellingPlanAllocation {
    sellingPlan {
      ...SellingPlan
    }
    priceAdjustments {
      compareAtPrice {
        amount
        currencyCode
      }
      perDeliveryPrice {
        amount
        currencyCode
      }
      price {
        amount
        currencyCode
      }
      unitPrice {
        amount
        currencyCode
      }
    }
  }
  ${SELLING_PLAN_FRAGMENT}
` as const;

/**
 * Fragment for variant with selling plan allocations
 */
export const VARIANT_WITH_SELLING_PLANS_FRAGMENT = `#graphql
  fragment VariantWithSellingPlans on ProductVariant {
    sellingPlanAllocations(first: 10) {
      nodes {
        ...SellingPlanAllocation
      }
    }
  }
  ${SELLING_PLAN_ALLOCATION_FRAGMENT}
` as const;

/**
 * Complete fragment to add to existing product queries
 * Add this to your PRODUCT_FRAGMENT in products.$handle.tsx
 *
 * @example
 * ```graphql
 * fragment Product on Product {
 *   # ... existing fields
 *   ...SellingPlanGroups
 * }
 * ```
 */
export const PRODUCT_SELLING_PLANS_FRAGMENT = `#graphql
  ${SELLING_PLAN_GROUPS_FRAGMENT}
` as const;

/**
 * Cart line fragment with subscription info
 */
export const CART_LINE_SUBSCRIPTION_FRAGMENT = `#graphql
  fragment CartLineSubscription on CartLine {
    sellingPlanAllocation {
      sellingPlan {
        id
        name
      }
      priceAdjustments {
        perDeliveryPrice {
          amount
          currencyCode
        }
      }
    }
  }
` as const;
