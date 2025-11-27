# TradeSphere ERP - AI Coding Instructions

## 1. Architecture & Structure
- **Monorepo**: Managed by Turborepo & pnpm.
- **Microfrontends (Multi-Zones)**:
  - `apps/web` (Port 3000): Main shell/dashboard. Proxies `/inventory` → inventory app and `/analytics` → analytics app via `next.config.js` rewrites.
  - `apps/inventory` (Port 3001): Inventory management module. Has `basePath: "/inventory"`.
  - `apps/analytics` (Port 3002): Analytics & reporting module. Has `basePath: "/analytics"`.
- **Shared Packages**:
  - `packages/ui`: Shared React components (`@repo/ui`). Includes: `button`, `card`, `sidebar`, `table`, `data-table`.
  - `packages/database`: Prisma + SQLite database (`@repo/database`). Schema in `prisma/schema.prisma`.
  - `packages/eslint-config`: Shared ESLint rules (`@repo/eslint-config`).
  - `packages/typescript-config`: Shared TSConfig (`@repo/typescript-config`).

## 2. Key Workflows
- **Development**: Run `pnpm dev` from root to start all apps in parallel.
  - Web: http://localhost:3000
  - Inventory: http://localhost:3000/inventory (proxied from port 3001)
  - Analytics: http://localhost:3000/analytics (proxied from port 3002)
- **Build**: `pnpm build` (uses Turbo caching).
- **Lint/Typecheck**: `pnpm lint` and `pnpm check-types`.
- **Database**:
  - Generate Prisma client: `pnpm --filter @repo/database db:generate`
  - Push schema to DB: `pnpm --filter @repo/database db:push`
  - Open Prisma Studio: `pnpm --filter @repo/database db:studio`
  - Seed data: `cd packages/database && npx tsx prisma/seed.ts`

## 3. Tech Stack & Conventions
- **Framework**: Next.js 16+ (App Router). Use `app/` directory structure.
- **Database**: Prisma ORM with SQLite (`packages/database/prisma/dev.db`).
- **Styling**: Tailwind CSS with "Deep Space Glass" aesthetic.
  - Use `cn()` utility for class merging (`@repo/ui/utils`).
  - Theme tokens: `bg-background`, `text-foreground`, `bg-muted/20`, `glass-card`.
- **Components**:
  - Located in `packages/ui/src/`. Pattern: Radix UI + `class-variance-authority` (cva) + Tailwind.
  - Import as `import { Button } from "@repo/ui/button"`.
  - DataTable uses `@tanstack/react-table` for sorting/pagination.
- **Data Fetching**: Server Components with Prisma. Use Server Actions for mutations.

## 4. Integration & Patterns
- **Cross-App Navigation**:
  - Since sub-apps have `basePath`, use relative links inside them (e.g., `/products/new` not `/inventory/products/new`).
  - Next.js automatically prepends the basePath.
- **Shared Layout**:
  - Each app includes `Sidebar` from `@repo/ui/sidebar` in its `layout.tsx`.
- **Server Actions** (mutations):
  - Defined in `app/actions.ts` with `'use server'` directive.
  - Example: `apps/inventory/app/actions.ts` has `createProduct()`.

## 5. Database Schema (Product Model)
```prisma
model Product {
  id           String   @id @default(cuid())
  name         String
  sku          String   @unique
  category     String
  currentStock Int      @default(0)
  price        Decimal
  cost         Decimal
  reorderPoint Int      @default(10)  // Safety Stock threshold
  maxStock     Int      @default(100) // Liquidity Cap
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```
- **Status Logic** (derived in code):
  - `OUT_OF_STOCK`: currentStock === 0
  - `LOW_STOCK`: currentStock <= reorderPoint
  - `OVERSTOCKED`: currentStock > maxStock
  - `IN_STOCK`: otherwise

## 6. Common Tasks
- **Adding a UI Component**:
  1. Create in `packages/ui/src/component.tsx`.
  2. Export in `packages/ui/package.json` exports field.
- **New Route in Inventory**:
  - Create `apps/inventory/app/new-route/page.tsx`.
  - Access via `localhost:3000/inventory/new-route`.
- **Adding a Server Action**:
  - Add function to `apps/inventory/app/actions.ts` with `'use server'`.
  - Use `revalidatePath("/")` after mutations.

## 7. Product Vision & Domain Logic
- **Core Philosophy**: Balance **Liquidity** (Cash Flow) vs. **Availability** (Stockouts).
- **Key Metrics**: `reorderPoint` (Safety Stock), `maxStock` (Liquidity Cap), `cost` (for capital tied up).
- **Analytics calculates**: Dead Stock Value, Liquidity Tied Up, Potential Revenue.
- **Reference**: See `docs/PRODUCT_VISION.md` for detailed domain modeling.

## 8. DONT FORGET TO USE CURRENT TECHNOLOGIES AND BEST PRACTICES IN NEXT.JS 16+ AND TYPESCRIPT WHEN WRITING OR UPDATING CODE.