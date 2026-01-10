import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  const containerClasses =
    layout === 'page' ? 'mx-auto max-w-4xl px-4 py-8' : 'flex h-full flex-col';

  return (
    <div className={containerClasses}>
      <CartEmpty hidden={linesCount} layout={layout} />

      {linesCount && (
        <div
          className={
            layout === 'aside' ? 'flex flex-1 flex-col overflow-hidden' : ''
          }
        >
          {/* Cart items list */}
          <div
            className={layout === 'aside' ? 'flex-1 overflow-y-auto' : 'mb-8'}
            aria-labelledby="cart-lines"
          >
            <ul className="divide-y divide-secondary-200">
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </div>

          {/* Cart summary - sticky at bottom for aside layout */}
          {cartHasItems && (
            <div
              className={
                layout === 'aside'
                  ? 'border-t border-secondary-200 bg-white pt-4'
                  : 'rounded-lg border border-secondary-200 bg-secondary-50 p-6'
              }
            >
              <CartSummary cart={cart} layout={layout} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();

  if (hidden) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
      {/* Empty cart icon */}
      <div className="mb-6 rounded-full bg-secondary-100 p-6">
        <svg
          className="h-12 w-12 text-secondary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-secondary-900">
        Your cart is empty
      </h3>
      <p className="mb-6 max-w-sm text-secondary-600">
        Looks like you haven&rsquo;t added anything yet. Let&rsquo;s get you
        started!
      </p>

      <Link
        to="/collections"
        onClick={layout === 'aside' ? close : undefined}
        prefetch="viewport"
        className="inline-flex items-center justify-center rounded-md bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Continue shopping
        <svg
          className="ml-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </Link>
    </div>
  );
}
