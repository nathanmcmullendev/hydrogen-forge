import {useState} from 'react';
import {Image} from '@shopify/hydrogen';

export interface ProductGalleryProps {
  images: Array<{
    id?: string;
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  }>;
  selectedVariantImage?: {
    id?: string;
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
}

export function ProductGallery({
  images,
  selectedVariantImage,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // If there's a selected variant image, find its index or use it as the main image
  const allImages = selectedVariantImage
    ? [
        selectedVariantImage,
        ...images.filter((img) => img.id !== selectedVariantImage.id),
      ]
    : images;

  const mainImage = allImages[selectedIndex] || allImages[0];
  const hasThumbnails = allImages.length > 1;

  if (!allImages.length) {
    return (
      <div className="aspect-square w-full rounded-lg bg-secondary-100">
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary-100">
        {mainImage && (
          <Image
            alt={mainImage.altText || 'Product image'}
            aspectRatio="1/1"
            data={mainImage}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-full w-full object-cover object-center"
          />
        )}

        {/* Navigation Arrows */}
        {hasThumbnails && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all hover:bg-white disabled:opacity-50"
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === 0 ? allImages.length - 1 : prev - 1,
                )
              }
              aria-label="Previous image"
            >
              <svg
                className="h-5 w-5 text-secondary-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all hover:bg-white disabled:opacity-50"
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === allImages.length - 1 ? 0 : prev + 1,
                )
              }
              aria-label="Next image"
            >
              <svg
                className="h-5 w-5 text-secondary-900"
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
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasThumbnails && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasThumbnails && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={image.id || index}
              type="button"
              className={`relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-md transition-all ${
                index === selectedIndex
                  ? 'ring-2 ring-primary-600 ring-offset-2'
                  : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                alt={image.altText || `Product thumbnail ${index + 1}`}
                aspectRatio="1/1"
                data={image}
                sizes="64px"
                className="h-full w-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
