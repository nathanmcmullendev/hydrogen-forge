type ComponentType = 'basic' | 'product' | 'collection' | 'cart' | 'form' | 'layout';
type RouteType = 'page' | 'resource' | 'collection' | 'product' | 'account' | 'api';

export function generateComponent(
  name: string,
  type: ComponentType,
  withStyles: boolean,
): string {
  switch (type) {
    case 'product':
      return generateProductComponent(name, withStyles);
    case 'collection':
      return generateCollectionComponent(name, withStyles);
    case 'cart':
      return generateCartComponent(name, withStyles);
    case 'form':
      return generateFormComponent(name, withStyles);
    case 'layout':
      return generateLayoutComponent(name, withStyles);
    default:
      return generateBasicComponent(name, withStyles);
  }
}

export function generateRoute(name: string, type: RouteType): string {
  switch (type) {
    case 'collection':
      return generateCollectionRoute(name);
    case 'product':
      return generateProductRoute(name);
    case 'account':
      return generateAccountRoute(name);
    case 'api':
      return generateApiRoute(name);
    case 'resource':
      return generateResourceRoute(name);
    default:
      return generatePageRoute(name);
  }
}

// Component generators
function generateBasicComponent(name: string, withStyles: boolean): string {
  return `export interface ${name}Props {
  // Add props here
}

export function ${name}({}: ${name}Props) {
  return (
    <div${withStyles ? ' className="p-4"' : ''}>
      <h2>${name} Component</h2>
    </div>
  );
}
`;
}

function generateProductComponent(name: string, withStyles: boolean): string {
  return `import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export interface ${name}Props {
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage?: {
      url: string;
      altText?: string | null;
    } | null;
    priceRange: {
      minVariantPrice: MoneyV2;
    };
  };
}

export function ${name}({product}: ${name}Props) {
  const image = product.featuredImage;

  return (
    <Link
      to={\`/products/\${product.handle}\`}
      ${withStyles ? 'className="group block"' : ''}
      prefetch="intent"
    >
      <div${withStyles ? ' className="relative aspect-square overflow-hidden rounded-lg bg-secondary-100"' : ''}>
        {image ? (
          <Image
            alt={image.altText || product.title}
            src={image.url}
            ${withStyles ? 'className="h-full w-full object-cover transition-transform group-hover:scale-105"' : ''}
          />
        ) : (
          <div${withStyles ? ' className="flex h-full w-full items-center justify-center"' : ''}>
            <span${withStyles ? ' className="text-secondary-400"' : ''}>No image</span>
          </div>
        )}
      </div>
      <div${withStyles ? ' className="mt-3 space-y-1"' : ''}>
        <h3${withStyles ? ' className="text-sm font-medium text-secondary-900"' : ''}>{product.title}</h3>
        <Money
          data={product.priceRange.minVariantPrice}
          ${withStyles ? 'className="text-sm text-secondary-500"' : ''}
        />
      </div>
    </Link>
  );
}
`;
}

function generateCollectionComponent(name: string, withStyles: boolean): string {
  return `import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

export interface ${name}Props {
  collection: {
    id: string;
    title: string;
    handle: string;
    image?: {
      url: string;
      altText?: string | null;
    } | null;
  };
}

export function ${name}({collection}: ${name}Props) {
  return (
    <Link
      to={\`/collections/\${collection.handle}\`}
      ${withStyles ? 'className="group relative block overflow-hidden rounded-lg"' : ''}
      prefetch="intent"
    >
      <div${withStyles ? ' className="aspect-video bg-secondary-100"' : ''}>
        {collection.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            src={collection.image.url}
            ${withStyles ? 'className="h-full w-full object-cover transition-transform group-hover:scale-105"' : ''}
          />
        ) : (
          <div${withStyles ? ' className="flex h-full w-full items-center justify-center bg-secondary-200"' : ''}>
            <span${withStyles ? ' className="text-secondary-500"' : ''}>{collection.title}</span>
          </div>
        )}
      </div>
      <div${withStyles ? ' className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4"' : ''}>
        <h3${withStyles ? ' className="text-lg font-semibold text-white"' : ''}>{collection.title}</h3>
      </div>
    </Link>
  );
}
`;
}

function generateCartComponent(name: string, withStyles: boolean): string {
  return `import {CartForm} from '@shopify/hydrogen';

export interface ${name}Props {
  line: {
    id: string;
    quantity: number;
    merchandise: {
      title: string;
      product: {
        title: string;
      };
    };
  };
}

export function ${name}({line}: ${name}Props) {
  return (
    <div${withStyles ? ' className="flex gap-4 py-4 border-b border-secondary-200"' : ''}>
      <div${withStyles ? ' className="flex-1"' : ''}>
        <h3${withStyles ? ' className="font-medium"' : ''}>{line.merchandise.product.title}</h3>
        <p${withStyles ? ' className="text-sm text-secondary-500"' : ''}>{line.merchandise.title}</p>
        <p${withStyles ? ' className="mt-1 text-sm"' : ''}>Qty: {line.quantity}</p>
      </div>
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesRemove}
        inputs={{lineIds: [line.id]}}
      >
        <button
          type="submit"
          ${withStyles ? 'className="text-sm text-red-600 hover:text-red-700"' : ''}
        >
          Remove
        </button>
      </CartForm>
    </div>
  );
}
`;
}

