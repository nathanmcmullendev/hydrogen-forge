import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Hydrogen Forge | Premium Streetwear'}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}, {products}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.storefront.query(FEATURED_PRODUCTS_QUERY),
  ]);

  return {
    featuredCollection: collections.nodes[0],
    featuredProducts: products.nodes,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <HeroSection />
      <FeaturedProducts products={data.featuredProducts} />
      <CategoryShowcase />
      <RecommendedProducts products={data.recommendedProducts} />
      <Newsletter />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <span className="hero-badge">New Collection 2025</span>
        <h1 className="hero-title">Elevate Your Style</h1>
        <p className="hero-subtitle">
          Discover premium streetwear and footwear crafted for those who dare to
          stand out.
        </p>
        <div className="hero-buttons">
          <Link to="/collections/all" className="btn btn-primary">
            Shop Now
          </Link>
          <Link to="/collections/all" className="btn btn-secondary">
            View Collection
          </Link>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-number">500+</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat">
          <span className="stat-number">10k+</span>
          <span className="stat-label">Customers</span>
        </div>
        <div className="stat">
          <span className="stat-number">4.9</span>
          <span className="stat-label">Rating</span>
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts({products}: {products: any[]}) {
  if (!products?.length) return null;

  return (
    <section className="featured-products-section">
      <div className="section-header">
        <h2 className="section-title">Featured Products</h2>
        <p className="section-subtitle">
          Handpicked essentials for your wardrobe
        </p>
      </div>
      <div className="featured-products-grid">
        {products.map((product, index) => (
          <Link
            key={product.id}
            to={`/products/${product.handle}`}
            className={`product-card ${index === 0 ? 'product-card-large' : ''}`}
            prefetch="intent"
          >
            {product.featuredImage && (
              <div className="product-card-image">
                <Image
                  data={product.featuredImage}
                  alt={product.featuredImage.altText || product.title}
                  sizes={
                    index === 0
                      ? '(min-width: 768px) 50vw, 100vw'
                      : '(min-width: 768px) 25vw, 50vw'
                  }
                />
                {index < 3 && <span className="product-badge">Hot</span>}
              </div>
            )}
            <div className="product-card-info">
              <h3 className="product-card-title">{product.title}</h3>
              <p className="product-card-vendor">{product.vendor}</p>
              <div className="product-card-price">
                <Money data={product.priceRange.minVariantPrice} />
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="section-cta">
        <Link to="/collections/all" className="btn btn-outline">
          View All Products
        </Link>
      </div>
    </section>
  );
}

function CategoryShowcase() {
  const categories = [
    {name: 'Shoes', handle: 'all', icon: '👟', count: '5 items'},
    {name: 'Jeans', handle: 'all', icon: '👖', count: '4 items'},
    {name: 'Hoodies', handle: 'all', icon: '🧥', count: '1 item'},
  ];

  return (
    <section className="category-section">
      <div className="section-header">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">
          Find exactly what you&apos;re looking for
        </p>
      </div>
      <div className="category-grid">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={`/collections/${category.handle}`}
            className="category-card"
          >
            <span className="category-icon">{category.icon}</span>
            <h3 className="category-name">{category.name}</h3>
            <span className="category-count">{category.count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="recommended-section">
      <div className="section-header">
        <h2 className="section-title">You Might Also Like</h2>
        <p className="section-subtitle">
          Curated picks based on trending styles
        </p>
      </div>
      <Suspense fallback={<ProductGridSkeleton />}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response?.products.nodes.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.handle}`}
                  className="product-card"
                  prefetch="intent"
                >
                  {product.featuredImage && (
                    <div className="product-card-image">
                      <Image
                        data={product.featuredImage}
                        alt={product.featuredImage.altText || product.title}
                        sizes="(min-width: 768px) 25vw, 50vw"
                      />
                    </div>
                  )}
                  <div className="product-card-info">
                    <h3 className="product-card-title">{product.title}</h3>
                    <div className="product-card-price">
                      <Money data={product.priceRange.minVariantPrice} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="recommended-products-grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="product-card skeleton">
          <div className="product-card-image skeleton-image" />
          <div className="product-card-info">
            <div className="skeleton-text" />
            <div className="skeleton-text short" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Newsletter() {
  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <h2 className="newsletter-title">Stay in the Loop</h2>
        <p className="newsletter-subtitle">
          Subscribe for exclusive drops, style tips, and 10% off your first
          order.
        </p>
        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            className="newsletter-input"
          />
          <button type="submit" className="btn btn-primary">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const FEATURED_PRODUCTS_QUERY = `#graphql
  fragment FeaturedProduct on Product {
    id
    title
    handle
    vendor
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query FeaturedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: TITLE) {
      nodes {
        ...FeaturedProduct
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
