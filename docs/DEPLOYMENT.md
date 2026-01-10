# Deployment Guide

Deploy your Hydrogen Forge project to Shopify Oxygen or other hosting platforms.

## Prerequisites

Before deploying, ensure you have:

1. A Shopify store with Hydrogen enabled
2. Shopify CLI installed (`npm install -g @shopify/cli`)
3. Your project connected to Shopify

## Connecting to Shopify

### Link Your Project

```bash
# Navigate to your project
cd my-store

# Link to your Shopify store
npx shopify hydrogen link

# Follow the prompts to:
# 1. Log in to your Shopify account
# 2. Select your store
# 3. Choose or create a Hydrogen storefront
```

### Environment Variables

Create a `.env` file with your store credentials:

```env
# Required
SESSION_SECRET="your-random-session-secret"
PUBLIC_STOREFRONT_API_TOKEN="your-storefront-api-token"
PUBLIC_STORE_DOMAIN="your-store.myshopify.com"

# Optional - Customer Account API
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID="your-client-id"
PUBLIC_CUSTOMER_ACCOUNT_API_URL="https://shopify.com/..."
```

## Deploying to Oxygen

### Preview Deployment

Deploy a preview version for testing:

```bash
npx shopify hydrogen deploy --preview
```

This creates a preview URL that you can share for testing.

### Production Deployment

Deploy to production:

```bash
npx shopify hydrogen deploy
```

### Automatic Deployments

Set up automatic deployments from GitHub:

1. Go to your Shopify admin
2. Navigate to **Sales channels** > **Hydrogen**
3. Select your storefront
4. Go to **Deployments** > **Connect GitHub**
5. Authorize Shopify to access your repository
6. Select the repository and branch

Now every push to the selected branch will trigger a deployment.

## Environment Configuration

### Oxygen Environment Variables

Set environment variables in Shopify admin:

1. Go to **Hydrogen** > **Your Storefront** > **Storefront settings**
2. Click **Environment variables**
3. Add your variables

Or use the CLI:

```bash
# Set a variable
npx shopify hydrogen env push SESSION_SECRET="your-secret"

# Pull variables to local .env
npx shopify hydrogen env pull
```

### Production vs Preview

Oxygen supports separate environments:

```bash
# Deploy to preview
npx shopify hydrogen deploy --preview

# Deploy to production
npx shopify hydrogen deploy
```

## Alternative Hosting

### Vercel

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/client",
  "framework": null,
  "functions": {
    "dist/server/index.js": {
      "runtime": "nodejs20.x"
    }
  }
}
```

3. Deploy:

```bash
vercel
```

### Cloudflare Workers

1. Install Wrangler:

```bash
npm install -g wrangler
```

2. Create `wrangler.toml`:

```toml
name = "my-hydrogen-store"
main = "dist/server/index.js"
compatibility_date = "2024-01-01"

[vars]
PUBLIC_STORE_DOMAIN = "your-store.myshopify.com"

[site]
bucket = "./dist/client"
```

3. Deploy:

```bash
wrangler deploy
```

### Docker

1. Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
```

2. Build and run:

```bash
# Build the image
docker build -t my-hydrogen-store .

# Run the container
docker run -p 3000:3000 \
  -e SESSION_SECRET="your-secret" \
  -e PUBLIC_STOREFRONT_API_TOKEN="your-token" \
  -e PUBLIC_STORE_DOMAIN="your-store.myshopify.com" \
  my-hydrogen-store
```

## Build Optimization

### Production Build

```bash
# Build for production
npm run build

# The build outputs to:
# - dist/client/  (static assets)
# - dist/server/  (server code)
```

### Bundle Analysis

Analyze your bundle size:

```bash
# Install the analyzer
npm install -D source-map-explorer

# Build with source maps
npm run build

# Analyze
npx source-map-explorer dist/client/**/*.js
```

### Performance Tips

1. **Image Optimization**

```tsx
// Use Hydrogen's Image component
import { Image } from "@shopify/hydrogen";

<Image data={image} sizes="(min-width: 768px) 50vw, 100vw" loading="lazy" />;
```

2. **Code Splitting**

```tsx
// Lazy load heavy components
import { lazy, Suspense } from "react";

const HeavyComponent = lazy(() => import("./HeavyComponent"));

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

3. **Caching Headers**

Configure caching in your routes:

```tsx
export function headers() {
  return {
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
  };
}
```

## Domain Configuration

### Custom Domain on Oxygen

1. Go to **Hydrogen** > **Your Storefront** > **Domains**
2. Click **Add domain**
3. Enter your domain
4. Update your DNS records:
   - Add a CNAME record pointing to your Oxygen URL

### SSL Certificate

Oxygen automatically provisions SSL certificates for custom domains.

## Monitoring

### Oxygen Analytics

View deployment analytics in Shopify admin:

- Request count
- Response times
- Error rates
- Cache hit rates

### Custom Monitoring

Add custom logging:

```tsx
// app/lib/logger.ts
export function log(level: string, message: string, data?: object) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (process.env.NODE_ENV === "production") {
    // Send to your logging service
    console.log(JSON.stringify(entry));
  } else {
    console.log(`[${level}] ${message}`, data);
  }
}
```

## Troubleshooting

### Common Issues

**Build Fails**

```bash
# Clear cache and rebuild
rm -rf node_modules .cache dist
npm install
npm run build
```

**Environment Variables Not Loading**

```bash
# Verify .env file exists
cat .env

# Pull from Oxygen
npx shopify hydrogen env pull
```

**Deployment Timeout**

```bash
# Increase build memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Debug Mode

Enable debug logging:

```bash
# Local development
DEBUG=* npm run dev

# Check Oxygen logs
npx shopify hydrogen logs
```

## Checklist

Before going live:

- [ ] All environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error pages customized (404, 500)
- [ ] Analytics/tracking installed
- [ ] Performance tested (Lighthouse)
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags configured
- [ ] Sitemap generated
- [ ] robots.txt configured
