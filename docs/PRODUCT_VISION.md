# TradeSphere ERP - Product Vision

## Core Philosophy: Intelligent Inventory Balance

> "Managing inventory is a time-consuming and tedious balancing act. If you allow inventory to fall too low, you are in danger of stockouts and shortages... However, if you overstock your inventory, your business will suffer from poor liquidity."

TradeSphere aims to solve the **Liquidity vs. Availability** dilemma through real-time insights.

## Key Modules & Features

### 1. Inventory Management (The "Balance" Engine)
**Goal**: Maintain ideal stock levels to prevent business interruptions without tying up capital.

*   **Real-time Stock Tracking**: Up-to-the-minute visibility into current inventory.
*   **Smart Reorder Points**:
    *   Define `min_stock_level` (Safety Stock) per product.
    *   Define `max_stock_level` (Liquidity Cap) per product.
*   **Automated Alerts**:
    *   **Stockout Risk**: When inventory dips below safety stock.
    *   **Overstock Warning**: When inventory exceeds turnover targets (identifying "dead stock").

### 2. Analytics (The "Insight" Engine)
**Goal**: Visualize the financial impact of inventory decisions.

*   **Liquidity Analysis**: Total capital tied up in inventory vs. available cash flow.
*   **Turnover Rate**: How fast items are selling (identifying slow movers).
*   **Demand Forecasting**: (Future) Predict stock needs based on historical trends.

## Proposed Data Model (Conceptual)

To support this vision, our `Product` entity needs more than just a name and count.

```typescript
type Product = {
  id: string;
  name: string;
  sku: string;
  
  // The Basics
  currentStock: number;
  price: number;      // Selling price
  cost: number;       // Cost to acquire (for liquidity calc)
  
  // The "Balance" Fields
  reorderPoint: number;   // When to buy more
  safetyStock: number;    // The "danger zone" threshold
  maxStock: number;       // The "waste" threshold
  
  // Status (Derived)
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCKED';
}
```
