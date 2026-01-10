import type {RouteType, ScaffoldRouteInput} from '../lib/types.js';

function generateTypesImport(routeName: string): string {
  // Convert route name to types path format
  // e.g., "products.$handle" -> "./+types/products.$handle"
  return `import type {Route} from './+types/${routeName}';`;
}

const PAGE_TEMPLATE = (input: ScaffoldRouteInput): string => {
  const {name, withLoader, withAction, withMeta, withGraphQL} = input;
  const typesImport = generateTypesImport(name);

  const imports = [`import {useLoaderData} from 'react-router';`, typesImport];

  if (withGraphQL) {
    imports.push(`import {getPaginationVariables} from '@shopify/hydrogen';`);
  }

  const loaderCode = withLoader
    ? `
export async function loader({context, params, request}: Route.LoaderArgs) {
  const {storefront} = context;
  ${withGraphQL ? 'const paginationVariables = getPaginationVariables(request, {pageBy: 8});' : ''}

  // Add your loader logic here
  ${withGraphQL ? `const data = await storefront.query(PAGE_QUERY${withGraphQL ? ', {variables: {...paginationVariables}}' : ''});` : ''}

  return {
    ${withGraphQL ? 'data,' : '// Return your data here'}
  };
}
`
    : '';

  const actionCode = withAction
    ? `
export async function action({context, request}: Route.ActionArgs) {
  const formData = await request.formData();

  // Add your action logic here

  return {success: true};
}
`
    : '';

  const metaCode = withMeta
    ? `
export const meta: Route.MetaFunction = ({data}) => {
  return [{title: 'Page Title'}];
};
`
    : '';

  const graphqlQuery = withGraphQL
    ? `
const PAGE_QUERY = \`#graphql
  query PageQuery($first: Int, $last: Int, $after: String, $before: String) {
    # Add your GraphQL query here
  }
\` as const;
`
    : '';

  const routeNameTitle = name
    .split('.')
    .pop()
    ?.replace(/[$_]/g, '')
    .replace(/^./, (c) => c.toUpperCase());

  return `${imports.join('\n')}
${metaCode}${loaderCode}${actionCode}
export default function ${routeNameTitle || 'Page'}() {
  ${withLoader ? 'const data = useLoaderData<typeof loader>();' : ''}

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">${routeNameTitle || 'Page'}</h1>
      {/* Add your page content here */}
    </div>
  );
}
${graphqlQuery}`;
};

const RESOURCE_TEMPLATE = (input: ScaffoldRouteInput): string => {
  const {name, withLoader, withAction} = input;
  const typesImport = generateTypesImport(name);

  return `${typesImport}
${withLoader ? `
export async function loader({context, params, request}: Route.LoaderArgs) {
  // Resource route loader - return data directly
  return Response.json({
    // Return your resource data here
  });
}
` : ''}
${withAction ? `
export async function action({context, request}: Route.ActionArgs) {
  const formData = await request.formData();

  // Process the action
  return Response.json({success: true});
}
` : ''}`;
};

