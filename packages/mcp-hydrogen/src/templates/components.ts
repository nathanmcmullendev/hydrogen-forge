import type {ComponentType, ScaffoldComponentInput} from '../lib/types.js';

interface PropDef {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

function generatePropsInterface(
  componentName: string,
  props: PropDef[],
): string {
  if (props.length === 0) return '';

  const propsLines = props
    .map((prop) => {
      const optional = prop.required ? '' : '?';
      const jsdoc = prop.description ? `  /** ${prop.description} */\n` : '';
      return `${jsdoc}  ${prop.name}${optional}: ${prop.type};`;
    })
    .join('\n');

  return `export interface ${componentName}Props {\n${propsLines}\n}\n`;
}

function generatePropsDestructure(props: PropDef[]): string {
  if (props.length === 0) return '';
  return props.map((p) => p.name).join(', ');
}

const BASIC_TEMPLATE = (
  name: string,
  props: PropDef[],
  withStyles: boolean,
): string => {
  const propsInterface = generatePropsInterface(name, props);
  const propsType = props.length > 0 ? `${name}Props` : '';
  const propsArg = props.length > 0 ? `{${generatePropsDestructure(props)}}: ${propsType}` : '';
  const styleComment = withStyles
    ? '\n      {/* Add Tailwind classes: flex, items-center, gap-4, etc. */}'
    : '';

  return `${propsInterface}
export function ${name}(${propsArg}) {
  return (
    <div className="${withStyles ? 'p-4' : ''}">${styleComment}
      <h2>${name} Component</h2>
    </div>
  );
}
`;
};

const PRODUCT_TEMPLATE = (
  name: string,
  props: PropDef[],
  withStyles: boolean,
): string => {
  const hasCustomProps = props.length > 0;
  const customPropsInterface = hasCustomProps
    ? generatePropsInterface(name, props)
    : '';

  return `import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

${customPropsInterface}export interface ${name}Props {
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage?: {
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    } | null;
    priceRange: {
      minVariantPrice: MoneyV2;
    };
  };${hasCustomProps ? `\n  ${props.map((p) => `${p.name}${p.required ? '' : '?'}: ${p.type};`).join('\n  ')}` : ''}
}

export function ${name}({product${hasCustomProps ? `, ${generatePropsDestructure(props)}` : ''}}: ${name}Props) {
  const image = product.featuredImage;

  return (
    <Link
      to={\`/products/\${product.handle}\`}
      className="${withStyles ? 'group block' : ''}"
      prefetch="intent"
    >
      <div className="${withStyles ? 'relative aspect-square overflow-hidden rounded-lg bg-secondary-100' : ''}">
        {image ? (
          <Image
            alt={image.altText || product.title}
            data={image}
            className="${withStyles ? 'h-full w-full object-cover transition-transform group-hover:scale-105' : ''}"
          />
        ) : (
          <div className="${withStyles ? 'flex h-full w-full items-center justify-center' : ''}">
            <span className="${withStyles ? 'text-secondary-400' : ''}">No image</span>
          </div>
        )}
      </div>
      <div className="${withStyles ? 'mt-3 space-y-1' : ''}">
        <h3 className="${withStyles ? 'text-sm font-medium text-secondary-900' : ''}">{product.title}</h3>
        <Money
          data={product.priceRange.minVariantPrice}
          className="${withStyles ? 'text-sm text-secondary-500' : ''}"
        />
      </div>
    </Link>
  );
}
`;
};

const COLLECTION_TEMPLATE = (
  name: string,
  props: PropDef[],
  withStyles: boolean,
): string => {
  const hasCustomProps = props.length > 0;

  return `import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

export interface ${name}Props {
  collection: {
    id: string;
    title: string;
    handle: string;
    description?: string;
    image?: {
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    } | null;
  };${hasCustomProps ? `\n  ${props.map((p) => `${p.name}${p.required ? '' : '?'}: ${p.type};`).join('\n  ')}` : ''}
}

export function ${name}({collection${hasCustomProps ? `, ${generatePropsDestructure(props)}` : ''}}: ${name}Props) {
  return (
    <Link
      to={\`/collections/\${collection.handle}\`}
      className="${withStyles ? 'group relative block overflow-hidden rounded-lg' : ''}"
      prefetch="intent"
    >
      <div className="${withStyles ? 'aspect-video bg-secondary-100' : ''}">
        {collection.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            data={collection.image}
            className="${withStyles ? 'h-full w-full object-cover transition-transform group-hover:scale-105' : ''}"
          />
        ) : (
          <div className="${withStyles ? 'flex h-full w-full items-center justify-center bg-secondary-200' : ''}">
            <span className="${withStyles ? 'text-secondary-500' : ''}">{collection.title}</span>
          </div>
        )}
      </div>
      <div className="${withStyles ? 'absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4' : ''}">
        <div>
          <h3 className="${withStyles ? 'text-lg font-semibold text-white' : ''}">{collection.title}</h3>
          {collection.description && (
            <p className="${withStyles ? 'mt-1 text-sm text-white/80 line-clamp-2' : ''}">
              {collection.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
`;
};

const CART_TEMPLATE = (
  name: string,
  _props: PropDef[],
  withStyles: boolean,
): string => {
  return `import {CartForm, Money} from '@shopify/hydrogen';
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';

export interface ${name}Props {
  line: {
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
      product: {
        title: string;
        handle: string;
      };
      image?: {
        url: string;
        altText?: string | null;
      } | null;
    };
    cost: {
      totalAmount: {
        amount: string;
        currencyCode: string;
      };
    };
  };
}

export function ${name}({line}: ${name}Props) {
  const {id, quantity, merchandise, cost} = line;

  return (
    <div className="${withStyles ? 'flex gap-4 py-4 border-b border-secondary-200' : ''}">
      {merchandise.image && (
        <div className="${withStyles ? 'h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary-100' : ''}">
          <img
            src={merchandise.image.url}
            alt={merchandise.image.altText || merchandise.title}
            className="${withStyles ? 'h-full w-full object-cover' : ''}"
          />
        </div>
      )}
      <div className="${withStyles ? 'flex flex-1 flex-col' : ''}">
        <h3 className="${withStyles ? 'text-sm font-medium text-secondary-900' : ''}">
          {merchandise.product.title}
        </h3>
        <p className="${withStyles ? 'text-sm text-secondary-500' : ''}">{merchandise.title}</p>
        <div className="${withStyles ? 'mt-auto flex items-center justify-between' : ''}">
          <div className="${withStyles ? 'flex items-center gap-2' : ''}">
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesUpdate}
              inputs={{
                lines: [{id, quantity: Math.max(0, quantity - 1)}] as CartLineUpdateInput[],
              }}
            >
              <button
                type="submit"
                className="${withStyles ? 'flex h-8 w-8 items-center justify-center rounded border border-secondary-300 text-secondary-600 hover:bg-secondary-50' : ''}"
              >
                -
              </button>
            </CartForm>
            <span className="${withStyles ? 'w-8 text-center text-sm' : ''}">{quantity}</span>
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesUpdate}
              inputs={{
                lines: [{id, quantity: quantity + 1}] as CartLineUpdateInput[],
              }}
            >
              <button
                type="submit"
                className="${withStyles ? 'flex h-8 w-8 items-center justify-center rounded border border-secondary-300 text-secondary-600 hover:bg-secondary-50' : ''}"
              >
                +
              </button>
            </CartForm>
          </div>
          <Money
            data={cost.totalAmount}
            className="${withStyles ? 'text-sm font-medium text-secondary-900' : ''}"
          />
        </div>
      </div>
    </div>
  );
}
`;
};

const FORM_TEMPLATE = (
  name: string,
  _props: PropDef[],
  withStyles: boolean,
): string => {
  return `import {Form, useNavigation} from 'react-router';

export interface ${name}Props {
  action?: string;
  method?: 'get' | 'post';
  onSuccess?: () => void;
}

export function ${name}({action, method = 'post', onSuccess}: ${name}Props) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form
      action={action}
      method={method}
      className="${withStyles ? 'space-y-4' : ''}"
    >
      <div>
        <label
          htmlFor="email"
          className="${withStyles ? 'block text-sm font-medium text-secondary-700' : ''}"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="${withStyles ? 'mt-1 block w-full rounded-md border border-secondary-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500' : ''}"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="${withStyles ? 'w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50' : ''}"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </Form>
  );
}
`;
};

const LAYOUT_TEMPLATE = (
  name: string,
  _props: PropDef[],
  withStyles: boolean,
): string => {
  return `import type {ReactNode} from 'react';

export interface ${name}Props {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export function ${name}({children, header, footer}: ${name}Props) {
  return (
    <div className="${withStyles ? 'flex min-h-screen flex-col' : ''}">
      {header && (
        <header className="${withStyles ? 'sticky top-0 z-40 border-b border-secondary-200 bg-white' : ''}">
          {header}
        </header>
      )}
      <main className="${withStyles ? 'flex-1' : ''}">{children}</main>
      {footer && (
        <footer className="${withStyles ? 'border-t border-secondary-200 bg-secondary-50' : ''}">
          {footer}
        </footer>
      )}
    </div>
  );
}
`;
};

const TEMPLATES: Record<
  ComponentType,
  (name: string, props: PropDef[], withStyles: boolean) => string
> = {
  basic: BASIC_TEMPLATE,
  product: PRODUCT_TEMPLATE,
  collection: COLLECTION_TEMPLATE,
  cart: CART_TEMPLATE,
  form: FORM_TEMPLATE,
  layout: LAYOUT_TEMPLATE,
};

export function generateComponent(input: ScaffoldComponentInput): string {
  const template = TEMPLATES[input.type];
  const props: PropDef[] = input.props || [];

  return template(input.name, props, input.withStyles);
}

export function generateTestFile(componentName: string): string {
  return `import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {${componentName}} from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    // Add assertions based on component content
  });
});
`;
}
