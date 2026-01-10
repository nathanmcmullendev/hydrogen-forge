# Hydrogen Forge - App Integrations Specification

## Technical Implementation Guide for Claude Code

**Created:** January 10, 2026
**Purpose:** Complete technical specifications for implementing Klaviyo, Recharge, Okendo, and Algolia integrations in Hydrogen Forge

---

## Executive Summary

### The Problem We're Solving

On a normal Shopify Liquid store:

- Install Klaviyo app → Widget appears automatically
- Install Recharge app → Subscription widget appears
- Install Yotpo/Okendo → Reviews show on product page

**On Hydrogen (headless):**

- Install Klaviyo app → **Nothing happens in your React frontend**
- Install Recharge app → **Nothing happens**
- Install reviews app → **Nothing happens**

The apps install on Shopify's backend, but there's no "hook" system to inject into React components. Developers must manually integrate each app via API.

> "Things like Gorgias, Recharge subscriptions, cart upsells that are usually just one-click installs turn into major pain points trying to integrate all the different APIs"
> — Developer on GitHub

### Our Goal

Build pre-built React components and utilities that make integration as simple as:

```bash
# Developer adds to .env
KLAVIYO_PUBLIC_KEY=abc123
OKENDO_SUBSCRIBER_ID=xyz789

# Components just work
<KlaviyoNewsletterForm />
<OkendoStarRating productId={product.id} />
```

---

## Integration 1: Klaviyo (Email/SMS Marketing)

### Overview

| Property                      | Value                           |
| ----------------------------- | ------------------------------- |
| **App Type**                  | Email/SMS Marketing             |
| **Revenue**                   | $585M/year, 117k+ brands        |
| **Complexity**                | Medium                          |
| **Official Hydrogen Support** | Yes (documented but manual)     |
| **npm Package**               | None official (we build custom) |

### Authentication

Klaviyo uses TWO types of API keys:

1. **Public API Key (company_id)**: 6-character string for client-side tracking
   - Safe to expose in browser
   - Used for: identify, track, subscribe to lists
2. **Private API Key**: For server-side operations
   - Never expose in browser
   - Used for: creating lists, querying data, bulk operations

### Required ENV Variables

```env
# Client-side (safe to expose)
KLAVIYO_PUBLIC_KEY=ABC123

# Server-side only (in Hydrogen server functions)
KLAVIYO_PRIVATE_KEY=pk_xxxxxxxxxxxxxxx

# Optional
KLAVIYO_LIST_ID=XyZ123  # Default newsletter list
```

### Components to Build

#### 1. KlaviyoProvider (Context Wrapper)

```tsx
// app/integrations/klaviyo/KlaviyoProvider.tsx
import { createContext, useContext, useEffect } from "react";

interface KlaviyoContextValue {
  identify: (profile: KlaviyoProfile) => void;
  track: (event: string, properties?: Record<string, any>) => void;
  isReady: boolean;
}

export function KlaviyoProvider({
  publicKey,
  children,
}: {
  publicKey: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Load Klaviyo.js script
    const script = document.createElement("script");
    script.src = `//static.klaviyo.com/onsite/js/${publicKey}/klaviyo.js`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [publicKey]);

  // ... context implementation
}
```

#### 2. KlaviyoNewsletterForm

```tsx
// app/integrations/klaviyo/KlaviyoNewsletterForm.tsx

