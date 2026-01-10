# Integration Research Summary

**Date:** January 10, 2026
**Purpose:** Analysis of existing Hydrogen integration repos to determine what to build vs. npm install

---

## Executive Summary

| Repo                | Version                                | Status       | Recommendation                        |
| ------------------- | -------------------------------------- | ------------ | ------------------------------------- |
| **Okendo Demo**     | Hydrogen 2025.7.0 / React Router 7.9.2 | **CURRENT**  | Use as primary reference              |
| **Klaviyo Example** | Hydrogen V1 (Remix-based)              | **OUTDATED** | Extract patterns only, rebuild for V2 |
| **Algolia Demo**    | Hydrogen 2023.4.3 (Remix)              | **OUTDATED** | Extract patterns only, rebuild for V2 |

---

## 1. Okendo Demo Analysis

**Source:** https://github.com/okendo/okendo-shopify-hydrogen-demo

### Version Info (CURRENT)

```json
{
  "@okendo/shopify-hydrogen": "^2.6.0",
  "@shopify/hydrogen": "2025.7.0",
  "react-router": "7.9.2",
  "react-router-dom": "7.9.2"
}
```

### Key Patterns to Adopt

**1. Provider Setup in root.tsx:**

```tsx
import {
  getOkendoProviderData,
  OkendoProvider,
} from "@okendo/shopify-hydrogen";

// In loadDeferredData (non-blocking):
function loadDeferredData({ context }: Route.LoaderArgs) {
  return {
    okendoProviderData: getOkendoProviderData({
      context,
      subscriberId: "<your-okendo-subscriber-id>",
    }),
  };
}

// In App component:
<OkendoProvider okendoProviderData={data.okendoProviderData}>
  <Analytics.Provider>
    <PageLayout>
      <Outlet />
    </PageLayout>
  </Analytics.Provider>
</OkendoProvider>;
```

**2. Meta tag in Layout:**

```tsx
<meta name="oke:subscriber_id" content="<your-okendo-subscriber-id>" />
```

**3. GraphQL Fragments:**

```graphql
fragment OkendoStarRatingSnippet on Product {
  okendoStarRatingSnippet: metafield(
    namespace: "app--1576377--reviews"
    key: "star_rating_snippet"
  ) {
    value
  }
}

fragment OkendoReviewsSnippet on Product {
  okendoReviewsSnippet: metafield(
    namespace: "app--1576377--reviews"
    key: "reviews_widget_snippet"
  ) {
    value
  }
}
```

**4. Component Usage:**

```tsx
import {OkendoReviews, OkendoStarRating} from '@okendo/shopify-hydrogen';

// Star rating on product cards:
<OkendoStarRating
  productId={product.id}
  okendoStarRatingSnippet={product.okendoStarRatingSnippet}
/>

// Reviews on product page:
<OkendoReviews
  productId={product.id}
  okendoReviewsSnippet={product.okendoReviewsSnippet}
/>
```

**5. V2 Analytics Pattern:**

```tsx
<Analytics.ProductView
  data={{
    products: [
      {
        id: product.id,
        title: product.title,
        price: selectedVariant?.price.amount || "0",
        vendor: product.vendor,
        variantId: selectedVariant?.id || "",
        variantTitle: selectedVariant?.title || "",
        quantity: 1,
      },
    ],
  }}
/>
```

### Recommendation: Use Official Package

```bash
npm install @okendo/shopify-hydrogen
```

**What we build:** Wrapper components with fallbacks, documentation, env variable handling
**What we DON'T build:** Core review functionality (use npm package)

---

## 2. Klaviyo Example Analysis

**Source:** https://github.com/klaviyo-labs/klaviyo-shopify-hydrogen-example

### Version Info (OUTDATED)

- **Framework:** Hydrogen V1 (pre-2023)
- **Indicators:**
  - `.client.jsx` file suffix (V1 pattern)
  - `ClientAnalytics` from `@shopify/hydrogen` (V1 only)
  - `loadScript` from `@shopify/hydrogen` (V1 only)
  - `useProductOptions` hook (V1 only)
  - References `App.server.jsx` (V1 RSC pattern)

### Klaviyo-Specific Patterns to Keep

**1. Script Loading URL:**

```javascript
const PUBLIC_KEY = "API_KEY";
const URL = `//static.klaviyo.com/onsite/js/klaviyo.js?company_id=${PUBLIC_KEY}`;
```

**2. Event Tracking via `_learnq` Array:**

```javascript
var _learnq = window._learnq || [];

