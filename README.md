# TradeSphere ERP

TradeSphere is a modern, microfrontend-based Enterprise Resource Planning (ERP) system designed for scalability and performance. It features a unique "Deep Space Glass" aesthetic and is built using Next.js, Turborepo, and Tailwind CSS.

## Architecture

TradeSphere follows a microfrontend architecture:

- **`apps/web`**: The main shell application (Dashboard) that orchestrates other modules.
- **`apps/inventory`**: Inventory management module.
- **`apps/analytics`**: Analytics and reporting module.
- **`packages/ui`**: Shared design system and UI components.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm

### Installation

```sh
pnpm install
```

### Running the Project

```sh
pnpm dev
```

This will start all applications in parallel:
- **Web (Dashboard)**: [http://localhost:3000](http://localhost:3000)
- **Inventory**: [http://localhost:3000/inventory](http://localhost:3000/inventory)
- **Analytics**: [http://localhost:3000/analytics](http://localhost:3000/analytics)

## Technologies

- **Framework**: Next.js 16+ (App Router)
- **Monorepo**: Turborepo
- **Styling**: Tailwind CSS
- **Theme**: Deep Space Glass
