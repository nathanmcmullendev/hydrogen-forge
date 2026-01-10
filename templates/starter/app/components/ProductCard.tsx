import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {useVariantUrl} from '~/lib/variants';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage?: {
      id?: string;
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    } | null;
    priceRange: {
      minVariantPrice: MoneyV2;
      maxVariantPrice: MoneyV2;
    };
    compareAtPriceRange?: {
      minVariantPrice: MoneyV2;
    };
    availableForSale?: boolean;
    vendor?: string;
  };
  loading?: 'eager' | 'lazy';
  showVendor?: boolean;
  aspectRatio?: '1/1' | '4/5' | '3/4' | '16/9';
}

export function ProductCard({
  product,
  loading = 'lazy',
  showVendor = false,
  aspectRatio = '1/1',
}: ProductCardProps) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const isOnSale =
    product.compareAtPriceRange?.minVariantPrice?.amount &&
    parseFloat(product.compareAtPriceRange.minVariantPrice.amount) >
      parseFloat(product.priceRange.minVariantPrice.amount);
  const isSoldOut = product.availableForSale === false;

  return (
    <Link
      className="group block"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary-100">
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio={aspectRatio}
            data={image}
            loading={loading}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-12 w-12 text-secondary-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isOnSale && (
            <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
              Sale
            </span>
          )}
          {isSoldOut && (
            <span className="rounded bg-secondary-900 px-2 py-0.5 text-xs font-medium text-white">
              Sold out
            </span>
          )}
        </div>

        {/* Quick Add Button (optional hover state) */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-white/90 p-2 backdrop-blur-sm">
            <span className="block text-center text-sm font-medium text-secondary-900">
              View Product
            </span>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        {showVendor && product.vendor && (
          <p className="text-xs uppercase tracking-wide text-secondary-500">
            {product.vendor}
          </p>
        )}
        <h3 className="text-sm font-medium text-secondary-900 transition-colors group-hover:text-primary-600">
          {product.title}
        </h3>
        <ProductCardPrice
          price={product.priceRange.minVariantPrice}
          compareAtPrice={product.compareAtPriceRange?.minVariantPrice}
        />
      </div>
    </Link>
  );
}

function ProductCardPrice({
  price,
  compareAtPrice,
}: {
  price: MoneyV2;
  compareAtPrice?: MoneyV2;
}) {
  const isOnSale =
    compareAtPrice?.amount &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm font-medium ${isOnSale ? 'text-red-600' : 'text-secondary-900'}`}
      >
        <Money data={price} />
      </span>
      {isOnSale && compareAtPrice && (
        <span className="text-sm text-secondary-500 line-through">
          <Money data={compareAtPrice} />
        </span>
      )}
    </div>
  );
}