// Track Viewed Product
_learnq.push([
  "track",
  "Viewed Product",
  {
    Name: payload.title,
    ProductID: productId, // Numeric ID, not GID
    Categories: collectionTitles,
    ImageURL: imageUrl,
    URL: productUrl,
    Brand: vendor,
    Price: price,
    CompareAtPrice: compareAtPrice,
  },
]);

// Track Viewed Item (for browse abandonment)
_learnq.push([
  "trackViewedItem",
  {
    Title: title,
    ItemId: productId,
    Categories: collectionTitles,
    ImageUrl: imageUrl,
    Url: productUrl,
    Metadata: { Brand, Price, CompareAtPrice },
  },
]);

// Track Added to Cart
_learnq.push([
  "track",
  "Added to Cart",
  {
    total_price: cart.cost.totalAmount.amount,
    $value: cart.cost.totalAmount.amount,
    original_total_price: cart.cost.subtotalAmount.amount,
    items: cartLines,
  },
]);

// Identify Customer
_learnq.push([
  "identify",
  {
    $email: customer.email,
    $first_name: customer.firstName,
    $last_name: customer.lastName,
  },
]);
```

**3. Product ID Extraction:**

```javascript
// Convert GID to numeric ID for Klaviyo
const productId = gid.substring(gid.lastIndexOf("/") + 1);
// gid://shopify/Product/12345 → "12345"
```

### What Needs Rebuilding for V2

| V1 Pattern                    | V2 Replacement                                   |
| ----------------------------- | ------------------------------------------------ |
| `ClientAnalytics.subscribe()` | `Analytics.Provider` + custom hooks              |
| `ClientAnalytics.publish()`   | Direct event calls in useEffect                  |
| `loadScript()`                | DOM API or useEffect with script injection       |
| `useProductOptions()`         | `getProductOptions()` + `useOptimisticVariant()` |
| `.client.jsx`                 | `.tsx` (no client/server suffix)                 |

### Recommendation: Build from Scratch Using Patterns

**What we keep:** Klaviyo API patterns, event shapes, tracking logic
**What we rebuild:** React components, hooks, script loading for V2

---

## 3. Algolia Demo Analysis

**Source:** https://github.com/algolia/shopify-hydrogen-algolia

### Version Info (OUTDATED)

```json
{
  "@shopify/hydrogen": "^2023.4.3",
  "@remix-run/react": "1.15.0",
  "@shopify/remix-oxygen": "^1.0.7",
  "react-instantsearch": "^7.5.2",
  "algoliasearch": "^4.22.1",
  "@algolia/autocomplete-js": "^1.13.0"
}
```

### Algolia Packages (Still Current)

The Algolia packages themselves are still valid:

- `algoliasearch: ^4.22.1` - Core search client
- `react-instantsearch: ^7.5.2` - React components
- `@algolia/autocomplete-js: ^1.13.0` - Autocomplete widget
- `@algolia/autocomplete-plugin-query-suggestions: ^1.13.0`
- `@algolia/autocomplete-plugin-recent-searches: ^1.13.0`
- `@algolia/requester-fetch: ^4.22.1` - Fetch adapter

### Key Patterns to Keep

**1. Config File Structure:**

```json
// algolia.config.json
{
  "appId": "YOUR_ALGOLIA_APP_ID",
  "appKey": "YOUR_ALGOLIA_API_KEY",
  "prefix": "shopify_",
  "QSindex": "shopify_products_query_suggestions"
}
```

**2. Search Client Initialization:**

```javascript
import algoliasearch from "algoliasearch/dist/algoliasearch-lite.esm.browser";
import { createFetchRequester } from "@algolia/requester-fetch";

const searchClient = algoliasearch(appId, apiKey, {
  requester: createFetchRequester(),
});
```

**3. Autocomplete with Multiple Sources:**

```javascript
autocomplete({
  container: containerRef.current,
  getSources({ query }) {
    return [
      {
        sourceId: "products",
        getItems() {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName: prefix + "products",
                query,
                params: { hitsPerPage: 4, clickAnalytics: true },
              },
            ],
          });
        },
        getItemUrl({ item }) {
          return "/products/" + item.handle;
        },
      },
      // ... collections, pages sources
    ];
  },
});
```

**4. InstantSearch with SSR:**

```jsx
// Loader
export async function loader({ request }) {
  const serverState = await getServerState(<AlgoliaSearch />, {
    renderToString,
  });
  return { serverState, serverUrl: request.url };
}

