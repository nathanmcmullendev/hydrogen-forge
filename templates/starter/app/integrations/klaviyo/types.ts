/**
 * Klaviyo Integration Types
 * For Hydrogen 2025.x / React Router 7
 */

/** Klaviyo profile for customer identification */
export interface KlaviyoProfile {
  $email: string;
  $first_name?: string;
  $last_name?: string;
  $phone_number?: string;
  $city?: string;
  $region?: string;
  $country?: string;
  $zip?: string;
  [key: string]: string | undefined;
}

/** Product data for Viewed Product event */
export interface KlaviyoViewedProduct {
  Name: string;
  ProductID: string;
  Categories?: string[] | null;
  ImageURL?: string;
  URL: string;
  Brand?: string;
  Price?: string;
  CompareAtPrice?: string;
}

/** Item data for trackViewedItem (browse abandonment) */
export interface KlaviyoViewedItem {
  Title: string;
  ItemId: string;
  Categories?: string[] | null;
  ImageUrl?: string;
  Url: string;
  Metadata?: {
    Brand?: string;
    Price?: string;
    CompareAtPrice?: string;
  };
}

/** Cart data for Added to Cart event */
export interface KlaviyoAddedToCart {
  $value: string;
  AddedItemProductName: string;
  AddedItemProductID: string;
  AddedItemVariantID: string;
  AddedItemSKU?: string | null;
  AddedItemImageURL?: string;
  AddedItemURL: string;
  AddedItemPrice: string;
  AddedItemQuantity: number;
  ItemNames: string[];
  CheckoutURL?: string;
  Items: KlaviyoCartItem[];
}

/** Individual cart item */
export interface KlaviyoCartItem {
  ProductID: string;
  VariantID: string;
  ProductName: string;
  Quantity: number;
  ItemPrice: string;
  RowTotal: string;
  ProductURL: string;
  ImageURL?: string;
  SKU?: string | null;
}

/** Newsletter subscription result */
export interface KlaviyoSubscribeResult {
  success: boolean;
  error?: string;
}

/** Provider props */
export interface KlaviyoProviderProps {
  publicKey: string;
  children: React.ReactNode;
}

/** Context value */
export interface KlaviyoContextValue {
  publicKey: string;
  isLoaded: boolean;
  identify: (profile: KlaviyoProfile) => void;
  track: (event: string, properties?: Record<string, unknown>) => void;
}

/** Newsletter form props */
export interface KlaviyoNewsletterFormProps {
  listId: string;
  source?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/** Simplified product type for tracking */
export interface TrackableProduct {
  id: string;
  title: string;
  handle: string;
  vendor?: string;
  featuredImage?: {
    url: string;
  };
  priceRange?: {
    minVariantPrice: {
      amount: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice?: {
      amount: string;
    };
  };
  collections?: {
    nodes?: Array<{title: string}>;
  };
}

/** Simplified variant type for tracking */
export interface TrackableVariant {
  id: string;
  title: string;
  sku?: string | null;
  price: {
    amount: string;
  };
  image?: {
    url: string;
  } | null;
}

/** Cart line for tracking */
export interface TrackableCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    sku?: string | null;
    price: {
      amount: string;
    };
    image?: {
      url: string;
    } | null;
    product: {
      id: string;
      title: string;
      handle: string;
    };
  };
  cost: {
    totalAmount: {
      amount: string;
    };
  };
}

/** Global Klaviyo type */
declare global {
  interface Window {
    _learnq?: Array<unknown[]>;
    klaviyo?: {
      push: (args: unknown[]) => void;
      identify: (profile: Record<string, unknown>) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
      trackViewedItem: (item: Record<string, unknown>) => void;
    };
  }
}
