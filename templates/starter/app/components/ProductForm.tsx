import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div className="space-y-6">
      {/* Product Options */}
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div key={option.name} className="space-y-3">
            <h5 className="text-sm font-medium text-secondary-900">
              {option.name}
            </h5>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const baseClasses =
                  'relative flex min-w-[3rem] items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';

                const stateClasses = selected
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : available
                    ? 'border-secondary-300 bg-white text-secondary-900 hover:border-secondary-400'
                    : 'border-secondary-200 bg-secondary-50 text-secondary-400 cursor-not-allowed';

                if (isDifferentProduct) {
                  return (
                    <Link
                      key={option.name + name}
                      className={`${baseClasses} ${stateClasses}`}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                      {!available && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-px w-full rotate-[-45deg] bg-secondary-400" />
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <button
                    key={option.name + name}
                    type="button"
                    className={`${baseClasses} ${stateClasses}`}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected && exists) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                    {!available && exists && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-px w-full rotate-[-45deg] bg-secondary-400" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add to Cart */}
      <div className="space-y-3 pt-2">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold Out'}
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) {
    return <span>{name}</span>;
  }

  return (
    <span
      aria-label={name}
      className="block h-6 w-6 rounded-full border border-secondary-300 shadow-sm"
      style={{
        backgroundColor: color || 'transparent',
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
