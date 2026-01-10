import {ProductCard, type ProductCardProps} from './ProductCard';

export interface ProductGridProps {
  products: ProductCardProps['product'][];
  columns?: 2 | 3 | 4;
  loading?: 'eager' | 'lazy';
  showVendor?: boolean;
}

export function ProductGrid({
  products,
  columns = 4,
  loading = 'lazy',
  showVendor = false,
}: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-secondary-300 bg-secondary-50">
        <p className="text-secondary-500">No products found</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 sm:gap-6 ${gridCols[columns]}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          loading={index < 4 ? 'eager' : loading}
          showVendor={showVendor}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({columns = 4}: {columns?: 2 | 3 | 4}) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 sm:gap-6 ${gridCols[columns]}`}>
      {Array.from({length: columns * 2}).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-square rounded-lg bg-secondary-200" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-3/4 rounded bg-secondary-200" />
            <div className="h-4 w-1/2 rounded bg-secondary-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
