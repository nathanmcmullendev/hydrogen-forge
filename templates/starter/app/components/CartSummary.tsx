import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import {useFetcher} from 'react-router';
import type {FetcherWithComponents} from 'react-router';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  return (
    <div aria-labelledby="cart-summary" className="space-y-4">
      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-secondary-600">Subtotal</span>
        <span className="text-base font-medium text-secondary-900">
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </span>
      </div>

      {/* Discounts & Gift Cards */}
      <CartDiscounts discountCodes={cart?.discountCodes} />
      <CartGiftCard giftCardCodes={cart?.appliedGiftCards} />

      {/* Shipping notice */}
      <p className="text-xs text-secondary-500">
        Shipping and taxes calculated at checkout
      </p>

      {/* Checkout button */}
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} layout={layout} />
    </div>
  );
}

function CartCheckoutActions({
  checkoutUrl,
  layout,
}: {
  checkoutUrl?: string;
  layout: CartLayout;
}) {
  if (!checkoutUrl) return null;

  return (
    <div className="space-y-3">
      <a
        href={checkoutUrl}
        target="_self"
        className="flex w-full items-center justify-center rounded-md bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Continue to Checkout
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
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </a>

      {layout === 'aside' && (
        <a
          href="/cart"
          className="flex w-full items-center justify-center rounded-md border border-secondary-300 bg-white px-6 py-3 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
        >
          View Cart
        </a>
      )}
    </div>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className="space-y-3">
      {/* Display applied discount codes */}
      {codes.length > 0 && (
        <div className="flex items-center justify-between rounded-md bg-green-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="text-sm font-medium text-green-700">
              {codes.join(', ')}
            </span>
          </div>
          <UpdateDiscountForm>
            <button
              type="submit"
              className="text-xs font-medium text-green-600 hover:text-green-800"
            >
              Remove
            </button>
          </UpdateDiscountForm>
        </div>
      )}

      {/* Discount code input */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex gap-2">
          <input
            type="text"
            name="discountCode"
            placeholder="Discount code"
            className="flex-1 rounded-md border border-secondary-300 px-3 py-2 text-sm placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="rounded-md bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  // Clear the gift card code input after the gift card is added
  useEffect(() => {
    if (giftCardAddFetcher.data) {
      giftCardCodeInput.current!.value = '';
    }
  }, [giftCardAddFetcher.data]);

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
  }

  return (
    <div className="space-y-3">
      {/* Display applied gift cards */}
      {giftCardCodes && giftCardCodes.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-secondary-500 uppercase tracking-wide">
            Applied Gift Cards
          </span>
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
              <div className="flex items-center justify-between rounded-md bg-purple-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-purple-700">
                    ***{giftCard.lastCharacters}
                  </span>
                  <span className="text-sm text-purple-600">
                    (<Money data={giftCard.amountUsed} />)
                  </span>
                </div>
                <button
                  type="submit"
                  className="text-xs font-medium text-purple-600 hover:text-purple-800"
                >
                  Remove
                </button>
              </div>
            </RemoveGiftCardForm>
          ))}
        </div>
      )}

      {/* Gift card input */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
        fetcherKey="gift-card-add"
      >
        <div className="flex gap-2">
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
            className="flex-1 rounded-md border border-secondary-300 px-3 py-2 text-sm placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            className="rounded-md bg-secondary-100 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  fetcherKey,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  children,
}: {
  giftCardId: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
    </CartForm>
  );
}
