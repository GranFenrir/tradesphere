# TradeSphere ERP - Product Vision

## Executive Summary

TradeSphere is a **modern, microfrontend-based ERP system** built to solve the fundamental inventory management challenge: balancing **Liquidity** (cash flow) against **Availability** (stockouts). It provides real-time visibility into stock levels, warehouse operations, and financial impact of inventory decisions.

---

## Core Philosophy: The Liquidity vs. Availability Balance

> "Managing inventory is a time-consuming and tedious balancing act. If you allow inventory to fall too low, you are in danger of stockouts and shortages... However, if you overstock your inventory, your business will suffer from poor liquidity."

### The Two Extremes

| Problem | Cause | Business Impact |
|---------|-------|-----------------|
| **Stockouts** | Inventory too low | Lost sales, unhappy customers, damaged reputation |
| **Overstocking** | Inventory too high | Capital tied up, storage costs, potential dead stock |

### TradeSphere's Solution

Every product has two critical thresholds:
- **Reorder Point** (Safety Stock): Minimum level before risk of stockout
- **Max Stock** (Liquidity Cap): Maximum level before capital becomes trapped

```
                    ┌─────────────────────────────────────────────┐
                    │                 OVERSTOCKED                 │  ⚠️ Dead Stock Risk
                    │              (currentStock > maxStock)      │
    ═══════════════ │ ─────────── MAX STOCK (Liquidity Cap) ──── │ ═════════════════
                    │                                             │
                    │                  HEALTHY                    │  ✅ Optimal Zone
                    │       (reorderPoint < stock ≤ maxStock)     │
                    │                                             │
    ═══════════════ │ ─────────── REORDER POINT (Safety Stock) ─ │ ═════════════════
                    │                                             │
                    │                 LOW STOCK                   │  ⚠️ Stockout Risk
                    │          (0 < stock ≤ reorderPoint)         │
                    │                                             │
    ═══════════════ │ ───────────────── ZERO ─────────────────── │ ═════════════════
                    │                OUT OF STOCK                 │  🚨 Lost Sales
                    └─────────────────────────────────────────────┘
```

---

## Architecture Overview

### Microfrontend Multi-Zone Architecture

