# Recharge / Subscriptions Integration

Subscription functionality for Hydrogen stores using Shopify Selling Plans.

## Overview

This integration provides:

- Subscribe & Save purchase option on product pages
- Subscription frequency selector
- Subscription pricing display with discount badges
- Cart line items with subscription info

**Important:** This integration works with any subscription app that uses Shopify Selling Plans, including:

- Recharge Subscriptions
- Bold Subscriptions
- Skio
- Ordergroove
- Native Shopify Subscriptions

## Prerequisites

1. **Subscription App Installed**: You need a subscription app installed on your Shopify store that creates Selling Plans (e.g., Recharge Pro Plan)
2. **Products Configured**: Products must have selling plan groups assigned in the subscription app

## How It Works

Subscription apps like Recharge create **Selling Plans** in Shopify Admin:

1. When you configure a product for subscriptions, the app creates `sellingPlanGroups`
2. Each group contains `sellingPlans` with delivery frequencies (weekly, monthly, etc.)
3. Each plan has `priceAdjustments` (e.g., 10% off for subscribers)
4. The cart accepts a `sellingPlanId` to create subscription line items

No special API or SDK is needed - it all works through the Shopify Storefront API.

## Setup

### 1. Update Product Query

Add selling plan data to your product query in `products.$handle.tsx`:

```tsx
import {
  SELLING_PLAN_GROUPS_FRAGMENT,
  VARIANT_WITH_SELLING_PLANS_FRAGMENT,
} from "~/integrations/subscriptions";

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    # ... existing fields

    # Add selling plan groups
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
        }
      }
    }
  }
`;

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    id
    # ... existing fields

    # Add selling plan allocations
    sellingPlanAllocations(first: 10) {
      nodes {
        sellingPlan {
          id
          name
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
        }
      }
    }
  }
`;
```

### 2. Add Subscription Components to Product Page

```tsx
import {
  SubscriptionSelector,
  SubscriptionPrice,
  useSubscription,
} from '~/integrations/subscriptions';

export default function Product() {
  const {product} = useLoaderData<typeof loader>();
  const selectedVariant = useOptimisticVariant(...);

  // Initialize subscription state
  const {
    purchaseType,
    setPurchaseType,
    selectedSellingPlanId,
    setSelectedSellingPlanId,
    selectedAllocation,
    hasSubscriptionOptions,
  } = useSubscription({
    sellingPlanGroups: product.sellingPlanGroups,
    sellingPlanAllocations: selectedVariant.sellingPlanAllocations,
  });

  return (
    <div className="product">
      <h1>{product.title}</h1>

      {/* Price display - shows subscription price when selected */}
      <SubscriptionPrice
        price={selectedVariant.price}
        compareAtPrice={selectedVariant.compareAtPrice}
        selectedAllocation={selectedAllocation}
      />

      {/* Subscription selector - only shows if product has subscriptions */}
      {hasSubscriptionOptions && (
        <SubscriptionSelector
          sellingPlanGroups={product.sellingPlanGroups}
          sellingPlanAllocations={selectedVariant.sellingPlanAllocations}
          purchaseType={purchaseType}
          onPurchaseTypeChange={setPurchaseType}
          selectedSellingPlanId={selectedSellingPlanId}
          onSellingPlanChange={setSelectedSellingPlanId}
        />
      )}

      {/* Pass sellingPlanId to cart */}
      <ProductForm
        productOptions={productOptions}
        selectedVariant={selectedVariant}
        sellingPlanId={selectedSellingPlanId}
      />
    </div>
  );
}
```

### 3. Update AddToCartButton

Modify your cart form to include the selling plan:

```tsx
// In ProductForm.tsx or AddToCartButton.tsx
<CartForm
  route="/cart"
  action={CartForm.ACTIONS.LinesAdd}
  inputs={{
    lines: [
      {
        merchandiseId: selectedVariant.id,
        quantity: 1,
        // Include selling plan if subscription selected
        ...(sellingPlanId && { sellingPlanId }),
      },
    ],
  }}
>
  <button type="submit">{sellingPlanId ? "Subscribe" : "Add to Cart"}</button>
</CartForm>
```

### 4. Show Subscription Info in Cart (Optional)

Display subscription details on cart line items:

```tsx
import { SubscriptionBadge } from "~/integrations/subscriptions";

function CartLineItem({ line }) {
  return (
    <div className="cart-line">
      <span>{line.merchandise.product.title}</span>

      {/* Show subscription badge */}
      {line.sellingPlanAllocation && (
        <SubscriptionBadge allocation={line.sellingPlanAllocation} />
      )}
    </div>
  );
}
```

## Components

### SubscriptionSelector

Full subscription selection UI with one-time vs. subscription toggle and frequency dropdown.

