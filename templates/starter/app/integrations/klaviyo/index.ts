/**
 * Klaviyo Integration for Hydrogen
 * Email/SMS marketing integration
 *
 * @example
 * ```tsx
 * // In root.tsx
 * import {KlaviyoProvider} from '~/integrations/klaviyo';
 *
 * <KlaviyoProvider publicKey={env.KLAVIYO_PUBLIC_KEY}>
 *   <App />
 * </KlaviyoProvider>
 * ```
 */

// Provider and context
export {KlaviyoProvider, useKlaviyo, useKlaviyoSafe} from './KlaviyoProvider';

// Newsletter form
export {KlaviyoNewsletterForm} from './KlaviyoNewsletterForm';

// Tracking hooks and functions
export {
  useKlaviyoTracking,
  useKlaviyoProductView,
  trackViewedProduct,
  trackAddedToCart,
  trackStartedCheckout,
} from './useKlaviyoTracking';

// Types
export type {
  KlaviyoProfile,
  KlaviyoViewedProduct,
  KlaviyoViewedItem,
  KlaviyoAddedToCart,
  KlaviyoCartItem,
  KlaviyoSubscribeResult,
  KlaviyoProviderProps,
  KlaviyoContextValue,
  KlaviyoNewsletterFormProps,
  TrackableProduct,
  TrackableVariant,
  TrackableCartLine,
} from './types';