function generateFormComponent(name: string, withStyles: boolean): string {
  return `import {Form, useNavigation} from 'react-router';

export interface ${name}Props {
  action?: string;
}

export function ${name}({action}: ${name}Props) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form action={action} method="post"${withStyles ? ' className="space-y-4"' : ''}>
      <div>
        <label htmlFor="email"${withStyles ? ' className="block text-sm font-medium"' : ''}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          ${withStyles ? 'className="mt-1 block w-full rounded-md border border-secondary-300 px-3 py-2"' : ''}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        ${withStyles ? 'className="w-full rounded-md bg-primary-600 px-4 py-2 text-white disabled:opacity-50"' : ''}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </Form>
  );
}
`;
}

function generateLayoutComponent(name: string, withStyles: boolean): string {
  return `import type {ReactNode} from 'react';

export interface ${name}Props {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export function ${name}({children, header, footer}: ${name}Props) {
  return (
    <div${withStyles ? ' className="flex min-h-screen flex-col"' : ''}>
      {header && <header${withStyles ? ' className="sticky top-0 z-40 border-b bg-white"' : ''}>{header}</header>}
      <main${withStyles ? ' className="flex-1"' : ''}>{children}</main>
      {footer && <footer${withStyles ? ' className="border-t bg-secondary-50"' : ''}>{footer}</footer>}
    </div>
  );
}
`;
}

// Route generators
function generatePageRoute(name: string): string {
  const routeTitle = name
    .split('.')
    .pop()
    ?.replace(/[$_]/g, '')
    .replace(/^./, (c) => c.toUpperCase()) || 'Page';

  return `import {useLoaderData} from 'react-router';
import type {Route} from './+types/${name}';

export const meta: Route.MetaFunction = () => {
  return [{title: '${routeTitle}'}];
};

export async function loader({context}: Route.LoaderArgs) {
  // Add your loader logic here
  return {};
}

export default function ${routeTitle}() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">${routeTitle}</h1>
    </div>
  );
}
`;
}

function generateCollectionRoute(name: string): string {
  return `import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/${name}';
import {getPaginationVariables} from '@shopify/hydrogen';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: \`\${data?.collection?.title ?? ''} Collection\`}];
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 8});

  if (!handle) {
    throw redirect('/collections');
  }

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle, ...paginationVariables},
  });

  if (!collection) {
    throw new Response('Collection not found', {status: 404});
  }

  return {collection};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{collection.title}</h1>
      {/* Add collection products grid here */}
    </div>
  );
}

const COLLECTION_QUERY = \`#graphql
  query Collection($handle: String!, $first: Int, $last: Int, $after: String, $before: String) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first, last: $last, after: $after, before: $before) {
        nodes {
          id
          handle
          title
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
\` as const;
`;
}

function generateProductRoute(name: string): string {
  return `import {useLoaderData} from 'react-router';
import type {Route} from './+types/${name}';
import {getSelectedProductOptions} from '@shopify/hydrogen';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: data?.product?.title ?? 'Product'}];
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const selectedOptions = getSelectedProductOptions(request);

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions},
  });

  if (!product) {
    throw new Response('Product not found', {status: 404});
  }

  return {product};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{product.title}</h1>
      {/* Add product gallery and form here */}
    </div>
  );
}

const PRODUCT_QUERY = \`#graphql
  query Product($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      featuredImage {
        url
        altText
      }
      selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions) {
        id
        title
        price {
          amount
          currencyCode
        }
      }
    }
  }
\` as const;
`;
}

function generateAccountRoute(name: string): string {
  return `import {useLoaderData} from 'react-router';
import type {Route} from './+types/${name}';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Account'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  await customerAccount.handleAuthStatus();

  const {data} = await customerAccount.query(CUSTOMER_QUERY);
  return {customer: data.customer};
}

export default function Account() {
  const {customer} = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="mt-4">Welcome, {customer?.firstName || 'Customer'}</p>
    </div>
  );
}

const CUSTOMER_QUERY = \`#graphql
  query CustomerQuery {
    customer {
      id
      firstName
      lastName
      email
    }
  }
\` as const;
`;
}

function generateApiRoute(name: string): string {
  return `import type {Route} from './+types/${name}';

export async function loader({request}: Route.LoaderArgs) {
  return Response.json({
    message: 'API endpoint',
    timestamp: new Date().toISOString(),
  });
}

export async function action({request}: Route.ActionArgs) {
  const method = request.method;

  if (method === 'POST') {
    const body = await request.json();
    return Response.json({success: true, data: body});
  }

  return Response.json({error: 'Method not allowed'}, {status: 405});
}
`;
}

function generateResourceRoute(name: string): string {
  return `import type {Route} from './+types/${name}';

export async function loader({context}: Route.LoaderArgs) {
  return Response.json({
    // Return your resource data
  });
}
`;
}