interface NewsletterFormProps {
  listId?: string; // Override default list
  successMessage?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Uses Klaviyo's Client API endpoint:
// POST https://a.klaviyo.com/client/subscriptions/?company_id=PUBLIC_KEY
```

**API Endpoint for Subscribe:**

```typescript
const subscribeToList = async (
  email: string,
  listId: string,
  publicKey: string,
) => {
  const response = await fetch(
    `https://a.klaviyo.com/client/subscriptions/?company_id=${publicKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        revision: "2024-02-15", // API version
      },
      body: JSON.stringify({
        data: {
          type: "subscription",
          attributes: {
            profile: {
              data: {
                type: "profile",
                attributes: { email },
              },
            },
          },
          relationships: {
            list: {
              data: {
                type: "list",
                id: listId,
              },
            },
          },
        },
      }),
    },
  );
  return response.ok;
};
```

#### 3. KlaviyoIdentify (Customer Tracking)

```tsx
// Identify logged-in customers
export function useKlaviyoIdentify() {
  const identify = (profile: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    [key: string]: any;
  }) => {
    if (typeof window !== "undefined" && window.klaviyo) {
      window.klaviyo.identify({
        email: profile.email,
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone_number: profile.phoneNumber,
        ...profile,
      });
    }
  };

  return { identify };
}
```

#### 4. KlaviyoTrackViewedProduct

```tsx
// Track product views for browse abandonment
export function trackViewedProduct(product: ShopifyProduct) {
  if (typeof window !== "undefined" && window.klaviyo) {
    const item = {
      Name: product.title,
      ProductID: product.id.replace("gid://shopify/Product/", ""),
      ImageURL: product.featuredImage?.url,
      Handle: product.handle,
      Brand: product.vendor,
      Price: product.priceRange?.minVariantPrice?.amount,
      Metadata: {
        Brand: product.vendor,
        CompareAtPrice: product.compareAtPriceRange?.minVariantPrice?.amount,
      },
    };

    window.klaviyo.track("Viewed Product", item);
    window.klaviyo.trackViewedItem(item);
  }
}
```

#### 5. KlaviyoTrackAddedToCart

```tsx
export function trackAddedToCart(
  product: ShopifyProduct,
  variant: ProductVariant,
) {
  if (typeof window !== "undefined" && window.klaviyo) {
    window.klaviyo.track("Added to Cart", {
      Name: product.title,
      ProductID: product.id.replace("gid://shopify/Product/", ""),
      VariantID: variant.id.replace("gid://shopify/ProductVariant/", ""),
      ImageURL: variant.image?.url || product.featuredImage?.url,
      Price: variant.price?.amount,
      Quantity: 1,
    });
  }
}
```

### Integration in root.tsx

```tsx
// app/root.tsx
import { Script } from "@shopify/hydrogen";
import { KlaviyoProvider } from "~/integrations/klaviyo";

export default function App() {
  return (
    <html>
      <head>...</head>
      <body>
        <KlaviyoProvider publicKey={env.KLAVIYO_PUBLIC_KEY}>
          <Outlet />
        </KlaviyoProvider>

        {/* Alternative: Direct script inclusion */}
        <Script
          async
          src={`//static.klaviyo.com/onsite/js/${env.KLAVIYO_PUBLIC_KEY}/klaviyo.js`}
        />
      </body>
    </html>
  );
}
```

### Files to Create

```
templates/starter/app/integrations/klaviyo/
├── index.ts                    # Re-exports
├── KlaviyoProvider.tsx         # Context wrapper
├── KlaviyoNewsletterForm.tsx   # Newsletter signup form
├── KlaviyoIdentify.tsx         # Customer identification
├── KlaviyoTracking.tsx         # Event tracking utilities
├── useKlaviyo.ts              # React hooks
└── types.ts                   # TypeScript interfaces
```

---

## Integration 2: Okendo (Reviews & UGC)

### Overview

| Property                      | Value                                |
| ----------------------------- | ------------------------------------ |
| **App Type**                  | Reviews, Loyalty, Quizzes            |
| **Complexity**                | Low-Medium (official package exists) |
| **Official Hydrogen Support** | Yes - `@okendo/shopify-hydrogen`     |
| **npm Package**               | `@okendo/shopify-hydrogen`           |

### Key Insight

**Okendo already has an official npm package for Hydrogen!** Our job is to:

1. Document proper setup
2. Provide wrapper components with sensible defaults
3. Handle common edge cases

### Required ENV Variables

```env
OKENDO_SUBSCRIBER_ID=your-subscriber-id
```

### Installation

```bash
npm install @okendo/shopify-hydrogen
```

### Setup in root.tsx

```tsx
// app/root.tsx
import {
  OkendoProvider,
  getOkendoProviderData,
} from "@okendo/shopify-hydrogen";

export async function loader({ context }: LoaderArgs) {
  const okendoProviderData = await getOkendoProviderData({
    env: context.env,
    subscriberId: context.env.OKENDO_SUBSCRIBER_ID,
  });

  return { okendoProviderData };
}

export default function App() {
  const { okendoProviderData } = useLoaderData<typeof loader>();

  return (
    <html>
      <body>
        <OkendoProvider {...okendoProviderData}>
          <Outlet />
        </OkendoProvider>
      </body>
    </html>
  );
}
```

### Available Components (from @okendo/shopify-hydrogen)

```tsx
import {
  OkendoStarRating,      // Star rating display
  OkendoReviews,         // Full reviews widget
  OkendoReviewsWidget,   // Configurable reviews
  OkendoReviewsCarousel, // Carousel display
  OkendoLoyaltyWidget,   // Loyalty points widget
} from '@okendo/shopify-hydrogen';

// Usage on product page
<OkendoStarRating
  productId={product.id}
  okendoStarRatingSnippet={okendoStarRatingSnippet}
/>

<OkendoReviews productId={product.id} />
```

### Our Wrapper Components

We'll create wrapper components that:

1. Handle missing Okendo config gracefully
2. Provide fallback UI
3. Add loading states
4. Include TypeScript types

```tsx
// app/integrations/reviews/OkendoReviewsWrapper.tsx

interface OkendoReviewsWrapperProps {
  productId: string;
  showIfEmpty?: boolean; // Show "No reviews yet" vs nothing
  fallback?: React.ReactNode;
}

export function OkendoReviewsWrapper({
  productId,
  showIfEmpty = true,
  fallback,
}: OkendoReviewsWrapperProps) {
  // Check if Okendo is configured
  const isConfigured = !!process.env.OKENDO_SUBSCRIBER_ID;

  if (!isConfigured) {
    return fallback || null;
  }

  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <OkendoReviews productId={productId} />
    </Suspense>
  );
}
```

### Files to Create

```
templates/starter/app/integrations/reviews/
├── index.ts                    # Re-exports
├── OkendoReviewsWrapper.tsx    # Reviews with fallbacks
├── OkendoStarRatingWrapper.tsx # Star rating with fallbacks
├── ReviewsSkeleton.tsx         # Loading skeleton
└── types.ts                    # TypeScript interfaces
```

---

## Integration 3: Recharge (Subscriptions)

### Overview

| Property                      | Value                             |
| ----------------------------- | --------------------------------- |
| **App Type**                  | Subscription Commerce             |
| **Revenue**                   | $20M+/month processed             |
| **Complexity**                | HIGH                              |
| **Official Hydrogen Support** | Yes - Recharge JS SDK             |
| **npm Package**               | `@rechargeapps/storefront-client` |

### Key Architecture

Recharge subscriptions work through **Shopify Selling Plans**:

1. Recharge creates "Selling Plans" in Shopify Admin
2. Selling Plans attach to products (one-time vs subscription)
3. Cart items include `sellingPlanId` to enable subscription
4. Checkout handles recurring billing via Shopify

### Required ENV Variables

```env
# No special env needed for basic integration
# Recharge works through Shopify's Storefront API
```

### GraphQL Query for Selling Plans

```graphql
# Get product with selling plans
query Product($handle: String!) {
  product(handle: $handle) {
    id
    title
    sellingPlanGroups(first: 10) {
      nodes {
        name
        sellingPlans(first: 10) {
          nodes {
            id
            name
            description
            recurringDeliveries
            options {
              name
              value
            }
            priceAdjustments {
              adjustmentValue {
                ... on SellingPlanPercentagePriceAdjustment {
                  adjustmentPercentage
                }
                ... on SellingPlanFixedPriceAdjustment {
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
    variants(first: 100) {
      nodes {
        id
        title
        price {
          amount
          currencyCode
        }
        sellingPlanAllocations(first: 10) {
          nodes {
            sellingPlan {
              id
              name
            }
            priceAdjustments {
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
```

### Components to Build

#### 1. SubscriptionSelector

```tsx
// app/integrations/subscriptions/SubscriptionSelector.tsx

interface SubscriptionSelectorProps {
  product: Product;
  selectedVariant: ProductVariant;
  onSellingPlanChange: (sellingPlanId: string | null) => void;
}

export function SubscriptionSelector({
  product,
  selectedVariant,
  onSellingPlanChange,
}: SubscriptionSelectorProps) {
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">(
    "one-time",
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const sellingPlanGroups = product.sellingPlanGroups?.nodes || [];
  const hasSubscriptions = sellingPlanGroups.length > 0;

  if (!hasSubscriptions) {
    return null; // Product doesn't have subscription options
  }

  return (
    <div className="subscription-selector">
      {/* One-time vs Subscribe toggle */}
      <div className="purchase-type-toggle">
        <button
          onClick={() => {
            setPurchaseType("one-time");
            onSellingPlanChange(null);
          }}
          className={purchaseType === "one-time" ? "active" : ""}
        >
          One-time purchase
        </button>
        <button
          onClick={() => setPurchaseType("subscription")}
          className={purchaseType === "subscription" ? "active" : ""}
        >
          Subscribe & Save
        </button>
      </div>

      {/* Subscription frequency options */}
      {purchaseType === "subscription" && (
        <div className="selling-plans">
          {sellingPlanGroups.map((group) => (
            <div key={group.name}>
              <h4>{group.name}</h4>
              {group.sellingPlans.nodes.map((plan) => (
                <label key={plan.id}>
                  <input
                    type="radio"
                    name="selling-plan"
                    value={plan.id}
                    checked={selectedPlan === plan.id}
                    onChange={() => {
                      setSelectedPlan(plan.id);
                      onSellingPlanChange(plan.id);
                    }}
                  />
                  {plan.name}
                  {/* Show discount if applicable */}
                  {plan.priceAdjustments?.[0]?.adjustmentValue
                    ?.adjustmentPercentage && (
                    <span className="discount">
                      Save{" "}
                      {
                        plan.priceAdjustments[0].adjustmentValue
                          .adjustmentPercentage
                      }
                      %
                    </span>
                  )}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 2. Modified AddToCartButton

```tsx
// Adding to cart WITH selling plan
import { CartForm } from "@shopify/hydrogen";

export function AddToCartWithSubscription({
  variantId,
  sellingPlanId,
  disabled,
}: {
  variantId: string;
  sellingPlanId: string | null;
  disabled?: boolean;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{
        lines: [
          {
            merchandiseId: variantId,
            quantity: 1,
            // KEY: Include selling plan ID for subscriptions
            ...(sellingPlanId && { sellingPlanId }),
          },
        ],
      }}
    >
      <button type="submit" disabled={disabled}>
        {sellingPlanId ? "Subscribe" : "Add to Cart"}
      </button>
    </CartForm>
  );
}
```

#### 3. SubscriptionCartLineItem

```tsx
// Display subscription info in cart
export function SubscriptionCartLineItem({ line }: { line: CartLine }) {
  const sellingPlanAllocation = line.sellingPlanAllocation;

  return (
    <div className="cart-line">
      <img
        src={line.merchandise.image?.url}
        alt={line.merchandise.product.title}
      />
      <div>
        <h3>{line.merchandise.product.title}</h3>
        {sellingPlanAllocation && (
          <div className="subscription-badge">
            <span>Subscription: {sellingPlanAllocation.sellingPlan.name}</span>
            {/* Show subscription price vs regular price */}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Files to Create

```
templates/starter/app/integrations/subscriptions/
├── index.ts                      # Re-exports
├── SubscriptionSelector.tsx      # Purchase type + frequency selector
├── SubscriptionPrice.tsx         # Price display with discount
├── SubscriptionCartLine.tsx      # Cart line with subscription info
├── useSubscription.ts            # Hooks for subscription state
├── sellingPlans.graphql          # GraphQL fragments
└── types.ts                      # TypeScript interfaces
```

### Important Notes for Recharge

1. **Recharge Pro Plan Required** for Storefront API access
2. **Customer Portal** - Recharge provides hosted portal or API for custom
3. **Checkout** - Uses Shopify Checkout (no custom checkout needed)
4. **Billing** - Handled entirely by Recharge on backend

---

## Integration 4: Algolia (Search & Discovery)

### Overview

| Property                      | Value                                  |
| ----------------------------- | -------------------------------------- |
| **App Type**                  | AI Search & Discovery                  |
| **Complexity**                | Medium                                 |
| **Official Hydrogen Support** | Yes - Demo repo available              |
| **npm Packages**              | `algoliasearch`, `react-instantsearch` |

### Required ENV Variables

```env
ALGOLIA_APP_ID=your-app-id
ALGOLIA_SEARCH_API_KEY=your-search-only-key  # Safe for client
ALGOLIA_INDEX_PREFIX=shopify_                 # Usually "shopify_"
```

### Architecture

1. **Algolia Shopify App** syncs products to Algolia index
2. **React InstantSearch** provides UI components
3. **Hydrogen routes** integrate with Algolia for search/collections

### Installation

```bash
npm install algoliasearch react-instantsearch
```

### Configuration

```typescript
// app/integrations/search/algolia.config.ts

export const algoliaConfig = {
  appId: process.env.ALGOLIA_APP_ID!,
  searchApiKey: process.env.ALGOLIA_SEARCH_API_KEY!,
  indexPrefix: process.env.ALGOLIA_INDEX_PREFIX || "shopify_",

  // Index names
  get productsIndex() {
    return `${this.indexPrefix}products`;
  },
  get querySuggestionsIndex() {
    return `${this.indexPrefix}products_query_suggestions`;
  },
};
```

### Components to Build

#### 1. AlgoliaProvider

```tsx
// app/integrations/search/AlgoliaProvider.tsx
import algoliasearch from "algoliasearch/lite";
import { InstantSearch } from "react-instantsearch";
import { algoliaConfig } from "./algolia.config";

const searchClient = algoliasearch(
  algoliaConfig.appId,
  algoliaConfig.searchApiKey,
);

export function AlgoliaProvider({ children }: { children: React.ReactNode }) {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={algoliaConfig.productsIndex}
    >
      {children}
    </InstantSearch>
  );
}
```

#### 2. AlgoliaSearchBox (Autocomplete)

```tsx
// app/integrations/search/AlgoliaSearchBox.tsx
import { useSearchBox } from "react-instantsearch";
import { autocomplete } from "@algolia/autocomplete-js";

export function AlgoliaSearchBox() {
  const { query, refine } = useSearchBox();

  return (
    <div className="search-box">
      <input
        type="search"
        value={query}
        onChange={(e) => refine(e.target.value)}
        placeholder="Search products..."
      />
    </div>
  );
}
```

#### 3. AlgoliaSearchResults

```tsx
// app/integrations/search/AlgoliaSearchResults.tsx
import { useHits, useSearchBox } from "react-instantsearch";
import { ProductCard } from "~/components/ProductCard";

export function AlgoliaSearchResults() {
  const { hits } = useHits();
  const { query } = useSearchBox();

  if (!query) {
    return null;
  }

  return (
    <div className="search-results">
      <p>
        {hits.length} results for "{query}"
      </p>
      <div className="products-grid">
        {hits.map((hit) => (
          <ProductCard
            key={hit.objectID}
            product={transformAlgoliaHitToProduct(hit)}
          />
        ))}
      </div>
    </div>
  );
}

// Transform Algolia hit to match Shopify product shape
function transformAlgoliaHitToProduct(hit: any) {
  return {
    id: hit.objectID,
    title: hit.title,
    handle: hit.handle,
    featuredImage: { url: hit.image },
    priceRange: {
      minVariantPrice: {
        amount: hit.price,
        currencyCode: "USD",
      },
    },
  };
}
```

#### 4. AlgoliaCollectionFilters

```tsx
// app/integrations/search/AlgoliaCollectionFilters.tsx
import {
  useRefinementList,
  useClearRefinements,
  useRange,
} from "react-instantsearch";

export function AlgoliaCollectionFilters() {
  return (
    <div className="filters">
      <PriceRangeFilter />
      <VendorFilter />
      <ProductTypeFilter />
      <ClearFiltersButton />
    </div>
  );
}

function VendorFilter() {
  const { items, refine } = useRefinementList({ attribute: "vendor" });

  return (
    <div className="filter-group">
      <h4>Brand</h4>
      {items.map((item) => (
        <label key={item.value}>
          <input
            type="checkbox"
            checked={item.isRefined}
            onChange={() => refine(item.value)}
          />
          {item.label} ({item.count})
        </label>
      ))}
    </div>
  );
}
```

### Search Route Integration

```tsx
// app/routes/($locale).search.tsx
import {
  AlgoliaProvider,
  AlgoliaSearchBox,
  AlgoliaSearchResults,
} from "~/integrations/search";

export default function SearchPage() {
  return (
    <AlgoliaProvider>
      <div className="search-page">
        <AlgoliaSearchBox />
        <AlgoliaSearchResults />
      </div>
    </AlgoliaProvider>
  );
}
```

### Files to Create

```
templates/starter/app/integrations/search/
├── index.ts                     # Re-exports
├── algolia.config.ts            # Configuration
├── AlgoliaProvider.tsx          # InstantSearch wrapper
├── AlgoliaSearchBox.tsx         # Search input with autocomplete
├── AlgoliaSearchResults.tsx     # Results grid
├── AlgoliaCollectionFilters.tsx # Faceted filters
├── AlgoliaPagination.tsx        # Pagination component
├── transforms.ts                # Algolia ↔ Shopify data transforms
└── types.ts                     # TypeScript interfaces
```

---

## Project Structure Summary

```
templates/starter/app/integrations/
├── index.ts                  # Master re-exports
├── klaviyo/
│   ├── index.ts
│   ├── KlaviyoProvider.tsx
│   ├── KlaviyoNewsletterForm.tsx
│   ├── KlaviyoIdentify.tsx
│   ├── KlaviyoTracking.tsx
│   ├── useKlaviyo.ts
│   └── types.ts
├── reviews/
│   ├── index.ts
│   ├── OkendoReviewsWrapper.tsx
│   ├── OkendoStarRatingWrapper.tsx
│   ├── ReviewsSkeleton.tsx
│   └── types.ts
├── subscriptions/
│   ├── index.ts
│   ├── SubscriptionSelector.tsx
│   ├── SubscriptionPrice.tsx
│   ├── SubscriptionCartLine.tsx
│   ├── useSubscription.ts
│   ├── sellingPlans.graphql
│   └── types.ts
└── search/
    ├── index.ts
    ├── algolia.config.ts
    ├── AlgoliaProvider.tsx
    ├── AlgoliaSearchBox.tsx
    ├── AlgoliaSearchResults.tsx
    ├── AlgoliaCollectionFilters.tsx
    ├── AlgoliaPagination.tsx
    ├── transforms.ts
    └── types.ts
```

---

## ENV Variables Summary

```env
# ===== KLAVIYO =====
KLAVIYO_PUBLIC_KEY=ABC123           # 6-char public key (safe for client)
KLAVIYO_PRIVATE_KEY=pk_xxxx         # Server-side only
KLAVIYO_LIST_ID=XyZ123              # Default newsletter list

# ===== OKENDO =====
OKENDO_SUBSCRIBER_ID=your-id        # From Okendo dashboard

# ===== RECHARGE =====
# No additional env needed - works through Shopify Storefront API
# Recharge must be installed on Shopify store

# ===== ALGOLIA =====
ALGOLIA_APP_ID=your-app-id
ALGOLIA_SEARCH_API_KEY=your-key     # Search-only key (safe for client)
ALGOLIA_INDEX_PREFIX=shopify_       # Usually "shopify_"
```

---

## Implementation Priority

| Phase | Integration  | Why This Order                                |
| ----- | ------------ | --------------------------------------------- |
| 1     | **Klaviyo**  | Most requested, medium complexity, no npm dep |
| 2     | **Okendo**   | Official npm package exists, easiest          |
| 3     | **Algolia**  | Good demo repo available, medium complexity   |
| 4     | **Recharge** | Most complex, requires deep Shopify knowledge |

---

## Testing Checklist

### Klaviyo

- [ ] Newsletter form submits successfully
- [ ] Subscriber appears in Klaviyo dashboard
- [ ] Viewed Product events fire on product pages
- [ ] Added to Cart events fire
- [ ] Customer identification works for logged-in users

### Okendo

- [ ] Star ratings display on product cards
- [ ] Full reviews widget loads on product page
- [ ] Reviews carousel works on homepage
- [ ] Fallback UI shows when Okendo not configured

### Recharge

- [ ] Subscription products show Subscribe & Save option
- [ ] Selling plan selector works
- [ ] Cart shows subscription details
- [ ] Checkout creates subscription order
- [ ] One-time purchase still works

### Algolia

- [ ] Search autocomplete returns results
- [ ] Search results page displays products
- [ ] Faceted filters work (price, vendor, type)
- [ ] Pagination works
- [ ] No results state handled

---

## Claude Code Command

```
Act as HYDROGEN for this session.
Read .claude/projects/hydrogen.md and this spec document.

NEW OBJECTIVE: Build App Integrations

Start with Phase 1: Klaviyo Integration
1. Create the klaviyo/ folder structure as specified
2. Build KlaviyoProvider with script loading
3. Build KlaviyoNewsletterForm with API integration
4. Build tracking utilities (identify, trackViewedProduct, trackAddedToCart)
5. Add TypeScript types
6. Update root.tsx to include KlaviyoProvider
7. Add example usage on homepage (newsletter form)
8. Create docs/integrations/KLAVIYO.md

Test by:
- Add KLAVIYO_PUBLIC_KEY to .env
- Verify script loads in browser
- Submit newsletter form, check Network tab

Follow build-test-iterate-push workflow.
Push at meaningful checkpoints with commit messages like:
"feat(klaviyo): add newsletter form component"
```

---

## Reference Links

- Klaviyo Hydrogen Guide: https://developers.klaviyo.com/en/docs/integrate_with_a_shopify_hydrogen_store
- Klaviyo JS API: https://developers.klaviyo.com/en/docs/javascript_api
- Okendo Hydrogen Package: https://www.npmjs.com/package/@okendo/shopify-hydrogen
- Okendo Demo Store: https://github.com/okendo/okendo-shopify-hydrogen-demo
- Recharge Hydrogen Examples: https://storefront.rechargepayments.com/client/docs/examples/hydrogen/overview/
- Algolia Hydrogen Demo: https://github.com/algolia/shopify-hydrogen-algolia
- Algolia React InstantSearch: https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/
