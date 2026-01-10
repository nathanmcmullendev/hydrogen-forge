import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';

type CollectionGridProps = {
  collections: Pick<
    Collection,
    'id' | 'title' | 'handle' | 'description' | 'image'
  >[];
  columns?: 2 | 3 | 4;
};

/**
 * A responsive grid of collection cards with images and titles.
 */
export function CollectionGrid({
  collections,
  columns = 3,
}: CollectionGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns]}`}>
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

type CollectionCardProps = {
  collection: Pick<
    Collection,
    'id' | 'title' | 'handle' | 'description' | 'image'
  >;
};

/**
 * A single collection card with image, title, and optional description.
 */
export function CollectionCard({collection}: CollectionCardProps) {
  return (
    <Link
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary-100">
        {collection.image ? (
          <Image
            data={collection.image}
            aspectRatio="1/1"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-16 w-16 text-secondary-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-lg font-semibold text-white drop-shadow-md">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="mt-1 line-clamp-2 text-sm text-white/80">
              {collection.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Skeleton loader for collection grid.
 */
export function CollectionGridSkeleton({count = 6}: {count?: number}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({length: count}).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-xl bg-secondary-200" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state for when there are no collections.
 */
export function CollectionGridEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-secondary-100 p-4">
        <svg
          className="h-8 w-8 text-secondary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-secondary-900">
        No collections found
      </h3>
      <p className="mt-1 text-sm text-secondary-500">
        Check back later for new collections.
      </p>
    </div>
  );
}