```tsx
<SubscriptionSelector
  sellingPlanGroups={product.sellingPlanGroups}
  sellingPlanAllocations={variant.sellingPlanAllocations}
  purchaseType={purchaseType}
  onPurchaseTypeChange={setPurchaseType}
  selectedSellingPlanId={selectedSellingPlanId}
  onSellingPlanChange={setSelectedSellingPlanId}
/>
```

### SubscriptionToggle

Simple checkbox toggle for single-option subscriptions:

```tsx
<SubscriptionToggle
  isSubscription={purchaseType === "subscription"}
  onChange={(checked) => setPurchaseType(checked ? "subscription" : "one-time")}
  discountPercentage={10}
/>
```

### SubscriptionPrice

Price display that shows subscription pricing when active:

```tsx
<SubscriptionPrice
  price={variant.price}
  compareAtPrice={variant.compareAtPrice}
  selectedAllocation={selectedAllocation}
/>
```

### SubscriptionBadge

Badge showing subscription details on cart items:

```tsx
<SubscriptionBadge allocation={line.sellingPlanAllocation} />
```

## Hooks

### useSubscription

Main hook for managing subscription state:

```tsx
const {
  purchaseType, // 'one-time' | 'subscription'
  setPurchaseType, // (type) => void
  selectedSellingPlanId, // string | null
  setSelectedSellingPlanId, // (id) => void
  hasSubscriptionOptions, // boolean
  selectedAllocation, // SellingPlanAllocation | null
  getDiscountPercentage, // (plan) => number | null
} = useSubscription({
  sellingPlanGroups: product.sellingPlanGroups,
  sellingPlanAllocations: variant.sellingPlanAllocations,
  defaultToSubscription: false, // Optional: default to subscription
});
```

### Utility Functions

```tsx
import {
  formatSellingPlanName,
  getSellingPlanFrequency,
  calculateSubscriptionSavings,
} from "~/integrations/subscriptions";

// Clean up plan names
formatSellingPlanName("Deliver every month"); // 'Every month'

// Get frequency string
getSellingPlanFrequency(plan); // 'Every 2 weeks'

// Calculate savings
calculateSubscriptionSavings("30.00", "27.00");
// { amount: 3, percentage: 10 }
```

## GraphQL Fragments

Pre-built fragments for your queries:

```tsx
import {
  SELLING_PLAN_FRAGMENT,
  SELLING_PLAN_GROUPS_FRAGMENT,
  SELLING_PLAN_ALLOCATION_FRAGMENT,
  VARIANT_WITH_SELLING_PLANS_FRAGMENT,
  CART_LINE_SUBSCRIPTION_FRAGMENT,
} from "~/integrations/subscriptions";
```

## CSS Classes

Style the components with these classes:

**Subscription Selector:**

- `.subscription-selector` - Main container
- `.subscription-selector__options` - Options container
- `.subscription-selector__option` - Individual option (one-time / subscription)
- `.subscription-selector__radio` - Radio input
- `.subscription-selector__discount` - Discount badge
- `.subscription-selector__frequency` - Frequency dropdown container
- `.subscription-selector__frequency-select` - Dropdown element

**Subscription Price:**

- `.subscription-price` - Price container
- `.subscription-price__current` - Current price
- `.subscription-price__frequency` - "/delivery" text
- `.subscription-price__original` - Original price container
- `.subscription-price__compare` - Strikethrough price
- `.subscription-price__savings` - Savings badge

**Subscription Badge:**

- `.subscription-badge` - Badge on cart items

## Troubleshooting

### Selling plans not appearing

1. Verify the subscription app (Recharge) is installed and configured
2. Check that products have selling plan groups assigned
3. Test the GraphQL query in your Shopify Storefront API explorer:

```graphql
query {
  product(handle: "your-product") {
    sellingPlanGroups(first: 5) {
      nodes {
        name
        sellingPlans(first: 5) {
          nodes {
            id
            name
          }
        }
      }
    }
  }
}
```

### Subscription not added to cart

1. Verify `sellingPlanId` is being passed to CartForm
2. Check the cart API response for errors
3. Ensure the selling plan ID matches a valid plan for the variant

### Prices not showing correctly

1. Check that `sellingPlanAllocations` is included in the variant query
2. Verify the allocation is being selected correctly based on the chosen plan

## Recharge-Specific Notes

- **Pro Plan Required**: Recharge Pro plan is needed for Storefront API access
- **Checkout**: Checkout is handled by Shopify (no custom checkout needed)
- **Customer Portal**: Manage subscriptions via Recharge's hosted portal or their API
- **Prepaid Subscriptions**: Use `purchasingCompany` in queries for B2B prepaid

## API Reference

- [Shopify Selling Plans API](https://shopify.dev/docs/api/storefront/latest/objects/sellingplan)
- [Recharge Hydrogen Examples](https://storefront.rechargepayments.com/client/docs/examples/hydrogen/overview/)
- [Shopify Subscriptions Guide](https://shopify.dev/docs/apps/selling-strategies/subscriptions)
