# Hydrogen Forge Starter

A developer-focused Shopify Hydrogen starter template with TypeScript strict mode and Tailwind CSS.

## Features

- **TypeScript Strict Mode** - Maximum type safety with all strict checks enabled
- **Tailwind CSS** - Utility-first CSS with custom component classes
- **React Router 7** - Latest routing with loaders and actions
- **Shopify Hydrogen** - Official Shopify headless commerce framework
- **Performance Optimized** - Built for 95+ PageSpeed scores

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Shopify Partner account with a development store

### Setup

1. **Clone and install:**

```bash
git clone https://github.com/nathanmcmullendev/hydrogen-forge.git
cd hydrogen-forge/templates/starter
pnpm install
```

2. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your Shopify store credentials
```

3. **Start development:**

```bash
pnpm dev
```

4. **Open browser:**

Navigate to `http://localhost:3000`

## Project Structure

```
app/
├── components/       # Reusable UI components
├── graphql/          # GraphQL fragments and queries
├── lib/              # Utilities and helpers
├── routes/           # Page routes (React Router 7)
├── styles/           # CSS files
│   ├── reset.css     # CSS reset
│   └── tailwind.css  # Tailwind directives + custom styles
└── root.tsx          # App root with layout
```

## Scripts

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Start development server     |
| `pnpm build`     | Build for production         |
| `pnpm preview`   | Preview production build     |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint`      | Run ESLint                   |
| `pnpm format`    | Format code with Prettier    |

## TypeScript Configuration

This starter uses TypeScript strict mode with additional checks:

- `strict: true` - Enable all strict type-checking options
- `noUncheckedIndexedAccess: true` - Add undefined to index signatures
- `exactOptionalPropertyTypes: true` - Exact optional property types
- `noImplicitReturns: true` - Ensure all code paths return

## Tailwind CSS

Custom component classes are defined in `app/styles/tailwind.css`:

- `.btn`, `.btn-primary`, `.btn-secondary` - Button variants
- `.input` - Form input styling
- `.card` - Card component
- `.badge`, `.badge-sale` - Badge variants
- `.product-grid` - Product grid layout
- `.container-narrow` - Centered container

## Deployment

Deploy to Shopify Oxygen:

```bash
pnpm build
shopify hydrogen deploy
```

Or deploy to Vercel, Netlify, or any Node.js hosting.

## Documentation

- [Hydrogen Docs](https://hydrogen.shopify.dev)
- [React Router 7 Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)

## License

MIT

---

Part of the [Hydrogen Forge](https://github.com/nathanmcmullendev/hydrogen-forge) ecosystem.
