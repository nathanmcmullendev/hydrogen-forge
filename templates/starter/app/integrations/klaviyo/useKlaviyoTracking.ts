/**
 * useKlaviyoTracking
 * Hook for tracking product views and cart events
 * For Hydrogen 2025.x / React Router 7
 */

import {useCallback, useEffect, useRef} from 'react';
import type {
  TrackableProduct,
  TrackableVariant,
  TrackableCartLine,
  KlaviyoViewedProduct,
  KlaviyoViewedItem,
  KlaviyoAddedToCart,
  KlaviyoCartItem,
} from './types';

/**
 * Extract numeric ID from Shopify GID
 * gid://shopify/Product/12345 → "12345"
 */
function extractId(gid: string): string {
  return gid.substring(gid.lastIndexOf('/') + 1);
}

/**
 * Get current page URL
 */
function getCurrentUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

/**
 * Push event to Klaviyo queue
 */
function pushToKlaviyo(args: unknown[]): void {
  if (typeof window === 'undefined') return;
  window._learnq = window._learnq || [];
  window._learnq.push(args);
}

/**
 * Track Viewed Product event
 */
export function trackViewedProduct(
  product: TrackableProduct,
  variant?: TrackableVariant,
): void {
  const productData: KlaviyoViewedProduct = {
    Name: product.title,
    ProductID: extractId(product.id),
    Categories: product.collections?.nodes?.map((c) => c.title) ?? null,
    ImageURL: variant?.image?.url || product.featuredImage?.url,
    URL: getCurrentUrl(),
    Brand: product.vendor,
    Price:
      variant?.price?.amount || product.priceRange?.minVariantPrice?.amount,
    CompareAtPrice: product.compareAtPriceRange?.minVariantPrice?.amount,
  };

  pushToKlaviyo(['track', 'Viewed Product', productData]);

  // Also track as ViewedItem for browse abandonment
  const itemData: KlaviyoViewedItem = {
    Title: product.title,
    ItemId: extractId(product.id),
    Categories: product.collections?.nodes?.map((c) => c.title) ?? null,
    ImageUrl: variant?.image?.url || product.featuredImage?.url,
    Url: getCurrentUrl(),
    Metadata: {
      Brand: product.vendor,
      Price:
        variant?.price?.amount || product.priceRange?.minVariantPrice?.amount,
      CompareAtPrice: product.compareAtPriceRange?.minVariantPrice?.amount,
    },
  };

  pushToKlaviyo(['trackViewedItem', itemData]);
}

/**
 * Track Added to Cart event
 */
export function trackAddedToCart(
  product: TrackableProduct,
  variant: TrackableVariant,
  quantity: number = 1,
  cartLines?: TrackableCartLine[],
  checkoutUrl?: string,
): void {
  // Build items array from cart lines or just the added item
  const items: KlaviyoCartItem[] = cartLines
    ? cartLines.map((line) => ({
        ProductID: extractId(line.merchandise.product.id),
        VariantID: extractId(line.merchandise.id),
        ProductName: line.merchandise.product.title,
        Quantity: line.quantity,
        ItemPrice: line.merchandise.price.amount,
        RowTotal: line.cost.totalAmount.amount,
        ProductURL: `/products/${line.merchandise.product.handle}`,
        ImageURL: line.merchandise.image?.url,
        SKU: line.merchandise.sku,
      }))
    : [
        {
          ProductID: extractId(product.id),
          VariantID: extractId(variant.id),
          ProductName: product.title,
          Quantity: quantity,
          ItemPrice: variant.price.amount,
          RowTotal: (parseFloat(variant.price.amount) * quantity).toFixed(2),
          ProductURL: `/products/${product.handle}`,
          ImageURL: variant.image?.url || product.featuredImage?.url,
          SKU: variant.sku,
        },
      ];

  // Calculate total value
  const totalValue = items.reduce(
    (sum, item) => sum + parseFloat(item.RowTotal),
    0,
  );

  const cartData: KlaviyoAddedToCart = {
    $value: totalValue.toFixed(2),
    AddedItemProductName: product.title,
    AddedItemProductID: extractId(product.id),
    AddedItemVariantID: extractId(variant.id),
    AddedItemSKU: variant.sku,
    AddedItemImageURL: variant.image?.url || product.featuredImage?.url,
    AddedItemURL: `/products/${product.handle}`,
    AddedItemPrice: variant.price.amount,
    AddedItemQuantity: quantity,
    ItemNames: items.map((item) => item.ProductName),
    CheckoutURL: checkoutUrl,
    Items: items,
  };

  pushToKlaviyo(['track', 'Added to Cart', cartData]);
}

/**
 * Track Started Checkout event
 */
export function trackStartedCheckout(
  cartLines: TrackableCartLine[],
  checkoutUrl: string,
): void {
  const items: KlaviyoCartItem[] = cartLines.map((line) => ({
    ProductID: extractId(line.merchandise.product.id),
    VariantID: extractId(line.merchandise.id),
    ProductName: line.merchandise.product.title,
    Quantity: line.quantity,
    ItemPrice: line.merchandise.price.amount,
    RowTotal: line.cost.totalAmount.amount,
    ProductURL: `/products/${line.merchandise.product.handle}`,
    ImageURL: line.merchandise.image?.url,
    SKU: line.merchandise.sku,
  }));

  const totalValue = items.reduce(
    (sum, item) => sum + parseFloat(item.RowTotal),
    0,
  );

  pushToKlaviyo([
    'track',
    'Started Checkout',
    {
      $value: totalValue.toFixed(2),
      ItemNames: items.map((item) => item.ProductName),
      CheckoutURL: checkoutUrl,
      Items: items,
    },
  ]);
}

/**
 * Hook to track product view on mount
 * Use this in product page component
 *
 * @example
 * ```tsx
 * function ProductPage() {
 *   const {product} = useLoaderData();
 *   useKlaviyoProductView(product, selectedVariant);
 *   return <div>...</div>;
 * }
 * ```
 */
export function useKlaviyoProductView(
  product: TrackableProduct | null | undefined,
  variant?: TrackableVariant | null,
): void {
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product) return;

    // Track unique product/variant combo
    const trackKey = `${product.id}-${variant?.id || 'default'}`;
    if (trackedRef.current === trackKey) return;

    trackedRef.current = trackKey;
    trackViewedProduct(product, variant ?? undefined);
  }, [product, variant]);
}

/**
 * Hook that returns tracking functions
 *
 * @example
 * ```tsx
 * function AddToCartButton() {
 *   const {trackAddToCart} = useKlaviyoTracking();
 *
 *   const handleAddToCart = () => {
 *     // Add to cart logic...
 *     trackAddToCart(product, variant, 1);
 *   };
 * }
 * ```
 */
export function useKlaviyoTracking() {
  const trackProductView = useCallback(
    (product: TrackableProduct, variant?: TrackableVariant) => {
      trackViewedProduct(product, variant);
    },
    [],
  );

  const trackAddToCart = useCallback(
    (
      product: TrackableProduct,
      variant: TrackableVariant,
      quantity?: number,
      cartLines?: TrackableCartLine[],
      checkoutUrl?: string,
    ) => {
      trackAddedToCart(product, variant, quantity, cartLines, checkoutUrl);
    },
    [],
  );

  const trackCheckout = useCallback(
    (cartLines: TrackableCartLine[], checkoutUrl: string) => {
      trackStartedCheckout(cartLines, checkoutUrl);
    },
    [],
  );

  return {
    trackProductView,
    trackAddToCart,
    trackCheckout,
  };
}
