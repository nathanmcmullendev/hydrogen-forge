# Extension Guide

Learn how to extend Hydrogen Forge with custom components, routes, and integrations.

## Adding Components

### Using the CLI

The fastest way to add components:

```bash
# Basic component
hydrogen-forge add component MyComponent

# Product component (with Image, Money imports)
hydrogen-forge add component FeaturedProduct

# Collection component (with overlay styling)
hydrogen-forge add component CollectionBanner

# Cart component (with CartForm)
hydrogen-forge add component CartItem

# Form component (with useNavigation)
hydrogen-forge add component ContactForm

# Layout component (with header/footer slots)
hydrogen-forge add component PageWrapper
```

### Manual Creation

Create a component file in `app/components/`:

```tsx
// app/components/MyComponent.tsx

export interface MyComponentProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function MyComponent({
  title,
  description,
  children,
}: MyComponentProps) {
  return (
    <div className="p-6 rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold text-secondary-900">{title}</h2>
      {description && <p className="mt-2 text-secondary-600">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
```

### Component Patterns

#### With Shopify Data

```tsx
import { Image, Money } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";

interface ProductCardProps {
  product: {
    title: string;
    handle: string;
    featuredImage?: { url: string; altText?: string | null } | null;
    priceRange: { minVariantPrice: MoneyV2 };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/products/${product.handle}`} className="group block">
      {product.featuredImage && (
        <Image
          data={product.featuredImage}
          className="aspect-square object-cover"
        />
      )}
      <h3>{product.title}</h3>
      <Money data={product.priceRange.minVariantPrice} />
    </Link>
  );
}
```

#### With Cart Actions

```tsx
import { CartForm } from "@shopify/hydrogen";

export function AddToCart({ variantId }: { variantId: string }) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{ lines: [{ merchandiseId: variantId, quantity: 1 }] }}
    >
      <button
        type="submit"
        className="w-full bg-primary-600 text-white py-3 rounded-lg"
      >
        Add to Cart
      </button>
    </CartForm>
  );
}
```

#### With Form State

```tsx
import { Form, useNavigation } from "react-router";

export function NewsletterForm() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post" action="/newsletter" className="flex gap-2">
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        className="flex-1 px-4 py-2 border rounded-lg"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </button>
    </Form>
  );
}
```

## Adding Routes

### Using the CLI

```bash
# Standard page
hydrogen-forge add route about

# Dynamic route
hydrogen-forge add route products.$handle

# Collection route
hydrogen-forge add route collections.$handle

# API route
hydrogen-forge add route api.webhook

# Account route
hydrogen-forge add route account.orders
```

### Manual Creation

Create a route file in `app/routes/`:

```tsx
// app/routes/about.tsx

import type { Route } from "./+types/about";

export const meta: Route.MetaFunction = () => {
  return [{ title: "About Us" }];
};

export async function loader({ context }: Route.LoaderArgs) {
  // Fetch data if needed
  return {};
}

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">About Us</h1>
      <p className="mt-4 text-secondary-600">Your about page content here.</p>
    </div>
  );
}
```

### Route Patterns

#### With GraphQL Data

```tsx
import { useLoaderData } from "react-router";
import type { Route } from "./+types/products.$handle";

export async function loader({ context, params }: Route.LoaderArgs) {
  const { storefront } = context;
  const { handle } = params;

  const { product } = await storefront.query(PRODUCT_QUERY, {
    variables: { handle },
  });

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  return { product };
}

export default function Product() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{product.title}</h1>
    </div>
  );
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
    }
  }
` as const;
```

#### With Form Actions

```tsx
import { Form, useLoaderData, useActionData } from "react-router";
import type { Route } from "./+types/contact";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const message = formData.get("message");

  // Process form submission
  // await sendEmail({email, message});

  return { success: true };
}

export default function Contact() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Contact Us</h1>

      {actionData?.success && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
          Message sent successfully!
        </div>
      )}

      <Form method="post" className="mt-6 space-y-4">
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={4} required />
        </div>
        <button type="submit">Send Message</button>
      </Form>
    </div>
  );
}
```

#### API Route

```tsx
// app/routes/api.webhook.tsx

import type { Route } from "./+types/api.webhook";

export async function action({ request, context }: Route.ActionArgs) {
  // Verify webhook signature
  const signature = request.headers.get("x-shopify-hmac-sha256");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 401 });
  }

  const body = await request.json();

  // Process webhook
  console.log("Webhook received:", body);

  return Response.json({ received: true });
}
```

## Customizing Styles

### Tailwind Configuration

Extend the Tailwind config in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          // ... more shades
          600: "#0284c7",
          700: "#0369a1",
        },
        secondary: {
          // ... your secondary colors
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
    },
  },
};
```

### Custom CSS

Add custom styles in `app/styles/app.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-primary-600 text-white font-medium rounded-lg
           hover:bg-primary-700 focus:outline-none focus:ring-2
           focus:ring-primary-500 focus:ring-offset-2
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm border border-secondary-200
           overflow-hidden;
  }

  .input {
    @apply w-full px-4 py-2 border border-secondary-300 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-primary-500
           focus:border-primary-500;
  }
}
```

## Adding Integrations

### Third-Party Services

```tsx
// app/lib/analytics.ts

export function trackPageView(path: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "GA_MEASUREMENT_ID", {
      page_path: path,
    });
  }
}

export function trackEvent(action: string, category: string, label?: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
    });
  }
}
```

### Custom Hooks

```tsx
// app/lib/hooks/useLocalStorage.ts

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

## Using MCP Tools

### With Claude Code

After running `hydrogen-forge setup-mcp`, you can use natural language:

```
"Create a ProductCard component with image, title, and price"
→ Uses scaffoldComponent tool

"Add a route for /pages/:handle"
→ Uses scaffoldRoute tool

"Create a new product called 'Summer T-Shirt' with price $29.99"
→ Uses createProduct tool

"Update inventory for SKU-123 to 50 units"
→ Uses updateInventory tool
```

### Programmatic Usage

```tsx
// Using the Shopify MCP directly
import { createProduct } from "@hydrogen-forge/mcp-shopify";

await createProduct({
  title: "New Product",
  descriptionHtml: "<p>Product description</p>",
  vendor: "My Brand",
  productType: "Apparel",
  status: "DRAFT",
});
```

## Best Practices

### Component Guidelines

1. **Single Responsibility** - One component, one purpose
2. **Props Interface** - Always define TypeScript interfaces
3. **Default Props** - Provide sensible defaults
4. **Accessibility** - Include ARIA attributes
5. **Responsive** - Mobile-first approach

### Route Guidelines

1. **Loader Pattern** - Fetch data in loaders, not components
2. **Error Handling** - Throw Response for errors
3. **Meta Function** - Always include SEO metadata
4. **Type Safety** - Use Route types from +types/

### Style Guidelines

1. **Tailwind First** - Use utility classes
2. **Component Classes** - Extract repeated patterns
3. **Design Tokens** - Use theme colors consistently
4. **Responsive** - Use breakpoint prefixes (sm:, md:, lg:)
