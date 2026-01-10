/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

/**
 * Declare additional environment variables for Hydrogen Forge integrations
 * These augment the base Env interface from @shopify/oxygen-workers-types
 */
declare global {
  interface Env {
    // Klaviyo Integration
    KLAVIYO_PUBLIC_KEY?: string;
    KLAVIYO_LIST_ID?: string;
  }
}
