import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <li
      key={id}
      className={`flex gap-4 py-4 ${line.isOptimistic ? 'opacity-60' : ''}`}
    >
      {/* Product image */}
      {image && (
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => layout === 'aside' && close()}
          className="flex-shrink-0"
        >
          <div className="h-24 w-24 overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50">
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={96}
              loading="lazy"
              width={96}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </Link>
      )}

      {/* Product details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <Link
              prefetch="intent"
              to={lineItemUrl}
              onClick={() => layout === 'aside' && close()}
              className="text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors"
            >
              {product.title}
            </Link>

            {/* Selected options */}
            {selectedOptions.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-secondary-500">
                {selectedOptions.map((option) => (
                  <span key={option.name}>
                    {option.name}: {option.value}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="ml-4 flex-shrink-0">
            <ProductPrice price={line?.cost?.totalAmount} size="sm" />
          </div>
        </div>

        {/* Quantity controls */}
        <div className="mt-auto pt-2">
          <CartLineQuantity line={line} />
        </div>
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center justify-between">
      {/* Quantity controls */}
      <div className="flex items-center rounded-lg border border-secondary-200">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="flex h-8 w-8 items-center justify-center text-secondary-600 transition-colors hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
        </CartLineUpdateButton>

        <span className="w-10 text-center text-sm font-medium text-secondary-900">
          {quantity}
        </span>

        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="flex h-8 w-8 items-center justify-center text-secondary-600 transition-colors hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </CartLineUpdateButton>
      </div>

      {/* Remove button */}
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className="text-xs font-medium text-secondary-500 underline-offset-2 transition-colors hover:text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