// Component
<InstantSearchSSRProvider {...serverState}>
  <InstantSearch
    searchClient={searchClient}
    indexName={indexName}
    routing={routing}
  >
    <SearchBox />
    <RefinementList attribute="vendor" />
    <RangeInput attribute="price" />
    <Hits hitComponent={Hit} />
    <Pagination />
  </InstantSearch>
</InstantSearchSSRProvider>;
```

**5. Hit Component Pattern:**

```jsx
const Hit = ({ hit, sendEvent }) => (
  <a href={"/products/" + hit.handle}>
    <Image src={hit.image} alt={hit.title} width="180px" />
    <h1>
      <Highlight attribute="title" hit={hit} />
    </h1>
    <p>${hit.price}</p>
  </a>
);
```

**6. Available Facet Attributes (from Shopify integration):**

- `vendor` - Brand/vendor name
- `product_type` - Product type
- `collections` - Collection names
- `price` - Product price
- `tags` - Product tags

### What Needs Rebuilding for V2

| Remix Pattern                           | React Router 7 Replacement             |
| --------------------------------------- | -------------------------------------- |
| `useLoaderData` from `@remix-run/react` | `useLoaderData` from `react-router`    |
| `($locale).search.jsx`                  | `search.tsx` or `($locale).search.tsx` |
| Remix loader signature                  | `Route.LoaderArgs` type                |

### Recommendation: Build with Algolia Packages

**What we install:** `algoliasearch`, `react-instantsearch`, `@algolia/autocomplete-*`
**What we build:** V2-compatible components, SSR handling, route integration

---

## Updated Implementation Strategy

### Phase 1: Klaviyo (Build from Scratch)

No npm package exists. Build:

- `KlaviyoProvider.tsx` - Script loader + context
- `KlaviyoNewsletterForm.tsx` - Newsletter signup (use Client API)
- `useKlaviyoTracking.ts` - Hook for tracking events
- Integration with V2 `Analytics.Provider` events

**Key insight:** Use `window._learnq` array pattern from V1 code, but wrap in V2-compatible hooks.

### Phase 2: Okendo (Install + Wrap)

Official package exists and is current:

```bash
npm install @okendo/shopify-hydrogen
```

Build:

- `OkendoReviewsWrapper.tsx` - Wrapper with fallbacks/error handling
- `OkendoStarRatingWrapper.tsx` - Wrapper with fallbacks
- GraphQL fragments (copy from demo)
- Documentation

### Phase 3: Algolia (Install + Build V2 Components)

Packages are current but integration code is outdated:

```bash
npm install algoliasearch react-instantsearch @algolia/autocomplete-js @algolia/requester-fetch
```

Build:

- `algolia.config.ts` - Typed config
- `AlgoliaProvider.tsx` - InstantSearch wrapper
- `AlgoliaSearchBox.tsx` - Search box component
- `AlgoliaSearchResults.tsx` - Results with Hit component
- `AlgoliaAutocomplete.tsx` - Autocomplete widget
- Route `search.tsx` - Full search page
- SSR handling for React Router 7

### Phase 4: Recharge (Build from Scratch)

Uses Shopify Selling Plans, no special package needed:

- `SubscriptionSelector.tsx` - Plan selector
- GraphQL fragments for selling plans
- Cart integration

---

## Files to Reference During Implementation

### Okendo (Primary Reference - Copy Patterns)

- `research/okendo-demo/app/root.tsx` - Provider setup
- `research/okendo-demo/app/lib/fragments.ts` - GraphQL fragments
- `research/okendo-demo/app/routes/products.$handle.tsx` - Product page integration
- `research/okendo-demo/app/components/ProductItem.tsx` - Star rating on cards

### Klaviyo (Extract Patterns Only)

- `research/klaviyo-example/components/klaviyo/KlaviyoOnsite.client.jsx` - Event tracking shapes
- `research/klaviyo-example/components/klaviyo/KlaviyoIdentify.client.jsx` - Identify pattern

### Algolia (Extract Patterns Only)

- `research/algolia-demo/app/components/Autocomplete.jsx` - Autocomplete widget
- `research/algolia-demo/app/routes/($locale).search.jsx` - Search page structure
- `research/algolia-demo/algolia.config.json` - Config structure

---

## Next Steps

1. **Delete partial Klaviyo files** already created (they were started without this research)
2. **Start fresh with Okendo** (simplest - just install package and add wrappers)
3. **Then Klaviyo** (medium - build from patterns)
4. **Then Algolia** (medium - install packages, build V2 components)
5. **Then Recharge** (complex - full custom build)