TradeSphere uses **Next.js Multi-Zones** with a shell application that proxies to independent modules:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TradeSphere Shell (Port 3000)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  /                    → Dashboard (web app)                             │
│  /settings/*          → Settings & User Management (web app)            │
│  /inventory/*         → Inventory Module (Port 3001, basePath)          │
│  /analytics/*         → Analytics Module (Port 3002, basePath)          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Framework** | Next.js 16+ (App Router) |
| **Database** | Prisma ORM + SQLite |
| **UI** | Tailwind CSS + Radix UI + TanStack Table |
| **Styling** | CSS Variables for theming (Dark/Light mode) |

---

## Data Model

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Warehouse  │ 1───n │   Location   │ 1───n │  StockItem   │
│              │       │  (Tree)      │       │              │
│  - name      │       │  - type      │       │  - quantity  │
│  - code      │       │  - parent    │       │              │
│  - address   │       │  - children  │       │              │
└──────────────┘       └──────────────┘       └──────────────┘
                              │                      │
                              │                      │
                              │                      │
                       ┌──────┴──────┐               │
                       │             │               │
                       ▼             ▼               ▼
              ┌──────────────┐  ┌──────────────┐ ┌──────────────┐
              │StockMovement │  │StockMovement │ │   Product    │
              │ (FROM)       │  │ (TO)         │ │              │
              └──────────────┘  └──────────────┘ │  - sku       │
                       │                         │  - price     │
                       └────────────┬────────────│  - cost      │
                                    │            │  - reorder   │
                                    ▼            │  - maxStock  │
                             ┌──────────────┐    └──────────────┘
                             │     User     │
                             │              │
                             │  - role      │
                             │  - prefs     │
                             └──────────────┘
```

### Core Models

#### Product
```prisma
model Product {
  id           String   @id
  name         String
  sku          String   @unique
  category     String
  
  currentStock Int      // Total across all locations
  price        Decimal  // Selling price
  cost         Decimal  // Acquisition cost (for liquidity calc)
  
  reorderPoint Int      // Safety Stock threshold
  maxStock     Int      // Liquidity Cap threshold
}
```

**Derived Status Logic:**
```typescript
function getProductStatus(product: Product): Status {
  if (product.currentStock === 0) return "OUT_OF_STOCK";
  if (product.currentStock <= product.reorderPoint) return "LOW_STOCK";
  if (product.currentStock > product.maxStock) return "OVERSTOCKED";
  return "IN_STOCK";
}
```

#### Location (Tree Structure)
```
Warehouse: "Main Distribution Center"
├── Zone A (type: ZONE)
│   ├── Rack 1 (type: RACK)
│   │   ├── Shelf 1 (type: SHELF)
│   │   │   ├── Bin A1 (type: BIN) → [StockItem: 50x Widget]
│   │   │   └── Bin A2 (type: BIN) → [StockItem: 30x Gadget]
│   │   └── Shelf 2 (type: SHELF)
│   └── Rack 2 (type: RACK)
└── Zone B (type: ZONE)
```

#### Stock Movements
Three movement types track all inventory changes:

| Type | From Location | To Location | Use Case |
|------|---------------|-------------|----------|
| **IN** | — | ✓ | Receiving goods, production output |
| **OUT** | ✓ | — | Sales, damaged goods, returns |
| **TRANSFER** | ✓ | ✓ | Moving between locations |

---

## Module Features

### 1. Inventory Module (`/inventory`)

**Dashboard Features:**
- Real-time product count, stock levels, inventory value
- Low stock alerts (items at/below reorder point)
- Quick actions: Add Product, View All

**Product Management:**
- Full CRUD operations via Server Actions
- SKU-based unique identification
- Category organization
- Price/Cost tracking for financial analysis

**Warehouse Management:**
- Multi-warehouse support
- Hierarchical location tree (Zone → Rack → Shelf → Bin)
- Location codes for quick identification

**Stock Operations:**
- **Stock In**: Record incoming inventory
- **Stock Out**: Record outgoing inventory  
- **Transfer**: Move stock between locations
- **History**: Full audit trail of all movements

### 2. Analytics Module (`/analytics`)

**Financial Metrics (Calculated in Real-Time):**

| Metric | Formula | Purpose |
|--------|---------|---------|
| **Liquidity Tied Up** | Σ(cost × currentStock) | Capital invested in inventory |
| **Potential Revenue** | Σ(price × currentStock) | Maximum possible sales value |
| **Dead Stock Value** | Σ(cost × excessUnits) where excess = stock - maxStock | Wasted capital in overstocked items |
| **Gross Margin** | Potential Revenue - Liquidity Tied Up | Profit potential |

**Stock Health Analysis:**
- **Healthy**: reorderPoint < stock ≤ maxStock
- **Low Stock**: 0 < stock ≤ reorderPoint  
- **Out of Stock**: stock = 0
- **Overstocked**: stock > maxStock

**Visual Dashboard:**
- Health distribution bar charts
- Items requiring attention list
- Financial impact cards

### 3. Settings Module (`/settings`)

**User Management:**
- Role-based access (ADMIN, MANAGER, OPERATOR, VIEWER)
- User creation/editing
- Active status toggle

**Application Settings:**
- Dark/Light theme toggle (synced across all microfrontends)
- User preferences stored per-user

---

## User Roles & Permissions

| Role | Description | Typical Access |
|------|-------------|----------------|
| **ADMIN** | Full system access | All features + User Management |
| **MANAGER** | Operational oversight | Inventory, Analytics, Reports |
| **OPERATOR** | Day-to-day operations | Stock movements, Product updates |
| **VIEWER** | Read-only access | View dashboards and reports |

---

## Technical Implementation Details

### Theme System

Cross-app theme synchronization via:
1. **Inline Script**: Runs before React hydrates to prevent flash
2. **localStorage**: Persists theme choice (`tradesphere-theme`)
3. **ThemeSync Component**: Listens for storage events across tabs/apps
4. **CSS Variables**: All colors use semantic tokens (`--foreground`, `--background`, etc.)

### Server Actions Pattern

All mutations use Next.js Server Actions:
```typescript
// apps/inventory/app/actions.ts
"use server";

export async function createProduct(formData: FormData) {
  // Validate, create, revalidate
  await prisma.product.create({ ... });
  revalidatePath("/");
}
```

### Type Safety (SQLite Limitations)

SQLite doesn't support enums, so we use string constants with TypeScript:
```typescript
// packages/database/src/index.ts
export const LocationType = {
  ZONE: "ZONE",
  RACK: "RACK", 
  SHELF: "SHELF",
  BIN: "BIN",
} as const;

export const MovementType = {
  IN: "IN",
  OUT: "OUT",
  TRANSFER: "TRANSFER",
} as const;
```

---

## Future Roadmap

### Phase 2: Intelligence Layer
- [ ] **Demand Forecasting**: ML-based prediction using historical movement data
- [ ] **Auto-Reorder Suggestions**: Smart recommendations when approaching reorder point
- [ ] **Seasonal Trend Analysis**: Identify patterns in stock movements

### Phase 3: Integration
- [ ] **Supplier Management**: Track vendors, lead times, pricing
- [ ] **Purchase Orders**: Generate POs based on reorder points
- [ ] **Sales Integration**: Connect with e-commerce/POS systems

### Phase 4: Advanced Analytics
- [ ] **ABC Analysis**: Classify products by revenue contribution
- [ ] **Turnover Rate Tracking**: Days of inventory, stock velocity
- [ ] **Cost Trend Analysis**: Track price/cost changes over time

---

## Quick Reference

### Commands

```bash
# Development
pnpm dev                                    # Start all apps
pnpm build                                  # Build all apps
pnpm lint                                   # Lint all packages

# Database
pnpm --filter @repo/database db:generate   # Generate Prisma client
pnpm --filter @repo/database db:push       # Push schema changes
pnpm --filter @repo/database db:studio     # Open Prisma Studio
cd packages/database && npx tsx prisma/seed.ts  # Seed data
```

### URLs (Development)

| App | Direct Port | Via Shell |
|-----|-------------|-----------|
| Web/Dashboard | :3000 | localhost:3000 |
| Inventory | :3001 | localhost:3000/inventory |
| Analytics | :3002 | localhost:3000/analytics |

---

*TradeSphere ERP - Balancing Liquidity and Availability*
