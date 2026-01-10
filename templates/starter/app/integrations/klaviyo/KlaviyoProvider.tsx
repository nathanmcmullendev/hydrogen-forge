/**
 * KlaviyoProvider
 * Loads Klaviyo onsite.js and provides tracking context
 * For Hydrogen 2025.x / React Router 7
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type {
  KlaviyoContextValue,
  KlaviyoProfile,
  KlaviyoProviderProps,
} from './types';

const KlaviyoContext = createContext<KlaviyoContextValue | null>(null);

/**
 * KlaviyoProvider - Wrap your app to enable Klaviyo tracking
 *
 * @example
 * ```tsx
 * // In root.tsx
 * <KlaviyoProvider publicKey={env.KLAVIYO_PUBLIC_KEY}>
 *   <App />
 * </KlaviyoProvider>
 * ```
 */
export function KlaviyoProvider({publicKey, children}: KlaviyoProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Klaviyo script on mount
  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') return;

    // Check if publicKey is provided
    if (!publicKey) {
      console.warn('[Klaviyo] No public key provided - skipping script load');
      return;
    }

    console.log('[Klaviyo] Initializing with public key:', publicKey);

    // Initialize _learnq array for queueing before script loads
    window._learnq = window._learnq || [];

    // Check if already loaded
    const existingScript = document.querySelector(
      'script[src*="static.klaviyo.com"]',
    );
    if (existingScript) {
      console.log('[Klaviyo] Script already loaded');
      setIsLoaded(true);
      return;
    }

    // Create and load script - use https explicitly
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${publicKey}`;

    script.onload = () => {
      console.log('[Klaviyo] Script loaded successfully');
      setIsLoaded(true);
    };

    script.onerror = (error) => {
      console.error('[Klaviyo] Failed to load script:', error);
    };

    document.head.appendChild(script);
    console.log('[Klaviyo] Script tag added to head');
  }, [publicKey]);

  /**
   * Identify a customer profile
   */
  const identify = useCallback((profile: KlaviyoProfile) => {
    if (typeof window === 'undefined') return;

    const _learnq = window._learnq || [];
    _learnq.push(['identify', profile]);
  }, []);

  /**
   * Track a custom event
   */
  const track = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      if (typeof window === 'undefined') return;

      const _learnq = window._learnq || [];
      _learnq.push(['track', event, properties]);
    },
    [],
  );

  const value: KlaviyoContextValue = {
    publicKey,
    isLoaded,
    identify,
    track,
  };

  return (
    <KlaviyoContext.Provider value={value}>{children}</KlaviyoContext.Provider>
  );
}

/**
 * Hook to access Klaviyo context
 * @throws Error if used outside KlaviyoProvider
 */
export function useKlaviyo(): KlaviyoContextValue {
  const context = useContext(KlaviyoContext);
  if (!context) {
    throw new Error('useKlaviyo must be used within a KlaviyoProvider');
  }
  return context;
}

/**
 * Hook to access Klaviyo context safely (returns null if not in provider)
 */
export function useKlaviyoSafe(): KlaviyoContextValue | null {
  return useContext(KlaviyoContext);
}