const COLLECTION_TEMPLATE = (input: ScaffoldRouteInput): string => {
  const {name} = input;
  const typesImport = generateTypesImport(name);

  return `import {redirect, useLoaderData} from 'react-router';
${typesImport}
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

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
    throw new Response(\`Collection \${handle} not found\`, {status: 404});
  }

  return {collection};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{collection.title}</h1>
      {collection.description && (
        <p className="mt-2 text-secondary-600">{collection.description}</p>
      )}
      <PaginatedResourceSection
        connection={collection.products}
        resourcesClassName="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        {({node: product}) => (
          <div key={product.id}>
            {/* Render product card */}
            {product.title}
          </div>
        )}
      </PaginatedResourceSection>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const COLLECTION_QUERY = \`#graphql
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }

  query Collection(
    $handle: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first, last: $last, after: $after, before: $before) {
        nodes {
          ...ProductItem
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
};

const PRODUCT_TEMPLATE = (input: ScaffoldRouteInput): string => {
  const {name} = input;
  const typesImport = generateTypesImport(name);

  return `import {useLoaderData} from 'react-router';
${typesImport}
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
} from '@shopify/hydrogen';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: \`\${data?.product?.title ?? ''}\`}];
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
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    product.variants,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Gallery */}
        <div>
          {product.featuredImage && (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              className="w-full rounded-lg"
            />
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          {product.descriptionHtml && (
            <div
              className="mt-4 prose"
              dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
            />
          )}
          {/* Add variant selector and add to cart here */}
        </div>
      </div>
      <Analytics.ProductView
        data={{
          products: [{
            id: product.id,
            title: product.title,
            price: selectedVariant?.price?.amount || '0',
            vendor: product.vendor,
            variantId: selectedVariant?.id || '',
            variantTitle: selectedVariant?.title || '',
            quantity: 1,
          }],
        }}
      />
    </div>
  );
}

const PRODUCT_QUERY = \`#graphql
  query Product($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      descriptionHtml
      featuredImage {
        url
        altText
        width
        height
      }
      selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions) {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
\` as const;
`;
};

const ACCOUNT_TEMPLATE = (input: ScaffoldRouteInput): string => {
  const {name, withLoader, withAction} = input;
  const typesImport = generateTypesImport(name);

  return `import {redirect, useLoaderData, Form} from 'react-router';
${typesImport}

export const meta: Route.MetaFunction = () => {
  return [{title: 'Account'}];
};
${withLoader ? `
export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;

  // Check if customer is logged in
  await customerAccount.handleAuthStatus();

  const {data} = await customerAccount.query(CUSTOMER_QUERY);

  return {customer: data.customer};
}
` : ''}
${withAction ? `
export async function action({context, request}: Route.ActionArgs) {
  const {customerAccount} = context;
  const formData = await request.formData();

  // Handle form submission
  return {success: true};
}
` : ''}
export default function Account() {
  ${withLoader ? 'const {customer} = useLoaderData<typeof loader>();' : ''}

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Account</h1>
      ${withLoader ? `
      <div className="mt-6">
        <p>Welcome, {customer?.firstName || 'Customer'}</p>
      </div>
      ` : ''}
    </div>
  );
}
${withLoader ? `
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
` : ''}`;
};

const API_TEMPLATE = (input: ScaffoldRouteInput): string => {
  const {name, withLoader, withAction} = input;
  const typesImport = generateTypesImport(name);

  return `${typesImport}
${withLoader ? `
export async function loader({context, request}: Route.LoaderArgs) {
  // Handle GET requests
  return Response.json({
    message: 'API endpoint',
    timestamp: new Date().toISOString(),
  });
}
` : ''}
${withAction ? `
export async function action({context, request}: Route.ActionArgs) {
  const method = request.method;

  if (method === 'POST') {
    const body = await request.json();
    // Handle POST request
    return Response.json({success: true, data: body});
  }

  if (method === 'PUT') {
    const body = await request.json();
    // Handle PUT request
    return Response.json({success: true, data: body});
  }

  if (method === 'DELETE') {
    // Handle DELETE request
    return Response.json({success: true});
  }

  return Response.json({error: 'Method not allowed'}, {status: 405});
}
` : ''}`;
};

const TEMPLATES: Record<RouteType, (input: ScaffoldRouteInput) => string> = {
  page: PAGE_TEMPLATE,
  resource: RESOURCE_TEMPLATE,
  collection: COLLECTION_TEMPLATE,
  product: PRODUCT_TEMPLATE,
  account: ACCOUNT_TEMPLATE,
  api: API_TEMPLATE,
};

export function generateRoute(input: ScaffoldRouteInput): string {
  const template = TEMPLATES[input.type];
  return template(input);
}

export function getRouteFileName(routeName: string): string {
  // Route name is already in the correct format (e.g., "products.$handle")
  return `${routeName}.tsx`;
}
