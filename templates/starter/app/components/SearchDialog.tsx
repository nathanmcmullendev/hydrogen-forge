import {useEffect, useRef, useState, useCallback} from 'react';
import {Link, useFetcher, useNavigate} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '~/lib/search';

type SearchDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * A modal search dialog with predictive search results.
 * Opens with Cmd+K keyboard shortcut.
 */
export function SearchDialog({isOpen, onClose}: SearchDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search-dialog'});
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = fetcher.data?.result ?? getEmptyPredictiveSearchResult();
  const isLoading = fetcher.state === 'loading';
  const hasResults = results.total > 0;
  const showResults = query.length > 0;

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure dialog is mounted
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (value.length > 0) {
        fetcher.submit(
          {q: value, limit: '6', predictive: 'true'},
          {method: 'GET', action: '/search'},
        );
      }
    },
    [fetcher],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.length > 0) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
        onClose();
      }
    },
    [query, navigate, onClose],
  );

  const handleResultClick = useCallback(() => {
    onClose();
    setQuery('');
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative flex min-h-full items-start justify-center px-4 pt-[15vh]">
        <div
          ref={dialogRef}
          className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
        >
          {/* Search input */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center border-b border-secondary-200">
              {/* Search icon */}
              <div className="pointer-events-none pl-4">
                <svg
                  className="h-5 w-5 text-secondary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <input
                ref={inputRef}
                type="search"
                name="q"
                value={query}
                onChange={handleInputChange}
                placeholder="Search products, collections..."
                className="h-14 w-full border-0 bg-transparent px-4 text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-0"
                autoComplete="off"
              />

              {/* Loading indicator */}
              {isLoading && (
                <div className="pr-4">
                  <svg
                    className="h-5 w-5 animate-spin text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              )}

              {/* Keyboard shortcut hint */}
              {!query && (
                <div className="hidden pr-4 sm:block">
                  <kbd className="rounded bg-secondary-100 px-2 py-1 text-xs font-medium text-secondary-500">
                    ESC
                  </kbd>
                </div>
              )}

              {/* Clear button */}
              {query && !isLoading && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="pr-4 text-secondary-400 hover:text-secondary-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Results */}
          {showResults && (
            <div className="max-h-[60vh] overflow-y-auto">
              {hasResults ? (
                <div className="divide-y divide-secondary-100">
                  {/* Products */}
                  {results.items.products.length > 0 && (
                    <SearchResultSection
                      title="Products"
                      icon={
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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      }
                    >
                      {results.items.products.map((product) => (
                        <ProductResult
                          key={product.id}
                          product={product}
                          term={query}
                          onClick={handleResultClick}
                        />
                      ))}
                    </SearchResultSection>
                  )}

                  {/* Collections */}
                  {results.items.collections.length > 0 && (
                    <SearchResultSection
                      title="Collections"
                      icon={
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
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      }
                    >
                      {results.items.collections.map((collection) => (
                        <CollectionResult
                          key={collection.id}
                          collection={collection}
                          term={query}
                          onClick={handleResultClick}
                        />
                      ))}
                    </SearchResultSection>
                  )}

                  {/* Pages */}
                  {results.items.pages.length > 0 && (
                    <SearchResultSection
                      title="Pages"
                      icon={
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      }
                    >
                      {results.items.pages.map((page) => (
                        <PageResult
                          key={page.id}
                          page={page}
                          term={query}
                          onClick={handleResultClick}
                        />
                      ))}
                    </SearchResultSection>
                  )}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-secondary-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="mt-4 text-sm text-secondary-500">
                    No results found for "{query}"
                  </p>
                  <p className="mt-1 text-xs text-secondary-400">
                    Try searching for something else
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer with keyboard hints */}
          {showResults && hasResults && (
            <div className="border-t border-secondary-200 bg-secondary-50 px-4 py-3">
              <div className="flex items-center justify-between text-xs text-secondary-500">
                <span>{results.total} results</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-white px-1.5 py-0.5 font-medium shadow-sm ring-1 ring-secondary-200">
                      Enter
                    </kbd>
                    to search
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-white px-1.5 py-0.5 font-medium shadow-sm ring-1 ring-secondary-200">
                      Esc
                    </kbd>
                    to close
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="py-3">
      <div className="mb-2 flex items-center gap-2 px-4 text-xs font-semibold uppercase tracking-wide text-secondary-500">
        {icon}
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

type ProductResultProps = {
  product: PredictiveSearchReturn['result']['items']['products'][0];
  term: string;
  onClick: () => void;
};

function ProductResult({product, term, onClick}: ProductResultProps) {
  const url = urlWithTrackingParams({
    baseUrl: `/products/${product.handle}`,
    trackingParams: product.trackingParameters,
    term,
  });
  const price = product?.selectedOrFirstAvailableVariant?.price;
  const image = product?.selectedOrFirstAvailableVariant?.image;

  return (
    <Link
      to={url}
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-2 transition-colors hover:bg-secondary-50"
    >
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-secondary-100">
        {image ? (
          <Image
            alt={image.altText ?? product.title}
            src={image.url}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-6 w-6 text-secondary-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-secondary-900">
          {product.title}
        </p>
        {price && (
          <p className="text-sm text-secondary-500">
            <Money data={price} />
          </p>
        )}
      </div>
      <svg
        className="h-4 w-4 flex-shrink-0 text-secondary-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

type CollectionResultProps = {
  collection: PredictiveSearchReturn['result']['items']['collections'][0];
  term: string;
  onClick: () => void;
};

function CollectionResult({collection, term, onClick}: CollectionResultProps) {
  const url = urlWithTrackingParams({
    baseUrl: `/collections/${collection.handle}`,
    trackingParams: collection.trackingParameters,
    term,
  });

  return (
    <Link
      to={url}
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-2 transition-colors hover:bg-secondary-50"
    >
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-secondary-100">
        {collection.image?.url ? (
          <Image
            alt={collection.image.altText ?? collection.title}
            src={collection.image.url}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-6 w-6 text-secondary-300"
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
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-secondary-900">
          {collection.title}
        </p>
        <p className="text-sm text-secondary-500">Collection</p>
      </div>
      <svg
        className="h-4 w-4 flex-shrink-0 text-secondary-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

type PageResultProps = {
  page: PredictiveSearchReturn['result']['items']['pages'][0];
  term: string;
  onClick: () => void;
};

function PageResult({page, term, onClick}: PageResultProps) {
  const url = urlWithTrackingParams({
    baseUrl: `/pages/${page.handle}`,
    trackingParams: page.trackingParameters,
    term,
  });

  return (
    <Link
      to={url}
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-2 transition-colors hover:bg-secondary-50"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-secondary-100">
        <svg
          className="h-6 w-6 text-secondary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-secondary-900">
          {page.title}
        </p>
        <p className="text-sm text-secondary-500">Page</p>
      </div>
      <svg
        className="h-4 w-4 flex-shrink-0 text-secondary-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

/**
 * Hook to manage search dialog state with Cmd+K shortcut
 */
export function useSearchDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
