# Klaviyo Integration

Email/SMS marketing integration for Hydrogen stores.

## Overview

This integration provides:

- Newsletter signup forms
- Customer identification
- Product view tracking (for browse abandonment)
- Add to cart tracking
- Checkout started tracking

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# Required: Your Klaviyo public API key (6-character company ID)
KLAVIYO_PUBLIC_KEY=ABC123

# Optional: Default newsletter list ID
KLAVIYO_LIST_ID=XyZ789
```

You can find these values in your Klaviyo dashboard:

- **Public Key**: Settings → API Keys → Public API Key
- **List ID**: Audience → Lists & Segments → Click on list → ID in URL

### 2. Provider Setup (Already Configured)

The `KlaviyoProvider` is already wired into `root.tsx`:

```tsx
// root.tsx
import { KlaviyoProvider } from "~/integrations/klaviyo";

export default function App() {
  const data = useRouteLoaderData<RootLoader>("root");

  return (
    <KlaviyoProvider publicKey={data.klaviyoPublicKey || ""}>
      {/* ... */}
    </KlaviyoProvider>
  );
}
```

## Components

### KlaviyoNewsletterForm

Newsletter signup form that uses Klaviyo's Client API.

```tsx
import { KlaviyoNewsletterForm } from "~/integrations/klaviyo";

<KlaviyoNewsletterForm
  listId="YOUR_LIST_ID"
  placeholder="Enter your email"
  buttonText="Subscribe"
  successMessage="Thanks for subscribing!"
  onSuccess={() => console.log("Subscribed!")}
  onError={(error) => console.error(error)}
/>;
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `listId` | `string` | Yes | Klaviyo list ID to subscribe to |
| `source` | `string` | No | Custom source for tracking (default: "Hydrogen Store") |
| `placeholder` | `string` | No | Input placeholder text |
| `buttonText` | `string` | No | Submit button text |
| `successMessage` | `string` | No | Message shown after success |
| `className` | `string` | No | Additional CSS classes |
| `onSuccess` | `() => void` | No | Callback on successful subscription |
| `onError` | `(error: string) => void` | No | Callback on error |

### CSS Classes

Style the form with these classes:

- `.klaviyo-newsletter-form` - Form container
- `.klaviyo-newsletter-input-group` - Input + button wrapper
- `.klaviyo-newsletter-input` - Email input
- `.klaviyo-newsletter-button` - Submit button
- `.klaviyo-newsletter-success` - Success message
- `.klaviyo-newsletter-error` - Error message
- `.klaviyo-newsletter-disabled` - Shown when Klaviyo not configured

## Tracking

### Product View Tracking

Automatically tracks product views using the `useKlaviyoProductView` hook:

```tsx
// Already added to products.$handle.tsx
import {useKlaviyoProductView} from '~/integrations/klaviyo';

function ProductPage() {
  const {product} = useLoaderData();
  const selectedVariant = useOptimisticVariant(...);

  // Tracks "Viewed Product" and "Viewed Item" events
  useKlaviyoProductView(product, selectedVariant);

  return <div>...</div>;
}
```

### Add to Cart Tracking

Track when items are added to cart:

```tsx
import { useKlaviyoTracking } from "~/integrations/klaviyo";

function AddToCartButton({ product, variant }) {
  const { trackAddToCart } = useKlaviyoTracking();

  const handleAddToCart = () => {
    // Your add to cart logic...

    // Track the event
    trackAddToCart(product, variant, 1);
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

### Checkout Started Tracking

Track when checkout begins:

```tsx
import { trackStartedCheckout } from "~/integrations/klaviyo";

function CheckoutButton({ cartLines, checkoutUrl }) {
  const handleCheckout = () => {
    trackStartedCheckout(cartLines, checkoutUrl);
    window.location.href = checkoutUrl;
  };

  return <button onClick={handleCheckout}>Checkout</button>;
}
```

### Customer Identification

Identify logged-in customers:

```tsx
import { useKlaviyo } from "~/integrations/klaviyo";

function AccountPage({ customer }) {
  const { identify } = useKlaviyo();

  useEffect(() => {
    if (customer?.email) {
      identify({
        $email: customer.email,
        $first_name: customer.firstName,
        $last_name: customer.lastName,
      });
    }
  }, [customer]);
}
```

## Events Sent to Klaviyo

### Viewed Product

```json
{
  "Name": "Product Title",
  "ProductID": "12345",
  "Categories": ["Collection 1", "Collection 2"],
  "ImageURL": "https://...",
  "URL": "https://store.com/products/handle",
  "Brand": "Vendor Name",
  "Price": "29.99",
  "CompareAtPrice": "39.99"
}
```

### Viewed Item (for browse abandonment)

```json
{
  "Title": "Product Title",
  "ItemId": "12345",
  "Categories": ["Collection 1"],
  "ImageUrl": "https://...",
  "Url": "https://store.com/products/handle",
  "Metadata": {
    "Brand": "Vendor Name",
    "Price": "29.99",
    "CompareAtPrice": "39.99"
  }
}
```

### Added to Cart

```json
{
  "$value": "59.98",
  "AddedItemProductName": "Product Title",
  "AddedItemProductID": "12345",
  "AddedItemVariantID": "67890",
  "AddedItemPrice": "29.99",
  "AddedItemQuantity": 2,
  "ItemNames": ["Product Title"],
  "Items": [...]
}
```

## Troubleshooting

### Newsletter form not submitting

1. Check that `KLAVIYO_PUBLIC_KEY` is set in `.env`
2. Check that the list ID is correct
3. Check browser console for errors

### Events not appearing in Klaviyo

1. Verify the public key is correct
2. Check browser Network tab for requests to `klaviyo.com`
3. Events may take a few minutes to appear in Klaviyo dashboard

### Script not loading

1. Check for ad blockers
2. Verify no CSP (Content Security Policy) blocking `static.klaviyo.com`

## API Reference

See [Klaviyo Developer Docs](https://developers.klaviyo.com/en/docs/integrate-with-a-shopify-hydrogen-store) for more details on the Klaviyo API.
