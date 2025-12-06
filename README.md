# TradeSphere ERP

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)
![Turborepo](https://img.shields.io/badge/Turborepo-2.6-EF4444?style=flat-square&logo=turborepo)

**A modern, microfrontend-based ERP system for intelligent inventory management**

[Features](#features) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Documentation](#documentation)

</div>

---

## Overview

TradeSphere is designed to solve the fundamental inventory management challenge: balancing **Liquidity** (cash flow) against **Availability** (stockouts). It provides real-time visibility into stock levels, warehouse operations, and the financial impact of inventory decisions.

### Core Philosophy

> *"Managing inventory is a balancing act. Too low = stockouts and lost sales. Too high = poor liquidity and dead stock."*

Every product has two critical thresholds:
- **Reorder Point** (Safety Stock): Minimum level before risk of stockout
- **Max Stock** (Liquidity Cap): Maximum level before capital becomes trapped

---

## Features

### 📦 Inventory Management
- **Product Catalog**: Full CRUD with SKU, pricing, cost tracking
- **Multi-Warehouse Support**: Organize stock across multiple facilities
- **Hierarchical Locations**: Zone → Rack → Shelf → Bin structure
- **Stock Movements**: Track IN, OUT, and TRANSFER operations
- **Real-time Alerts**: Low stock and overstock warnings

### 📊 Analytics Dashboard
- **Liquidity Tied Up**: Capital invested in inventory (cost × stock)
- **Potential Revenue**: Maximum possible sales value (price × stock)
- **Dead Stock Value**: Wasted capital in overstocked items
- **Stock Health**: Visual distribution of healthy/low/out/overstocked items

### ⚙️ Settings & Administration
- **User Management**: Role-based access (Admin, Manager, Operator, Viewer)
- **Theme System**: Dark/Light mode with cross-app synchronization
- **User Preferences**: Personalized settings per user

### 🎨 Design System
- **"Deep Space Glass" Aesthetic**: Modern glassmorphism UI
- **Shared Component Library**: Consistent design across all modules
- **Responsive Layout**: Works on desktop and tablet

---

## Architecture

TradeSphere uses a **Next.js Multi-Zone** microfrontend architecture with a monorepo structure.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TradeSphere Shell (localhost:3000)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  /                    → Dashboard                                       │
│  /settings/*          → Settings & User Management                      │
│  /inventory/*         → Inventory Module (proxied from :3001)           │
│  /analytics/*         → Analytics Module (proxied from :3002)           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
tradesphere/
├── apps/
│   ├── web/                 # Main shell app (Port 3000)
│   │   ├── app/
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── settings/          # Settings pages
│   │   │   ├── actions.ts         # Server Actions
│   │   │   └── providers.tsx      # Theme & User context
│   │   └── next.config.js         # Rewrites to sub-apps
│   │
│   ├── inventory/           # Inventory module (Port 3001)
│   │   ├── app/
│   │   │   ├── page.tsx           # Product list
│   │   │   ├── products/          # Product CRUD
│   │   │   ├── warehouses/        # Warehouse management
│   │   │   ├── locations/         # Location hierarchy
│   │   │   ├── stock/             # Stock operations
│   │   │   └── actions.ts         # Server Actions
│   │   └── next.config.js         # basePath: "/inventory"
│   │
│   └── analytics/           # Analytics module (Port 3002)
│       ├── app/
│       │   └── page.tsx           # Analytics dashboard
│       └── next.config.js         # basePath: "/analytics"
│
├── packages/
│   ├── ui/                  # Shared UI components (@repo/ui)
│   │   └── src/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── sidebar.tsx
│   │       ├── data-table.tsx
│   │       └── theme-provider.tsx
│   │
│   ├── database/            # Prisma + SQLite (@repo/database)
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       ├── seed.ts
│   │       └── dev.db
│   │
│   ├── eslint-config/       # Shared ESLint rules
│   └── typescript-config/   # Shared TypeScript configs
│
├── docs/
│   └── PRODUCT_VISION.md    # Detailed product documentation
│
├── turbo.json               # Turborepo pipeline config
├── pnpm-workspace.yaml      # Workspace packages
└── package.json             # Root scripts
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16+ (App Router) |
| **Language** | TypeScript 5.9 |
| **Monorepo** | Turborepo + pnpm workspaces |
| **Database** | Prisma ORM + SQLite |
| **Styling** | Tailwind CSS + CSS Variables |
| **Components** | Radix UI + class-variance-authority |
| **Tables** | TanStack Table (React Table v8) |
| **Icons** | Lucide React |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9.0

### Installation

```bash
# Clone the repository
git clone https://github.com/GranFenrir/tradesphere.git
cd tradesphere

# Install dependencies
pnpm install

# Generate Prisma client
pnpm --filter @repo/database db:generate

# Push database schema (creates SQLite database)
pnpm --filter @repo/database db:push

# (Optional) Seed with sample data
cd packages/database && npx tsx prisma/seed.ts && cd ../..
```

### Development

```bash
# Start all apps in parallel
pnpm dev
```

Access the apps:
- **Dashboard**: http://localhost:3000
- **Inventory**: http://localhost:3000/inventory
- **Analytics**: http://localhost:3000/analytics
- **Settings**: http://localhost:3000/settings

### Build

```bash
# Build all apps for production
pnpm build

# Type check all packages
pnpm check-types

# Lint all packages
pnpm lint
```

---

## Database

### Schema Overview

```
Product ──┬── StockItem ──── Location ──── Warehouse
          │
          └── StockMovement ─┬── fromLocation
                             └── toLocation
                             
User ──── StockMovement (audit trail)
```

### Key Models

| Model | Purpose |
|-------|---------|
| `Product` | Items with SKU, price, cost, reorder thresholds |
| `Warehouse` | Physical facilities with code and address |
| `Location` | Hierarchical tree (Zone/Rack/Shelf/Bin) |
| `StockItem` | Quantity of a product at a specific location |
| `StockMovement` | Audit trail of IN/OUT/TRANSFER operations |
| `User` | Team members with roles and preferences |

### Database Commands

```bash
# Generate Prisma client after schema changes
pnpm --filter @repo/database db:generate

# Push schema to database
pnpm --filter @repo/database db:push

# Open Prisma Studio (database browser)
pnpm --filter @repo/database db:studio

# Reset database (careful in production!)
pnpm --filter @repo/database db:push --force-reset
```

---

## Shared Packages

### @repo/ui

Shared React components with consistent styling:

```tsx
import { Button } from "@repo/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { DataTable } from "@repo/ui/data-table";
import { Sidebar } from "@repo/ui/sidebar";
import { ThemeProvider, useTheme } from "@repo/ui/theme-provider";
```

### @repo/database

Prisma client and type constants:

```tsx
import { prisma, LocationType, MovementType, UserRole } from "@repo/database";

// Use type constants (SQLite doesn't support enums)
const zone = await prisma.location.create({
  data: {
    type: LocationType.ZONE,  // "ZONE"
    // ...
  }
});
```

---

## Theme System

TradeSphere supports Dark and Light modes with cross-app synchronization.

### How it Works

1. **Web App**: Uses `ThemeProvider` with React context
2. **Sub-Apps**: Use `ThemeSync` to read theme from localStorage
3. **Flash Prevention**: Inline script applies theme before React hydrates
4. **Cross-Tab Sync**: Storage events sync theme across browser tabs

### Usage

```tsx
// In any component within web app
import { useTheme } from "@repo/ui/theme-provider";

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

---

## API Routes

The inventory module exposes REST APIs for dynamic data:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | List all products |
| `/api/products/[sku]` | GET | Get product by SKU |
| `/api/warehouses` | GET | List all warehouses |
| `/api/locations` | GET | List locations (with tree structure) |
| `/api/locations/bins` | GET | List bin-level locations only |
| `/api/locations/with-stock` | GET | Locations with stock items |

---

## User Roles

| Role | Access Level |
|------|--------------|
| **ADMIN** | Full system access + User management |
| **MANAGER** | Inventory, Analytics, Reports |
| **OPERATOR** | Stock movements, Product updates |
| **VIEWER** | Read-only dashboards and reports |

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm check-types` | TypeScript type checking |
| `pnpm --filter @repo/database db:studio` | Open Prisma Studio |

---

## Documentation

- **[Product Vision](./docs/PRODUCT_VISION.md)**: Detailed product philosophy, data models, and roadmap
- **[GitHub Copilot Instructions](./.github/copilot-instructions.md)**: AI coding assistant context

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is private and proprietary.

---

<div align="center">

**TradeSphere ERP** — Balancing Liquidity and Availability

Made with ❤️ using Next.js, Turborepo, and Tailwind CSS

</div>
