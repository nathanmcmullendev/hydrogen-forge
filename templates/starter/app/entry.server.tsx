import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  // Add Klaviyo domains to CSP
  // Since there's no explicit script-src, we add it and also extend connect-src
  const cspHeader = header
    .replace(
      'default-src',
      "script-src 'self' https://cdn.shopify.com https://static.klaviyo.com https://static-tracking.klaviyo.com 'nonce-" +
        nonce +
        "'; default-src",
    )
    .replace(
      'connect-src',
      'connect-src https://a.klaviyo.com https://static-tracking.klaviyo.com https://manage.kmail-lists.com',
    );

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', cspHeader);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
